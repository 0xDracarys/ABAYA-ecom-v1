"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

/**
 * TEMPORARY COMPONENT FOR DEVELOPMENT
 * Provides a direct bypass to the admin dashboard without authentication
 * FOR DEVELOPMENT PURPOSES ONLY - REMOVE BEFORE PRODUCTION
 */
export default function BypassAdminLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleBypass = async () => {
    setIsLoading(true)
    
    try {
      // Check if there's an existing session first
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // If no session exists, create one with the admin user
        await supabase.auth.signInWithPassword({
          email: 'admin@abaya-ecom.test',
          password: 'AdminPass123!'
        })
      }
      
      // Store a temporary bypass flag in localStorage
      localStorage.setItem('adminBypass', 'true')
      
      // Navigate to admin dashboard
      router.push('/admin')
    } catch (error) {
      console.error("Error during admin bypass:", error)
      // Even if there's an error, try to navigate anyway
      router.push('/admin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="destructive"
      className="w-full bg-red-600 hover:bg-red-700" 
      onClick={handleBypass}
      disabled={isLoading}
    >
      {isLoading ? "Accessing..." : "⚠️ BYPASS LOGIN - GO TO ADMIN DASHBOARD ⚠️"}
    </Button>
  )
} 