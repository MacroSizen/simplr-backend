// Shared TypeScript types for the application

// ============================================================================
// Database Models
// ============================================================================

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
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
// Action Response Types
// ============================================================================

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

