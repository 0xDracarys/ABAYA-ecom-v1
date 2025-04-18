"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Category {
  id: string
  name: string
  product_count?: number
}

interface ProductFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
  onSearch: (query: string) => void
  initialSearchQuery: string
}

export default function ProductFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  onSearch,
  initialSearchQuery,
}: ProductFilterProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="sticky top-4">
      {/* Mobile filter dialog */}
      <div className="md:hidden">
        <Button onClick={() => setMobileFiltersOpen(true)} variant="outline" className="w-full mb-4">
          Filters
        </Button>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)} />
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-gray-400"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                  <span className="sr-only">Close menu</span>
                </button>
              </div>

              {/* Mobile filters */}
              <div className="mt-4 px-4">
                <form onSubmit={handleSearchSubmit} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white rounded-md"
                    >
                      Search
                    </button>
                  </div>
                </form>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          onCategoryChange(null)
                          setMobileFiltersOpen(false)
                        }}
                        className={`text-sm ${
                          selectedCategory === null ? "font-medium text-primary" : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        All Categories
                      </button>
                    </div>

                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <button
                          onClick={() => {
                            onCategoryChange(category.id)
                            setMobileFiltersOpen(false)
                          }}
                          className={`text-sm ${
                            selectedCategory === category.id
                              ? "font-medium text-primary"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          {category.name}
                          {category.product_count !== undefined && (
                            <span className="ml-1 text-gray-400">({category.product_count})</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop filters */}
      <div className="hidden md:block">
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white rounded-md"
            >
              Search
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Categories</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <button
                onClick={() => onCategoryChange(null)}
                className={`text-sm ${
                  selectedCategory === null ? "font-medium text-primary" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                All Categories
              </button>
            </div>

            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <button
                  onClick={() => onCategoryChange(category.id)}
                  className={`text-sm ${
                    selectedCategory === category.id ? "font-medium text-primary" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {category.name}
                  {category.product_count !== undefined && (
                    <span className="ml-1 text-gray-400">({category.product_count})</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
