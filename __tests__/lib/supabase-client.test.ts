import { supabase, checkSupabaseConnection } from '@/lib/supabase/client';

// Mock the supabase module
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        count: jest.fn(() => ({
          head: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }))
}));

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('supabase client should be defined', () => {
    expect(supabase).toBeDefined();
  });

  test('checkSupabaseConnection should return success when connection is healthy', async () => {
    // Mock the query response
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        count: jest.fn().mockReturnValue({
          head: jest.fn().mockResolvedValue({ data: {}, error: null })
        })
      })
    });
    
    supabase.from = mockFrom;

    const result = await checkSupabaseConnection();
    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('categories');
  });

  test('checkSupabaseConnection should return error when connection fails', async () => {
    // Mock the query response to return an error
    const mockError = { message: 'Connection failed' };
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        count: jest.fn().mockReturnValue({
          head: jest.fn().mockResolvedValue({ data: null, error: mockError })
        })
      })
    });
    
    supabase.from = mockFrom;

    const result = await checkSupabaseConnection();
    expect(result.success).toBe(false);
    expect(result.error).toBe(mockError.message);
  });

  test('checkSupabaseConnection should handle unexpected errors', async () => {
    // Mock the query to throw an error
    const mockError = new Error('Unexpected error');
    const mockFrom = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        count: jest.fn().mockReturnValue({
          head: jest.fn().mockRejectedValue(mockError)
        })
      })
    });
    
    supabase.from = mockFrom;

    const result = await checkSupabaseConnection();
    expect(result.success).toBe(false);
    expect(result.error).toBe(mockError.message);
  });
}); 