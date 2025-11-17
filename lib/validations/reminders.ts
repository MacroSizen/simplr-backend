import { z } from "zod";

// Create reminder list schema
export const createReminderListSchema = z.object({
  name: z.string().min(1, "List name is required").trim().max(100),
});

export type CreateReminderListInput = z.infer<typeof createReminderListSchema>;

// Update reminder list schema
export const updateReminderListSchema = z.object({
  name: z.string().min(1, "List name is required").trim().max(100),
});

export type UpdateReminderListInput = z.infer<typeof updateReminderListSchema>;

// Create reminder schema
export const createReminderSchema = z.object({
  list_id: z.string().uuid("Invalid list ID"),
  title: z.string().min(1, "Title is required").trim().max(500),
  due_date: z.string().datetime().optional(),
  relevance: z
    .number()
    .int()
    .min(1, "Relevance must be at least 1")
    .max(3, "Relevance must be at most 3"),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;

// Update reminder schema
export const updateReminderSchema = z.object({
  title: z.string().min(1, "Title is required").trim().max(500).optional(),
  due_date: z.string().datetime().nullable().optional(),
  relevance: z
    .number()
    .int()
    .min(1, "Relevance must be at least 1")
    .max(3, "Relevance must be at most 3")
    .optional(),
  completed: z.boolean().optional(),
});

export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;

// ID schemas
export const reminderListIdSchema = z.object({
  id: z.string().uuid("Invalid list ID"),
});

export type ReminderListIdInput = z.infer<typeof reminderListIdSchema>;

export const reminderIdSchema = z.object({
  id: z.string().uuid("Invalid reminder ID"),
});

export type ReminderIdInput = z.infer<typeof reminderIdSchema>;

