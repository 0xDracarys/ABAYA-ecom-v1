import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase/client"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Schema for product validation
const productSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  image_url: z.string().url().optional(),
  category_id: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
})

// Helper function to get authenticated Supabase client with admin access
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

// Function to check if user is admin
async function isAdmin(request: NextRequest) {
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
  
  // Check if user is an admin - assuming a 'user_roles' table
  const { data: userRole } = await authClient
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single()
  
  return userRole?.role === "admin"
}

// GET handler for fetching products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : null
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : null
    const featured = searchParams.get("featured") === "true"
    const tag = searchParams.get("tag")
    
    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    // Build the query
    let query = supabase
      .from("products")
      .select("*, categories(*), product_tags!inner(tag_id, tags(name))", { count: "exact" })
    
    // Apply filters
    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }
    
    if (search) {
      query = query.ilike("name", `%${search}%`)
    }
    
    if (minPrice !== null) {
      query = query.gte("price", minPrice)
    }
    
    if (maxPrice !== null) {
      query = query.lte("price", maxPrice)
    }
    
    if (featured) {
      query = query.eq("featured", true)
    }
    
    if (tag) {
      query = query.eq("product_tags.tags.name", tag)
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })
    
    // Apply pagination
    query = query.range(from, to)
    
    // Execute the query
    const { data: products, count, error } = await query
    
    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      products,
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

// POST handler for creating a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin status
    const admin = await isAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    const validationResult = productSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { tags, ...productData } = validationResult.data
    
    // Use admin client for creating products
    const adminClient = await getAdminClient()
    
    // Start a transaction to insert product and tags
    const { data: product, error: productError } = await adminClient
      .from("products")
      .insert(productData)
      .select()
      .single()
    
    if (productError) {
      console.error("Error creating product:", productError)
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      )
    }
    
    // Add tags if provided
    if (tags && tags.length > 0 && product) {
      const productTags = tags.map((tagId) => ({
        product_id: product.id,
        tag_id: tagId,
      }))
      
      const { error: tagError } = await adminClient
        .from("product_tags")
        .insert(productTags)
      
      if (tagError) {
        console.error("Error adding product tags:", tagError)
        // We don't fail the request, but log the error
      }
    }
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// PUT handler for updating a product (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check admin status
    const admin = await isAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      )
    }

    // Get the product ID from the query parameter
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // We use partial validation for updates
    const updateSchema = productSchema.partial()
    const validationResult = updateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { tags, ...productData } = validationResult.data
    
    // Use admin client for updating products
    const adminClient = await getAdminClient()
    
    // First check if the product exists
    const { data: existingProduct, error: findError } = await adminClient
      .from("products")
      .select("id")
      .eq("id", id)
      .single()
    
    if (findError || !existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }
    
    // Update the product
    const { data: updatedProduct, error: updateError } = await adminClient
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single()
    
    if (updateError) {
      console.error("Error updating product:", updateError)
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      )
    }
    
    // Update tags if provided
    if (tags && tags.length > 0) {
      // First delete existing tags
      const { error: deleteTagsError } = await adminClient
        .from("product_tags")
        .delete()
        .eq("product_id", id)
      
      if (deleteTagsError) {
        console.error("Error removing existing product tags:", deleteTagsError)
      }
      
      // Then add new tags
      const productTags = tags.map((tagId) => ({
        product_id: id,
        tag_id: tagId,
      }))
      
      const { error: addTagsError } = await adminClient
        .from("product_tags")
        .insert(productTags)
      
      if (addTagsError) {
        console.error("Error adding updated product tags:", addTagsError)
      }
    }
    
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// DELETE handler for removing a product (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check admin status
    const admin = await isAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      )
    }

    // Get the product ID from the query parameter
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Use admin client for deleting products
    const adminClient = await getAdminClient()
    
    // First delete related records from the product_tags table
    const { error: tagDeleteError } = await adminClient
      .from("product_tags")
      .delete()
      .eq("product_id", id)
    
    if (tagDeleteError) {
      console.error("Error deleting product tags:", tagDeleteError)
      // Continue anyway to try deleting the product
    }
    
    // Then delete the product
    const { error: productDeleteError } = await adminClient
      .from("products")
      .delete()
      .eq("id", id)
    
    if (productDeleteError) {
      console.error("Error deleting product:", productDeleteError)
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 