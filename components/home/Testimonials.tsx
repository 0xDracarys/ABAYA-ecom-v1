"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, Quote } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  location: string
  avatar: string
  rating: number
  text: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Aisha Rahman",
    location: "Dubai, UAE",
    avatar: "https://source.unsplash.com/random/100x100/?woman,portrait",
    rating: 5,
    text: "The quality of these abayas is exceptional. The fabric feels luxurious and the attention to detail is impressive. I've received countless compliments whenever I wear them."
  },
  {
    id: "2",
    name: "Fatima Al-Sayed",
    location: "Riyadh, Saudi Arabia",
    avatar: "https://source.unsplash.com/random/100x100/?woman,portrait,2",
    rating: 5,
    text: "Elegant designs that blend tradition with contemporary style. I appreciate how versatile these pieces are - perfect for both everyday wear and special occasions."
  },
  {
    id: "3",
    name: "Noor Malik",
    location: "London, UK",
    avatar: "https://source.unsplash.com/random/100x100/?woman,portrait,3",
    rating: 4,
    text: "The customer service is as remarkable as the abayas themselves. When I had a question about sizing, the team was incredibly helpful and ensured I found the perfect fit."
  },
  {
    id: "4",
    name: "Layla Hassan",
    location: "Doha, Qatar",
    avatar: "https://source.unsplash.com/random/100x100/?woman,portrait,4",
    rating: 5,
    text: "These abayas combine modesty with elegance in a way I haven't found elsewhere. The craftsmanship is exceptional, and they maintain their quality even after multiple washes."
  }
]

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext()
    }, 7000)
    
    return () => clearInterval(interval)
  }, [activeIndex])
  
  const goToNext = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % TESTIMONIALS.length)
      setIsAnimating(false)
    }, 500)
  }
  
  const goToPrev = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === 0 ? TESTIMONIALS.length - 1 : prevIndex - 1
      )
      setIsAnimating(false)
    }, 500)
  }
  
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'fill-[#8a7158] text-[#8a7158]' 
            : 'fill-transparent text-gray-300'
        }`} 
      />
    ))
  }
  
  return (
    <div className="bg-[#f9f6f2] py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[#333] mb-3">
            Client Testimonials
          </h2>
          <p className="text-[#666] max-w-xl mx-auto">
            Discover what our valued customers have to say about their Abaya Elegance experience.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          {/* Quote Icon */}
          <div className="absolute left-4 top-4 text-[#8a7158]/20">
            <Quote className="w-16 h-16" />
          </div>
          
          {/* Testimonial Slider */}
          <div className="bg-white p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div 
              className={`transition-opacity duration-500 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={TESTIMONIALS[activeIndex].avatar}
                    alt={TESTIMONIALS[activeIndex].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    {renderStars(TESTIMONIALS[activeIndex].rating)}
                  </div>
                  <h3 className="text-xl font-medium text-[#333]">
                    {TESTIMONIALS[activeIndex].name}
                  </h3>
                  <p className="text-[#8a7158]">{TESTIMONIALS[activeIndex].location}</p>
                </div>
              </div>
              
              <blockquote className="text-lg md:text-xl font-serif text-[#666] italic leading-relaxed">
                "{TESTIMONIALS[activeIndex].text}"
              </blockquote>
            </div>
          </div>
          
          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 gap-2">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating || index === activeIndex) return
                  setIsAnimating(true)
                  setTimeout(() => {
                    setActiveIndex(index)
                    setIsAnimating(false)
                  }, 500)
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-[#8a7158]' : 'bg-[#8a7158]/30'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:translate-x-0 bg-white h-10 w-10 rounded-full shadow flex items-center justify-center text-[#8a7158] hover:bg-[#8a7158] hover:text-white transition-colors z-10"
            aria-label="Previous testimonial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-0 bg-white h-10 w-10 rounded-full shadow flex items-center justify-center text-[#8a7158] hover:bg-[#8a7158] hover:text-white transition-colors z-10"
            aria-label="Next testimonial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
