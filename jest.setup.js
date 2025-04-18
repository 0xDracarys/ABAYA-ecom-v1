// Learn more: https://jestjs.io/docs/configuration#setupfilesafterenv-array

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'

// Mock the Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'test-cookie-value' })),
  })),
  headers: jest.fn(() => new Map()),
}))

// Mock useSearchParams
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key) => {
      const params = {
        page: '1',
        limit: '10',
        category: 'test-category',
      }
      return params[key] || null
    }),
  })),
  usePathname: jest.fn(() => '/'),
  useParams: jest.fn(() => ({})),
}))

// Global mocks
global.fetch = jest.fn()

// Suppress console errors during tests
console.error = jest.fn()

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
}) 