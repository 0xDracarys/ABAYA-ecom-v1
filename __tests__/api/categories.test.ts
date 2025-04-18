import { NextRequest } from "next/server"
import { GET, POST } from "@/app/api/categories/route"
import { supabase } from "@/lib/supabase/client"
import { createClient } from "@supabase/supabase-js"

// Mock supabase client
jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock Next.js cookies
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name) => ({ value: `mock-cookie-${name}` })),
  })),
}))

// Mock createClient
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}))

describe("Categories API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET /api/categories", () => {
    it("should fetch all categories", async () => {
      // Mock category data
      const mockCategories = [
        { id: "1", name: "Abaya", description: "Traditional Abaya" },
        { id: "2", name: "Jilbab", description: "Traditional Jilbab" },
      ]

      // Mock supabase query builder
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()

      // Mock supabase query result
      const mockQueryResult = {
        data: mockCategories,
        error: null,
      }

      // Set up the mock chain
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      })

      // Mock the final query execution
      mockOrder.mockResolvedValue(mockQueryResult)

      // Create mock request
      const request = new NextRequest("http://localhost:3000/api/categories", {
        method: "GET",
      })

      // Call the GET handler
      const response = await GET(request)
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(responseData).toEqual(mockCategories)

      // Verify supabase was called correctly
      expect(supabase.from).toHaveBeenCalledWith("categories")
      expect(mockSelect).toHaveBeenCalledWith("*")
      expect(mockOrder).toHaveBeenCalledWith("name", { ascending: true })
    })

    it("should handle errors when fetching categories", async () => {
      // Mock error response
      const mockError = {
        data: null,
        error: { message: "Database error" },
      }

      // Set up the mock chain
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      })

      // Mock the final query execution with error
      mockOrder.mockResolvedValue(mockError)

      // Create mock request
      const request = new NextRequest("http://localhost:3000/api/categories", {
        method: "GET",
      })

      // Call the GET handler
      const response = await GET(request)
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(responseData.error).toBe("Failed to fetch categories")
    })

    it("should fetch categories with product counts", async () => {
      // Mock category data
      const mockCategories = [
        { id: "1", name: "Abaya", description: "Traditional Abaya" },
        { id: "2", name: "Jilbab", description: "Traditional Jilbab" },
      ]

      // Mock product counts
      const mockProductCounts = [
        { category_id: "1", count: 5 },
        { category_id: "2", count: 3 },
      ]

      // Mock supabase query builder
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockIn = jest.fn().mockReturnThis()
      const mockGroup = jest.fn().mockReturnThis()

      // Mock supabase query results
      const mockCategoriesResult = {
        data: mockCategories,
        error: null,
      }

      const mockCountsResult = {
        data: mockProductCounts,
        error: null,
      }

      // Set up the mocks
      ;(supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === "categories") {
          return {
            select: mockSelect,
            order: mockOrder,
          }
        } else if (table === "products") {
          return {
            select: jest.fn().mockReturnThis(),
            in: mockIn,
            group: mockGroup,
          }
        }
        return {}
      })

      // Mock the query executions
      mockOrder.mockResolvedValue(mockCategoriesResult)
      mockGroup.mockResolvedValue(mockCountsResult)

      // Create mock request with withProductCount
      const request = new NextRequest("http://localhost:3000/api/categories?withProductCount=true", {
        method: "GET",
      })

      // Call the GET handler
      const response = await GET(request)
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      // Check if product counts were added to categories
      expect(responseData).toEqual([
        { id: "1", name: "Abaya", description: "Traditional Abaya", product_count: 5 },
        { id: "2", name: "Jilbab", description: "Traditional Jilbab", product_count: 3 },
      ])
    })
  })

  describe("POST /api/categories", () => {
    it("should reject non-admin users", async () => {
      // Mock authentication to return non-admin
      const mockAuthSession = {
        data: { session: { user: { id: "user1" } } },
      }

      const mockUserRole = {
        data: { role: "customer" },
        error: null,
      }

      // Mock supabase auth
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue(mockAuthSession),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockUserRole),
        }),
      })

      // Create mock request
      const request = new NextRequest("http://localhost:3000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Category",
          description: "A new category",
        }),
      })

      // Call the POST handler
      const response = await POST(request)
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(403)
      expect(responseData.error).toBe("Unauthorized: Admin access required")
    })

    it("should validate category data", async () => {
      // Mock authentication to return admin
      const mockAuthSession = {
        data: { session: { user: { id: "admin1" } } },
      }

      const mockUserRole = {
        data: { role: "admin" },
        error: null,
      }

      // Mock supabase auth
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue(mockAuthSession),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockUserRole),
          insert: jest.fn().mockReturnThis(),
        }),
      })

      // Create mock request with invalid data
      const request = new NextRequest("http://localhost:3000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "A", // Too short
        }),
      })

      // Call the POST handler
      const response = await POST(request)
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(400)
      expect(responseData.error).toBe("Validation failed")
      expect(responseData.details).toBeDefined()
    })
  })
}) 