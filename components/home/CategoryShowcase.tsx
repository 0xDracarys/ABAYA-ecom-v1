"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"

type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
}

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("categories").select("id, name, slug, image_url").limit(3)

        if (error) throw error

        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // If no categories are available yet, show placeholders
  if (categories.length === 0) {
    const placeholderCategories = [
      { id: "1", name: "Casual Abayas", slug: "#", image_url: "/placeholder.svg?height=400&width=600" },
      { id: "2", name: "Formal Abayas", slug: "#", image_url: "/placeholder.svg?height=400&width=600" },
      { id: "3", name: "Premium Collection", slug: "#", image_url: "/placeholder.svg?height=400&width=600" },
    ]

    return (
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {placeholderCategories.map((category) => (
            <div key={category.id} className="text-center">
              <div className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src={category.image_url || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`}>
            <div className="text-center group">
              <div className="relative h-64 overflow-hidden rounded-lg transition-all duration-300 group-hover:shadow-lg">
                <Image
                  src={category.image_url || "/placeholder.svg?height=400&width=600"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link href="/categories" className="text-primary font-medium hover:underline">
          View All Categories
        </Link>
      </div>
    </div>
  )
}
