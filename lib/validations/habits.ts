import { z } from "zod";

// Create habit schema
export const createHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required").trim().max(200),
  frequency: z.enum(["daily", "weekly", "monthly"], {
    errorMap: () => ({ message: "Frequency must be daily, weekly, or monthly" }),
  }),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;

// Update habit schema
export const updateHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required").trim().max(200).optional(),
  frequency: z
    .enum(["daily", "weekly", "monthly"], {
      errorMap: () => ({
        message: "Frequency must be daily, weekly, or monthly",
      }),
    })
    .optional(),
});

export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

// Toggle habit log schema
export const toggleHabitLogSchema = z.object({
  habit_id: z.string().uuid("Invalid habit ID"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  completed: z.boolean(),
});

export type ToggleHabitLogInput = z.infer<typeof toggleHabitLogSchema>;

// Habit ID schema
export const habitIdSchema = z.object({
  id: z.string().uuid("Invalid habit ID"),
});

export type HabitIdInput = z.infer<typeof habitIdSchema>;

// Get habit logs query schema
export const habitLogsQuerySchema = z.object({
  habit_id: z.string().uuid("Invalid habit ID").optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
});

export type HabitLogsQueryInput = z.infer<typeof habitLogsQuerySchema>;

