import { Metadata } from "next"
import { isAdmin } from "@/lib/supabase/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Admin Dashboard | Abaya Elegance",
  description: "Manage your store, products, orders, and customers.",
}

export default async function AdminDashboardPage() {
  // Check if the user is an admin
  // This runs server-side, ensuring protected access
  try {
    const adminStatus = await isAdmin()
    
    // If not admin, redirect to login
    if (!adminStatus) {
      console.log('Non-admin user tried to access admin dashboard')
      return redirect('/auth/login?message=You must be an admin to view this page')
    }
    
    // User is admin, show dashboard
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Orders Panel */}
          <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-500 mt-1">Pending orders</p>
            <button className="mt-4 text-blue-500 text-sm font-medium hover:underline">
              View All Orders →
            </button>
          </div>
          
          {/* Products Panel */}
          <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-green-500">
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-500 mt-1">Total products</p>
            <button className="mt-4 text-green-500 text-sm font-medium hover:underline">
              Manage Products →
            </button>
          </div>
          
          {/* Customers Panel */}
          <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500">
            <h2 className="text-xl font-semibold mb-4">Customers</h2>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-gray-500 mt-1">Registered users</p>
            <button className="mt-4 text-purple-500 text-sm font-medium hover:underline">
              View Customers →
            </button>
          </div>
          
          {/* Revenue Panel */}
          <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-amber-500">
            <h2 className="text-xl font-semibold mb-4">Revenue</h2>
            <p className="text-3xl font-bold">$0.00</p>
            <p className="text-sm text-gray-500 mt-1">Total revenue</p>
            <button className="mt-4 text-amber-500 text-sm font-medium hover:underline">
              View Reports →
            </button>
          </div>
        </div>
        
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-[#8a7158] hover:bg-[#6d5944] text-white px-4 py-2 rounded">
              Add New Product
            </button>
            <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded">
              View Orders
            </button>
            <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded">
              Manage Inventory
            </button>
            <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded">
              Update Settings
            </button>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error checking admin status:', error)
    return redirect('/auth/login?message=An error occurred. Please try again.')
  }
} 