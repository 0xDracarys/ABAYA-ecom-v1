"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
    
    // In production, you would send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service like Sentry, LogRocket, etc.
      // Example: Sentry.captureException(error);
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h1>
      
      <p className="text-gray-600 max-w-md mb-8">
        We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
      </p>
      
      {/* Only show error details in development */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg text-left w-full max-w-md overflow-auto">
          <p className="text-sm font-medium text-gray-900 mb-2">Error details (only visible in development):</p>
          <p className="text-xs font-mono text-gray-700 break-words">
            {error.message || "Unknown error occurred"}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-gray-500 mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={reset}
          className="bg-[#8a7158] hover:bg-[#6d5944] flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        
        <Link href="/">
          <Button
            variant="outline" 
            className="border-[#8a7158] text-[#8a7158] hover:bg-[#8a7158]/10 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  )
} 