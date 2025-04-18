import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

// GET handler for fetching a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }
    
    // Fetch the product with related data
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        categories(*),
        product_tags(tags(*)),
        product_reviews(
          id,
          rating,
          comment,
          created_at,
          user_id,
          profiles(name, avatar_url)
        )
      `)
      .eq("id", id)
      .single()
    
    if (error) {
      console.error("Error fetching product:", error)
      
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 500 }
      )
    }
    
    // If product not found
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }
    
    // Format product reviews for easier consumption
    const formattedProduct = {
      ...product,
      tags: product.product_tags?.map((tag) => tag.tags) || [],
      reviews: product.product_reviews || [],
    }
    
    // Remove the nested structure to clean up the response
    delete formattedProduct.product_tags
    delete formattedProduct.product_reviews
    
    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 