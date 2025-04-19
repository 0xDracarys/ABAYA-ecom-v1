"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Settings, 
  ChevronLeft, 
  LogOut
} from "lucide-react"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { signOut } = useSupabaseAuth()
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }
  
  return (
    <div 
      className={cn(
        "bg-[#1E293B] text-white h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-blue-900">
        {!collapsed && (
          <Link href="/admin" className="font-bold text-lg">
            Abaya Admin
          </Link>
        )}
        <button 
          onClick={toggleSidebar}
          className={cn(
            "p-1.5 rounded-md hover:bg-blue-800 transition-colors",
            collapsed && "mx-auto"
          )}
        >
          <ChevronLeft className={cn(
            "h-5 w-5 transition-transform",
            collapsed && "rotate-180"
          )} />
        </button>
      </div>
      
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 transition-colors hover:bg-blue-800",
                    isActive ? "bg-blue-800" : "transparent",
                    collapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-white" : "text-gray-400"
                  )} />
                  
                  {!collapsed && (
                    <span className="ml-3 truncate">{item.title}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-2 mt-auto border-t border-blue-900">
        <Link 
          href="/"
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-gray-400 hover:bg-blue-800 hover:text-white transition-colors",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Back to Site</span>}
        </Link>
        
        <button
          onClick={() => signOut()}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-gray-400 hover:bg-blue-800 hover:text-white transition-colors w-full",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  )
} 