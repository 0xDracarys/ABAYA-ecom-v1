"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import {
  BarChart,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  AlertCircle
} from "lucide-react"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  lowStockProducts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true)
        
        // In a real application, fetch these from Supabase
        // For demo purposes, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        setStats({
          totalOrders: 152,
          totalRevenue: 28945.75,
          totalCustomers: 98,
          totalProducts: 64,
          lowStockProducts: 5
        })
        
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalOrders}</div>
                <p className="text-xs text-muted-foreground">+8.2% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">+4.6% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.lowStockProducts} products low in stock
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have {stats?.totalOrders} total orders. Recent orders will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="flex items-center justify-center h-80 bg-muted/20 rounded-md">
                <div className="flex flex-col items-center text-muted-foreground">
                  <BarChart className="h-8 w-8 mb-2" />
                  <p>Sales analytics will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button className="text-left px-4 py-2 border border-input rounded hover:bg-muted transition-colors">
                Add New Product
              </button>
              <button className="text-left px-4 py-2 border border-input rounded hover:bg-muted transition-colors">
                Manage Orders
              </button>
              <button className="text-left px-4 py-2 border border-input rounded hover:bg-muted transition-colors">
                Update Inventory
              </button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 text-sm border-l-2 border-yellow-500 pl-3 py-1">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">Low Stock Alert</p>
                  <p className="text-muted-foreground">{stats?.lowStockProducts} products need to be restocked</p>
                </div>
              </div>
              <div className="flex gap-2 text-sm border-l-2 border-blue-500 pl-3 py-1">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">System Update</p>
                  <p className="text-muted-foreground">New features available in the admin dashboard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 