'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStatus, authClient } from '@/lib/auth-client'

interface AuthContextType {
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  isMigrated: boolean
  authType: 'legacy' | 'betterauth' | 'none'
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; migrated?: boolean }>
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, session, isAuthenticated, isLoading, error, isMigrated } = useAuthStatus()
  const [authType, setAuthType] = useState<'legacy' | 'betterauth' | 'none'>('none')

  // Check auth type on mount and when session changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setAuthType(isMigrated ? 'betterauth' : 'legacy')
    } else {
      setAuthType('none')
    }
  }, [isAuthenticated, user, isMigrated])

  const signIn = async (email: string, password: string) => {
    try {
      // Try BetterAuth first
      const result = await authClient.signIn.email({
        email,
        password
      })

      if (result.data) {
        return { success: true, migrated: true }
      }

      // Fallback to legacy API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh auth status after legacy login
        await refresh()
        return { 
          success: true, 
          migrated: data.migrated || false 
        }
      } else {
        return { 
          success: false, 
          error: data.error || 'Authentication failed' 
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    try {
      // Try BetterAuth first
      const result = await authClient.signUp.email({
        email,
        password,
        name
      })

      if (result.data) {
        return { success: true }
      }

      // Fallback to legacy API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh auth status after legacy signup
        await refresh()
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error || 'Account creation failed' 
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Account creation failed' 
      }
    }
  }

  const signOut = async () => {
    try {
      // Try BetterAuth logout first
      await authClient.signOut()
    } catch (error) {
      console.log('BetterAuth logout failed, trying legacy logout')
    }

    try {
      // Also call legacy logout to clear any JWT cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Legacy logout failed:', error)
    }

    // Force refresh to update auth state
    window.location.href = '/login'
  }

  const refresh = async () => {
    try {
      // Force refresh of BetterAuth session
      await authClient.getSession({ 
        query: { 
          fresh: true 
        } 
      })
    } catch (error) {
      console.error('Session refresh failed:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    isMigrated,
    authType,
    signIn,
    signUp,
    signOut,
    refresh
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, isLoading])

  return { isAuthenticated, isLoading }
}
