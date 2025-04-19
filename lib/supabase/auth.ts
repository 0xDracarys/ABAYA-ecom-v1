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
  
  // Enhanced email logging
  console.log('Email value passed to Supabase signIn:', email)
  console.log('Email validation check:', {
    isString: typeof email === 'string',
    length: email?.length,
    format: email?.includes('@') ? 'contains @' : 'missing @',
    trimmedValue: email?.trim()
  })
  
  // Log authentication attempt
  console.log('Attempting authentication for:', email)
  
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
    console.error('Missing required environment variables:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    return { error: 'Authentication configuration error' }
  }

  try {
    // Attempt authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase SignIn Error Details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        details: JSON.stringify(error, null, 2)
      })
      return { error: error.message }
    }

    // Log successful authentication
    console.log('Authentication successful for:', email, {
      userId: data.user?.id,
      session: !!data.session
    })

    // Check admin status
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user?.id)
      .single()

    console.log('User role check:', {
      userId: data.user?.id,
      role: userRole?.role || 'no role found'
    })

    redirect(redirectTo)
  } catch (error) {
    console.error('Unexpected authentication error:', error)
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

  // Check if user has admin role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single()

  return userRole?.role === "admin"
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string || '/auth/login?message=Please check your email to confirm your account'
  
  // Enhanced email logging for registration
  console.log('Email value passed to Supabase signUp:', email)
  console.log('Email validation check:', {
    isString: typeof email === 'string',
    length: email?.length,
    format: email?.includes('@') ? 'contains @' : 'missing @',
    trimmedValue: email?.trim()
  })
  
  // Log registration attempt
  console.log('Attempting registration for:', email)
  
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
      console.error('Supabase SignUp Error Details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        details: JSON.stringify(error, null, 2)
      })
      return { error: error.message }
    }

    // Log successful registration
    console.log('Registration successful for:', email, {
      userId: data.user?.id,
      session: !!data.session,
      confirmationSent: !data.session
    })

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