/**
 * Frontend Authentication Integration Tests
 * Tests for BetterAuth React client integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import { AuthProvider } from '@/contexts/auth-context'

// Mock BetterAuth client
const mockAuthClient = {
  signIn: {
    email: jest.fn()
  },
  signUp: {
    email: jest.fn()
  },
  signOut: jest.fn(),
  getSession: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    isPending: false,
    error: null
  }))
}

jest.mock('@/lib/auth-client', () => ({
  authClient: mockAuthClient,
  useAuthStatus: jest.fn(() => ({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isMigrated: false
  })),
  signIn: mockAuthClient.signIn,
  signUp: mockAuthClient.signUp,
  signOut: mockAuthClient.signOut,
  useSession: mockAuthClient.useSession,
  getSession: mockAuthClient.getSession
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  })
}))

// Test components
function TestAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('Frontend Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  describe('AuthProvider', () => {
    test('should provide authentication context', () => {
      const TestComponent = () => {
        const { useAuth } = require('@/contexts/auth-context')
        const { isAuthenticated, isLoading } = useAuth()
        
        return (
          <div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="loading">{isLoading.toString()}</div>
          </div>
        )
      }

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    test('should handle sign in flow', async () => {
      mockAuthClient.signIn.email.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } }
      })

      const TestComponent = () => {
        const { useAuth } = require('@/contexts/auth-context')
        const { signIn } = useAuth()
        
        return (
          <button
            onClick={() => signIn('test@example.com', 'password123')}
            data-testid="signin-btn"
          >
            Sign In
          </button>
        )
      }

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      fireEvent.click(screen.getByTestId('signin-btn'))

      await waitFor(() => {
        expect(mockAuthClient.signIn.email).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    test('should handle sign up flow', async () => {
      mockAuthClient.signUp.email.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } }
      })

      const TestComponent = () => {
        const { useAuth } = require('@/contexts/auth-context')
        const { signUp } = useAuth()
        
        return (
          <button
            onClick={() => signUp('Test User', 'test@example.com', 'password123')}
            data-testid="signup-btn"
          >
            Sign Up
          </button>
        )
      }

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      fireEvent.click(screen.getByTestId('signup-btn'))

      await waitFor(() => {
        expect(mockAuthClient.signUp.email).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      })
    })

    test('should handle fallback to legacy API', async () => {
      // Mock BetterAuth failure
      mockAuthClient.signIn.email.mockRejectedValue(new Error('BetterAuth failed'))

      // Mock successful legacy API response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          user: { id: '1', email: 'test@example.com' }
        })
      })

      const TestComponent = () => {
        const { useAuth } = require('@/contexts/auth-context')
        const { signIn } = useAuth()
        
        return (
          <button
            onClick={() => signIn('test@example.com', 'password123')}
            data-testid="signin-btn"
          >
            Sign In
          </button>
        )
      }

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      fireEvent.click(screen.getByTestId('signin-btn'))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        })
      })
    })

    test('should handle sign out', async () => {
      const TestComponent = () => {
        const { useAuth } = require('@/contexts/auth-context')
        const { signOut } = useAuth()
        
        return (
          <button
            onClick={signOut}
            data-testid="signout-btn"
          >
            Sign Out
          </button>
        )
      }

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      // Mock window.location.href assignment
      delete (window as any).location
      window.location = { href: '' } as any

      fireEvent.click(screen.getByTestId('signout-btn'))

      await waitFor(() => {
        expect(mockAuthClient.signOut).toHaveBeenCalled()
      })
    })
  })

  describe('Protected Routes', () => {
    test('should redirect unauthenticated users', () => {
      const { useRequireAuth } = require('@/contexts/auth-context')
      
      // Mock unauthenticated state
      const mockUseAuth = jest.fn(() => ({
        isAuthenticated: false,
        isLoading: false
      }))
      
      require('@/contexts/auth-context').useAuth = mockUseAuth

      const TestComponent = () => {
        useRequireAuth()
        return <div>Protected Content</div>
      }

      // Mock window.location.href assignment
      delete (window as any).location
      window.location = { href: '' } as any

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      // Should attempt redirect
      expect(window.location.href).toBe('/login')
    })

    test('should allow authenticated users', () => {
      const { useRequireAuth } = require('@/contexts/auth-context')
      
      // Mock authenticated state
      const mockUseAuth = jest.fn(() => ({
        isAuthenticated: true,
        isLoading: false
      }))
      
      require('@/contexts/auth-context').useAuth = mockUseAuth

      const TestComponent = () => {
        useRequireAuth()
        return <div data-testid="protected-content">Protected Content</div>
      }

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  describe('Migration Status Display', () => {
    test('should show migration status for migrated users', () => {
      const { useAuth } = require('@/contexts/auth-context')
      
      // Mock migrated user
      const mockUseAuth = jest.fn(() => ({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        isAuthenticated: true,
        isMigrated: true, 
        authType: 'betterauth'
      }))
      
      require('@/contexts/auth-context').useAuth = mockUseAuth

      const TestComponent = () => {
        const { user, isMigrated, authType } = useAuth()
        
        return (
          <div>
            <span data-testid="user-name">{user?.name}</span>
            {isMigrated && (
              <span data-testid="migration-badge">Enhanced Security</span>
            )}
            <span data-testid="auth-type">{authType}</span>
          </div>
        )
      }

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
      expect(screen.getByTestId('migration-badge')).toHaveTextContent('Enhanced Security')
      expect(screen.getByTestId('auth-type')).toHaveTextContent('betterauth')
    })

    test('should show legacy status for non-migrated users', () => {
      const { useAuth } = require('@/contexts/auth-context')
      
      // Mock legacy user
      const mockUseAuth = jest.fn(() => ({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        isAuthenticated: true,
        isMigrated: false,
        authType: 'legacy'
      }))
      
      require('@/contexts/auth-context').useAuth = mockUseAuth

      const TestComponent = () => {
        const { user, isMigrated, authType } = useAuth()
        
        return (
          <div>
            <span data-testid="user-name">{user?.name}</span>
            {!isMigrated && (
              <span data-testid="legacy-badge">Legacy Auth</span>
            )}
            <span data-testid="auth-type">{authType}</span>
          </div>
        )
      }

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
      expect(screen.getByTestId('legacy-badge')).toHaveTextContent('Legacy Auth')
      expect(screen.getByTestId('auth-type')).toHaveTextContent('legacy')
    })
  })

  describe('Error Handling', () => {
    test('should handle authentication errors', async () => {
      // Mock authentication failure
      mockAuthClient.signIn.email.mockRejectedValue(new Error('Invalid credentials'))
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({
          error: 'Invalid credentials'
        })
      })

      const TestComponent = () => {
        const { useAuth } = require('@/contexts/auth-context')
        const { signIn } = useAuth()
        
        return (
          <button
            onClick={async () => {
              const result = await signIn('wrong@example.com', 'wrongpassword')
              if (!result.success) {
                // Error should be handled
                expect(result.error).toBe('Invalid credentials')
              }
            }}
            data-testid="signin-btn"
          >
            Sign In
          </button>
        )
      }

      render(
        <TestAuthProvider>
          <TestComponent />
        </TestAuthProvider>
      )

      fireEvent.click(screen.getByTestId('signin-btn'))

      await waitFor(() => {
        expect(mockAuthClient.signIn.email).toHaveBeenCalled()
      })
    })
  })
});
