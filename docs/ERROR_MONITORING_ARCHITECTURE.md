# Error Monitoring & System Health Architecture

> **Version**: 1.0.0  
> **Created**: December 10, 2025  
> **Module**: `/src/modules/error-monitoring/`

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Core Components](#core-components)
4. [Database Schema](#database-schema)
5. [Error Categories](#error-categories)
6. [Health Monitoring](#health-monitoring)
7. [AI-Powered Analysis](#ai-powered-analysis)
8. [User Error Reporting](#user-error-reporting)
9. [Module Structure](#module-structure)
10. [API Reference](#api-reference)
11. [Implementation Checklist](#implementation-checklist)

---

## Overview

Enterprise-grade error monitoring and system health tracking inspired by:
- **Sentry** - Error tracking and performance monitoring
- **Datadog** - Infrastructure monitoring
- **PagerDuty** - Incident management
- **FareHarbor/Calendly** - SaaS reliability patterns

### Key Features

| Feature | Description |
|---------|-------------|
| **Automated Error Capture** | Global error boundary, unhandled rejections, API errors |
| **System Health Monitoring** | Uptime, API health, webhook status, database, Stripe |
| **User Error Reporting** | Org owners and customers can report issues |
| **AI-Powered Analysis** | Claude/GPT analyzes errors and suggests fixes |
| **Real-time Dashboard** | Live error feed and health metrics |
| **Automated Alerts** | Email/Slack notifications for critical issues |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ERROR MONITORING SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  Error Sources  │    │  Health Checks  │    │  User Reports   │         │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤         │
│  │ • JS Errors     │    │ • API Endpoints │    │ • Bug Reports   │         │
│  │ • API Errors    │    │ • Webhooks      │    │ • Feature Req   │         │
│  │ • Network Fails │    │ • Database      │    │ • Feedback      │         │
│  │ • Type Errors   │    │ • Stripe        │    │ • Screenshots   │         │
│  │ • Crashes       │    │ • Embeds        │    │                 │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           └──────────────────────┼──────────────────────┘                   │
│                                  ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      ERROR PROCESSING PIPELINE                         │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  1. Capture → 2. Deduplicate → 3. Enrich → 4. Store → 5. Analyze      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                  │                                          │
│           ┌──────────────────────┼──────────────────────┐                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │    Database     │    │   AI Analysis   │    │     Alerts      │         │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤         │
│  │ • system_errors │    │ • Claude 4.5    │    │ • Email         │         │
│  │ • health_checks │    │ • GPT-4 Codex   │    │ • Slack         │         │
│  │ • user_reports  │    │ • Auto-suggest  │    │ • PagerDuty     │         │
│  │ • error_metrics │    │ • Code patches  │    │ • In-app        │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      SYSTEM ADMIN DASHBOARD                            │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  • Real-time Error Feed    • Health Status Grid    • AI Suggestions   │  │
│  │  • Error Trends Charts     • User Reports Queue    • Alert History    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Error Capture Layer

| Component | Purpose | File |
|-----------|---------|------|
| `GlobalErrorBoundary` | Catches React component errors | `components/GlobalErrorBoundary.tsx` |
| `errorCapture.service` | Captures JS errors, network errors | `services/errorCapture.service.ts` |
| `apiErrorInterceptor` | Intercepts failed API calls | `services/apiInterceptor.service.ts` |

### 2. Health Monitoring Layer

| Service | Monitors | Interval |
|---------|----------|----------|
| `apiHealth.service` | Edge Functions, REST endpoints | 5 min |
| `webhookHealth.service` | Stripe webhooks, third-party | 15 min |
| `databaseHealth.service` | Supabase connection, queries | 5 min |
| `embedHealth.service` | Widget loading, booking flow | 30 min |

### 3. AI Analysis Layer

| Provider | Use Case | Model |
|----------|----------|-------|
| Anthropic Claude | Error analysis, root cause | claude-3-5-sonnet |
| OpenAI GPT | Code suggestions, fixes | gpt-4-turbo |

---

## Database Schema

### Tables

#### `system_errors` - Error tracking
```sql
CREATE TABLE system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_hash VARCHAR(64) NOT NULL,           -- SHA256 hash for deduplication
  error_type error_type_enum NOT NULL,
  severity severity_enum NOT NULL DEFAULT 'error',
  message TEXT NOT NULL,
  stack_trace TEXT,
  component VARCHAR(255),                     -- React component or service
  file_path VARCHAR(500),
  line_number INTEGER,
  column_number INTEGER,
  
  -- Context
  url VARCHAR(2000),
  user_agent TEXT,
  browser VARCHAR(100),
  os VARCHAR(100),
  device_type VARCHAR(50),
  
  -- Multi-tenant
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',               -- Custom context data
  request_id VARCHAR(100),
  session_id VARCHAR(100),
  
  -- Status
  status error_status_enum DEFAULT 'new',
  occurrence_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  
  -- AI Analysis
  ai_analysis JSONB,                         -- AI-generated analysis
  ai_suggestion TEXT,                        -- Suggested fix
  ai_analyzed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_errors_hash ON system_errors(error_hash);
CREATE INDEX idx_errors_type ON system_errors(error_type);
CREATE INDEX idx_errors_severity ON system_errors(severity);
CREATE INDEX idx_errors_status ON system_errors(status);
CREATE INDEX idx_errors_org ON system_errors(organization_id);
CREATE INDEX idx_errors_created ON system_errors(created_at DESC);
```

#### `health_checks` - System health monitoring
```sql
CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type health_check_type_enum NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  endpoint VARCHAR(500),
  
  -- Status
  status health_status_enum NOT NULL,
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  
  -- Details
  details JSONB DEFAULT '{}',
  
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_service ON health_checks(service_name, checked_at DESC);
CREATE INDEX idx_health_status ON health_checks(status);
```

#### `user_error_reports` - User-submitted bug reports
```sql
CREATE TABLE user_error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type report_type_enum NOT NULL,
  priority priority_enum DEFAULT 'medium',
  
  -- Reporter
  reporter_type reporter_type_enum NOT NULL,   -- org_owner, customer, staff
  reporter_id UUID REFERENCES users(id),
  reporter_email VARCHAR(255),
  reporter_name VARCHAR(255),
  organization_id UUID REFERENCES organizations(id),
  
  -- Report content
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  
  -- Context
  url VARCHAR(2000),
  browser_info JSONB,
  screenshot_urls TEXT[],
  
  -- Linked error
  linked_error_id UUID REFERENCES system_errors(id),
  
  -- Status
  status report_status_enum DEFAULT 'open',
  assigned_to UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `error_alerts` - Alert configuration and history
```sql
CREATE TABLE error_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type alert_type_enum NOT NULL,
  channel alert_channel_enum NOT NULL,
  
  -- Trigger conditions
  trigger_conditions JSONB NOT NULL,
  
  -- Notification details
  recipients TEXT[],
  webhook_url VARCHAR(2000),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `system_uptime` - Uptime tracking
```sql
CREATE TABLE system_uptime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  status uptime_status_enum NOT NULL,
  
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  incident_id VARCHAR(100),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enums

```sql
CREATE TYPE error_type_enum AS ENUM (
  'javascript', 'network', 'api', 'database', 
  'stripe', 'webhook', 'embed', 'auth', 
  'validation', 'runtime', 'crash', 'unknown'
);

CREATE TYPE severity_enum AS ENUM (
  'debug', 'info', 'warning', 'error', 'critical'
);

CREATE TYPE error_status_enum AS ENUM (
  'new', 'investigating', 'identified', 
  'fixing', 'resolved', 'ignored', 'recurring'
);

CREATE TYPE health_check_type_enum AS ENUM (
  'api', 'webhook', 'database', 'stripe', 
  'embed', 'email', 'sms', 'external'
);

CREATE TYPE health_status_enum AS ENUM (
  'healthy', 'degraded', 'unhealthy', 'unknown'
);

CREATE TYPE report_type_enum AS ENUM (
  'bug', 'feature_request', 'performance', 
  'ui_issue', 'data_issue', 'other'
);

CREATE TYPE reporter_type_enum AS ENUM (
  'system_admin', 'org_owner', 'staff', 'customer'
);

CREATE TYPE priority_enum AS ENUM (
  'low', 'medium', 'high', 'critical'
);

CREATE TYPE report_status_enum AS ENUM (
  'open', 'in_progress', 'pending_info', 
  'resolved', 'closed', 'duplicate'
);

CREATE TYPE alert_type_enum AS ENUM (
  'error_spike', 'critical_error', 'health_degraded',
  'uptime_incident', 'new_user_report'
);

CREATE TYPE alert_channel_enum AS ENUM (
  'email', 'slack', 'webhook', 'in_app'
);

CREATE TYPE uptime_status_enum AS ENUM (
  'operational', 'degraded', 'partial_outage', 
  'major_outage', 'maintenance'
);
```

---

## Error Categories

### Error Type Matrix

| Type | Source | Auto-Capture | Priority |
|------|--------|--------------|----------|
| `javascript` | Unhandled exceptions | ✅ | High |
| `network` | Failed HTTP requests | ✅ | Medium |
| `api` | Edge Function errors | ✅ | High |
| `database` | Supabase errors | ✅ | Critical |
| `stripe` | Payment failures | ✅ | Critical |
| `webhook` | Webhook delivery fails | ✅ | High |
| `embed` | Widget loading errors | ✅ | Medium |
| `auth` | Authentication failures | ✅ | High |
| `validation` | Data validation errors | ✅ | Low |
| `runtime` | TypeErrors, ReferenceErrors | ✅ | Medium |
| `crash` | App crashes, blank screens | ✅ | Critical |

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| `critical` | System down, data loss | < 15 min |
| `error` | Feature broken, blocking | < 1 hour |
| `warning` | Degraded, workaround exists | < 4 hours |
| `info` | Minor issue, cosmetic | < 24 hours |
| `debug` | Development only | N/A |

---

## Health Monitoring

### Health Check Endpoints

| Service | Endpoint | Interval | Timeout |
|---------|----------|----------|---------|
| API Health | `/health` | 5 min | 10s |
| Database | `SELECT 1` | 5 min | 5s |
| Stripe | `stripe.paymentIntents.list({limit:1})` | 15 min | 10s |
| Webhooks | Check last delivery time | 15 min | - |
| Embeds | Load test widget | 30 min | 30s |
| Edge Functions | Invoke test function | 10 min | 15s |

### Status Page Components

```
┌────────────────────────────────────────────────────┐
│              SYSTEM STATUS                          │
├────────────────────────────────────────────────────┤
│                                                     │
│  ● API Endpoints            [Operational]          │
│  ● Database                 [Operational]          │
│  ● Payment Processing       [Operational]          │
│  ● Booking Widgets          [Operational]          │
│  ● Email Notifications      [Degraded]             │
│  ● Webhook Deliveries       [Operational]          │
│                                                     │
│  Current Uptime: 99.97%                            │
│  Last Incident: 3 days ago                         │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## AI-Powered Analysis

### Analysis Pipeline

```
Error Captured
      │
      ▼
┌─────────────────┐
│ Deduplication   │  ← Check error_hash
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Context Enrich  │  ← Add user, org, session data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Analysis     │  ← Send to Claude/GPT
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Generated Output:                    │
│ • Root cause explanation            │
│ • Similar known issues              │
│ • Suggested code fix                │
│ • Estimated severity                │
│ • Affected users estimate           │
└─────────────────────────────────────┘
```

### AI Prompt Template

```typescript
const AI_ANALYSIS_PROMPT = `
You are an expert software engineer analyzing a production error.

ERROR DETAILS:
- Type: {error_type}
- Message: {message}
- Stack Trace: {stack_trace}
- Component: {component}
- File: {file_path}:{line_number}

CONTEXT:
- URL: {url}
- Browser: {browser}
- User Role: {user_role}
- Organization: {org_name}

Please provide:
1. ROOT CAUSE: What likely caused this error
2. IMPACT: How many users might be affected
3. FIX: Suggested code fix (if applicable)
4. PREVENTION: How to prevent this in the future
5. SEVERITY: Rate 1-5 (5 = critical)

Format as JSON.
`;
```

### Auto-Fix Capabilities

| Error Type | Auto-Fix | Implementation |
|------------|----------|----------------|
| TypeErrors | ✅ | Add null checks |
| Missing imports | ✅ | Add import statements |
| API timeouts | ⚠️ | Suggest retry logic |
| Auth errors | ❌ | Manual review |
| Database errors | ❌ | Manual review |

---

## User Error Reporting

### Report Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Customer    │     │  Org Owner   │     │   Staff      │
│  Widget      │     │  Dashboard   │     │   App        │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Report Form         │
                │   ┌─────────────────┐ │
                │   │ Title           │ │
                │   │ Description     │ │
                │   │ Steps to Repro  │ │
                │   │ Screenshot      │ │
                │   │ Priority        │ │
                │   └─────────────────┘ │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   user_error_reports  │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Alert System        │
                │   → Email to admins   │
                │   → Slack notification│
                └───────────────────────┘
```

### Report Widget (Embedded)

```typescript
// For customer booking widgets
<ErrorReportButton 
  reporterType="customer"
  context={{ 
    activityId, 
    bookingStep, 
    widgetKey 
  }}
/>

// For org owner dashboard
<ErrorReportPanel 
  reporterType="org_owner"
  organizationId={orgId}
/>
```

---

## Module Structure

```
/src/modules/error-monitoring/
├── index.ts                          # Module exports (30 lines)
├── types/
│   ├── index.ts                      # Type exports
│   ├── errors.types.ts               # Error types (90 lines)
│   ├── health.types.ts               # Health check types (70 lines)
│   ├── reports.types.ts              # User report types (60 lines)
│   └── alerts.types.ts               # Alert types (50 lines)
├── constants/
│   ├── index.ts                      # Constants exports
│   ├── errorCategories.ts            # Error type definitions (80 lines)
│   ├── healthEndpoints.ts            # Health check config (60 lines)
│   └── severityLevels.ts             # Severity definitions (40 lines)
├── services/
│   ├── index.ts                      # Service exports
│   ├── errorCapture.service.ts       # Error capture logic (145 lines)
│   ├── errorStore.service.ts         # Store errors to DB (100 lines)
│   ├── healthCheck.service.ts        # Run health checks (140 lines)
│   ├── aiAnalysis.service.ts         # AI analysis (130 lines)
│   ├── userReports.service.ts        # User reports CRUD (120 lines)
│   └── alerting.service.ts           # Send alerts (110 lines)
├── hooks/
│   ├── index.ts                      # Hook exports
│   ├── useErrorMonitoring.ts         # Main dashboard hook (140 lines)
│   ├── useHealthStatus.ts            # Health status hook (100 lines)
│   ├── useUserReports.ts             # User reports hook (100 lines)
│   └── useAlerts.ts                  # Alerts hook (80 lines)
├── components/
│   ├── index.ts                      # Component exports
│   ├── ErrorDashboard.tsx            # Main dashboard (150 lines)
│   ├── ErrorList.tsx                 # Error table (140 lines)
│   ├── ErrorDetailPanel.tsx          # Error details (130 lines)
│   ├── HealthStatusGrid.tsx          # Health grid (110 lines)
│   ├── UserReportsQueue.tsx          # Reports queue (120 lines)
│   ├── AIAnalysisPanel.tsx           # AI suggestions (100 lines)
│   ├── ErrorReportForm.tsx           # Report form (140 lines)
│   ├── AlertConfigPanel.tsx          # Alert config (130 lines)
│   └── UptimeChart.tsx               # Uptime chart (90 lines)
├── pages/
│   ├── index.ts                      # Page exports
│   └── ErrorMonitoringPage.tsx       # System Admin page (140 lines)
└── utils/
    ├── errorHash.ts                  # Generate error hash (30 lines)
    ├── errorEnricher.ts              # Enrich error context (60 lines)
    └── healthAggregator.ts           # Aggregate health data (50 lines)

/supabase/functions/
├── system-health-check/
│   └── index.ts                      # Scheduled health checks
├── ai-error-analysis/
│   └── index.ts                      # AI analysis endpoint
└── error-webhook/
    └── index.ts                      # Error ingestion webhook
```

---

## API Reference

### Edge Functions

#### `POST /functions/v1/system-health-check`
```typescript
// Run health checks
{
  "checks": ["api", "database", "stripe", "webhooks"]
}

// Response
{
  "results": [
    { "service": "api", "status": "healthy", "responseTime": 45 },
    { "service": "database", "status": "healthy", "responseTime": 12 }
  ],
  "overallStatus": "healthy"
}
```

#### `POST /functions/v1/ai-error-analysis`
```typescript
// Request AI analysis
{
  "errorId": "uuid",
  "provider": "anthropic" // or "openai"
}

// Response
{
  "analysis": {
    "rootCause": "Null reference when accessing user.organization",
    "impact": "Affects ~5% of users on org settings page",
    "suggestedFix": "Add optional chaining: user?.organization?.id",
    "severity": 3,
    "relatedErrors": ["error-id-1", "error-id-2"]
  }
}
```

#### `POST /functions/v1/error-webhook`
```typescript
// Ingest error from external source
{
  "source": "vercel" | "cloudflare" | "custom",
  "error": {
    "message": "...",
    "stack": "...",
    "metadata": {}
  }
}
```

### RPC Functions

```sql
-- Get error statistics
SELECT * FROM get_error_stats(
  p_time_range := '24 hours',
  p_organization_id := NULL  -- NULL for all orgs
);

-- Get health summary
SELECT * FROM get_health_summary();

-- Get uptime percentage
SELECT * FROM calculate_uptime(
  p_service_name := 'api',
  p_days := 30
);
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Database migration with all tables and enums
- [ ] Basic types and constants
- [ ] Error capture service (global handler)
- [ ] Error storage service

### Phase 2: Health Monitoring (Week 1-2)
- [ ] Health check service
- [ ] Health check scheduler (cron)
- [ ] Uptime tracking
- [ ] Health status grid component

### Phase 3: Dashboard UI (Week 2)
- [ ] Error list component
- [ ] Error detail panel
- [ ] Dashboard layout
- [ ] Charts and metrics

### Phase 4: AI Integration (Week 2-3)
- [ ] AI analysis service
- [ ] Claude integration
- [ ] OpenAI integration
- [ ] AI suggestion panel

### Phase 5: User Reporting (Week 3)
- [ ] User reports service
- [ ] Report form component
- [ ] Reports queue component
- [ ] Customer report widget

### Phase 6: Alerting (Week 3-4)
- [ ] Alert configuration
- [ ] Email alerts
- [ ] Slack integration
- [ ] In-app notifications

### Phase 7: Polish & Deploy (Week 4)
- [ ] Real-time subscriptions
- [ ] Error rate limiting
- [ ] Documentation
- [ ] Production deployment

---

## Security Considerations

1. **Error Data Sanitization**: Remove sensitive data (passwords, tokens) before storing
2. **Rate Limiting**: Prevent error flooding (max 100 errors/minute per org)
3. **PII Handling**: Anonymize user data in error reports
4. **Access Control**: Only system admins can view all errors
5. **AI Data**: Don't send PII to AI providers

---

## Performance Considerations

1. **Error Deduplication**: Hash errors to prevent duplicate storage
2. **Batch Processing**: Queue errors and process in batches
3. **Retention Policy**: Auto-delete resolved errors after 30 days
4. **Index Optimization**: Proper indexes for common queries
5. **Health Check Caching**: Cache health results for 1 minute

---

## Related Documentation

- [Multi-Tenant Auth Architecture](./MULTI_TENANT_AUTH_ARCHITECTURE.md)
- [Edge Caching Architecture](./EDGE_CACHING_ARCHITECTURE.md)
- [AI Agents Module](./AI_AGENTS_MODULE.md)
