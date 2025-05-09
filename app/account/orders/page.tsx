"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function OrdersPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          Back to Account
        </Button>
        
        <h1 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-8">
          My Orders
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              View your order history and check the status of your orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 text-center py-8">
                You haven't placed any orders yet.
              </p>
              
              <div className="flex justify-center pt-4">
                <Link href="/shop">
                  <Button>
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 