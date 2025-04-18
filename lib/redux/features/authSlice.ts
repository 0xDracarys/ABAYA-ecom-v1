import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { supabase } from "@/lib/supabase/client"

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  is_admin: boolean
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

// Check current session
export const checkSession = createAsyncThunk("auth/checkSession", async (_, { rejectWithValue }) => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) throw sessionError
    if (!sessionData.session) return null

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, is_admin")
      .eq("id", sessionData.session.user.id)
      .single()

    if (profileError) throw profileError

    return {
      id: sessionData.session.user.id,
      email: sessionData.session.user.email!,
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      is_admin: profile?.is_admin || false,
    }
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

// Sign in with email and password
export const signInWithEmail = createAsyncThunk(
  "auth/signInWithEmail",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, is_admin")
        .eq("id", data.user.id)
        .single()

      if (profileError) throw profileError

      return {
        id: data.user.id,
        email: data.user.email!,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        is_admin: profile?.is_admin || false,
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Sign in with OAuth provider
export const signInWithOAuth = createAsyncThunk(
  "auth/signInWithOAuth",
  async (provider: "google" | "facebook" | "github", { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return null // We'll handle the user data after redirect
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Sign up with email and password
export const signUpWithEmail = createAsyncThunk(
  "auth/signUpWithEmail",
  async (
    {
      email,
      password,
      firstName,
      lastName,
    }: { email: string; password: string; firstName?: string; lastName?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) throw error

      return null // User needs to verify email
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Sign out
export const signOut = createAsyncThunk("auth/signOut", async (_, { rejectWithValue }) => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return null
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

// Update user profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
    }: {
      firstName?: string
      lastName?: string
      phone?: string
      address?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { auth: AuthState }
      const userId = state.auth.user?.id

      if (!userId) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          address,
          city,
          state,
          postal_code: postalCode,
          country,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single()

      if (error) throw error

      return {
        ...state.auth.user,
        first_name: data.first_name,
        last_name: data.last_name,
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Check session
      .addCase(checkSession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkSession.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Sign in with email
      .addCase(signInWithEmail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signInWithEmail.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Sign in with OAuth
      .addCase(signInWithOAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signInWithOAuth.fulfilled, (state) => {
        state.loading = false
        // We'll handle the user data after redirect
      })
      .addCase(signInWithOAuth.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Sign up with email
      .addCase(signUpWithEmail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUpWithEmail.fulfilled, (state) => {
        state.loading = false
        // User needs to verify email
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Sign out
      .addCase(signOut.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false
        state.user = null
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
