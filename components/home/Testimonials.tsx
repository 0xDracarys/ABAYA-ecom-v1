import Image from "next/image"

const testimonials = [
  {
    id: 1,
    content:
      "I absolutely love the quality and design of my abaya. It's elegant, comfortable, and perfect for both everyday wear and special occasions.",
    author: "Sarah Ahmed",
    role: "Loyal Customer",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    content:
      "The attention to detail in these abayas is remarkable. The fabric is premium quality and the stitching is flawless. Highly recommend!",
    author: "Fatima Khan",
    role: "Fashion Blogger",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    content:
      "I've ordered multiple abayas from this store and have never been disappointed. The shipping is fast and the customer service is excellent.",
    author: "Aisha Rahman",
    role: "Repeat Customer",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function Testimonials() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="relative h-10 w-10 rounded-full overflow-hidden mr-4">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{testimonial.author}</h3>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
            <p className="text-gray-600 italic">"{testimonial.content}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}
