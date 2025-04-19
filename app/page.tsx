import { Suspense } from "react"
import dynamic from "next/dynamic"
import FeaturedProducts from "@/components/home/FeaturedProducts"
import Hero from "@/components/home/Hero"
import CategoryShowcase from "@/components/home/CategoryShowcase"
import Newsletter from "@/components/home/Newsletter"
import Testimonials from "@/components/home/Testimonials"
import ErrorBoundary from "@/components/common/ErrorBoundary"
import { Skeleton } from "@/components/ui/skeleton"

// Loading states for each section
const HeroSkeleton = () => (
  <div className="h-[70vh] bg-[#0d0d0d] animate-pulse" />
)

const CategorySkeleton = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="space-y-8">
      <Skeleton className="h-12 w-64 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
    </div>
  </div>
)

const FeaturedSkeleton = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="space-y-8">
      <Skeleton className="h-12 w-64 mx-auto" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
    </div>
  </div>
)

export default function Home() {
  return (
    <div>
      <ErrorBoundary fallback={<HeroSkeleton />}>
        <Suspense fallback={<HeroSkeleton />}>
          <Hero />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<CategorySkeleton />}>
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryShowcase />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={<FeaturedSkeleton />}>
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense>
          <Testimonials />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense>
          <Newsletter />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
