import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Elegant Abayas for Every Occasion
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Discover our premium collection of beautifully crafted abayas that combine tradition with modern style.
            Perfect for everyday wear or special occasions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/shop">
              <Button size="lg">Shop Collection</Button>
            </Link>
            <Link href="/categories" className="text-sm font-semibold leading-6 text-gray-900">
              Browse Categories <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
