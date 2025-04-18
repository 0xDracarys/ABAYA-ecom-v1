import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

// Schema for review validation
const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(500),
})

// GET handler for fetching reviews for a specific product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Fetch reviews with user information
    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reviews:", error)
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      )
    }

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// POST handler for creating a new review (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
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
      return NextResponse.json(
        { error: "Authentication required to post a review" },
        { status: 401 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    
    const validationResult = reviewSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const reviewData = {
      ...validationResult.data,
      user_id: session.user.id,
    }
    
    // First check if the product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", reviewData.product_id)
      .single()
    
    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }
    
    // Check if the user has already reviewed this product
    const { data: existingReview, error: existingError } = await supabase
      .from("product_reviews")
      .select("id")
      .match({
        product_id: reviewData.product_id,
        user_id: session.user.id,
      })
      .maybeSingle()
    
    if (!existingError && existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      )
    }
    
    // Insert the review
    const { data: review, error } = await supabase
      .from("product_reviews")
      .insert(reviewData)
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .single()
    
    if (error) {
      console.error("Error creating review:", error)
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      )
    }
    
    // Update the product average rating
    await updateProductAverageRating(reviewData.product_id)
    
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// Helper function to update a product's average rating
async function updateProductAverageRating(productId: string) {
  try {
    // Get all reviews for this product
    const { data: reviews, error: reviewsError } = await supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", productId)
    
    if (reviewsError || !reviews || reviews.length === 0) {
      console.error("Error fetching reviews for rating update:", reviewsError)
      return
    }
    
    // Calculate the average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    
    // Update the product's average rating
    const { error: updateError } = await supabase
      .from("products")
      .update({ 
        rating: averageRating,
        review_count: reviews.length
      })
      .eq("id", productId)
    
    if (updateError) {
      console.error("Error updating product average rating:", updateError)
    }
  } catch (error) {
    console.error("Error in updateProductAverageRating:", error)
  }
} 