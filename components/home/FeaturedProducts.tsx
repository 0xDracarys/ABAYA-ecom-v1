"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"

type Product = {
  id: string
  name: string
  price: number
  discount_price: number | null
  slug: string
  image_url: string
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true)

        // Get featured products
        const { data: featuredProducts, error } = await supabase
          .from("products")
          .select(`
            id, 
            name, 
            price, 
            discount_price, 
            slug
          `)
          .eq("featured", true)
          .limit(4)

        if (error) throw error

        // Get primary image for each product
        const productsWithImages = await Promise.all(
          featuredProducts.map(async (product) => {
            const { data: imageData } = await supabase
              .from("product_images")
              .select("image_url")
              .eq("product_id", product.id)
              .eq("is_primary", true)
              .single()

            return {
              ...product,
              image_url: imageData?.image_url || "/placeholder.svg?height=300&width=300",
            }
          }),
        )

        setProducts(productsWithImages)
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-80 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`}>
            <div className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <div className="mt-2 flex items-center">
                  {product.discount_price ? (
                    <>
                      <p className="text-lg font-medium text-primary">{formatPrice(product.discount_price)}</p>
                      <p className="ml-2 text-sm text-gray-500 line-through">{formatPrice(product.price)}</p>
                    </>
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{formatPrice(product.price)}</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link href="/shop">
          <Button variant="outline" size="lg">
            View All Products
          </Button>
        </Link>
      </div>
    </div>
  )
}
