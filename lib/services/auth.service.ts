import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(email: string, password: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Register a new user
   */
  static async register(email: string, password: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Get current user from token
   */
  static async getCurrentUser(token: string): Promise<{
    user: User | null;
    error: Error | null;
  }> {
    const supabase = await createClient();
    
    // Set the auth token for this request
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      return { user: null, error };
    }

    return { user, error: null };
  }

  /**
   * Refresh session with refresh token
   */
  static async refreshToken(refreshToken: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Logout user (revoke token)
   */
  static async logout(token: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error };
    }

    return { error: null };
  }
}

