import { z } from "zod";

// Create note schema
export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").trim().max(200),
  content: z.string().trim().max(50000).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

// Update note schema
export const updateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").trim().max(200).optional(),
  content: z.string().trim().max(50000).nullable().optional(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// Note ID schema
export const noteIdSchema = z.object({
  id: z.string().uuid("Invalid note ID"),
});

export type NoteIdInput = z.infer<typeof noteIdSchema>;

// Search notes query schema
export const notesSearchSchema = z.object({
  q: z.string().min(1).nullish(),
  limit: z.coerce.number().int().positive().max(100).nullish().default(50),
  offset: z.coerce.number().int().nonnegative().nullish().default(0),
});

export type NotesSearchInput = z.infer<typeof notesSearchSchema>;

export type NotesQueryDTO = z.infer<typeof notesSearchSchema>;