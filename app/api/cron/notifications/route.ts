import { NextRequest, NextResponse } from "next/server";
import { NotificationsService } from "@/lib/services/notifications.service";

// Optional: Add a secret key for cron job authentication
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/notifications
 * Process scheduled notifications and send due reminders
 * This endpoint should be called by a cron job service (e.g., Vercel Cron, cron-job.org)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret if configured
    if (CRON_SECRET) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const results = {
      scheduledNotifications: { processed: 0, failed: 0 },
      reminderNotifications: { sent: 0, failed: 0 },
      habitNotifications: { sent: 0, failed: 0 },
    };

    // 1. Process pending scheduled notifications
    const scheduledResult =
      await NotificationsService.processPendingNotifications();
    results.scheduledNotifications = scheduledResult;

    // 2. Send notifications for due reminders
    const { data: dueReminders } = await NotificationsService.getDueReminders();
    if (dueReminders && dueReminders.length > 0) {
      // Group reminders by user
      const remindersByUser = dueReminders.reduce(
        (acc, reminder) => {
          if (!acc[reminder.user_id]) {
            acc[reminder.user_id] = [];
          }
          acc[reminder.user_id].push(reminder);
          return acc;
        },
        {} as Record<string, typeof dueReminders>
      );

      for (const [userId, reminders] of Object.entries(remindersByUser)) {
        for (const reminder of reminders) {
          const result = await NotificationsService.sendNotification(userId, {
            category: "reminders",
            title: "Reminder Due",
            body: reminder.title,
            reference_id: reminder.id,
            data: { reminder_id: reminder.id },
          });

          if (result.success) {
            results.reminderNotifications.sent++;
          } else {
            results.reminderNotifications.failed++;
          }
        }
      }
    }

    // 3. Send daily habit reminders
    // Check if current hour matches scheduled time for habits (default 7:00)
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    // Only send habit reminders at the start of each hour (between :00 and :05)
    if (currentMinute < 5) {
      const { data: habits } =
        await NotificationsService.getHabitsForDailyReminder();

      if (habits && habits.length > 0) {
        // Group habits by user
        const habitsByUser = habits.reduce(
          (acc, habit) => {
            if (!acc[habit.user_id]) {
              acc[habit.user_id] = [];
            }
            acc[habit.user_id].push(habit);
            return acc;
          },
          {} as Record<string, typeof habits>
        );

        for (const [userId, userHabits] of Object.entries(habitsByUser)) {
          // Check user's preferred habit notification time
          const { data: settings } =
            await NotificationsService.getSettings(userId);
          const habitSettings = settings?.notification_categories?.habits;

          if (
            habitSettings?.enabled &&
            habitSettings.scheduled &&
            habitSettings.scheduledTime
          ) {
            const [scheduledHour] = habitSettings.scheduledTime
              .split(":")
              .map(Number);

            // Only send if current hour matches scheduled hour
            if (currentHour === scheduledHour) {
              const habitNames = userHabits
                .slice(0, 3)
                .map((h) => h.name)
                .join(", ");
              const moreText =
                userHabits.length > 3
                  ? ` and ${userHabits.length - 3} more`
                  : "";

              const result = await NotificationsService.sendNotification(
                userId,
                {
                  category: "habits",
                  title: "Daily Habits",
                  body: `Time to complete: ${habitNames}${moreText}`,
                }
              );

              if (result.success) {
                results.habitNotifications.sent++;
              } else {
                results.habitNotifications.failed++;
              }
            }
          }
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        results,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

