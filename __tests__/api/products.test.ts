import { NextRequest } from "next/server"
import { GET, POST, PUT, DELETE } from "@/app/api/products/route"
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

describe("Products API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET /api/products", () => {
    it("should fetch products with pagination and filters", async () => {
      // Mock product data
      const mockProducts = [
        { id: "1", name: "Test Abaya 1", price: 99.99 },
        { id: "2", name: "Test Abaya 2", price: 149.99 },
      ]

      // Mock supabase query builder
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockRange = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockIlike = jest.fn().mockReturnThis()
      const mockGte = jest.fn().mockReturnThis()
      const mockLte = jest.fn().mockReturnThis()

      // Mock supabase query result
      const mockQueryResult = {
        data: mockProducts,
        count: 2,
        error: null,
      }

      // Set up the mock chain
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        range: mockRange,
        eq: mockEq,
        ilike: mockIlike,
        gte: mockGte,
        lte: mockLte,
      })

      // Mock the final query execution
      mockRange.mockResolvedValue(mockQueryResult)

      // Create mock request with search params
      const request = new NextRequest("http://localhost:3000/api/products?page=1&limit=10&categoryId=cat1&search=test", {
        method: "GET",
      })

      // Call the GET handler
      const response = await GET(request)
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(responseData.products).toEqual(mockProducts)
      expect(responseData.totalCount).toBe(2)
      expect(responseData.page).toBe(1)
      expect(responseData.limit).toBe(10)

      // Verify supabase was called correctly
      expect(supabase.from).toHaveBeenCalledWith("products")
      expect(mockSelect).toHaveBeenCalled()
      expect(mockOrder).toHaveBeenCalled()
      expect(mockRange).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith("category_id", "cat1")
      expect(mockIlike).toHaveBeenCalledWith("name", "%test%")
    })

    it("should handle errors when fetching products", async () => {
      // Mock error response
      const mockError = {
        data: null,
        count: null,
        error: { message: "Database error" },
      }

      // Set up the mock chain
      const mockSelect = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockRange = jest.fn().mockReturnThis()
      
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        range: mockRange,
      })

      // Mock the final query execution with error
      mockRange.mockResolvedValue(mockError)

      // Create mock request
      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "GET",
      })

      // Call the GET handler
      const response = await GET(request)
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(500)
      expect(responseData.error).toBe("Failed to fetch products")
    })
  })

  describe("POST /api/products", () => {
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
      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Abaya",
          description: "A beautiful new abaya",
          price: 129.99,
          category_id: "cat1",
        }),
      })

      // Call the POST handler
      const response = await POST(request)
      const responseData = await response.json()

      // Assertions
      expect(response.status).toBe(403)
      expect(responseData.error).toBe("Unauthorized: Admin access required")
    })

    it("should validate product data", async () => {
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

      // Create mock request with invalid data (missing required fields)
      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Ab", // Too short
          price: -10, // Negative price
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