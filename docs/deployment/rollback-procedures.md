# Rollback Procedures - Production Emergency Response

## Overview
Comprehensive rollback and emergency response procedures for Finance Tracker production deployment.

## Emergency Response Levels

### Level 1: Minor Issues (P3)
- **Trigger**: Cosmetic bugs, non-critical feature issues
- **Response Time**: Next business day
- **Action**: Hot fix deployment

### Level 2: Feature Degradation (P2)
- **Trigger**: Major feature partially broken, performance degraded
- **Response Time**: 4 hours
- **Action**: Feature flag disable or targeted rollback

### Level 3: Service Disruption (P1)
- **Trigger**: Core functionality unavailable, authentication issues
- **Response Time**: 1 hour
- **Action**: Partial rollback or emergency patch

### Level 4: Complete Outage (P0)
- **Trigger**: Site completely down, database corruption, security breach
- **Response Time**: 15 minutes
- **Action**: Full rollback to last known good state

## Rollback Strategies

### 1. Application Rollback (Vercel)

#### Instant Rollback via Vercel Dashboard
```bash
# Via Vercel CLI (fastest method)
vercel --prod --force

# Or via dashboard
1. Go to Vercel dashboard
2. Select Finance Tracker project
3. Go to Deployments tab
4. Find last known good deployment
5. Click "Promote to Production"
```

#### Automated Rollback Script
```bash
#!/bin/bash
# rollback.sh - Emergency rollback script

set -e

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "Timestamp: $(date)"

# Get last known good deployment
LAST_GOOD_DEPLOYMENT=$(vercel ls --prod --json | jq -r '.[1].uid')

if [ -z "$LAST_GOOD_DEPLOYMENT" ]; then
    echo "❌ No previous deployment found"
    exit 1
fi

echo "Rolling back to deployment: $LAST_GOOD_DEPLOYMENT"

# Promote previous deployment
vercel promote $LAST_GOOD_DEPLOYMENT --prod

echo "✅ Rollback completed"
echo "🔍 Verifying deployment..."

# Health check
sleep 30
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/api/health)

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Health check passed"
    # Notify team
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 ROLLBACK COMPLETED: Finance Tracker rolled back successfully. Health check: PASS"}' \
        $SLACK_WEBHOOK_URL
else
    echo "❌ Health check failed: $HEALTH_STATUS"
    # Escalate
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 CRITICAL: Rollback completed but health check failed. Manual intervention required."}' \
        $SLACK_WEBHOOK_URL
fi
```

### 2. Database Rollback (Supabase)

#### Point-in-Time Recovery
```sql
-- Supabase automatic backups (available for 7 days)
-- Recovery via Supabase Dashboard:
-- 1. Go to Database > Backups
-- 2. Select backup timestamp
-- 3. Restore to new database
-- 4. Update connection strings

-- Manual backup before deployment
CREATE SCHEMA backup_$(date +%Y%m%d_%H%M%S);

-- Backup critical tables
CREATE TABLE backup_$(date +%Y%m%d_%H%M%S).accounts AS SELECT * FROM accounts;
CREATE TABLE backup_$(date +%Y%m%d_%H%M%S).transactions AS SELECT * FROM transactions;
```

#### Migration Rollback Scripts
```sql
-- rollback-migration-v2.sql
-- Rollback from v2 to v1 schema

BEGIN;

-- Drop new columns added in v2
ALTER TABLE transactions DROP COLUMN IF EXISTS tags;
ALTER TABLE accounts DROP COLUMN IF EXISTS account_number;

-- Restore old constraints
ALTER TABLE transactions 
    DROP CONSTRAINT IF EXISTS check_amount_positive,
    ADD CONSTRAINT check_amount_range CHECK (amount BETWEEN -999999.99 AND 999999.99);

-- Rollback data transformations
UPDATE transactions 
SET category = 'Other' 
WHERE category NOT IN ('Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Salary', 'Freelance', 'Investment', 'Business', 'Gift');

COMMIT;
```

#### Emergency Database Restore
```bash
#!/bin/bash
# db-rollback.sh

echo "🚨 DATABASE ROLLBACK INITIATED"

# Create emergency backup of current state
pg_dump $DATABASE_URL > "emergency_backup_$(date +%Y%m%d_%H%M%S).sql"

# Restore from backup
if [ -f "$1" ]; then
    echo "Restoring from backup: $1"
    psql $DATABASE_URL < "$1"
    echo "✅ Database restored"
else
    echo "❌ Backup file not found: $1"
    exit 1
fi

# Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM accounts;" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database verification passed"
else
    echo "❌ Database verification failed"
    exit 1
fi
```

### 3. Feature Flag Rollback

#### Emergency Feature Disable
```typescript
// lib/feature-flags.ts
export const EMERGENCY_FLAGS = {
  DISABLE_TRANSACTIONS: process.env.EMERGENCY_DISABLE_TRANSACTIONS === 'true',
  DISABLE_ACCOUNTS: process.env.EMERGENCY_DISABLE_ACCOUNTS === 'true',
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true',
  READ_ONLY_MODE: process.env.READ_ONLY_MODE === 'true',
}

// Emergency maintenance page
export function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Scheduled Maintenance
        </h1>
        <p className="text-gray-600 mb-4">
          We're performing scheduled maintenance to improve your experience. 
          We'll be back shortly.
        </p>
        <div className="text-sm text-gray-500">
          Follow updates: <a href="#" className="text-blue-600">@FinanceTracker</a>
        </div>
      </div>
    </div>
  )
}
```

#### Feature Flag Management
```typescript
// middleware.ts - Emergency feature control
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Maintenance mode
  if (process.env.MAINTENANCE_MODE === 'true' && 
      !request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  // Read-only mode
  if (process.env.READ_ONLY_MODE === 'true') {
    const isWriteOperation = ['POST', 'PUT', 'DELETE'].includes(request.method)
    if (isWriteOperation && request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'System is in read-only mode' },
        { status: 503 }
      )
    }
  }

  return NextResponse.next()
}
```

## Incident Response Procedures

### 1. Incident Detection & Triage

#### Automated Detection
```typescript
// lib/incident-detection.ts
export class IncidentManager {
  static async detectAndRespond() {
    const healthChecks = await this.runHealthChecks()
    const errorRate = await this.getErrorRate()
    const responseTime = await this.getAverageResponseTime()

    // P0: Complete outage
    if (healthChecks.database === 'down' || errorRate > 50) {
      await this.triggerEmergencyRollback()
      await this.notifyTeam('P0', 'Complete system outage detected')
    }
    
    // P1: Major degradation
    else if (errorRate > 20 || responseTime > 5000) {
      await this.enableMaintenanceMode()
      await this.notifyTeam('P1', 'Major system degradation detected')
    }
    
    // P2: Minor issues
    else if (errorRate > 10 || responseTime > 2000) {
      await this.notifyTeam('P2', 'Performance degradation detected')
    }
  }

  private static async triggerEmergencyRollback() {
    // Set emergency flags
    await this.setEnvironmentVariable('MAINTENANCE_MODE', 'true')
    
    // Trigger rollback
    const { exec } = require('child_process')
    exec('./scripts/rollback.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('Rollback failed:', error)
        this.escalateToHuman()
      } else {
        console.log('Rollback completed:', stdout)
      }
    })
  }
}
```

### 2. Communication Procedures

#### Status Page Updates
```typescript
// lib/status-page.ts
export class StatusPageManager {
  static async updateStatus(incident: {
    title: string
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
    message: string
  }) {
    // Update status page API
    await fetch('https://api.statuspage.io/v1/pages/YOUR_PAGE_ID/incidents', {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${process.env.STATUSPAGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        incident: {
          name: incident.title,
          status: incident.status,
          impact_override: 'major',
          body: incident.message
        }
      })
    })
  }

  static async resolveIncident(incidentId: string) {
    await fetch(`https://api.statuspage.io/v1/pages/YOUR_PAGE_ID/incidents/${incidentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `OAuth ${process.env.STATUSPAGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        incident: {
          status: 'resolved',
          body: 'The issue has been resolved and all systems are operational.'
        }
      })
    })
  }
}
```

#### Team Notification
```typescript
// lib/notifications.ts
export class NotificationManager {
  static async notifyTeam(severity: string, message: string) {
    const notifications = []

    // Slack notification
    notifications.push(
      fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${severity}: ${message}`,
          channel: severity === 'P0' ? '#critical-alerts' : '#alerts'
        })
      })
    )

    // Email notification for P0/P1
    if (['P0', 'P1'].includes(severity)) {
      notifications.push(
        this.sendEmail({
          to: ['oncall@company.com', 'engineering@company.com'],
          subject: `${severity} Alert: Finance Tracker`,
          body: message
        })
      )
    }

    // PagerDuty for P0
    if (severity === 'P0') {
      notifications.push(
        this.triggerPagerDuty({
          routing_key: process.env.PAGERDUTY_ROUTING_KEY!,
          event_action: 'trigger',
          payload: {
            summary: message,
            severity: 'critical',
            source: 'finance-tracker'
          }
        })
      )
    }

    await Promise.all(notifications)
  }
}
```

### 3. Post-Incident Procedures

#### Incident Report Template
```markdown
# Incident Report - [Date] - [Incident ID]

## Summary
Brief description of what happened and impact on users.

## Timeline
- **[Time]**: Issue first detected
- **[Time]**: Investigation started
- **[Time]**: Root cause identified
- **[Time]**: Fix deployed
- **[Time]**: Issue resolved

## Root Cause
Detailed explanation of what caused the incident.

## Impact
- **Users Affected**: X users
- **Duration**: X minutes
- **Services Impacted**: List of affected services
- **Revenue Impact**: $X (if applicable)

## Resolution
Steps taken to resolve the incident.

## Lessons Learned
1. What went well
2. What could be improved
3. Action items for prevention

## Action Items
- [ ] Item 1 - Owner - Due date
- [ ] Item 2 - Owner - Due date
- [ ] Item 3 - Owner - Due date
```

#### Automated Post-Mortem
```typescript
// lib/post-mortem.ts
export class PostMortemGenerator {
  static async generateReport(incident: {
    id: string
    startTime: Date
    endTime: Date
    severity: string
  }) {
    const logs = await this.collectLogs(incident.startTime, incident.endTime)
    const metrics = await this.collectMetrics(incident.startTime, incident.endTime)
    const timeline = await this.generateTimeline(incident.id)

    const report = {
      incident_id: incident.id,
      duration: incident.endTime.getTime() - incident.startTime.getTime(),
      affected_users: await this.calculateAffectedUsers(incident.startTime, incident.endTime),
      error_count: logs.errors.length,
      performance_impact: metrics.averageResponseTime,
      timeline: timeline,
      recommendations: await this.generateRecommendations(logs, metrics)
    }

    // Save report
    await this.saveReport(report)
    
    // Schedule post-mortem meeting
    await this.schedulePostMortem(incident.id, report)

    return report
  }
}
```

## Testing Rollback Procedures

### 1. Rollback Testing Checklist
```bash
# Monthly rollback drill checklist
- [ ] Test application rollback (staging)
- [ ] Test database rollback (staging)
- [ ] Test feature flag disable
- [ ] Test notification systems
- [ ] Test status page updates
- [ ] Verify team response times
- [ ] Document any issues found
```

### 2. Staging Environment Rollback Test
```bash
#!/bin/bash
# test-rollback.sh - Monthly rollback drill

echo "🧪 ROLLBACK DRILL STARTED"
echo "Environment: STAGING"
echo "Timestamp: $(date)"

# Deploy test version
vercel --prod --scope staging

# Wait for deployment
sleep 60

# Trigger rollback
./scripts/rollback.sh

# Verify rollback
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://staging.yourdomain.com/api/health)

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Rollback drill successful"
else
    echo "❌ Rollback drill failed"
    exit 1
fi

echo "📊 Generating drill report..."
# Generate report with timing and success metrics
```

---

**Rollback Procedures Complete** ✅
**Coverage**: Application, database, feature flags, incident response
**Response Times**: 15 minutes for P0, 1 hour for P1
**Testing**: Monthly drills, automated detection
**Next Step**: Final deployment pipeline and go-live procedures
