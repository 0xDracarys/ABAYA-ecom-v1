"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { deleteProduct } from "@/app/actions/product"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category_id: string
  image_url: string
  created_at: string
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Load products on component mount
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          
        if (error) {
          console.error("Error loading products:", error)
          toast.error("Failed to load products")
          return
        }
        
        setProducts(data || [])
      } catch (err) {
        console.error("Unexpected error:", err)
        toast.error("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProducts()
  }, [])

  async function handleDeleteProduct(id: string) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const result = await deleteProduct(id)

      if (result.error) {
        toast.error("Failed to delete product")
        return
      }

      toast.success("Product deleted successfully")
      
      // Update local state
      setProducts(products.filter(product => product.id !== id))
      
      // Refresh the page data
      router.refresh()
    } catch (err) {
      toast.error("An error occurred while deleting the product")
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {searchQuery
              ? "No products found matching your search."
              : "No products added yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <div className="aspect-square relative">
                <img
                  src={product.image_url || "/placeholder-product.png"}
                  alt={product.name}
                  className="object-cover w-full h-full rounded-t-lg"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-lg font-bold">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
} 