# Infrastructure Setup Guide - Epic 2 Production

## Database Setup (Supabase Production)

### 1. Create Production Database
```sql
-- Create production project at supabase.com
-- Project Name: finance-tracker-prod
-- Region: Choose closest to users
-- Pricing: Pro plan recommended for production
```

### 2. Database Schema Migration
```sql
-- Run these scripts in Supabase SQL Editor

-- Users table (handled by Supabase Auth)
-- Accounts table
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment')),
  balance DECIMAL(12,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'EGP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Database Configuration
```bash
# Connection pooling settings
# In Supabase Dashboard > Settings > Database
Max connections: 100
Statement timeout: 15s
Idle timeout: 10m
```

## Authentication Setup (BetterAuth + Supabase)

### 1. BetterAuth Configuration
```typescript
// lib/auth.ts - Production configuration
import { betterAuth } from "better-auth"
import { supabaseAdapter } from "better-auth/adapters/supabase"

export const auth = betterAuth({
  database: supabaseAdapter({
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_ANON_KEY!,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
    }
  }
})
```

### 2. OAuth Provider Setup

#### Google OAuth
```bash
# Google Cloud Console
1. Go to console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - https://yourdomain.com/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google (for dev)
```

#### GitHub OAuth
```bash
# GitHub Developer Settings
1. Go to github.com/settings/developers
2. Create new OAuth App
3. Set Authorization callback URL:
   - https://yourdomain.com/api/auth/callback/github
```

## Hosting Setup (Vercel Production)

### 1. Vercel Project Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://yourdomain.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 2. Environment Variables (Vercel Dashboard)
```bash
# Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
BETTER_AUTH_URL=https://yourdomain.com

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=finance-tracker
```

### 3. Domain Configuration
```bash
# Custom Domain Setup in Vercel
1. Add domain in Vercel dashboard
2. Configure DNS records:
   - A record: @ -> 76.76.19.61
   - CNAME record: www -> cname.vercel-dns.com
3. SSL certificate (automatic via Vercel)
```

## CDN and Performance

### 1. Image Optimization
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
```

### 2. Caching Strategy
```typescript
// API routes caching headers
export async function GET() {
  const response = NextResponse.json(data)
  
  // Cache for 5 minutes, stale-while-revalidate for 1 hour
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=3600'
  )
  
  return response
}
```

## Security Configuration

### 1. Security Headers
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 2. Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true,
})
```

## Monitoring Setup

### 1. Error Tracking (Sentry)
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
```

### 2. Analytics Setup
```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Add to app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## Health Checks

### 1. API Health Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Database health check
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase
      .from('accounts')
      .select('count')
      .limit(1)
    
    if (error) throw error

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        api: 'up'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

### 2. Uptime Monitoring
```bash
# UptimeRobot Configuration
1. Create account at uptimerobot.com
2. Add HTTP(s) monitor:
   - URL: https://yourdomain.com/api/health
   - Interval: 5 minutes
   - Alert contacts: email, SMS, Slack
```

---

**Infrastructure Checklist Complete** ✅
**Estimated Setup Time**: 4-6 days
**Dependencies**: Domain name, Supabase Pro account, Vercel Pro (optional)
**Next Step**: Environment configuration and testing
