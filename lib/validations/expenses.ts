import { z } from "zod";

// Create expense schema
export const createExpenseSchema = z.object({
  categoryId: z.number(),
  amount: z
    .number()
    .positive("Amount must be positive")
    .finite("Amount must be a valid number"),
  description: z.string().trim().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

// Expense ID schema
export const expenseIdSchema = z.object({
  id: z.string().uuid("Invalid expense ID"),
});

export type ExpenseIdInput = z.infer<typeof expenseIdSchema>;

// Query parameters for expenses list
export const expensesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).nullish().default(50),
  offset: z.coerce.number().int().nonnegative().nullish().default(0),
  category: z.string().nullish(),
  startDate: z.string().datetime().nullish(),
  endDate: z.string().datetime().nullish(),
});

export type ExpensesQueryInput = z.infer<typeof expensesQuerySchema>;

// Category schemas
export const createCategorySchema = z.object({
  name: z.number(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema;

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

