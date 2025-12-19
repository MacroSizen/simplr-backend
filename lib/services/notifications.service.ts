import { createClient } from "@/lib/supabase/server";
import type {
  NotificationSettings,
  NotificationCategories,
  DeviceToken,
  ScheduledNotification,
  NotificationCategory,
  PushNotificationPayload,
  ExpoPushTicket,
} from "@/lib/types";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// Default notification categories configuration
const DEFAULT_NOTIFICATION_CATEGORIES: NotificationCategories = {
  reminders: {
    enabled: true,
    realTime: true,
    scheduled: true,
    scheduledTime: "09:00",
  },
  habits: { enabled: true, scheduled: true, scheduledTime: "07:00" },
  expenses: { enabled: false },
  notes: { enabled: false },
};

export interface RegisterDeviceDTO {
  push_token: string;
  platform: "ios" | "android" | "web";
  device_name?: string;
}

export interface UpdateSettingsDTO {
  notifications_enabled?: boolean;
  notification_categories?: Partial<NotificationCategories>;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
}

export interface SendNotificationDTO {
  category: NotificationCategory;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  reference_id?: string;
}

export class NotificationsService {
  /**
   * Get notification settings for a user
   */
  static async getSettings(
    userId: string
  ): Promise<{ data: NotificationSettings | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "notifications_enabled, notification_categories, quiet_hours_start, quiet_hours_end"
      )
      .eq("id", userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    // Merge with defaults if categories are missing
    const settings: NotificationSettings = {
      notifications_enabled: data.notifications_enabled ?? true,
      notification_categories: {
        ...DEFAULT_NOTIFICATION_CATEGORIES,
        ...(data.notification_categories || {}),
      },
      quiet_hours_start: data.quiet_hours_start,
      quiet_hours_end: data.quiet_hours_end,
    };

    return { data: settings, error: null };
  }

  /**
   * Update notification settings for a user
   */
  static async updateSettings(
    userId: string,
    input: UpdateSettingsDTO
  ): Promise<{ data: NotificationSettings | null; error: Error | null }> {
    const supabase = await createClient();

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (input.notifications_enabled !== undefined) {
      updateData.notifications_enabled = input.notifications_enabled;
    }

    if (input.notification_categories !== undefined) {
      // Get current settings to merge with
      const { data: currentSettings } = await this.getSettings(userId);
      updateData.notification_categories = {
        ...(currentSettings?.notification_categories ||
          DEFAULT_NOTIFICATION_CATEGORIES),
        ...input.notification_categories,
      };
    }

    if (input.quiet_hours_start !== undefined) {
      updateData.quiet_hours_start = input.quiet_hours_start;
    }

    if (input.quiet_hours_end !== undefined) {
      updateData.quiet_hours_end = input.quiet_hours_end;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      return { data: null, error };
    }

    // Return updated settings
    return this.getSettings(userId);
  }

  /**
   * Register a device for push notifications
   */
  static async registerDevice(
    userId: string,
    input: RegisterDeviceDTO
  ): Promise<{ data: DeviceToken | null; error: Error | null }> {
    const supabase = await createClient();

    // Upsert the device token (update if exists, insert if not)
    const { data, error } = await supabase
      .from("device_tokens")
      .upsert(
        {
          user_id: userId,
          push_token: input.push_token,
          platform: input.platform,
          device_name: input.device_name || null,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,push_token",
        }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as DeviceToken, error: null };
  }

  /**
   * Unregister a device from push notifications
   */
  static async unregisterDevice(
    userId: string,
    pushToken: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();

    // Mark token as inactive instead of deleting (for audit trail)
    const { error } = await supabase
      .from("device_tokens")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("push_token", pushToken);

    return { error: error || null };
  }

  /**
   * Get all active device tokens for a user
   */
  static async getDeviceTokens(
    userId: string
  ): Promise<{ data: DeviceToken[] | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("device_tokens")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      return { data: null, error };
    }

    return { data: data as DeviceToken[], error: null };
  }

  /**
   * Check if a user has notifications enabled for a specific category
   */
  static async isCategoryEnabled(
    userId: string,
    category: NotificationCategory
  ): Promise<boolean> {
    const { data: settings } = await this.getSettings(userId);

    if (!settings?.notifications_enabled) {
      return false;
    }

    const categorySettings = settings.notification_categories[category];
    return categorySettings?.enabled ?? false;
  }

  /**
   * Check if we're in quiet hours for a user
   */
  static async isInQuietHours(userId: string): Promise<boolean> {
    const { data: settings } = await this.getSettings(userId);

    if (!settings?.quiet_hours_start || !settings?.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    const start = settings.quiet_hours_start;
    const end = settings.quiet_hours_end;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }

    return currentTime >= start && currentTime <= end;
  }

  /**
   * Send a push notification to a user
   */
  static async sendNotification(
    userId: string,
    input: SendNotificationDTO
  ): Promise<{ success: boolean; error: Error | null }> {
    // Check if category is enabled
    const isEnabled = await this.isCategoryEnabled(userId, input.category);
    if (!isEnabled) {
      return { success: false, error: new Error("Notifications disabled for this category") };
    }

    // Check quiet hours
    const inQuietHours = await this.isInQuietHours(userId);
    if (inQuietHours) {
      // Schedule for later instead of sending now
      return {
        success: false,
        error: new Error("In quiet hours - notification will be scheduled"),
      };
    }

    // Get device tokens
    const { data: tokens, error: tokensError } =
      await this.getDeviceTokens(userId);
    if (tokensError || !tokens || tokens.length === 0) {
      return { success: false, error: new Error("No device tokens found") };
    }

    // Build push notification payloads
    const notifications: PushNotificationPayload[] = tokens.map((token) => ({
      to: token.push_token,
      title: input.title,
      body: input.body || "",
      data: {
        ...input.data,
        category: input.category,
        reference_id: input.reference_id,
      },
      sound: "default",
      categoryId: input.category,
    }));

    // Send to Expo Push Notification service
    const result = await this.sendToExpo(notifications);

    // Log to notification history
    const supabase = await createClient();
    await supabase.from("notification_history").insert({
      user_id: userId,
      category: input.category,
      title: input.title,
      body: input.body,
      data: input.data || null,
    });

    return result;
  }

  /**
   * Send notifications to Expo Push Notification service
   */
  private static async sendToExpo(
    notifications: PushNotificationPayload[]
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notifications),
      });

      if (!response.ok) {
        throw new Error(`Expo Push API error: ${response.statusText}`);
      }

      const data = (await response.json()) as { data: ExpoPushTicket[] };

      // Check for any failed tickets
      const failedTickets = data.data.filter(
        (ticket) => ticket.status === "error"
      );
      if (failedTickets.length > 0) {
        console.error("Some notifications failed:", failedTickets);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Failed to send push notifications:", error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  }

  /**
   * Schedule a notification for later delivery
   */
  static async scheduleNotification(
    userId: string,
    category: NotificationCategory,
    title: string,
    body: string | null,
    scheduledFor: Date,
    referenceId?: string
  ): Promise<{ data: ScheduledNotification | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scheduled_notifications")
      .insert({
        user_id: userId,
        category,
        reference_id: referenceId || null,
        title,
        body,
        scheduled_for: scheduledFor.toISOString(),
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as ScheduledNotification, error: null };
  }

  /**
   * Get pending notifications that are due to be sent
   */
  static async getPendingNotifications(): Promise<{
    data: ScheduledNotification[] | null;
    error: Error | null;
  }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(100);

    if (error) {
      return { data: null, error };
    }

    return { data: data as ScheduledNotification[], error: null };
  }

  /**
   * Process pending scheduled notifications
   */
  static async processPendingNotifications(): Promise<{
    processed: number;
    failed: number;
  }> {
    const { data: pending, error } = await this.getPendingNotifications();

    if (error || !pending || pending.length === 0) {
      return { processed: 0, failed: 0 };
    }

    let processed = 0;
    let failed = 0;

    const supabase = await createClient();

    for (const notification of pending) {
      const result = await this.sendNotification(notification.user_id, {
        category: notification.category,
        title: notification.title,
        body: notification.body || undefined,
        reference_id: notification.reference_id || undefined,
      });

      if (result.success) {
        await supabase
          .from("scheduled_notifications")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", notification.id);
        processed++;
      } else {
        await supabase
          .from("scheduled_notifications")
          .update({
            status: "failed",
            error_message: result.error?.message || "Unknown error",
          })
          .eq("id", notification.id);
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * Get due reminders that need notifications
   */
  static async getDueReminders(): Promise<{
    data: Array<{ user_id: string; id: string; title: string; due_date: string }> | null;
    error: Error | null;
  }> {
    const supabase = await createClient();

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Get reminders due in the next hour that haven't been completed
    const { data, error } = await supabase
      .from("reminders")
      .select("id, user_id, title, due_date")
      .eq("completed", false)
      .gte("due_date", now.toISOString())
      .lte("due_date", oneHourFromNow.toISOString());

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Get habits that need daily reminders
   */
  static async getHabitsForDailyReminder(): Promise<{
    data: Array<{ user_id: string; id: string; name: string }> | null;
    error: Error | null;
  }> {
    const supabase = await createClient();

    // Get all habits (daily frequency)
    const { data, error } = await supabase
      .from("habits")
      .select("id, user_id, name")
      .eq("frequency", "daily");

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelScheduledNotification(
    userId: string,
    notificationId: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("scheduled_notifications")
      .update({ status: "cancelled" })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .eq("status", "pending");

    return { error: error || null };
  }
}

