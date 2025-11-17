import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/types";

export interface CreateNoteDTO {
  title: string;
  content?: string;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string | null;
}

export interface NotesQueryDTO {
  q?: string;
  limit?: number;
  offset?: number;
}

export class NotesService {
  /**
   * Get all notes for a user
   */
  static async getAll(
    userId: string,
    query?: NotesQueryDTO
  ): Promise<{ data: Note[] | null; error: Error | null }> {
    const supabase = await createClient();
    let queryBuilder = supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    // Search filter
    if (query?.q) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query.q}%,content.ilike.%${query.q}%`
      );
    }

    // Pagination
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

    return { data: data as Note[], error: null };
  }

  /**
   * Get a single note by ID
   */
  static async getById(
    userId: string,
    id: string
  ): Promise<{ data: Note | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Note, error: null };
  }

  /**
   * Create a new note
   */
  static async create(
    userId: string,
    input: CreateNoteDTO
  ): Promise<{ data: Note | null; error: Error | null }> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: input.title,
        content: input.content || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Note, error: null };
  }

  /**
   * Update a note
   */
  static async update(
    userId: string,
    id: string,
    input: UpdateNoteDTO
  ): Promise<{ data: Note | null; error: Error | null }> {
    const supabase = await createClient();
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;

    const { data, error } = await supabase
      .from("notes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Note, error: null };
  }

  /**
   * Delete a note
   */
  static async delete(
    userId: string,
    id: string
  ): Promise<{ error: Error | null }> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return { error };
    }

    return { error: null };
  }
}

