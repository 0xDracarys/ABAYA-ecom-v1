import { supabase } from "@/lib/supabase/client"
import { PostgrestFilterBuilder } from "@supabase/postgrest-js"

export type ProductFilter = {
  categoryId?: string | null
  search?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  featured?: boolean
  tag?: string | null
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category_id: string
  rating?: number
  review_count?: number
  stock: number
  featured: boolean
  created_at: string
  updated_at: string
  tags?: any[]
  categories?: any
}

/**
 * Apply filters to a Supabase query for products
 */
export function applyProductFilters(
  query: PostgrestFilterBuilder<any, any, any>,
  filters: ProductFilter
) {
  let filteredQuery = query

  // Category filter
  if (filters.categoryId) {
    filteredQuery = filteredQuery.eq("category_id", filters.categoryId)
  }

  // Search filter
  if (filters.search) {
    filteredQuery = filteredQuery.ilike("name", `%${filters.search}%`)
  }

  // Price range filters
  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    filteredQuery = filteredQuery.gte("price", filters.minPrice)
  }

  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    filteredQuery = filteredQuery.lte("price", filters.maxPrice)
  }

  // Featured filter
  if (filters.featured) {
    filteredQuery = filteredQuery.eq("featured", true)
  }

  // Tag filter
  if (filters.tag) {
    filteredQuery = filteredQuery.eq("product_tags.tags.name", filters.tag)
  }

  // Sorting
  const sortField = filters.sortBy || "created_at"
  const sortDirection = filters.sortOrder || "desc"
  filteredQuery = filteredQuery.order(sortField, { ascending: sortDirection === "asc" })

  return filteredQuery
}

/**
 * Format price as currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0
  const discount = ((originalPrice - salePrice) / originalPrice) * 100
  return Math.round(discount)
}

/**
 * Format product data for display
 */
export function formatProductData(product: Product): Product {
  // Format tags if available
  if (product.tags && Array.isArray(product.tags)) {
    product.tags = product.tags.map(tag => {
      // Handle nested tag structure from the API
      if (tag.tags) {
        return tag.tags
      }
      return tag
    })
  }
  
  return product
}

/**
 * Fetch related products
 */
export async function fetchRelatedProducts(productId: string, categoryId: string, limit = 4) {
  try {
    // First try to get products from the same category
    let { data: relatedProducts, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("category_id", categoryId)
      .neq("id", productId) // Exclude current product
      .limit(limit)
    
    if (error) {
      console.error("Error fetching related products:", error)
      return []
    }
    
    // If we don't have enough related products, get more featured products
    if (!relatedProducts || relatedProducts.length < limit) {
      const additionalLimit = limit - (relatedProducts?.length || 0)
      
      const { data: featuredProducts, error: featuredError } = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("featured", true)
        .neq("id", productId)
        .limit(additionalLimit)
      
      if (!featuredError && featuredProducts) {
        // Combine the results
        relatedProducts = [
          ...(relatedProducts || []),
          ...(featuredProducts || []),
        ].slice(0, limit)
      }
    }
    
    return relatedProducts || []
  } catch (error) {
    console.error("Error in fetchRelatedProducts:", error)
    return []
  }
} 