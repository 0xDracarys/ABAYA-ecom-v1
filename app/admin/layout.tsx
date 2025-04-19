import { AdminSidebar } from "@/components/admin/AdminSidebar"
import AdminAuthCheck from "@/components/admin/AdminAuthCheck"

export const metadata = {
  title: 'Admin Dashboard | Abaya Elegance',
  description: 'Admin dashboard for managing Abaya Elegance e-commerce platform',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthCheck>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </AdminAuthCheck>
  )
} 