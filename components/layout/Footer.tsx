import Link from "next/link"
import Image from "next/image"
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  MapPin, 
  Mail, 
  Phone
} from "lucide-react"

const SOCIAL_LINKS = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
]

const QUICK_LINKS = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/support" },
]

const RESOURCES = [
  { name: "Sizing Guide", href: "/sizing-guide" },
  { name: "Care Instructions", href: "/care-instructions" },
  { name: "Shipping & Returns", href: "/shipping" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-[#0d0d0d] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="block mb-4">
              <h2 className="text-xl font-serif">Abaya Elegance</h2>
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Premium modest fashion crafted with elegance and quality.
              Discover timeless abayas for every occasion.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((social) => (
                <a 
                  key={social.name} 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#8a7158] transition-colors"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              {RESOURCES.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-[#8a7158] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  123 Fashion Avenue<br />
                  Dubai, United Arab Emirates
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-[#8a7158] mr-3 flex-shrink-0" />
                <a href="tel:+971555555555" className="text-gray-400 hover:text-white transition-colors">
                  +971 55 555 5555
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-[#8a7158] mr-3 flex-shrink-0" />
                <a href="mailto:info@abayaelegance.com" className="text-gray-400 hover:text-white transition-colors">
                  info@abayaelegance.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; {currentYear} Abaya Elegance. All rights reserved.</p>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-[#8a7158] mr-2">Payment methods:</span>
            <div className="flex">
              {["visa", "mastercard", "amex", "paypal"].map((card) => (
                <span key={card} className="mx-1">
                  {card}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
