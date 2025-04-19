import { notFound } from "next/navigation"
import Image from "next/image"
import { Metadata } from "next"
import { supabase } from "@/lib/supabase/client"
import AddToCartButton from "@/components/shop/AddToCartButton"
import ProductGallery from "@/components/shop/ProductGallery"
import RelatedProducts from "@/components/shop/RelatedProducts"
import ProductReviews from "@/components/shop/ProductReviews"

interface ProductPageProps {
  params: {
    slug: string
  }
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  sale_price?: number
  category_id: string
  stock_quantity: number
  image_url: string
  gallery_images?: string[]
  features?: string[]
  category?: {
    name: string
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    return {
      title: "Product Not Found | Abaya Elegance",
      description: "The requested product could not be found.",
    }
  }
  
  return {
    title: `${product.name} | Abaya Elegance`,
    description: product.description || `${product.name} - Abaya Elegance Collection`,
  }
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:category_id (
          name,
          slug
        )
      `)
      .eq('slug', slug)
      
    if (error) {
      console.error('Error fetching product:', error)
      return null
    }
    
    if (!data || data.length === 0) {
      console.log(`No product found with slug: ${slug}`)
      return null
    }
    
    return data[0]
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    notFound()
  }

  const isOnSale = product.sale_price && product.sale_price < product.price
  const productImages = [
    product.image_url,
    ...(product.gallery_images || []),
  ].filter(Boolean)
  
  return (
    <div className="bg-[#f9f6f2]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery images={productImages} productName={product.name} />
          </div>
          
          {/* Product Details */}
          <div className="flex flex-col">
            {product.category && (
              <div className="mb-2">
                <a 
                  href={`/categories/${product.category.slug}`} 
                  className="text-[#8a7158] hover:text-[#6d5944] text-sm font-medium"
                >
                  {product.category.name}
                </a>
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-serif font-light text-[#333] mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-2 mb-6">
              {isOnSale ? (
                <>
                  <span className="text-2xl font-medium text-[#8a7158]">
                    ${product.sale_price?.toFixed(2)}
                  </span>
                  <span className="text-lg text-[#666] line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-[#8a7158] text-white">
                    SALE
                  </span>
                </>
              ) : (
                <span className="text-2xl font-medium text-[#8a7158]">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="prose prose-stone max-w-none mb-8">
              <p>{product.description}</p>
            </div>
            
            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-[#333] mb-3">Features</h3>
                <ul className="list-disc list-inside space-y-1 text-[#666]">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-auto">
              <div className="mb-6">
                <div className="flex items-center gap-4 text-sm text-[#666]">
                  <div className="flex items-center gap-1">
                    <span className={`w-3 h-3 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>{product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                </div>
              </div>
              
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
        
        {/* Product Reviews */}
        <div className="mt-16">
          <ProductReviews productId={product.id} />
        </div>
        
        {/* Related Products */}
        <div className="mt-16">
          <RelatedProducts 
            categoryId={product.category_id} 
            currentProductId={product.id} 
          />
        </div>
      </div>
    </div>
  )
} 