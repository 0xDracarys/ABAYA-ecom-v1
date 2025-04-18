import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

// Schema for tag validation
const tagSchema = z.object({
  name: z.string().min(2).max(30),
})

// Helper function to check if user is admin
async function isAdmin() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
    },
  })
  
  const { data: { session } } = await authClient.auth.getSession()
  
  if (!session) {
    return false
  }
  
  const { data: userRole } = await authClient
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single()
  
  return userRole?.role === "admin"
}

// Helper function to get admin client
async function getAdminClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceKey) {
    throw new Error("Missing service role key for admin operations")
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// GET handler for fetching all tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const withProductCount = searchParams.get("withProductCount") === "true"
    
    let query = supabase.from("tags").select("*")
    
    // Order by name alphabetically
    query = query.order("name", { ascending: true })
    
    const { data: tags, error } = await query
    
    if (error) {
      console.error("Error fetching tags:", error)
      return NextResponse.json(
        { error: "Failed to fetch tags" },
        { status: 500 }
      )
    }
    
    // If requested, fetch product counts for each tag
    if (withProductCount && tags.length > 0) {
      const tagIds = tags.map((tag) => tag.id)
      
      // Get product counts for each tag through product_tags junction table
      const { data: productTagCounts, error: countError } = await supabase
        .from("product_tags")
        .select("tag_id, count")
        .in("tag_id", tagIds)
        .group("tag_id")
      
      if (!countError && productTagCounts) {
        // Map product counts to tags
        const countsMap = productTagCounts.reduce((acc, item) => {
          acc[item.tag_id] = item.count
          return acc
        }, {})
        
        // Add product count to each tag
        tags.forEach((tag) => {
          tag.product_count = countsMap[tag.id] || 0
        })
      }
    }
    
    return NextResponse.json(tags)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// POST handler for creating a new tag (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin status
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    
    const validationResult = tagSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    // Use admin client for creating tags
    const adminClient = await getAdminClient()
    
    const { data: tag, error } = await adminClient
      .from("tags")
      .insert(validationResult.data)
      .select()
      .single()
    
    if (error) {
      console.error("Error creating tag:", error)
      
      // Check for duplicate name
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A tag with this name already exists" },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to create tag" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 