import { Metadata } from "next"
import ContactForm from "@/components/common/ContactForm"

export const metadata: Metadata = {
  title: "Support | Abaya Elegance",
  description: "Get help with your orders, products, or any other inquiries about Abaya Elegance.",
}

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers. Payment information is securely processed and we never store your full credit card details."
  },
  {
    question: "How long does shipping take?",
    answer: "Domestic orders typically take 3-5 business days. International shipping can take 7-14 business days depending on the destination country and customs processing."
  },
  {
    question: "Can I return or exchange my order?",
    answer: "Yes, we offer returns and exchanges within 30 days of delivery. Items must be in their original condition with tags attached. Please visit our Returns Policy page for more details."
  },
  {
    question: "How do I care for my abaya?",
    answer: "We recommend gentle hand washing with cold water or dry cleaning for most of our abayas. Each product has specific care instructions on its product page and attached to the garment."
  },
  {
    question: "Do you offer custom sizes?",
    answer: "Yes, we offer custom sizing for most of our collections. Please contact our customer support team to discuss your requirements and any additional costs."
  },
  {
    question: "Are your abayas ethically produced?",
    answer: "Absolutely. We work only with ethical manufacturers who provide fair wages and safe working conditions. We're committed to sustainable and ethical fashion practices."
  }
]

export default function SupportPage() {
  return (
    <div className="bg-[#f9f6f2]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 text-[#333]">Support & Contact</h1>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            We're here to help you with any questions or concerns about your Abaya Elegance experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-medium text-[#333] mb-6">Get in Touch</h2>
            <ContactForm />
          </div>
          
          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-medium text-[#333] mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-[#e5e2dd] p-6"
                >
                  <h3 className="text-lg font-medium text-[#333] mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-[#666]">{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center lg:text-left">
              <p className="text-[#666] mb-2">
                Can't find the answer you're looking for?
              </p>
              <p className="text-[#8a7158]">
                Email us at <a href="mailto:support@abayaelegance.com" className="underline hover:text-[#6d5944]">support@abayaelegance.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 