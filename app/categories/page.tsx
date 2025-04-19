import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories | Abaya Elegance",
  description: "Browse our complete collection of premium abayas by category",
}

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-8">
        Our Collections
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* This will be populated with actual category data */}
        {["Casual", "Formal", "Embroidered", "Modern", "Traditional", "Premium"].map((category) => (
          <div 
            key={category} 
            className="relative overflow-hidden group bg-gray-100 aspect-[3/4]"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-2xl font-medium text-[#8a7158] z-10">{category}</h3>
            </div>
            
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300"></div>
          </div>
        ))}
      </div>
    </div>
  )
} 