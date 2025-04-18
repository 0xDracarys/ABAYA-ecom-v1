"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface ProductSortProps {
  currentSort: string
  onSortChange: (sort: string) => void
}

export default function ProductSort({ currentSort, onSortChange }: ProductSortProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ]

  const currentSortLabel = sortOptions.find((option) => option.value === currentSort)?.label || "Sort"

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full md:w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span>{currentSortLabel}</span>
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value)
                  setIsOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentSort === option.value
                    ? "bg-gray-100 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
