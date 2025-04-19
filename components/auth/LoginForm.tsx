"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { signIn } from "@/lib/supabase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" aria-disabled={pending} disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  )
}

export default function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  async function handleSubmit(formData: FormData) {
    setErrorMessage(null)
    
    // Log submitted credentials for debugging
    console.log(`Attempting login with: ${formData.get('email')}`)
    
    try {
      const result = await signIn(formData)
      
      if (result?.error) {
        setErrorMessage(result.error)
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
    }
  }
  
  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <AtSymbolIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full pl-10 pr-3 py-2"
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <div className="text-sm">
              <a href="#" className="font-medium text-[#8a7158] hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <KeyIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full pl-10 pr-3 py-2"
              placeholder="Enter your password"
            />
          </div>
        </div>
      </div>
      
      <input type="hidden" name="redirectTo" value={redirectTo} />
      
      <SubmitButton />
      
      {errorMessage && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
    </form>
  )
} 