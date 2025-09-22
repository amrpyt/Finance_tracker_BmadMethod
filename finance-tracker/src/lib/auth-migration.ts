/**
 * Authentication Migration Utilities
 * Handles the transition from custom JWT auth to BetterAuth
 */

import { auth } from '@/lib/auth-betterauth';
import { verifyJWT } from '@/lib/auth';
import { supabase } from '@/lib/database';
import { NextRequest } from 'next/server';

export interface MigrationUser {
  id: string;
  email: string;
  name?: string;
  isMigrated: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: MigrationUser;
  session?: any;
  error?: string;
  authType: 'legacy' | 'betterauth' | 'none';
}

/**
 * Check if user is migrated to BetterAuth
 */
export async function isUserMigrated(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user')
      .select('id')
      .eq('id', userId)
      .single();
    
    return !!data;
  } catch {
    return false;
  }
}

/**
 * Get authentication info from request (supports both JWT and BetterAuth)
 */
export async function getAuthFromRequest(request: NextRequest): Promise<AuthResult> {
  // Try BetterAuth session first
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (session?.session && session?.user) {
      return {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          isMigrated: true
        },
        session: session.session,
        authType: 'betterauth'
      };
    }
  } catch (error) {
    console.log('BetterAuth session check failed:', error);
  }

  // Fallback to legacy JWT
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return { success: false, authType: 'none' };
    }

    const decoded = verifyJWT(authToken);
    if (!decoded) {
      return { success: false, authType: 'none' };
    }

    // Get user from legacy users table
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', decoded.userId)
      .single();

    if (!user) {
      return { success: false, authType: 'none' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        isMigrated: false
      },
      authType: 'legacy'
    };
  } catch (error) {
    console.log('Legacy JWT validation failed:', error);
    return { success: false, authType: 'none' };
  }
}

/**
 * Migrate user from legacy system to BetterAuth
 */
export async function migrateUserToBetterAuth(
  userId: string, 
  email: string, 
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user data from legacy table
    const { data: legacyUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!legacyUser) {
      return { success: false, error: 'Legacy user not found' };
    }

    // Create user in BetterAuth system
    const result = await auth.api.signUpEmail({
      body: {
        email: email,
        password: password,
        name: legacyUser.name || email
      }
    });

    if (!result) {
      return { success: false, error: 'Failed to create BetterAuth user' };
    }

    // Mark migration in legacy table (add migration flag)
    await supabase
      .from('users')
      .update({ migrated_to_betterauth: true })
      .eq('id', userId);

    return { success: true };
  } catch (error) {
    console.error('User migration failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create BetterAuth session for migrated user
 */
export async function createBetterAuthSession(
  email: string, 
  password: string,
  request: NextRequest
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email: email,
        password: password
      },
      headers: request.headers
    });

    return { success: true, response: result };
  } catch (error) {
    console.error('BetterAuth session creation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}

/**
 * Authentication strategy selector
 */
export function getAuthStrategy(): 'dual' | 'betterauth-only' | 'legacy-only' {
  // During migration period, use dual authentication
  // This can be controlled via environment variable
  const strategy = process.env.AUTH_STRATEGY || 'dual';
  return strategy as 'dual' | 'betterauth-only' | 'legacy-only';
}
