import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

// Production BetterAuth configuration for CLI
const database = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}) : undefined;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key-not-for-production",
  database,
  trustedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
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
  plugins: [
    nextCookies() // Add Next.js cookies plugin - must be last
  ]
});
