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
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleSubmit(formData: FormData) {
    setErrorMessage(null)
    setIsLoading(true)
    
    try {
      // Call signIn - will redirect or return error
      const result = await signIn(formData).catch(error => {
        // Handle NEXT_REDIRECT "errors" - these are actually successful redirects
        if (error && error.message && error.message.includes('NEXT_REDIRECT')) {
          // Successful login and redirect, silently return null
          return null
        }
        throw error // Re-throw other errors
      })
      
      // If we get a result with an error, show it
      if (result && result.error) {
        console.error('Sign-in error:', result.error)
        setErrorMessage(result.error)
        return
      }
      
      // If no redirect occurred (unusual), manually redirect
      if (result !== null) {
        window.location.href = '/'
      }
      
    } catch (error) {
      // Final error handling
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        // This is another way the redirect might manifest - it's not an error
        return
      }
      
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }
  
  if (errorMessage?.includes('not properly configured')) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Configuration Error
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>The authentication system is not properly configured. Please contact the administrator.</p>
            </div>
          </div>
        </div>
      </div>
    )
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
              disabled={isLoading}
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
              disabled={isLoading}
              className="block w-full pl-10 pr-3 py-2"
              placeholder="Enter your password"
            />
          </div>
        </div>
      </div>
      
      <input type="hidden" name="redirectTo" value={redirectTo} />
      
      <SubmitButton />
      
      {errorMessage && !errorMessage.includes('not properly configured') && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
    </form>
  )
} 