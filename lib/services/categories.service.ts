import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export interface CreateCategoryDTO {
  name: string;
}

export interface UpdateCategoryDTO {
  name: string;
}

export class CategoriesService {
  /**
   * Get all categories for a user
   */
  static async getAll(userId: string): Promise<{ data: Category[] | null; error: Error | null }> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      return { data: null, error };
    }

    return { data: data as Category[], error: null };
  }

  /**
   * Get all categories with usage count
   */
  static async getWithUsage(userId: string): Promise<{ data: (Category & { usage_count: number })[] | null; error: Error | null }> {
    const supabase = await createClient();

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId);

    if (categoriesError) {
      return { data: null, error: categoriesError };
    }

    // Get usage counts
    // Note: This is a bit inefficient but works for now. 
    // Ideally we'd use a join and count, but Supabase JS client makes that tricky with simple joins.
    // Or a raw SQL query / RPC.
    // For now, let's just fetch expenses and count in memory since dataset is likely small per user.
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("category_id")
      .eq("user_id", userId);

    if (expensesError) {
      return { data: null, error: expensesError };
    }

    const usageMap = new Map<string, number>();
    expenses?.forEach((exp) => {
      if (exp.category_id) {
        usageMap.set(exp.category_id, (usageMap.get(exp.category_id) || 0) + 1);
      }
    });

    const categoriesWithUsage = categories.map((cat) => ({
      ...cat,
      usage_count: usageMap.get(cat.id) || 0,
    }));

    // Sort by usage count desc
    categoriesWithUsage.sort((a, b) => b.usage_count - a.usage_count);

    return { data: categoriesWithUsage, error: null };
  }

  /**
   * Create a new category
   */
  static async create(
    userId: string,
    input: CreateCategoryDTO
  ): Promise<{ data: Category | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: input.name,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Category, error: null };
  }

  /**
   * Update a category
   */
  static async update(
    userId: string,
    id: string,
    input: UpdateCategoryDTO
  ): Promise<{ data: Category | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: input.name,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Category, error: null };
  }

  /**
   * Delete a category
   */
  static async delete(
    userId: string,
    id: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return { error };
    }

    return { error: null };
  }
}
