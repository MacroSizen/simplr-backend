import { z } from "zod";

// Time format regex (HH:mm)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Category settings schema
const categorySettingsSchema = z.object({
  enabled: z.boolean(),
  realTime: z.boolean().optional(),
  scheduled: z.boolean().optional(),
  scheduledTime: z
    .string()
    .regex(timeRegex, "Invalid time format (HH:mm)")
    .optional(),
});

// Notification categories schema
const notificationCategoriesSchema = z.object({
  reminders: categorySettingsSchema.optional(),
  habits: categorySettingsSchema.optional(),
  expenses: categorySettingsSchema.optional(),
  notes: categorySettingsSchema.optional(),
});

// Register device schema
export const registerDeviceSchema = z.object({
  push_token: z
    .string()
    .min(1, "Push token is required")
    .max(500, "Push token too long"),
  platform: z.enum(["ios", "android", "web"], {
    errorMap: () => ({ message: "Platform must be ios, android, or web" }),
  }),
  device_name: z.string().max(100, "Device name too long").optional(),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;

// Unregister device schema
export const unregisterDeviceSchema = z.object({
  push_token: z.string().min(1, "Push token is required"),
});

export type UnregisterDeviceInput = z.infer<typeof unregisterDeviceSchema>;

// Update notification settings schema
export const updateNotificationSettingsSchema = z.object({
  notifications_enabled: z.boolean().optional(),
  notification_categories: notificationCategoriesSchema.optional(),
  quiet_hours_start: z
    .string()
    .regex(timeRegex, "Invalid time format (HH:mm)")
    .nullable()
    .optional(),
  quiet_hours_end: z
    .string()
    .regex(timeRegex, "Invalid time format (HH:mm)")
    .nullable()
    .optional(),
});

export type UpdateNotificationSettingsInput = z.infer<
  typeof updateNotificationSettingsSchema
>;

// Send notification schema (for internal use)
export const sendNotificationSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  category: z.enum(["reminders", "habits", "expenses", "notes"], {
    errorMap: () => ({
      message: "Category must be reminders, habits, expenses, or notes",
    }),
  }),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  body: z.string().max(500, "Body too long").optional(),
  data: z.record(z.unknown()).optional(),
  reference_id: z.string().uuid("Invalid reference ID").optional(),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

// Schedule notification schema
export const scheduleNotificationSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  category: z.enum(["reminders", "habits", "expenses", "notes"]),
  reference_id: z.string().uuid("Invalid reference ID").nullable().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  body: z.string().max(500, "Body too long").optional(),
  scheduled_for: z.string().datetime("Invalid datetime format"),
});

export type ScheduleNotificationInput = z.infer<
  typeof scheduleNotificationSchema
>;

