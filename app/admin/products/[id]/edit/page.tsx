import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { ProductForm } from "@/components/admin/ProductForm"
import { Spinner } from "@/components/ui/spinner"
import { Suspense } from "react"

interface EditProductPageProps {
  params: {
    id: string
  }
}

async function GetProduct({ id }: { id: string }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  console.log(`[EditProduct] Fetching product with ID: ${id}`)
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !product) {
    console.error("[EditProduct] Error fetching product:", error)
    notFound()
  }

  console.log(`[EditProduct] Successfully fetched product: ${product.name}`)
  
  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    salePrice: product.sale_price || undefined,
    stock: product.stock,
    category: product.category || "",
    slug: product.slug,
    imageUrl: product.image_url,
    galleryImages: product.gallery_images || [],
    features: product.features || []
  }

  return <ProductForm initialData={productData} />
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      
      <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="lg" /></div>}>
        <GetProduct id={id} />
      </Suspense>
    </div>
  )
} 