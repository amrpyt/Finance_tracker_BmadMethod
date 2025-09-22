/**
 * Dual Authentication System
 * Supports both legacy JWT and BetterAuth during migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, migrateUserToBetterAuth, createBetterAuthSession, getAuthStrategy } from './auth-migration';
import { verifyPassword } from './auth';
import { supabase } from './database';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  isMigrated: boolean;
}

export interface AuthContext {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  authType: 'legacy' | 'betterauth' | 'none';
}

/**
 * Get authentication context from request
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  const authResult = await getAuthFromRequest(request);

  if (!authResult.success || !authResult.user) {
    return {
      user: null,
      isAuthenticated: false,
      authType: 'none'
    };
  }

  return {
    user: {
      id: authResult.user.id,
      email: authResult.user.email,
      name: authResult.user.name || authResult.user.email,
      isMigrated: authResult.user.isMigrated
    },
    isAuthenticated: true,
    authType: authResult.authType
  };
}

/**
 * Authenticate user with dual system support
 */
export async function authenticateUser(
  email: string, 
  password: string,
  request: NextRequest
): Promise<{
  success: boolean;
  user?: AuthenticatedUser;
  response?: NextResponse;
  error?: string;
  migrated?: boolean;
}> {
  const strategy = getAuthStrategy();

  try {
    // Get user from legacy system first
    const { data: legacyUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!legacyUser) {
      return { success: false, error: 'User not found' };
    }

    // Verify password against legacy hash
    const isValidPassword = await verifyPassword(password, legacyUser.password_hash);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Check if user is already migrated
    const { data: betterAuthUser } = await supabase
      .from('user')
      .select('*')
      .eq('id', legacyUser.id)
      .single();

    if (betterAuthUser && (strategy === 'dual' || strategy === 'betterauth-only')) {
      // User is migrated, use BetterAuth
      const sessionResult = await createBetterAuthSession(email, password, request);
      
      if (sessionResult.success) {
        return {
          success: true,
          user: {
            id: legacyUser.id,
            email: legacyUser.email,
            name: legacyUser.name || legacyUser.email,
            isMigrated: true
          },
          response: sessionResult.response,
          migrated: false // Already migrated
        };
      }
    }

    // If dual or legacy strategy, and user not migrated yet
    if ((strategy === 'dual' || strategy === 'legacy-only') && !betterAuthUser) {
      
      if (strategy === 'dual') {
        // Migrate user to BetterAuth on successful login
        const migrationResult = await migrateUserToBetterAuth(
          legacyUser.id, 
          legacyUser.email, 
          password
        );

        if (migrationResult.success) {
          // Create BetterAuth session
          const sessionResult = await createBetterAuthSession(email, password, request);
          
          if (sessionResult.success) {
            return {
              success: true,
              user: {
                id: legacyUser.id,
                email: legacyUser.email,
                name: legacyUser.name || legacyUser.email,
                isMigrated: true
              },
              response: sessionResult.response,
              migrated: true
            };
          }
        }
      }

      // Fallback to legacy JWT authentication
      const { generateJWT } = await import('./auth');
      const token = generateJWT(legacyUser.id, legacyUser.email);

      const response = NextResponse.json({
        message: 'Authentication successful',
        user: { 
          id: legacyUser.id, 
          email: legacyUser.email,
          name: legacyUser.name || legacyUser.email
        }
      });

      // Set JWT cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return {
        success: true,
        user: {
          id: legacyUser.id,
          email: legacyUser.email,
          name: legacyUser.name || legacyUser.email,
          isMigrated: false
        },
        response,
        migrated: false
      };
    }

    return { success: false, error: 'Authentication strategy not supported' };

  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}

/**
 * Sign up user with dual system support
 */
export async function signUpUser(
  name: string,
  email: string, 
  password: string,
  request: NextRequest
): Promise<{
  success: boolean;
  user?: AuthenticatedUser;
  response?: NextResponse;
  error?: string;
}> {
  const strategy = getAuthStrategy();

  try {
    // Check if user already exists in legacy system
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Try BetterAuth signup first (only if database is available)
    if (process.env.DATABASE_URL && !process.env.SKIP_BETTERAUTH) {
      try {
        const { auth } = await import('./auth-betterauth');
        const result = await auth.api.signUpEmail({
          body: {
            email: email,
            password: password,
            name: name
          }
        });

        if ((result as any)?.user) {
          console.log('✅ BetterAuth signup successful');
          const user = (result as any).user;
          return {
            success: true,
            user: user,
            response: NextResponse.json(
              { 
                message: 'Account created successfully with enhanced security',
                user: { 
                  id: user.id, 
                  email: user.email,
                  name: user.name
                }
              },
              { status: 201 }
            )
          };
        }
      } catch (betterAuthError: any) {
        console.log('BetterAuth signup failed, falling back to legacy:', betterAuthError?.message || betterAuthError);
        // Continue to legacy signup
      }
    }

    // Legacy signup (fallback or legacy-only strategy)
    if (strategy === 'legacy-only' || strategy === 'dual') {
      const { hashPassword, generateJWT } = await import('./auth');
      const { v4: uuidv4 } = await import('uuid');
      
      const passwordHash = await hashPassword(password);
      const userId = uuidv4();

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: name.trim(),
          email: email.toLowerCase(),
          password_hash: passwordHash
        })
        .select()
        .single();

      if (error) {
        console.error('Legacy signup error:', error);
        return { success: false, error: 'Failed to create account' };
      }

      const token = generateJWT(userId, email.toLowerCase());

      const response = NextResponse.json({
        message: 'Account created successfully',
        user: { id: userId, email: email.toLowerCase(), name: name }
      }, { status: 201 });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return {
        success: true,
        user: {
          id: userId,
          email: email.toLowerCase(),
          name: name,
          isMigrated: false
        },
        response
      };
    }

    return { success: false, error: 'Signup strategy not supported' };

  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Account creation failed' 
    };
  }
}
