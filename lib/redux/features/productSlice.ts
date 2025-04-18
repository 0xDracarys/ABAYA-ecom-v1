import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { supabase } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  description: string
  price: number
  discount_price: number | null
  stock_quantity: number
  category_id: string
  slug: string
  featured: boolean
  created_at: string
  updated_at: string
  category_name?: string
  images?: { id: string; image_url: string; is_primary: boolean }[]
  average_rating?: number
}

interface ProductsState {
  products: Product[]
  product: Product | null
  loading: boolean
  error: string | null
  totalCount: number
}

const initialState: ProductsState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  totalCount: 0,
}

// Fetch products with pagination
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    {
      page = 1,
      limit = 10,
      categoryId = null,
      search = null,
      sortBy = "created_at",
      sortOrder = "desc",
    }: {
      page?: number
      limit?: number
      categoryId?: string | null
      search?: string | null
      sortBy?: string
      sortOrder?: "asc" | "desc"
    },
    { rejectWithValue },
  ) => {
    try {
      // Calculate offset
      const offset = (page - 1) * limit

      // Start building the query
      let query = supabase.from("products").select(
        `
          *,
          categories:category_id (name),
          product_images (id, image_url, is_primary)
        `,
        { count: "exact" },
      )

      // Add filters if provided
      if (categoryId) {
        query = query.eq("category_id", categoryId)
      }

      if (search) {
        query = query.ilike("name", `%${search}%`)
      }

      // Add sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" })

      // Add pagination
      query = query.range(offset, offset + limit - 1)

      // Execute the query
      const { data, error, count } = await query

      if (error) throw error

      // Format the data
      const formattedData = data.map((product) => ({
        ...product,
        category_name: product.categories?.name,
        images: product.product_images,
      }))

      return {
        products: formattedData,
        totalCount: count || 0,
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Fetch a single product by slug
export const fetchProductBySlug = createAsyncThunk(
  "products/fetchProductBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      // Get the product
      const { data: product, error } = await supabase
        .from("products")
        .select(`
          *,
          categories:category_id (name),
          product_images (id, image_url, is_primary)
        `)
        .eq("slug", slug)
        .single()

      if (error) throw error

      // Get average rating
      const { data: ratingData, error: ratingError } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", product.id)
        .avg("rating")

      if (ratingError) throw ratingError

      return {
        ...product,
        category_name: product.categories?.name,
        images: product.product_images,
        average_rating: ratingData[0]?.avg || 0,
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Create a new product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData: Partial<Product>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("products").insert(productData).select().single()

      if (error) throw error

      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Update a product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }: { id: string; productData: Partial<Product> }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("products").update(productData).eq("id", id).select().single()

      if (error) throw error

      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Delete a product
export const deleteProduct = createAsyncThunk("products/deleteProduct", async (id: string, { rejectWithValue }) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw error

    return id
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductState: (state) => {
      state.product = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<{ products: Product[]; totalCount: number }>) => {
        state.loading = false
        state.products = action.payload.products
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch product by slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false
        state.product = action.payload
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false
        state.products.unshift(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false
        const index = state.products.findIndex((product) => product.id === action.payload.id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
        if (state.product && state.product.id === action.payload.id) {
          state.product = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.products = state.products.filter((product) => product.id !== action.payload)
        if (state.product && state.product.id === action.payload) {
          state.product = null
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearProductState } = productSlice.actions
export default productSlice.reducer
