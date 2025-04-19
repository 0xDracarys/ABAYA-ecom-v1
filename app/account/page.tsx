"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login?redirect=/account')
        return
      }
      
      setUser(session.user)
      setLoading(false)
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-transparent" aria-label="Loading">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-8">
        My Account
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push('/account/edit')}>
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Track your recent purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">You haven't placed any orders yet.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push('/account/orders')}>
                View All Orders
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            className="border-[#8a7158] text-[#8a7158] hover:bg-[#8a7158]/10"
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
} 