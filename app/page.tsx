import FeaturedProducts from "@/components/home/FeaturedProducts"
import Hero from "@/components/home/Hero"
import CategoryShowcase from "@/components/home/CategoryShowcase"
import Newsletter from "@/components/home/Newsletter"
import Testimonials from "@/components/home/Testimonials"

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8">
      <Hero />
      <CategoryShowcase />
      <FeaturedProducts />
      <Testimonials />
      <Newsletter />
    </div>
  )
}
