"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name,
            email,
            subject,
            message
          }
        ])
      
      if (error) throw error
      
      // Clear form
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      
      toast({
        title: "Message Received",
        description: "Thank you for your message. We'll get back to you soon!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
      console.error("Error submitting contact form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#666] mb-1">
          Your Name
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-[#e5e2dd] focus:border-[#8a7158] focus:ring-[#8a7158]"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#666] mb-1">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[#e5e2dd] focus:border-[#8a7158] focus:ring-[#8a7158]"
          required
        />
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-[#666] mb-1">
          Subject
        </label>
        <Input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-[#e5e2dd] focus:border-[#8a7158] focus:ring-[#8a7158]"
          required
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[#666] mb-1">
          Message
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full border border-[#e5e2dd] focus:border-[#8a7158] focus:ring-[#8a7158]"
          required
        />
      </div>
      
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#8a7158] hover:bg-[#6d5944] text-white w-full py-6 rounded-none"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
} 