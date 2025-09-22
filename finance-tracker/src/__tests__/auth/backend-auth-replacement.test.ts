/**
 * Backend Authentication Replacement Tests
 * Tests for dual authentication system and migration functionality
 */

import { jest } from '@jest/globals';

// Mock environment variables
const mockEnv = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  BETTER_AUTH_SECRET: 'test-secret-key-for-testing-purposes',
  BETTER_AUTH_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
  AUTH_STRATEGY: 'dual'
};

// Mock dependencies
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn()
    }))
  }))
};

const mockAuth = {
  api: {
    getSession: jest.fn(),
    signUpEmail: jest.fn(),
    signInEmail: jest.fn(),
    signOut: jest.fn()
  }
};

jest.mock('@/lib/database', () => ({
  supabase: mockSupabase
}));

jest.mock('@/lib/auth-betterauth', () => ({
  auth: mockAuth
}));

jest.mock('@/lib/auth', () => ({
  verifyJWT: jest.fn(),
  generateJWT: jest.fn(() => 'mock-jwt-token'),
  verifyPassword: jest.fn(),
  hashPassword: jest.fn(() => Promise.resolve('mock-hash')),
  isValidEmail: jest.fn(() => true)
}));

describe('Backend Authentication Replacement', () => {
  beforeEach(() => {
    Object.assign(process.env, mockEnv);
    jest.clearAllMocks();
  });

  describe('Dual Authentication System', () => {
    test('should handle BetterAuth session correctly', async () => {
      const { getAuthFromRequest } = await import('@/lib/auth-migration');
      
      mockAuth.api.getSession.mockResolvedValue({
        session: { id: 'session-123' },
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' }
      });

      const mockRequest = {
        headers: new Headers()
      } as any;

      const result = await getAuthFromRequest(mockRequest);

      expect(result.success).toBe(true);
      expect(result.authType).toBe('betterauth');
      expect(result.user?.isMigrated).toBe(true);
    });

    test('should fallback to legacy JWT when BetterAuth fails', async () => {
      const { getAuthFromRequest } = await import('@/lib/auth-migration');
      const { verifyJWT } = await import('@/lib/auth');

      // Mock BetterAuth failure
      mockAuth.api.getSession.mockRejectedValue(new Error('Session not found'));

      // Mock JWT success
      (verifyJWT as jest.MockedFunction<typeof verifyJWT>).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com'
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          created_at: new Date()
        }
      });

      const mockRequest = {
        headers: new Headers(),
        cookies: {
          get: jest.fn(() => ({ value: 'mock-jwt-token' }))
        }
      } as any;

      const result = await getAuthFromRequest(mockRequest);

      expect(result.success).toBe(true);
      expect(result.authType).toBe('legacy');
      expect(result.user?.isMigrated).toBe(false);
    });

    test('should return none when no authentication found', async () => {
      const { getAuthFromRequest } = await import('@/lib/auth-migration');

      mockAuth.api.getSession.mockRejectedValue(new Error('No session'));

      const mockRequest = {
        headers: new Headers(),
        cookies: {
          get: jest.fn(() => null)
        }
      } as any;

      const result = await getAuthFromRequest(mockRequest);

      expect(result.success).toBe(false);
      expect(result.authType).toBe('none');
    });
  });

  describe('User Migration', () => {
    test('should migrate user successfully', async () => {
      const { migrateUserToBetterAuth } = await import('@/lib/auth-migration');

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          password_hash: 'legacy-hash'
        }
      });

      mockAuth.api.signUpEmail.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' }
      });

      mockSupabase.from().update().eq.mockResolvedValue({});

      const result = await migrateUserToBetterAuth(
        'user-123',
        'test@example.com',
        'password123'
      );

      expect(result.success).toBe(true);
      expect(mockAuth.api.signUpEmail).toHaveBeenCalledWith({
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
      });
    });

    test('should handle migration failure gracefully', async () => {
      const { migrateUserToBetterAuth } = await import('@/lib/auth-migration');

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null
      });

      const result = await migrateUserToBetterAuth(
        'user-123',
        'test@example.com',
        'password123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Legacy user not found');
    });
  });

  describe('Authentication Strategy', () => {
    test('should return dual strategy by default', async () => {
      const { getAuthStrategy } = await import('@/lib/auth-migration');
      
      const strategy = getAuthStrategy();
      expect(strategy).toBe('dual');
    });

    test('should respect AUTH_STRATEGY environment variable', async () => {
      process.env.AUTH_STRATEGY = 'betterauth-only';
      
      // Re-import to get fresh module
      jest.resetModules();
      const { getAuthStrategy } = await import('@/lib/auth-migration');
      
      const strategy = getAuthStrategy();
      expect(strategy).toBe('betterauth-only');
    });
  });

  describe('API Route Updates', () => {
    test('should handle signup with dual authentication', async () => {
      const { signUpUser } = await import('@/lib/auth-dual');

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null // No existing user
      });

      mockAuth.api.signUpEmail.mockResolvedValue({
        user: { 
          id: 'user-123', 
          email: 'test@example.com', 
          name: 'Test User' 
        }
      });

      const mockRequest = {
        headers: new Headers()
      } as any;

      const result = await signUpUser(
        'Test User',
        'test@example.com',
        'password123',
        mockRequest
      );

      expect(result.success).toBe(true);
      expect(result.user?.isMigrated).toBe(true);
      expect(mockAuth.api.signUpEmail).toHaveBeenCalled();
    });

    test('should handle login with migration', async () => {
      const { authenticateUser } = await import('@/lib/auth-dual');
      const { verifyPassword } = await import('@/lib/auth');

      // Mock legacy user exists
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({
          data: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            password_hash: 'legacy-hash'
          }
        })
        .mockResolvedValueOnce({
          data: null // Not yet in BetterAuth
        });

      (verifyPassword as jest.MockedFunction<typeof verifyPassword>)
        .mockResolvedValue(true);

      mockAuth.api.signUpEmail.mockResolvedValue({
        user: { id: 'user-123' }
      });

      mockAuth.api.signInEmail.mockResolvedValue({
        user: { id: 'user-123' },
        session: { id: 'session-123' }
      });

      const mockRequest = {
        headers: new Headers()
      } as any;

      const result = await authenticateUser(
        'test@example.com',
        'password123',
        mockRequest
      );

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(true);
      expect(result.user?.isMigrated).toBe(true);
    });
  });

  describe('Session Management', () => {
    test('should get auth context from BetterAuth session', async () => {
      const { getAuthContext } = await import('@/lib/auth-dual');

      mockAuth.api.getSession.mockResolvedValue({
        session: { id: 'session-123' },
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' }
      });

      const mockRequest = {
        headers: new Headers()
      } as any;

      const context = await getAuthContext(mockRequest);

      expect(context.isAuthenticated).toBe(true);
      expect(context.authType).toBe('betterauth');
      expect(context.user?.isMigrated).toBe(true);
    });

    test('should handle unauthenticated request', async () => {
      const { getAuthContext } = await import('@/lib/auth-dual');

      mockAuth.api.getSession.mockRejectedValue(new Error('No session'));

      const mockRequest = {
        headers: new Headers(),
        cookies: {
          get: jest.fn(() => null)
        }
      } as any;

      const context = await getAuthContext(mockRequest);

      expect(context.isAuthenticated).toBe(false);
      expect(context.authType).toBe('none');
      expect(context.user).toBeNull();
    });
  });
});

describe('Password Migration', () => {
  test('should track migration status correctly', async () => {
    const { isUserMigrated } = await import('@/lib/auth-migration');

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: { id: 'user-123' }
    });

    const result = await isUserMigrated('user-123');
    expect(result).toBe(true);
  });

  test('should handle non-migrated user', async () => {
    const { isUserMigrated } = await import('@/lib/auth-migration');

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null
    });

    const result = await isUserMigrated('user-123');
    expect(result).toBe(false);
  });
});
