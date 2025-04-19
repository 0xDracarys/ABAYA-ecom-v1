import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClientImage } from "@/components/ui/client-image"

export default function NotFound() {
  return (
    <div className="bg-[#f9f6f2] min-h-[70vh] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="relative h-32 w-32 mx-auto mb-8">
            <ClientImage
              src="/404.svg"
              alt="404 Icon"
              fill
              className="object-contain"
              fallbackColor="transparent"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-light mb-6 text-[#333]">404</h1>
          <h2 className="text-2xl font-serif text-[#8a7158] mb-6">Page Not Found</h2>
          <p className="text-[#666] mb-8">
            The page you are looking for doesn't exist or has been moved.
            Our elegant collection awaits you on our home page.
          </p>
          
          <Link href="/">
            <Button className="bg-[#8a7158] hover:bg-[#6d5944] text-white rounded-none px-8 py-2">
              Return to Homepage
            </Button>
          </Link>
          
          <div className="mt-12 pt-8 border-t border-[#e5e2dd]">
            <p className="text-[#666] mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/shop" className="text-[#8a7158] hover:text-[#6d5944] hover:underline">
                Shop Collection
              </Link>
              <Link href="/categories" className="text-[#8a7158] hover:text-[#6d5944] hover:underline">
                Categories
              </Link>
              <Link href="/support" className="text-[#8a7158] hover:text-[#6d5944] hover:underline">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 