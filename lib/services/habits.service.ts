import { createClient } from "@/lib/supabase/server";
import type { Habit, HabitLog } from "@/lib/types";

export interface CreateHabitDTO {
  name: string;
  frequency: string;
}

export interface UpdateHabitDTO {
  name?: string;
  frequency?: string;
}

export interface ToggleHabitLogDTO {
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface HabitLogsQuery {
  habit_id?: string;
  startDate?: string;
  endDate?: string;
}

export class HabitsService {
  /**
   * Get all habits for a user
   */
  static async getAll(userId: string): Promise<{
    data: Habit[] | null;
    error: Error | null;
  }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data: data as Habit[], error: null };
  }

  /**
   * Get a single habit by ID
   */
  static async getById(
    userId: string,
    id: string
  ): Promise<{ data: Habit | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Habit, error: null };
  }

  /**
   * Create a new habit
   */
  static async create(
    userId: string,
    input: CreateHabitDTO
  ): Promise<{ data: Habit | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        name: input.name,
        frequency: input.frequency,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Habit, error: null };
  }

  /**
   * Update a habit
   */
  static async update(
    userId: string,
    id: string,
    input: UpdateHabitDTO
  ): Promise<{ data: Habit | null; error: Error | null }> {
    const supabase = await createClient();
    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.frequency !== undefined) updateData.frequency = input.frequency;

    const { data, error } = await supabase
      .from("habits")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Habit, error: null };
  }

  /**
   * Delete a habit
   */
  static async delete(
    userId: string,
    id: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return { error };
    }

    return { error: null };
  }

  /**
   * Get habit logs for a user
   */
  static async getLogs(
    userId: string,
    query?: HabitLogsQuery
  ): Promise<{ data: HabitLog[] | null; error: Error | null }> {
    const supabase = await createClient();
    let queryBuilder = supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (query?.habit_id) {
      queryBuilder = queryBuilder.eq("habit_id", query.habit_id);
    }

    if (query?.startDate) {
      queryBuilder = queryBuilder.gte("date", query.startDate);
    }

    if (query?.endDate) {
      queryBuilder = queryBuilder.lte("date", query.endDate);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      return { data: null, error };
    }

    return { data: data as HabitLog[], error: null };
  }

  /**
   * Toggle habit log (create or update)
   */
  static async toggleLog(
    userId: string,
    input: ToggleHabitLogDTO
  ): Promise<{ data: HabitLog | null; error: Error | null }> {
    const supabase = await createClient();

    // Check if log exists
    const { data: existingLog, error: fetchError } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", input.habit_id)
      .eq("date", input.date)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    if (existingLog) {
      // Update existing log
      const { data, error } = await supabase
        .from("habit_logs")
        .update({ completed: input.completed })
        .eq("id", existingLog.id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: data as HabitLog, error: null };
    } else {
      // Create new log
      const { data, error } = await supabase
        .from("habit_logs")
        .insert({
          user_id: userId,
          habit_id: input.habit_id,
          date: input.date,
          completed: input.completed,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: data as HabitLog, error: null };
    }
  }
}

