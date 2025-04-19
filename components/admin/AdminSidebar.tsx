"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/supabase/auth"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Tag, 
  Settings, 
  LogOut 
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    return pathname === path
      ? "bg-gray-800 text-white"
      : "text-gray-300 hover:bg-gray-700 hover:text-white"
  }
  
  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">Abaya Admin</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/admin" className={`flex items-center p-2 rounded-md ${isActive('/admin')}`}>
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className={`flex items-center p-2 rounded-md ${isActive('/admin/products')}`}>
              <ShoppingBag className="mr-3 h-5 w-5" />
              Products
            </Link>
          </li>
          <li>
            <Link href="/admin/customers" className={`flex items-center p-2 rounded-md ${isActive('/admin/customers')}`}>
              <Users className="mr-3 h-5 w-5" />
              Customers
            </Link>
          </li>
          <li>
            <Link href="/admin/categories" className={`flex items-center p-2 rounded-md ${isActive('/admin/categories')}`}>
              <Tag className="mr-3 h-5 w-5" />
              Categories
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className={`flex items-center p-2 rounded-md ${isActive('/admin/settings')}`}>
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={async () => {
            await signOut({ redirectTo: '/' })
          }}
          className="flex items-center p-2 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
} 