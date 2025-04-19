"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
}

// Fallback categories in case database is empty
const FALLBACK_CATEGORIES = [
  {
    id: "1",
    name: "Classic Collection",
    slug: "classic",
    description: "Timeless designs for everyday elegance",
    image_url: "https://source.unsplash.com/random/600x800/?abaya,classic"
  },
  {
    id: "2",
    name: "Occasion Wear",
    slug: "occasion",
    description: "Abayas for special events and celebrations",
    image_url: "https://source.unsplash.com/random/600x800/?abaya,luxury"
  },
  {
    id: "3",
    name: "Casual Comfort",
    slug: "casual",
    description: "Comfortable, stylish abayas for daily wear",
    image_url: "https://source.unsplash.com/random/600x800/?abaya,casual"
  }
]

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .limit(3)
          .order('name')
        
        if (error) {
          throw error
        }
        
        if (data && data.length > 0) {
          setCategories(data)
        } else {
          // Use fallback data if no categories in DB
          setCategories(FALLBACK_CATEGORIES)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories(FALLBACK_CATEGORIES)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative">
              <Skeleton className="h-96 w-full" />
              <div className="mt-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f9f6f2] py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[#333] mb-3">
            Explore Our Collections
          </h2>
          <p className="text-[#666] max-w-xl mx-auto">
            Discover our curated categories of elegant abayas, designed for every occasion and personal style.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group block relative overflow-hidden bg-white"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-serif mb-2">{category.name}</h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">{category.description}</p>
                <span className="inline-flex items-center text-[#f9f6f2] font-light">
                  Explore Collection <ChevronRight className="ml-1 w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
