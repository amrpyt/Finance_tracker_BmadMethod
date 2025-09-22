/**
 * BetterAuth React Client Configuration
 * Frontend client for BetterAuth integration
 */

import { createAuthClient } from "better-auth/react";

// Create auth client with error handling for development environment
let authClient: any;

try {
  authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    basePath: "/api/auth/better-auth",
    
    // Session configuration
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5 // 5 minutes cache
      }
    },

    // Additional client options
    fetchOptions: {
      onError: (context) => {
        // Suppress empty error objects in development
        if (context.error && Object.keys(context.error).length > 0) {
          console.warn('BetterAuth client error:', context.error);
        }
        
        // Handle specific error cases
        if (context.error?.status === 401) {
          console.log('Session expired or invalid');
        } else if (context.error?.status >= 500) {
          console.error('Server error during authentication');
        }
      },
      onSuccess: (context) => {
        // Optional success logging for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('BetterAuth request successful:', context.response?.status);
        }
      }
    }
  });
} catch (error) {
  console.warn('BetterAuth client initialization failed, using fallback:', error);
  
  // Fallback client for development environment
  authClient = {
    signIn: async () => ({ error: 'BetterAuth not available in this environment' }),
    signUp: async () => ({ error: 'BetterAuth not available in this environment' }),
    signOut: async () => ({ error: 'BetterAuth not available in this environment' }),
    useSession: () => ({ data: null, isPending: false, error: null }),
    getSession: async () => null,
    $Infer: {}
  };
}

export { authClient };

// Export individual auth methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  $Infer
} = authClient;

// Type exports for TypeScript
export type Session = any; // Will be properly typed by BetterAuth
export type User = any; // Will be properly typed by BetterAuth

// Custom hooks for enhanced functionality
export function useAuthStatus() {
  const session = useSession();
  
  return {
    user: (session as any)?.data?.user || null,
    session: (session as any)?.data?.session || null,
    isAuthenticated: !!(session as any)?.data?.user,
    isLoading: (session as any)?.isPending || false,
    error: (session as any)?.error || null,
    isMigrated: (session as any)?.data?.user?.isMigrated || false
  };
}

// Utility function for checking authentication status
export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
  authType?: 'legacy' | 'betterauth' | 'none';
}> {
  try {
    // First try BetterAuth session
    const session = await getSession();
    if ((session as any)?.user) {
      return {
        isAuthenticated: true,
        user: (session as any).user,
        authType: 'betterauth'
      };
    }

    // Fallback to legacy auth check via /api/auth/me
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isAuthenticated: true,
        user: data.user,
        authType: data.authType || 'legacy'
      };
    }

    return {
      isAuthenticated: false,
      user: null,
      authType: 'none'
    };
  } catch (error) {
    console.error('Auth status check failed:', error);
    return {
      isAuthenticated: false,
      user: null,
      authType: 'none'
    };
  }
}
