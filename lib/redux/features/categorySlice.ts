import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { supabase } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
  slug: string
  created_at: string
  updated_at: string
  product_count?: number
}

interface CategoriesState {
  categories: Category[]
  category: Category | null
  loading: boolean
  error: string | null
  totalCount: number
}

const initialState: CategoriesState = {
  categories: [],
  category: null,
  loading: false,
  error: null,
  totalCount: 0,
}

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      // Calculate offset
      const offset = (page - 1) * limit

      // Get categories with product count
      const { data, error, count } = await supabase
        .from("categories")
        .select(
          `
          *,
          products:products (count)
        `,
          { count: "exact" },
        )
        .order("name")
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Format the data
      const formattedData = data.map((category) => ({
        ...category,
        product_count: category.products.length,
      }))

      return {
        categories: formattedData,
        totalCount: count || 0,
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Fetch a single category by slug
export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchCategoryBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select(`
          *,
          products:products (count)
        `)
        .eq("slug", slug)
        .single()

      if (error) throw error

      return {
        ...data,
        product_count: data.products.length,
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Create a new category
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData: Partial<Category>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("categories").insert(categoryData).select().single()

      if (error) throw error

      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Update a category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData }: { id: string; categoryData: Partial<Category> }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("categories").update(categoryData).eq("id", id).select().single()

      if (error) throw error

      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Delete a category
export const deleteCategory = createAsyncThunk("categories/deleteCategory", async (id: string, { rejectWithValue }) => {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) throw error

    return id
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryState: (state) => {
      state.category = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<{ categories: Category[]; totalCount: number }>) => {
          state.loading = false
          state.categories = action.payload.categories
          state.totalCount = action.payload.totalCount
        },
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch category by slug
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false
        state.category = action.payload
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false
        state.categories.unshift(action.payload)
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false
        const index = state.categories.findIndex((category) => category.id === action.payload.id)
        if (index !== -1) {
          state.categories[index] = action.payload
        }
        if (state.category && state.category.id === action.payload.id) {
          state.category = action.payload
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.categories = state.categories.filter((category) => category.id !== action.payload)
        if (state.category && state.category.id === action.payload) {
          state.category = null
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCategoryState } = categorySlice.actions
export default categorySlice.reducer
