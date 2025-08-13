import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
  // Provide fallback for development
  const fallbackUrl = "https://your-project.supabase.co"
  const fallbackKey = "your-anon-key"

  console.warn("Using fallback Supabase configuration - please set up your environment variables")
}

export const supabase = createClient(
  supabaseUrl || "https://your-project.supabase.co",
  supabaseAnonKey || "your-anon-key",
)

// Client-side singleton pattern
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl || "https://your-project.supabase.co", supabaseAnonKey || "your-anon-key")
  }
  return supabaseClient
}
