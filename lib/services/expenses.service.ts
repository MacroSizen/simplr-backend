import { createClient } from "@/lib/supabase/server";
import type { Expense } from "@/lib/types";

export interface CreateExpenseDTO {
  category?: string;
  categoryId?: string;
  amount: number;
  description?: string;
}

export interface ExpensesQueryDTO {
  limit?: number;
  offset?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export class ExpensesService {
  /**
   * Get all expenses for a user
   */
  static async getAll(
    userId: string,
    query?: ExpensesQueryDTO
  ): Promise<{ data: Expense[] | null; error: Error | null }> {
    const supabase = await createClient();
    console.log(userId);
    let queryBuilder = supabase
      .from("expenses")
      .select("*, categories(name)")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    console.log(query);

    // Apply filters
    if (query?.category) {
      queryBuilder = queryBuilder.eq("category", query.category);
    }

    if (query?.startDate) {
      queryBuilder = queryBuilder.gte("date", query.startDate);
    }

    if (query?.endDate) {
      // Append time to include the full day if it's just a date string
      const endDate = query.endDate.includes("T") ? query.endDate : `${query.endDate}T23:59:59.999Z`;
      queryBuilder = queryBuilder.lte("date", endDate);
    }

    // Apply pagination
    if (query?.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query?.offset) {
      queryBuilder = queryBuilder.range(
        query.offset,
        query.offset + (query.limit || 50) - 1
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      return { data: null, error };
    }

    // Map the category name if available
    const mappedData = (data as any[]).map((expense) => ({
      ...expense,
      category: expense.categories?.name || expense.category,
    }));

    return { data: mappedData as Expense[], error: null };
  }

  /**
   * Get a single expense by ID
   */
  static async getById(
    userId: string,
    id: string
  ): Promise<{ data: Expense | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Expense, error: null };
  }

  /**
   * Create a new expense
   */
  static async create(
    userId: string,
    input: CreateExpenseDTO
  ): Promise<{ data: Expense | null; error: Error | null }> {
    console.log(input.categoryId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: userId,
        category_id: input.categoryId,
        amount: input.amount,
        description: input.description || null,
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      return { data: null, error };
    }

    return { data: data as Expense, error: null };
  }

  /**
   * Delete an expense
   */
  static async delete(
    userId: string,
    id: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return { error };
    }

    return { error: null };
  }
}

