import { configureStore } from "@reduxjs/toolkit"
import cartReducer from "./features/cartSlice"
import authReducer from "./features/authSlice"
import productReducer from "./features/productSlice"
import categoryReducer from "./features/categorySlice"

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
