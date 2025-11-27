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
