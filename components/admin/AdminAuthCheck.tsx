"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

interface AdminAuthCheckProps {
  children: ReactNode
}

export default function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true)

        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login?redirect=/admin&message=Please login with admin credentials')
          return
        }

        // Check if user has admin role
        const { data: userRole, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()
        
        if (error) {
          console.error("Error checking admin status:", error)
          setIsAdmin(false)
          router.push('/')
          return
        }

        if (userRole?.role !== "admin") {
          console.log("User is not an admin:", session.user.email)
          setIsAdmin(false)
          router.push('/?message=You do not have admin access')
          return
        }

        console.log("Admin access granted for:", session.user.email)
        setIsAdmin(true)
      } catch (error) {
        console.error("Unexpected error during admin check:", error)
        setIsAdmin(false)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // The useEffect will redirect non-admins
  }

  return <>{children}</>
} 