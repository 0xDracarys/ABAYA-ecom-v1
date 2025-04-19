import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { checkSupabaseConnection } from '@/lib/supabase/client';

// Mock the Supabase connection check
jest.mock('@/lib/supabase/client', () => ({
  checkSupabaseConnection: jest.fn(),
}));

describe('ConnectionStatus Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<ConnectionStatus>Test Content</ConnectionStatus>);
    
    expect(screen.getByText('Connecting to database...')).toBeInTheDocument();
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  test('shows error state when connection fails', async () => {
    // Mock the connection check to return an error
    (checkSupabaseConnection as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Connection error',
    });

    render(<ConnectionStatus>Test Content</ConnectionStatus>);

    await waitFor(() => {
      expect(screen.getByText('Database connection error')).toBeInTheDocument();
      expect(screen.getByText('Connection error')).toBeInTheDocument();
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });
  });

  test('shows success state and renders children when connection succeeds', async () => {
    // Mock the connection check to return success
    (checkSupabaseConnection as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<ConnectionStatus>Test Content</ConnectionStatus>);

    await waitFor(() => {
      expect(screen.getByText('Connected to Supabase')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
}); 