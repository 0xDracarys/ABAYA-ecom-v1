import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import ProductsList from "./ProductsList"
import { Spinner } from "@/components/ui/spinner"

async function getProducts() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching products:", error)
    throw new Error("Failed to load products")
  }
  
  return products || []
}

export default async function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      }>
        <ProductsList />
      </Suspense>
    </div>
  )
}

// Create the client component in a new file at app/admin/products/ProductsList.tsx
// This will handle the search, filtering, and delete operations on the client side 