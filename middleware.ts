import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  // Check all paths that should be protected
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin')
  const isHomePage = request.nextUrl.pathname === '/'
  const path = request.nextUrl.pathname
  
  console.log(`[Middleware] Processing request for path: ${path}`)
  
  if (!isProtectedRoute && !isHomePage) {
    console.log(`[Middleware] Path ${path} is not protected, skipping auth checks`)
    return NextResponse.next()
  }

  try {
    // Create server-side Supabase client using cookies for authentication
    const supabase = createServerClient()
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      // No valid session/user
      console.log(`[Middleware] No authenticated user found: ${userError?.message || 'User not found'}`)
      
      if (isProtectedRoute) {
        console.log(`[Middleware] Redirecting unauthenticated user from ${path} to /auth/login`)
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
      
      return NextResponse.next()
    }
    
    console.log(`[Middleware] User authenticated: ${user.id} (${user.email})`)
    
    // Check if user has admin role in user_roles table
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (roleError) {
      console.error('[Middleware] Error checking user role:', roleError)
    }
    
    const isAdmin = userRole?.role === 'admin'
    console.log(`[Middleware] Admin check result: ${isAdmin ? 'Is admin' : 'Not admin'}`)
    
    // Handle admin routes access control
    if (isProtectedRoute && !isAdmin) {
      console.log(`[Middleware] Non-admin user attempting to access ${path}, redirecting to /`)
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Redirect admin from homepage to admin dashboard
    if (isHomePage && isAdmin) {
      console.log(`[Middleware] Admin user detected on homepage, redirecting to admin dashboard`)
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    
    console.log(`[Middleware] Access granted for ${path}`)
    return NextResponse.next()
    
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error)
    
    // If error occurs on protected route, redirect to login
    if (isProtectedRoute) {
      console.log(`[Middleware] Error during auth check, redirecting from ${path} to /auth/login`)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/admin/:path*'],
} 