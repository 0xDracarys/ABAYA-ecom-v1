"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Home, RefreshCw } from "lucide-react"
import { logErrorToService } from "@/lib/utils"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to service (implemented in utils.ts)
    logErrorToService(error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="error-container">
          <h1>We've encountered an issue</h1>
          <p>
            We apologize for the inconvenience. Our team has been notified and is working to fix this problem.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-[#8a7158] hover:bg-[#6d5944] text-white rounded-none"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="border-[#8a7158] text-[#8a7158] hover:bg-[#8a7158]/10 rounded-none"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
            <Link href="/support">
              <Button
                variant="link"
                className="text-[#8a7158]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 