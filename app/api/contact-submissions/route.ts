import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { z } from "zod"

// Schema for contact submissions
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(100),
  message: z.string().min(10).max(1000),
  phone: z.string().optional(),
})

// POST handler for creating a new contact submission
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    
    const validationResult = contactSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    // Add metadata
    const contactData = {
      ...validationResult.data,
      ip_address: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      status: "new",
    }
    
    // Insert the contact submission
    const { data: submission, error } = await supabase
      .from("contact_submissions")
      .insert(contactData)
      .select()
      .single()
    
    if (error) {
      console.error("Error submitting contact form:", error)
      return NextResponse.json(
        { error: "Failed to submit contact form" },
        { status: 500 }
      )
    }
    
    // You could add email notification logic here
    // Example: await sendNotificationEmail(contactData)
    
    return NextResponse.json(
      { 
        message: "Contact form submitted successfully",
        id: submission.id
      }, 
      { status: 201 }
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// GET handler for fetching contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // This endpoint should be admin-only, but you need to implement the auth check
    // For now, we'll implement a simple API key check
    const apiKey = request.headers.get("x-api-key")
    const validApiKey = process.env.ADMIN_API_KEY
    
    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    // Build query
    let query = supabase
      .from("contact_submissions")
      .select("*", { count: "exact" })
    
    // Filter by status if provided
    if (status) {
      query = query.eq("status", status)
    }
    
    // Apply pagination and sorting
    query = query
      .order("created_at", { ascending: false })
      .range(from, to)
    
    // Execute query
    const { data: submissions, count, error } = await query
    
    if (error) {
      console.error("Error fetching contact submissions:", error)
      return NextResponse.json(
        { error: "Failed to fetch contact submissions" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      submissions,
      totalCount: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 