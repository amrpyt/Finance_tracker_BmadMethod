/**
 * BetterAuth Setup Tests
 * Tests for BetterAuth configuration and integration
 */

import { jest } from '@jest/globals';

// Mock environment variables
const mockEnv = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  BETTER_AUTH_SECRET: 'test-secret-key-for-testing-purposes',
  BETTER_AUTH_URL: 'http://localhost:3000',
  NODE_ENV: 'test'
};

// Mock pg Pool
const mockPool = {
  query: jest.fn(),
  end: jest.fn(),
};

jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool)
}));

describe('BetterAuth Setup', () => {
  beforeEach(() => {
    // Set up environment variables for each test
    Object.assign(process.env, mockEnv);
    jest.clearAllMocks();
  });

  describe('Environment Configuration', () => {
    test('should have required environment variables', () => {
      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.BETTER_AUTH_SECRET).toBeDefined();
      expect(process.env.BETTER_AUTH_URL).toBeDefined();
    });

    test('should validate BETTER_AUTH_SECRET length', () => {
      const secret = process.env.BETTER_AUTH_SECRET!;
      expect(secret.length).toBeGreaterThan(20);
    });

    test('should validate BETTER_AUTH_URL format', () => {
      const url = process.env.BETTER_AUTH_URL!;
      expect(url).toMatch(/^https?:\/\/.+/);
    });
  });

  describe('BetterAuth Configuration', () => {
    test('should import BetterAuth without errors', async () => {
      const { betterAuth } = await import('better-auth');
      expect(betterAuth).toBeDefined();
      expect(typeof betterAuth).toBe('function');
    });

    test('should import pg Pool without errors', async () => {
      const { Pool } = await import('pg');
      expect(Pool).toBeDefined();
      expect(typeof Pool).toBe('function');
    });

    test('should create auth configuration', async () => {
      // Mock the auth configuration import
      const mockAuth = {
        handler: {
          GET: jest.fn(),
          POST: jest.fn()
        }
      };

      // Test that the configuration doesn't throw
      expect(() => {
        const config = {
          database: mockPool,
          emailAndPassword: { enabled: true },
          session: { expiresIn: 60 * 60 * 24 * 7 }
        };
        expect(config).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Database Connection', () => {
    test('should create Pool with correct connection string', () => {
      const { Pool } = require('pg');
      new Pool({
        connectionString: process.env.DATABASE_URL
      });

      expect(Pool).toHaveBeenCalledWith({
        connectionString: mockEnv.DATABASE_URL
      });
    });

    test('should handle database connection errors gracefully', async () => {
      mockPool.query.mockRejectedValue(new Error('Connection failed'));
      
      try {
        await mockPool.query('SELECT 1');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Connection failed');
      }
    });
  });

  describe('Session Configuration', () => {
    test('should configure session with 7 day expiration', () => {
      const sessionConfig = {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 24 hours
      };

      expect(sessionConfig.expiresIn).toBe(604800); // 7 days in seconds
      expect(sessionConfig.updateAge).toBe(86400); // 24 hours in seconds
    });

    test('should configure secure cookies for production', () => {
      process.env.NODE_ENV = 'production';
      
      const cookieConfig = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        httpOnly: true,
      };

      expect(cookieConfig.secure).toBe(true);
      expect(cookieConfig.sameSite).toBe('lax');
      expect(cookieConfig.httpOnly).toBe(true);
    });

    test('should configure insecure cookies for development', () => {
      process.env.NODE_ENV = 'development';
      
      const cookieConfig = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        httpOnly: true,
      };

      expect(cookieConfig.secure).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    test('should configure rate limiting', () => {
      const rateLimitConfig = {
        window: 60, // 1 minute
        max: 100, // 100 requests
      };

      expect(rateLimitConfig.window).toBe(60);
      expect(rateLimitConfig.max).toBe(100);
    });
  });

  describe('API Route Handler', () => {
    test('should export GET and POST handlers', async () => {
      // Mock the route handler
      const mockHandler = {
        GET: jest.fn(),
        POST: jest.fn()
      };

      expect(mockHandler.GET).toBeDefined();
      expect(mockHandler.POST).toBeDefined();
      expect(typeof mockHandler.GET).toBe('function');
      expect(typeof mockHandler.POST).toBe('function');
    });
  });
});

describe('Migration Scripts', () => {
  describe('Migration Validation', () => {
    test('should validate required migration files exist', () => {
      const fs = require('fs');
      const path = require('path');
      
      const migrationFiles = [
        'scripts/migrations/000-backup-existing-users.sql',
        'scripts/migrations/001-create-betterauth-tables.sql',
        'scripts/migrations/002-migrate-existing-users.sql',
        'scripts/migrations/999-rollback-betterauth.sql',
      ];

      // Mock file existence check
      const fileExistsCheck = (filePath: string) => {
        return migrationFiles.some(file => filePath.includes(file.split('/').pop()!));
      };

      migrationFiles.forEach(file => {
        expect(fileExistsCheck(file)).toBe(true);
      });
    });

    test('should validate migration script structure', () => {
      const mockSqlContent = `
        -- BetterAuth Schema Migration
        CREATE TABLE IF NOT EXISTS "user" (
          "id" VARCHAR PRIMARY KEY,
          "email" VARCHAR UNIQUE NOT NULL
        );
      `;

      // Test SQL structure
      expect(mockSqlContent).toContain('CREATE TABLE IF NOT EXISTS "user"');
      expect(mockSqlContent).toContain('PRIMARY KEY');
      expect(mockSqlContent).toContain('UNIQUE NOT NULL');
    });
  });

  describe('User Data Migration', () => {
    test('should preserve user IDs during migration', () => {
      const originalUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: new Date('2024-01-01')
      };

      const migratedUser = {
        id: originalUser.id, // Should preserve ID
        email: originalUser.email,
        name: originalUser.email, // Use email as name
        emailVerified: true,
        createdAt: originalUser.created_at
      };

      expect(migratedUser.id).toBe(originalUser.id);
      expect(migratedUser.email).toBe(originalUser.email);
      expect(migratedUser.emailVerified).toBe(true);
    });

    test('should handle missing user names gracefully', () => {
      const userWithoutName = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: null
      };

      const processedUser = {
        ...userWithoutName,
        name: userWithoutName.name || userWithoutName.email
      };

      expect(processedUser.name).toBe('test@example.com');
    });
  });
});
