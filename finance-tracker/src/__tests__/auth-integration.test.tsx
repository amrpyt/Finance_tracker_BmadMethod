/**
 * Authentication Integration Test
 * Tests the actual auth implementation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/login/page'
import { AuthProvider, useAuth } from '@/contexts/auth-context'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock auth client
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: jest.fn()
    },
    signUp: {
      email: jest.fn()
    },
    signOut: jest.fn(),
    getSession: jest.fn()
  },
  useAuthStatus: jest.fn(() => ({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isMigrated: false
  }))
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    } as any)
    
    global.fetch = jest.fn()
  })

  test('should render login form', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )

    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('should handle form submission', async () => {
    // Mock successful auth client response
    const { authClient } = require('@/lib/auth-client')
    authClient.signIn.email.mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } }
    })

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )

    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  test('should show error message on failed login', async () => {
    // Mock auth client failure and fetch fallback failure
    const { authClient } = require('@/lib/auth-client')
    authClient.signIn.email.mockRejectedValue(new Error('BetterAuth failed'))
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials' })
    })

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )

    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })
})

// Test auth context functionality
describe('Auth Context', () => {
  test('should provide auth context values', () => {
    const TestComponent = () => {
      const { isAuthenticated, isLoading, authType } = useAuth()
      
      return (
        <div>
          <div data-testid="authenticated">{isAuthenticated.toString()}</div>
          <div data-testid="loading">{isLoading.toString()}</div>
          <div data-testid="auth-type">{authType}</div>
        </div>
      )
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('auth-type')).toHaveTextContent('none')
  })
})
