"use client"

import { useState } from "react"
import { ClientImage } from "@/components/ui/client-image"

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // If no images are provided, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square relative bg-gray-100">
        <ClientImage
          src="/placeholder-image.png"
          alt={productName}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          fallbackColor="#f5f5f5"
        />
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square relative bg-white overflow-hidden">
        <ClientImage
          src={images[currentImageIndex]}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          fallbackColor="#f9f9f9"
        />
      </div>
      
      {/* Thumbnails - only show if there's more than 1 image */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`aspect-square relative border-2 transition-all ${
                index === currentImageIndex 
                  ? "border-[#8a7158]" 
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <ClientImage
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 10vw"
                fallbackColor="#f5f5f5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 