import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Let Supabase handle the redirect - don't specify redirectTo
          // Supabase will use its own callback URL and then redirect back to the app
        },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        throw error;
      }

      console.log("Google sign-in initiated:", data);
      return data;
    } catch (error) {
      console.error("Google OAuth error:", error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // Get user profile - simplified without admin client
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);

        // If user doesn't exist, create a basic profile
        if (error.code === "PGRST116") {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && user.id === userId) {
            // Create user profile if it doesn't exist
            const newProfile = {
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || user.email || "User",
              role: "user" as const,
            };

            const { data: createdProfile, error: createError } = await supabase
              .from("users")
              .insert(newProfile)
              .select()
              .single();

            if (createError) {
              console.error("Error creating user profile:", createError);
              return null;
            }

            return createdProfile;
          }
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error("Unexpected error fetching user profile:", error);
      return null;
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if user is admin
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile?.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  },

  // Store server-side session cookies (access + refresh)
  async storeServerSession(accessToken: string, refreshToken: string) {
    try {
      const res = await fetch("/api/auth/store-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to store server session: ${res.status} ${txt}`);
      }
      return true;
    } catch (err) {
      console.error("storeServerSession error:", err);
      return false;
    }
  },

  // Refresh server-side session using refresh token cookie
  async refreshServerSession() {
    try {
      const res = await fetch("/api/auth/refresh-session", { method: "POST" });
      if (!res.ok) {
        return false;
      }
      return true;
    } catch (err) {
      console.error("refreshServerSession error:", err);
      return false;
    }
  },

  // Auto-refresh management
  _refreshTimeoutId: null as any,
  async startAutoRefresh() {
    try {
      const { data: { session } = {} as any } =
        await supabase.auth.getSession();
      const expiresAt = (session as any)?.expires_at; // UNIX timestamp (seconds)
      if (!expiresAt) return;

      const msUntilExpiry = expiresAt * 1000 - Date.now();
      const refreshBefore = 60 * 1000; // refresh 60s before expiry
      const timeout = Math.max(0, msUntilExpiry - refreshBefore);

      if (this._refreshTimeoutId) clearTimeout(this._refreshTimeoutId);

      this._refreshTimeoutId = setTimeout(async () => {
        const ok = await this.refreshServerSession();
        if (ok) {
          // dispatch event for pending requests
          if (typeof window !== "undefined")
            window.dispatchEvent(new CustomEvent("session:restored"));
          // schedule next refresh
          this.startAutoRefresh();
        } else {
          if (typeof window !== "undefined")
            window.dispatchEvent(new CustomEvent("session:expired"));
        }
      }, timeout);
    } catch (err) {
      console.error("startAutoRefresh error:", err);
    }
  },

  stopAutoRefresh() {
    try {
      if (this._refreshTimeoutId) clearTimeout(this._refreshTimeoutId);
      this._refreshTimeoutId = null;
    } catch (err) {
      console.error("stopAutoRefresh error:", err);
    }
  },
};
