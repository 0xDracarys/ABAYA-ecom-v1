"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { fetchProducts } from "@/redux/features/productSlice"
import { fetchCategories } from "@/redux/features/categorySlice"
import ProductCard from "@/components/shop/ProductCard"
import ProductFilter from "@/components/shop/ProductFilter"
import ProductSort from "@/components/shop/ProductSort"
import Pagination from "@/components/common/Pagination"

export default function ShopPage() {
  const dispatch = useDispatch<AppDispatch>()
  const searchParams = useSearchParams()

  const { products, loading, totalCount } = useSelector((state: RootState) => state.products)
  const { categories } = useSelector((state: RootState) => state.categories)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Get query parameters
  useEffect(() => {
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort")
    const page = searchParams.get("page")

    if (category) setSelectedCategory(category)
    if (search) setSearchQuery(search)
    if (page) setCurrentPage(Number.parseInt(page))

    if (sort) {
      if (sort === "price-low") {
        setSortBy("price")
        setSortOrder("asc")
      } else if (sort === "price-high") {
        setSortBy("price")
        setSortOrder("desc")
      } else if (sort === "newest") {
        setSortBy("created_at")
        setSortOrder("desc")
      } else if (sort === "oldest") {
        setSortBy("created_at")
        setSortOrder("asc")
      }
    }
  }, [searchParams])

  // Fetch products and categories
  useEffect(() => {
    dispatch(fetchCategories())

    dispatch(
      fetchProducts({
        page: currentPage,
        limit: itemsPerPage,
        categoryId: selectedCategory,
        search: searchQuery,
        sortBy,
        sortOrder,
      }),
    )
  }, [dispatch, currentPage, itemsPerPage, selectedCategory, searchQuery, sortBy, sortOrder])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: string) => {
    if (sort === "price-low") {
      setSortBy("price")
      setSortOrder("asc")
    } else if (sort === "price-high") {
      setSortBy("price")
      setSortOrder("desc")
    } else if (sort === "newest") {
      setSortBy("created_at")
      setSortOrder("desc")
    } else if (sort === "oldest") {
      setSortBy("created_at")
      setSortOrder("asc")
    }
    setCurrentPage(1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query || null)
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop Our Collection</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="w-full md:w-1/4">
          <ProductFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onSearch={handleSearch}
            initialSearchQuery={searchQuery || ""}
          />
        </div>

        {/* Products grid */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {products.length} of {totalCount} products
            </p>
            <ProductSort
              currentSort={
                sortBy === "price"
                  ? sortOrder === "asc"
                    ? "price-low"
                    : "price-high"
                  : sortOrder === "desc"
                    ? "newest"
                    : "oldest"
              }
              onSortChange={handleSortChange}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No products found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalCount > itemsPerPage && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / itemsPerPage)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
