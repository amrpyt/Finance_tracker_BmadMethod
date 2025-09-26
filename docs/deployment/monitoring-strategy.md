# Production Monitoring Strategy - Epic 2

## Overview
Comprehensive monitoring and observability strategy for Finance Tracker production deployment.

## Error Tracking & Alerting

### 1. Sentry Configuration
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  
  // Performance monitoring
  profilesSampleRate: 1.0,
  
  // Session replay for debugging
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/yourapi\.domain\.com\/api/],
    }),
  ],
  
  beforeSend(event) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.type === 'ChunkLoadError') {
        return null // Ignore chunk load errors
      }
    }
    return event
  },
})
```

### 2. Custom Error Boundaries
```typescript
// components/ErrorBoundary.tsx
'use client'

import * as Sentry from "@sentry/nextjs"
import { ErrorBoundary as SentryErrorBoundary } from "@sentry/nextjs"

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Something went wrong
            </h3>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            We've been notified of this error and are working to fix it.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetError}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SentryErrorBoundary fallback={ErrorFallback}>
      {children}
    </SentryErrorBoundary>
  )
}
```

### 3. API Error Monitoring
```typescript
// lib/api-monitoring.ts
import * as Sentry from "@sentry/nextjs"

export function withErrorMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    const transaction = Sentry.startTransaction({
      name: operationName,
      op: "api"
    })

    try {
      const result = await fn(...args)
      transaction.setStatus("ok")
      return result
    } catch (error) {
      transaction.setStatus("internal_error")
      
      Sentry.captureException(error, {
        tags: {
          operation: operationName,
        },
        extra: {
          arguments: args,
        }
      })
      
      throw error
    } finally {
      transaction.finish()
    }
  }
}

// Usage in API routes
export const GET = withErrorMonitoring(async (request: Request) => {
  // API logic here
}, "GET /api/transactions")
```

## Performance Monitoring

### 1. Web Vitals Tracking
```typescript
// lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
import * as Sentry from "@sentry/nextjs"

function sendToAnalytics(metric: any) {
  // Send to Sentry
  Sentry.addBreadcrumb({
    category: 'web-vital',
    message: `${metric.name}: ${metric.value}`,
    level: 'info',
    data: metric,
  })

  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

### 2. Database Query Monitoring
```typescript
// lib/db-monitoring.ts
import { createClient } from '@supabase/supabase-js'
import * as Sentry from "@sentry/nextjs"

class MonitoredSupabaseClient {
  private client: ReturnType<typeof createClient>

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
  }

  async query(table: string, operation: string, queryFn: () => Promise<any>) {
    const startTime = Date.now()
    const span = Sentry.startSpan({
      name: `db.${table}.${operation}`,
      op: 'db'
    })

    try {
      const result = await queryFn()
      const duration = Date.now() - startTime

      // Log slow queries (>1000ms)
      if (duration > 1000) {
        Sentry.captureMessage(`Slow query detected: ${table}.${operation}`, {
          level: 'warning',
          extra: {
            duration,
            table,
            operation
          }
        })
      }

      span.setStatus('ok')
      return result
    } catch (error) {
      span.setStatus('internal_error')
      Sentry.captureException(error, {
        tags: {
          table,
          operation
        }
      })
      throw error
    } finally {
      span.end()
    }
  }

  get supabase() {
    return this.client
  }
}

export const monitoredDb = new MonitoredSupabaseClient()
```

## Business Metrics Monitoring

### 1. User Activity Tracking
```typescript
// lib/analytics.ts
interface UserEvent {
  event: string
  userId?: string
  properties?: Record<string, any>
}

export class Analytics {
  static track(event: UserEvent) {
    // Send to multiple analytics providers
    this.sendToSentry(event)
    this.sendToGA4(event)
    this.sendToCustomAnalytics(event)
  }

  private static sendToSentry(event: UserEvent) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: event.event,
      level: 'info',
      data: event.properties
    })
  }

  private static sendToGA4(event: UserEvent) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, {
        user_id: event.userId,
        ...event.properties
      })
    }
  }

  private static sendToCustomAnalytics(event: UserEvent) {
    // Send to your custom analytics endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(console.error)
    }
  }
}

// Usage in components
export function useAnalytics() {
  const trackTransaction = (action: 'create' | 'edit' | 'delete', transactionId: string) => {
    Analytics.track({
      event: `transaction_${action}`,
      properties: {
        transaction_id: transactionId,
        timestamp: new Date().toISOString()
      }
    })
  }

  const trackAccountAction = (action: 'create' | 'edit' | 'delete', accountId: string) => {
    Analytics.track({
      event: `account_${action}`,
      properties: {
        account_id: accountId,
        timestamp: new Date().toISOString()
      }
    })
  }

  return {
    trackTransaction,
    trackAccountAction
  }
}
```

### 2. Financial Metrics Dashboard
```typescript
// app/api/metrics/route.ts
import { NextResponse } from 'next/server'
import { monitoredDb } from '@/lib/db-monitoring'

export async function GET() {
  try {
    const metrics = await Promise.all([
      // User metrics
      monitoredDb.query('users', 'count', async () => {
        const { count } = await monitoredDb.supabase
          .from('auth.users')
          .select('*', { count: 'exact', head: true })
        return count
      }),

      // Transaction metrics
      monitoredDb.query('transactions', 'daily_count', async () => {
        const { data } = await monitoredDb.supabase
          .from('transactions')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        return data?.length || 0
      }),

      // Account metrics
      monitoredDb.query('accounts', 'total_balance', async () => {
        const { data } = await monitoredDb.supabase
          .from('accounts')
          .select('balance')
        return data?.reduce((sum, account) => sum + account.balance, 0) || 0
      })
    ])

    return NextResponse.json({
      users: {
        total: metrics[0]
      },
      transactions: {
        last_24h: metrics[1]
      },
      accounts: {
        total_balance: metrics[2]
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
```

## Alert Configuration

### 1. Critical Alerts (Immediate Response)
```yaml
# Sentry Alert Rules
- name: "High Error Rate"
  conditions:
    - "event.count > 10 in 5 minutes"
  actions:
    - email: "dev-team@company.com"
    - slack: "#alerts"
    - pagerduty: "critical"

- name: "Database Connection Failure"
  conditions:
    - "event.message contains 'database connection'"
  actions:
    - email: "dev-team@company.com"
    - slack: "#alerts"
    - pagerduty: "critical"

- name: "Authentication Failure Spike"
  conditions:
    - "event.count > 20 in 10 minutes"
    - "event.tags.operation = 'auth'"
  actions:
    - email: "security@company.com"
    - slack: "#security-alerts"
```

### 2. Warning Alerts (Monitor & Investigate)
```yaml
- name: "Slow API Response"
  conditions:
    - "event.extra.duration > 2000"
  actions:
    - slack: "#performance"

- name: "High Memory Usage"
  conditions:
    - "performance.memory_usage > 80%"
  actions:
    - slack: "#infrastructure"

- name: "Low User Activity"
  conditions:
    - "custom.daily_active_users < 10"
  actions:
    - email: "product@company.com"
```

## Monitoring Dashboard

### 1. Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "Finance Tracker - Production Monitoring",
    "panels": [
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(sentry_errors_total[5m])",
            "legendFormat": "Errors per second"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "singlestat",
        "targets": [
          {
            "expr": "finance_tracker_active_users",
            "legendFormat": "Active Users"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "supabase_connections_active",
            "legendFormat": "Active Connections"
          }
        ]
      }
    ]
  }
}
```

### 2. Health Check Monitoring
```typescript
// lib/health-checks.ts
export interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  error?: string
}

export async function runHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []

  // Database health
  try {
    const start = Date.now()
    await monitoredDb.supabase.from('accounts').select('count').limit(1)
    checks.push({
      name: 'database',
      status: 'healthy',
      responseTime: Date.now() - start
    })
  } catch (error) {
    checks.push({
      name: 'database',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // External API health (if any)
  try {
    const start = Date.now()
    const response = await fetch('https://api.external-service.com/health', {
      timeout: 5000
    })
    checks.push({
      name: 'external_api',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime: Date.now() - start
    })
  } catch (error) {
    checks.push({
      name: 'external_api',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  return checks
}
```

## Incident Response

### 1. Runbook Template
```markdown
# Incident Response Runbook

## Severity Levels
- **P0 (Critical)**: Complete service outage
- **P1 (High)**: Major feature unavailable
- **P2 (Medium)**: Minor feature degraded
- **P3 (Low)**: Cosmetic issues

## Response Times
- P0: 15 minutes
- P1: 1 hour
- P2: 4 hours
- P3: Next business day

## Escalation Path
1. On-call engineer
2. Engineering lead
3. CTO
4. CEO (for P0 incidents)

## Communication Channels
- Internal: #incidents Slack channel
- External: Status page updates
- Users: In-app notifications
```

### 2. Automated Incident Detection
```typescript
// lib/incident-detection.ts
export class IncidentDetector {
  static async checkSystemHealth() {
    const checks = await runHealthChecks()
    const unhealthyServices = checks.filter(check => check.status === 'unhealthy')

    if (unhealthyServices.length > 0) {
      await this.createIncident({
        title: `System Health Alert: ${unhealthyServices.length} services unhealthy`,
        severity: unhealthyServices.length > 2 ? 'P0' : 'P1',
        services: unhealthyServices.map(s => s.name)
      })
    }
  }

  private static async createIncident(incident: {
    title: string
    severity: string
    services: string[]
  }) {
    // Create incident in incident management system
    // Send alerts to appropriate channels
    // Update status page
  }
}
```

---

**Monitoring Strategy Complete** ✅
**Coverage**: Error tracking, performance, business metrics, alerting
**Tools**: Sentry, Grafana, custom analytics, health checks
**Response Time**: 15 minutes for critical issues
**Next Step**: Rollback procedures and deployment pipeline
