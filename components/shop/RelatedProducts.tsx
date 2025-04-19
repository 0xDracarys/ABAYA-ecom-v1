"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientImage } from "@/components/ui/client-image"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  image_url: string
}

interface RelatedProductsProps {
  categoryId: string
  currentProductId: string
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, price, image_url')
          .eq('category_id', categoryId)
          .neq('id', currentProductId)
          .limit(4)
        
        if (error) {
          throw error
        }
        
        setRelatedProducts(data || [])
      } catch (error) {
        console.error('Error fetching related products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRelatedProducts()
  }, [categoryId, currentProductId])
  
  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-serif font-light text-[#333] mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (relatedProducts.length === 0) {
    return null
  }
  
  return (
    <div>
      <h2 className="text-2xl font-serif font-light text-[#333] mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <Link 
            href={`/product/${product.slug}`} 
            key={product.id}
            className="group block bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <ClientImage
                src={product.image_url || 'https://source.unsplash.com/random/600x800/?abaya'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
                fallbackColor="#f5f5f5"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-[#333] mb-1 truncate">{product.name}</h3>
              <p className="text-sm text-[#8a7158] font-medium">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 