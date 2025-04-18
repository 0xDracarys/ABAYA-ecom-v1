"use client"

import { useState, useEffect } from "react"
import { checkSupabaseConnection } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

interface ConnectionStatusProps {
  children: React.ReactNode
}

export default function ConnectionStatus({ children }: ConnectionStatusProps) {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showConnected, setShowConnected] = useState(true)

  async function checkConnection() {
    setStatus("checking")
    setIsRetrying(true)
    
    try {
      const result = await checkSupabaseConnection()
      
      if (result.success) {
        setStatus("connected")
        setErrorMessage(null)
      } else {
        setStatus("error")
        setErrorMessage(result.error || "Unknown connection error")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to connect to database")
    } finally {
      setIsRetrying(false)
    }
  }

  // Check connection on mount
  useEffect(() => {
    checkConnection()
  }, [])

  // Handle showing connection success indicator for 3 seconds
  useEffect(() => {
    if (status === "connected") {
      setShowConnected(true)
      const timer = setTimeout(() => {
        setShowConnected(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [status])

  if (status === "checking") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 text-amber-600 animate-pulse mb-4">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <p>Connecting to database...</p>
        </div>
        <div className="w-full max-w-md bg-amber-50 p-4 rounded-md text-sm text-amber-800">
          Please wait while we establish connection to the database.
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p>Database connection error</p>
        </div>
        <div className="w-full max-w-md bg-red-50 p-4 rounded-md mb-4 text-sm text-red-800">
          <p className="font-semibold mb-2">Unable to connect to the database</p>
          {errorMessage && <p className="mb-2">{errorMessage}</p>}
          <p>Please check your Supabase credentials and try again.</p>
        </div>
        <button
          onClick={checkConnection}
          disabled={isRetrying}
          className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2`}
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <>
      {showConnected && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-md px-4 py-2 shadow-md z-50 flex items-center gap-2 text-green-700 transition-opacity duration-500">
          <CheckCircle className="w-4 h-4" />
          <p className="text-sm">Connected to Supabase</p>
        </div>
      )}
      {children}
    </>
  )
} 