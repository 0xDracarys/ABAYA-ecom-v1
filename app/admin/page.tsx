import { Metadata } from "next"
import AdminAuthCheck from "@/components/admin/AdminAuthCheck"
import AdminDashboard from "@/components/admin/AdminDashboard"

export const metadata: Metadata = {
  title: "Admin Dashboard | Abaya Elegance",
  description: "Admin dashboard for managing the Abaya Elegance e-commerce platform",
}

export default function AdminPage() {
  return (
    <AdminAuthCheck>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <AdminDashboard />
      </div>
    </AdminAuthCheck>
  )
}