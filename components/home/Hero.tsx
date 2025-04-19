"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { ClientImage } from "@/components/ui/client-image"

const SLIDES = [
  {
    image: "/abaya-main-page-upper.jpg",
    title: "Elegant Abayas for Every Occasion",
    subtitle: "Crafted with precision and designed with grace"
  },
  {
    image: "/abayajpeg-1.jpeg",
    title: "Luxury in Every Detail",
    subtitle: "Premium fabrics and expert craftsmanship"
  },
  {
    image: "/abayajpeg-2.jpeg",
    title: "Timeless Modest Fashion",
    subtitle: "Where tradition meets contemporary style"
  }
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-[#0d0d0d]">
      {/* Image Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <ClientImage
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            fallbackColor="#333"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-xl">
            <h1 
              className="text-4xl md:text-6xl font-serif font-light text-white mb-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
            >
              {SLIDES[currentSlide].title}
            </h1>
            <p 
              className="text-lg md:text-xl text-white/80 mb-8 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "600ms", animationFillMode: "forwards" }}
            >
              {SLIDES[currentSlide].subtitle}
            </p>
            <div 
              className="flex flex-wrap gap-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "900ms", animationFillMode: "forwards" }}
            >
              <Link href="/shop">
                <Button 
                  size="lg" 
                  className="bg-[#8a7158] hover:bg-[#6d5944] text-white rounded-none px-8"
                >
                  Shop Collection
                </Button>
              </Link>
              <Link href="/categories">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white/10 rounded-none"
                >
                  Browse Categories
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? "bg-[#8a7158]" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
