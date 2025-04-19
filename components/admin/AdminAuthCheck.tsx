"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { supabase } from "@/lib/supabase/client" 

interface AdminAuthCheckProps {
  children: React.ReactNode
}

export function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const { user } = useSupabaseAuth()
  const router = useRouter()

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        setIsLoading(true)
        
        if (!user) {
          router.push("/auth/login?redirectTo=/admin")
          return
        }
        
        // Option 1: Check a custom claim or field on the user record
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error("Error checking admin status:", error)
          router.push("/")
          return
        }
        
        if (data?.is_admin) {
          setIsAuthorized(true)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Error in admin auth check:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAdminStatus()
  }, [user, router])
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner className="w-10 h-10 border-4 border-primary mx-auto mb-4" />
          <p className="text-lg text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }
  
  // Only render children if user is authorized
  return isAuthorized ? <>{children}</> : null
} 