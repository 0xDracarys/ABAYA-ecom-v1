"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Mail, Calendar, ShoppingBag } from "lucide-react"

interface Customer {
  id: string
  email: string
  created_at: string
  full_name: string | null
  avatar_url: string | null
  orders_count: number
  total_spent: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      setLoading(true)
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        setError("Failed to load customers")
        return
      }

      // Then get order statistics for each customer
      const customersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("total")
            .eq("user_id", profile.id)

          if (ordersError) {
            console.error("Error fetching orders for customer:", ordersError)
            return {
              ...profile,
              orders_count: 0,
              total_spent: 0
            }
          }

          return {
            ...profile,
            orders_count: orders.length,
            total_spent: orders.reduce((sum, order) => sum + (order.total || 0), 0)
          }
        })
      )

      setCustomers(customersWithStats)
    } catch (err) {
      console.error("Error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Search by email or name..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {customer.avatar_url ? (
                    <img
                      src={customer.avatar_url}
                      alt={customer.full_name || "Customer"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Mail className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {customer.full_name || "Unnamed Customer"}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(customer.created_at).toLocaleDateString()}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Orders
                    </div>
                    <p className="text-2xl font-bold">{customer.orders_count}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">$</span>
                      Total Spent
                    </div>
                    <p className="text-2xl font-bold">
                      ${customer.total_spent.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {searchQuery
              ? "No customers found matching your search."
              : "No customers yet."}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 