import { createClient } from "@/lib/supabase/server";
import type { Reminder, ReminderList } from "@/lib/types";

export interface CreateReminderListDTO {
  name: string;
}

export interface UpdateReminderListDTO {
  name: string;
}

export interface CreateReminderDTO {
  list_id: string;
  title: string;
  due_date?: string;
  relevance: number;
}

export interface UpdateReminderDTO {
  title?: string;
  due_date?: string | null;
  relevance?: number;
  completed?: boolean;
}

export class RemindersService {
  /**
   * Get all reminder lists for a user
   */
  static async getLists(userId: string): Promise<{
    data: ReminderList[] | null;
    error: Error | null;
  }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reminder_lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data: data as ReminderList[], error: null };
  }

  /**
   * Get a single reminder list by ID
   */
  static async getListById(
    userId: string,
    id: string
  ): Promise<{ data: ReminderList | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reminder_lists")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as ReminderList, error: null };
  }

  /**
   * Create a new reminder list
   */
  static async createList(
    userId: string,
    input: CreateReminderListDTO
  ): Promise<{ data: ReminderList | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reminder_lists")
      .insert({
        user_id: userId,
        name: input.name,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as ReminderList, error: null };
  }

  /**
   * Update a reminder list
   */
  static async updateList(
    userId: string,
    id: string,
    input: UpdateReminderListDTO
  ): Promise<{ data: ReminderList | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reminder_lists")
      .update({ name: input.name })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as ReminderList, error: null };
  }

  /**
   * Delete a reminder list
   */
  static async deleteList(
    userId: string,
    id: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("reminder_lists")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return { error };
    }

    return { error: null };
  }

  /**
   * Get all reminders for a specific list
   */
  static async getReminders(
    userId: string,
    listId?: string
  ): Promise<{ data: Reminder[] | null; error: Error | null }> {
    const supabase = await createClient();
    let query = supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId);

    if (listId) {
      query = query.eq("list_id", listId);
    }

    const { data, error } = await query.order("due_date", { ascending: true, nullsFirst: false });

    if (error) {
      return { data: null, error };
    }

    return { data: data as Reminder[], error: null };
  }

  /**
   * Get a single reminder by ID
   */
  static async getReminderById(
    userId: string,
    id: string
  ): Promise<{ data: Reminder | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Reminder, error: null };
  }

  /**
   * Create a new reminder
   */
  static async createReminder(
    userId: string,
    input: CreateReminderDTO
  ): Promise<{ data: Reminder | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reminders")
      .insert({
        user_id: userId,
        list_id: input.list_id,
        title: input.title,
        due_date: input.due_date || null,
        relevance: input.relevance,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Reminder, error: null };
  }

  /**
   * Update a reminder
   */
  static async updateReminder(
    userId: string,
    id: string,
    input: UpdateReminderDTO
  ): Promise<{ data: Reminder | null; error: Error | null }> {
    const supabase = await createClient();
    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.due_date !== undefined) updateData.due_date = input.due_date;
    if (input.relevance !== undefined) updateData.relevance = input.relevance;
    if (input.completed !== undefined) updateData.completed = input.completed;

    const { data, error } = await supabase
      .from("reminders")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Reminder, error: null };
  }

  /**
   * Delete a reminder
   */
  static async deleteReminder(
    userId: string,
    id: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return { error };
    }

    return { error: null };
  }
}

