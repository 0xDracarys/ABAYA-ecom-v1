import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { supabase } from "@/lib/supabase/client"

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  is_admin: boolean
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

// Get current user
export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) throw sessionError
    if (!session) return null

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError) throw profileError

    return {
      id: session.user.id,
      email: session.user.email!,
      first_name: profile.first_name,
      last_name: profile.last_name,
      is_admin: profile.is_admin,
    }
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error("No active session")

      const { data, error } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          // Add other fields as needed
        })
        .eq("id", session.user.id)
        .select()
        .single()

      if (error) throw error

      return {
        id: session.user.id,
        email: session.user.email!,
        first_name: data.first_name,
        last_name: data.last_name,
        is_admin: data.is_admin,
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
    clearUser: (state) => {
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<UserProfile | null>) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearUser } = authSlice.actions
export default authSlice.reducer
