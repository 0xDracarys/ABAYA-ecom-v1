"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { ClientImage } from "@/components/ui/client-image"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  sale_price?: number
  image_url: string
}

// Fallback products in case database is empty
const FALLBACK_PRODUCTS = [
  {
    id: "1",
    name: "Embroidered Elegance Abaya",
    slug: "embroidered-elegance",
    price: 189.99,
    sale_price: 149.99,
    image_url: "https://res.cloudinary.com/dssuwgyjm/image/upload/v1/abaya-elegance/product-1.jpg"
  },
  {
    id: "2",
    name: "Ethereal Lace Trim Abaya",
    slug: "ethereal-lace",
    price: 219.99,
    image_url: "https://res.cloudinary.com/dssuwgyjm/image/upload/v1/abaya-elegance/product-2.jpg"
  },
  {
    id: "3",
    name: "Luminous Pearl Detailed Abaya",
    slug: "luminous-pearl",
    price: 249.99,
    image_url: "https://res.cloudinary.com/dssuwgyjm/image/upload/v1/abaya-elegance/product-3.jpg"
  },
  {
    id: "4",
    name: "Royal Butterfly Abaya",
    slug: "royal-butterfly",
    price: 199.99,
    sale_price: 159.99,
    image_url: "https://res.cloudinary.com/dssuwgyjm/image/upload/v1/abaya-elegance/product-4.jpg"
  }
]

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price, sale_price, image_url')
          .eq('is_featured', true)
          .limit(4)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        if (data && data.length > 0) {
          setProducts(data)
        } else {
          // Use fallback data if no products in DB
          setProducts(FALLBACK_PRODUCTS)
        }
      } catch (error) {
        console.error('Error fetching featured products:', error)
        setProducts(FALLBACK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative">
              <Skeleton className="aspect-[3/4] w-full" />
              <div className="mt-4">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-light text-[#333] mb-3">
          Featured Collection
        </h2>
        <p className="text-[#666] max-w-xl mx-auto">
          Our most loved pieces, handpicked for their exceptional design and craftsmanship.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group block bg-white overflow-hidden"
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <ClientImage
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                fallbackColor="#f1f1f1"
              />
              
              {product.sale_price && product.sale_price < product.price && (
                <span className="absolute top-3 right-3 bg-[#8a7158] text-white text-xs font-medium px-2 py-1">
                  SALE
                </span>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium text-[#333] mb-2 truncate">
                {product.name}
              </h3>
              
              <div className="flex items-center gap-2">
                {product.sale_price && product.sale_price < product.price ? (
                  <>
                    <span className="text-[#8a7158] font-medium">
                      {formatPrice(product.sale_price)}
                    </span>
                    <span className="text-[#666] text-sm line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-[#8a7158] font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  className="w-full bg-[#8a7158] hover:bg-[#6d5944] text-white rounded-none"
                  size="sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  View Product
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <Link href="/shop">
          <Button 
            variant="outline" 
            className="border-[#8a7158] text-[#8a7158] hover:bg-[#8a7158]/10 rounded-none px-8"
          >
            View All Collections
          </Button>
        </Link>
      </div>
    </div>
  )
}
