'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export type SignOutOptions = {
  redirectTo?: string
}

export async function signOut({ redirectTo = '/' }: SignOutOptions = {}) {
  const cookieStore = cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  await supabase.auth.signOut()
  redirect(redirectTo)
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string || '/'
  
  const cookieStore = cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Verify environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[signIn] Missing required environment variables')
    return { error: 'Authentication configuration error' }
  }

  try {
    // Attempt authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[signIn] Authentication error:', error.message)
      return { error: error.message }
    }

    // Check admin status from user_roles table
    let targetRedirect = redirectTo
    
    try {
      // Query user_roles table for admin role
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user?.id)
        .single()

      if (roleError) {
        console.warn('[signIn] Error checking user role:', roleError.message)
        // Continue with default redirect for users without roles
      } else {
        const isAdmin = userRole?.role === 'admin'
        
        // Override redirect for admin users to go to admin dashboard
        if (isAdmin && redirectTo === '/') {
          targetRedirect = '/admin/dashboard'
        }
      }
    } catch (roleCheckError) {
      console.warn('[signIn] Exception during role check:', roleCheckError)
      // Continue with login despite role check failure, using default redirect
    }

    redirect(targetRedirect)
  } catch (error) {
    console.error('[signIn] Unexpected error:', error)
    return { error: 'An unexpected error occurred during authentication' }
  }
}

export async function isAdmin() {
  const cookieStore = cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return false
  }

  try {
    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single()

    if (roleError) {
      console.warn('Error checking admin role:', roleError.message)
      return false;
    }

    return userRole?.role === "admin"
  } catch (error) {
    console.error('Exception during admin check:', error)
    return false
  }
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string || '/auth/login?message=Please check your email to confirm your account'
  
  const cookieStore = cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Verify environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing required environment variables for registration')
    return { error: 'Registration system is not properly configured' }
  }

  try {
    // Attempt registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(redirectTo, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').toString()}`,
      },
    })

    if (error) {
      console.error('Supabase SignUp Error:', error.message)
      return { error: error.message }
    }

    // Log successful registration
    console.log('Registration successful for:', email)

    return { 
      success: true,
      message: 'Registration successful! Please check your email to confirm your account.'
    }
  } catch (error) {
    console.error('Unexpected registration error:', error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during registration' 
    }
  }
} 