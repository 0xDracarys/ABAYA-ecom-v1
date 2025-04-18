import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Validate required environment variables when loading this module
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseServiceKey) {
  throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY")
}

/**
 * Creates a Supabase client with server-side auth
 * This should be used in API routes and server components
 * Uses service role key that can bypass RLS policies
 */
export function createServerClient() {
  const cookieStore = cookies()

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // Additional cookie operations aren't applicable in a read-only function
    },
  })
}

/**
 * Creates a Supabase admin client with service role key
 * This should be used only for admin operations from server
 */
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Checks if a user has admin role from the session
 * Use in API routes to protect admin functions
 */
export async function isUserAdmin(userId: string) {
  if (!userId) return false
  
  try {
    const adminClient = createAdminClient()
    
    const { data, error } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single()
    
    if (error || !data) return false
    
    return data.role === "admin"
  } catch (error) {
    console.error("Error checking admin role:", error)
    return false
  }
}
