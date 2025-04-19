"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Please enter your email",
        variant: "destructive",
      })
      return
    }
    
    try {
      setLoading(true)
      
      // In a real application, you'd make an API call to subscribe the user
      // For example:
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // })
      
      // For now, simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Thank you for subscribing",
        description: "You'll receive our latest news and exclusive offers.",
      })
      
      setEmail("")
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="bg-[#f9f0e1] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[#333] mb-3">
            Join Our Community
          </h2>
          <p className="text-[#666] mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter and be the first to know about new collections, 
            exclusive offers, and styling inspirations.
          </p>
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border-[#e5e2dd] focus:border-[#8a7158] focus:ring-[#8a7158]"
              required
            />
            <Button 
              type="submit"
              disabled={loading}
              className="bg-[#8a7158] hover:bg-[#6d5944] text-white rounded-none"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          <p className="text-xs text-[#666] mt-4">
            By subscribing, you agree to receive marketing communications from us.
            <br />
            You can unsubscribe at any time. Read our <a href="/privacy" className="underline hover:text-[#8a7158]">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
