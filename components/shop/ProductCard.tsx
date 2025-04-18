import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    discount_price: number | null
    slug: string
    images?: { id: string; image_url: string; is_primary: boolean }[]
    average_rating?: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  // Find primary image or use the first one
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
  const imageUrl = primaryImage?.image_url || "/placeholder.svg?height=300&width=300"

  return (
    <div className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg">
      <Link href={`/product/${product.slug}`}>
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
          <Image
            src={imageUrl || "/placeholder.svg"}
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

          {/* Rating stars */}
          {product.average_rating && (
            <div className="mt-2 flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.average_rating || 0) ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 15.585l-7.07 3.707 1.35-7.857L.587 7.01l7.87-1.142L10 0l2.543 5.868 7.87 1.142-5.693 5.425 1.35 7.857z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
              <span className="ml-1 text-sm text-gray-500">({product.average_rating.toFixed(1)})</span>
            </div>
          )}
        </div>
      </Link>

      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Button size="sm" variant="secondary" className="rounded-full p-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </div>
    </div>
  )
}
