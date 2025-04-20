"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export type ProductFormData = {
  name: string
  description: string
  price: number
  salePrice?: number
  stock: number
  category: string
  slug: string
  imageUrl: string
  galleryImages?: string[]
  features?: string[]
}

export async function createProduct(data: ProductFormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from("products")
      .select("slug")
      .eq("slug", data.slug)
      .single()

    if (existingProduct) {
      return { error: "A product with this slug already exists" }
    }

    // Insert new product
    const { data: newProduct, error } = await supabase
      .from("products")
      .insert([
        {
          name: data.name,
          description: data.description,
          price: data.price,
          sale_price: data.salePrice || null,
          stock: data.stock,
          category: data.category,
          slug: data.slug,
          image_url: data.imageUrl,
          gallery_images: data.galleryImages || [],
          features: data.features || []
        }
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return { error: "Failed to create product" }
    }

    revalidatePath("/admin/products")
    return { data: newProduct }
  } catch (error) {
    console.error("Error in createProduct:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateProduct(productId: string, data: ProductFormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Check if slug already exists for other products
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, slug")
      .eq("slug", data.slug)
      .neq("id", productId)
      .single()

    if (existingProduct) {
      return { error: "A product with this slug already exists" }
    }

    // Update product
    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update({
        name: data.name,
        description: data.description,
        price: data.price,
        sale_price: data.salePrice || null,
        stock: data.stock,
        category: data.category,
        slug: data.slug,
        image_url: data.imageUrl,
        gallery_images: data.galleryImages || [],
        features: data.features || []
      })
      .eq("id", productId)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return { error: "Failed to update product" }
    }

    revalidatePath("/admin/products")
    return { data: updatedProduct }
  } catch (error) {
    console.error("Error in updateProduct:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deleteProduct(productId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)

    if (error) {
      console.error("Error deleting product:", error)
      return { error: "Failed to delete product" }
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteProduct:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getProduct(productId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()

    if (error) {
      console.error("Error fetching product:", error)
      return { error: "Failed to fetch product" }
    }

    return { data }
  } catch (error) {
    console.error("Error in getProduct:", error)
    return { error: "An unexpected error occurred" }
  }
} 