import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"
import LoginForm from "@/components/auth/LoginForm"
import BypassAdminLogin from "@/components/auth/BypassAdminLogin"

export const metadata: Metadata = {
  title: "Login | Abaya Elegance",
  description: "Log in to your Abaya Elegance account",
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string, message?: string }
}) {
  // Console logs will only appear on the server
  console.log("Admin credentials for testing: admin@abaya-ecom.test / AdminPass123!")
  
  const redirectTo = searchParams.redirect || "/"
  const message = searchParams.message
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-32">
          <Image 
            src="/logo.png" 
            alt="Abaya Elegance"
            width={128}
            height={128}
            priority
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/register" className="font-medium text-[#8a7158] hover:underline">
            create a new account
          </Link>
        </p>
        
        {message && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md">
            {message}
          </div>
        )}
        
        {/* Temporary admin credential guidance - Remove before production */}
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-200">
          <strong>Admin Test Credentials:</strong><br />
          Email: admin@abaya-ecom.test<br />
          Password: AdminPass123!
        </div>
        
        {/* TEMPORARY: Direct Admin Access Button */}
        <div className="mt-4">
          <BypassAdminLogin />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  )
}
