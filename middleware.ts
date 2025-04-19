import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // For routes that start with /admin, check if the user is authenticated and has admin role
  if (path.startsWith('/admin')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Create supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    })

    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Redirect to login page with return URL
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', path)
      redirectUrl.searchParams.set('message', 'Please login to access the admin area')
      return NextResponse.redirect(redirectUrl)
    }

    // Check if the user has admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    if (!userRole || userRole.role !== 'admin') {
      // Redirect to login page with message
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('message', 'You do not have admin access')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // For routes that start with /account, check if the user is authenticated
  if (path.startsWith('/account')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Create supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    })

    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Redirect to login page with return URL
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

// Only run middleware on matching paths
export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
} 