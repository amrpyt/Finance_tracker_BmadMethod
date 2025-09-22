import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Production BetterAuth configuration for CLI
const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const auth = betterAuth({
  database,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Start with false for easier migration
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (same as current JWT)
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 5 minutes cache
    }
  },
  cookies: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
  },
  rateLimit: {
    window: 60, // 1 minute
    max: 100, // 100 requests per minute
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false, // Not needed for single domain
    },
    ipAddress: {
      enabled: true,
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },
  },
});
