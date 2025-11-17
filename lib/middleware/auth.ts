import { NextRequest } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import type { User } from "@supabase/supabase-js";

/**
 * Verify authentication from Bearer token in request headers
 * Throws error if not authenticated
 */
export async function verifyAuth(req: NextRequest): Promise<User> {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);
  
  const { user, error } = await AuthService.getCurrentUser(token);

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * Verify authentication and return user or null
 * Does not throw, returns null if not authenticated
 */
export async function tryVerifyAuth(req: NextRequest): Promise<User | null> {
  try {
    return await verifyAuth(req);
  } catch {
    return null;
  }
}

