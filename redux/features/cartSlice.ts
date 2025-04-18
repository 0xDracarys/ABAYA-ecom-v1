import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { supabase } from "@/lib/supabase/client"

interface CartItem {
  id: string
  product_id: string
  quantity: number
  name: string
  price: number
  image_url: string
}

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
}

// Fetch cart items
export const fetchCartItems = createAsyncThunk("cart/fetchItems", async (userId: string, { rejectWithValue }) => {
  try {
    // First, get the cart ID for this user
    const { data: cartData, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (cartError) {
      // If no cart exists, create one
      if (cartError.code === "PGRST116") {
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert({ user_id: userId })
          .select("id")
          .single()

        if (createError) throw createError

        return [] // Return empty cart items for new cart
      } else {
        throw cartError
      }
    }

    const cartId = cartData.id

    // Get cart items with product details
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
          id,
          product_id,
          quantity,
          products:product_id (
            name,
            price,
            product_images (
              image_url
            )
          )
        `)
      .eq("cart_id", cartId)

    if (error) throw error

    // Format the data
    return data.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      name: item.products.name,
      price: item.products.price,
      image_url: item.products.product_images[0]?.image_url || "/placeholder.svg?height=100&width=100",
    }))
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

// Add item to cart
export const addToCart = createAsyncThunk(
  "cart/addItem",
  async (
    { userId, productId, quantity }: { userId: string; productId: string; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      // Get or create cart
      const { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single()

      let cartId

      if (cartError) {
        // Create new cart if doesn't exist
        if (cartError.code === "PGRST116") {
          const { data: newCart, error: createError } = await supabase
            .from("carts")
            .insert({ user_id: userId })
            .select("id")
            .single()

          if (createError) throw createError
          cartId = newCart.id
        } else {
          throw cartError
        }
      } else {
        cartId = cartData.id
      }

      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", productId)
        .single()

      if (checkError && checkError.code !== "PGRST116") throw checkError

      if (existingItem) {
        // Update quantity if item exists
        const { data: updatedItem, error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)
          .select()
          .single()

        if (updateError) throw updateError
      } else {
        // Add new item if it doesn't exist
        const { error: insertError } = await supabase.from("cart_items").insert({
          cart_id: cartId,
          product_id: productId,
          quantity,
        })

        if (insertError) throw insertError
      }

      // Get product details
      const { data: product, error: productError } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          product_images (
            image_url
          )
        `)
        .eq("id", productId)
        .single()

      if (productError) throw productError

      return {
        product_id: product.id,
        quantity,
        name: product.name,
        price: product.price,
        image_url: product.product_images[0]?.image_url || "/placeholder.svg?height=100&width=100",
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("cart_items").update({ quantity }).eq("id", itemId).select().single()

      if (error) throw error

      return { id: itemId, quantity }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

// Remove item from cart
export const removeFromCart = createAsyncThunk("cart/removeItem", async (itemId: string, { rejectWithValue }) => {
  try {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

    if (error) throw error

    return itemId
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

// Clear cart
export const clearCart = createAsyncThunk("cart/clearCart", async (userId: string, { rejectWithValue }) => {
  try {
    // Get cart ID
    const { data: cartData, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (cartError) throw cartError

    // Delete all items in cart
    const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartData.id)

    if (error) throw error

    return true
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch cart items
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCartItems.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false
        // We'll refetch the cart after adding an item to ensure consistency
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false
        const { id, quantity } = action.payload
        const itemIndex = state.items.findIndex((item) => item.id === id)
        if (itemIndex !== -1) {
          state.items[itemIndex].quantity = quantity
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false
        state.items = []
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default cartSlice.reducer
