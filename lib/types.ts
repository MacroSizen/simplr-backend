// Shared TypeScript types for the application

// ============================================================================
// Database Models
// ============================================================================

export interface Expense {
  id: string;
  user_id: string;
  category_id: number;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
}

export interface Category {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
}

export interface ReminderList {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  list_id: string;
  user_id: string;
  title: string;
  due_date: string | null;
  relevance: number;
  completed: boolean;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Action Input Types
// ============================================================================

export interface CreateExpenseInput {
  category: string;
  amount: number;
  description?: string;
}

export interface CreateReminderListInput {
  name: string;
}

export interface CreateReminderInput {
  list_id: string;
  title: string;
  due_date?: string;
  relevance: number;
}

export interface UpdateReminderInput {
  completed: boolean;
}

export interface CreateHabitInput {
  name: string;
  frequency: string;
}

export interface ToggleHabitLogInput {
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
}

export interface UpdateNoteInput {
  title: string;
  content?: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationCategory = "reminders" | "habits" | "expenses" | "notes";

export type DevicePlatform = "ios" | "android" | "web";

export type NotificationStatus = "pending" | "sent" | "failed" | "cancelled";

export interface CategorySettings {
  enabled: boolean;
  realTime?: boolean;
  scheduled?: boolean;
  scheduledTime?: string; // HH:mm format
}

export interface NotificationCategories {
  reminders: CategorySettings;
  habits: CategorySettings;
  expenses: CategorySettings;
  notes: CategorySettings;
}

export interface NotificationSettings {
  notifications_enabled: boolean;
  notification_categories: NotificationCategories;
  quiet_hours_start: string | null; // HH:mm format
  quiet_hours_end: string | null; // HH:mm format
}

export interface DeviceToken {
  id: string;
  user_id: string;
  push_token: string;
  platform: DevicePlatform;
  device_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledNotification {
  id: string;
  user_id: string;
  category: NotificationCategory;
  reference_id: string | null;
  title: string;
  body: string | null;
  scheduled_for: string;
  sent_at: string | null;
  status: NotificationStatus;
  error_message: string | null;
  created_at: string;
}

export interface NotificationHistory {
  id: string;
  user_id: string;
  category: NotificationCategory;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  sent_at: string;
  read_at: string | null;
}

export interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  categoryId?: string;
}

export interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Notification Input Types
// ============================================================================

export interface RegisterDeviceInput {
  push_token: string;
  platform: DevicePlatform;
  device_name?: string;
}

export interface UpdateNotificationSettingsInput {
  notifications_enabled?: boolean;
  notification_categories?: Partial<NotificationCategories>;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
}

export interface SendNotificationInput {
  user_id: string;
  category: NotificationCategory;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  reference_id?: string;
}

// ============================================================================
// Action Response Types
// ============================================================================

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

