import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Abaya Elegance",
  description: "Learn about our story, values, and commitment to quality abaya designs",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-8">
          Our Story
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p>
            Abaya Elegance was founded with a singular vision: to create modest fashion that never compromises on style or quality. Our journey began in 2018 when our founder, inspired by the rich heritage of traditional abayas, set out to design pieces that honored tradition while embracing contemporary aesthetics.
          </p>
          
          <p>
            Each design in our collection is carefully crafted using premium fabrics and meticulous attention to detail. We believe that modest fashion should be both beautiful and comfortable, allowing women to express their personal style while adhering to their values.
          </p>
          
          <p>
            Our team of dedicated designers and artisans work tirelessly to create pieces that stand the test of time, both in quality and design. From intricate embroidery to innovative silhouettes, every element is considered with care.
          </p>
          
          <p>
            Today, Abaya Elegance is proud to serve customers worldwide, bringing our unique blend of tradition and modernity to women who appreciate the art of modest dressing. We remain committed to our founding principles of quality, craftsmanship, and thoughtful design in everything we do.
          </p>
        </div>
      </div>
    </div>
  )
} 