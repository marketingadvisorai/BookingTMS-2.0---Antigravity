# Product Requirements Document: Enterprise Scale Improvements

> **Version**: 1.0.0  
> **Date**: December 1, 2025  
> **Author**: Engineering Team  
> **Status**: Approved for Implementation

---

## 1. Executive Summary

### 1.1 Problem Statement

BookingTMS is a multi-tenant booking management SaaS platform that currently serves small-scale deployments. As we prepare for enterprise customers (FareHarbor, Calendly, Stripe-scale), several architectural limitations must be addressed:

1. **Race conditions** in booking flow causing double bookings
2. **RLS policy recursion** causing authentication failures
3. **Missing indexes** causing slow queries at scale
4. **No caching layer** causing repeated database hits
5. **No rate limiting** exposing the system to abuse

### 1.2 Goals

| Goal | Metric | Target |
|------|--------|--------|
| Zero double bookings | Race condition incidents | 0/month |
| Fast API responses | P95 latency | <100ms |
| High availability | Uptime | 99.99% |
| Scalability | Concurrent users | 10,000+ |
| Data isolation | Security incidents | 0/year |

### 1.3 Non-Goals

- Mobile app development (future phase)
- White-label solution (future phase)
- Multi-region deployment (future phase)

---

## 2. User Stories

### 2.1 Platform Admin (System Admin)

```
AS A platform administrator
I WANT to manage all organizations from a single dashboard
SO THAT I can monitor platform health and revenue
```

**Acceptance Criteria:**
- [ ] View all organizations with real-time metrics
- [ ] See total bookings, revenue, and active users
- [ ] Manage subscription plans and billing
- [ ] Access audit logs for compliance

### 2.2 Organization Owner (Super Admin)

```
AS AN organization owner
I WANT my data to be completely isolated from other tenants
SO THAT I can trust the platform with my business data
```

**Acceptance Criteria:**
- [ ] Cannot see other organizations' data
- [ ] Cannot access other organizations' customers
- [ ] My staff can only see my organization's data
- [ ] Audit trail for all data access

### 2.3 Customer (End User)

```
AS A customer booking an experience
I WANT to be confident that my booking won't be double-booked
SO THAT I can trust the reservation system
```

**Acceptance Criteria:**
- [ ] Slot shows as unavailable immediately after booking
- [ ] Cannot book a slot that's being booked by another user
- [ ] Receive immediate confirmation
- [ ] See real-time availability updates

### 2.4 Staff Member

```
AS A staff member
I WANT fast access to booking information
SO THAT I can efficiently check in customers
```

**Acceptance Criteria:**
- [ ] Booking lookup in <1 second
- [ ] Real-time updates when bookings change
- [ ] Offline capability for check-in (future)

---

## 3. Technical Requirements

### 3.1 Database Requirements

#### 3.1.1 Optimistic Locking

**Requirement:** Implement optimistic locking on `activity_sessions` table to prevent race conditions.

```sql
-- Required schema change
ALTER TABLE activity_sessions ADD COLUMN version INTEGER DEFAULT 1;

-- Required function
CREATE FUNCTION reserve_session_capacity(
  session_id UUID,
  spots INTEGER,
  expected_version INTEGER
) RETURNS BOOLEAN;
```

**Rationale:** Without optimistic locking, two concurrent booking requests can both succeed, causing overbooking.

#### 3.1.2 Index Requirements

**Requirement:** Add composite indexes for common query patterns.

| Table | Index | Columns | Type |
|-------|-------|---------|------|
| activity_sessions | idx_sessions_availability | (activity_id, start_time, capacity_remaining) | B-tree |
| bookings | idx_bookings_org_date_status | (organization_id, booking_date, status) | B-tree |
| customers | idx_customers_org_email | (organization_id, email) | Unique |
| activities | idx_activities_schedule | (schedule) | GIN |

**Rationale:** Current queries perform full table scans at scale.

#### 3.1.3 RLS Policy Requirements

**Requirement:** Refactor RLS policies to use SECURITY DEFINER helper functions.

```sql
-- Required helper functions
CREATE FUNCTION get_my_organization_id() RETURNS UUID;
CREATE FUNCTION is_platform_admin() RETURNS BOOLEAN;
CREATE FUNCTION can_access_organization(org_id UUID) RETURNS BOOLEAN;
```

**Rationale:** Current RLS policies cause infinite recursion when querying the users table.

### 3.2 API Requirements

#### 3.2.1 Rate Limiting

**Requirement:** Implement rate limiting on all API endpoints.

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public (widget) | 100 req | 1 minute |
| Authenticated | 1000 req | 1 minute |
| Admin | 5000 req | 1 minute |
| Webhook | 10000 req | 1 minute |

**Rationale:** Protect against abuse and ensure fair resource allocation.

#### 3.2.2 Response Time Requirements

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| GET /availability | 20ms | 50ms | 100ms |
| POST /bookings | 100ms | 200ms | 500ms |
| GET /bookings/:id | 10ms | 30ms | 50ms |
| GET /dashboard/stats | 50ms | 100ms | 200ms |

### 3.3 Caching Requirements

#### 3.3.1 Cache Strategy

| Data Type | TTL | Invalidation |
|-----------|-----|--------------|
| Activity details | 5 min | On update |
| Venue config | 5 min | On update |
| Session availability | 30 sec | On booking |
| User permissions | 5 min | On role change |

**Rationale:** Reduce database load for frequently accessed data.

### 3.4 Security Requirements

#### 3.4.1 Data Isolation

- All tenant data MUST be isolated via RLS
- System admins MUST have explicit access grants
- Audit logs MUST track all data access
- API keys MUST be scoped to organization

#### 3.4.2 Authentication

- JWT tokens MUST expire in 1 hour
- Refresh tokens MUST expire in 7 days
- MFA SHOULD be available for admin accounts
- Session MUST be invalidated on password change

---

## 4. Functional Requirements

### 4.1 Booking Flow

#### 4.1.1 Slot Reservation

```
GIVEN a customer selects a time slot
WHEN they click "Book Now"
THEN the system MUST:
  1. Create a temporary reservation (5 min TTL)
  2. Decrement capacity_remaining atomically
  3. Return a reservation_id for checkout
  4. Release reservation if checkout not completed
```

#### 4.1.2 Checkout Process

```
GIVEN a customer has a valid reservation
WHEN they complete payment
THEN the system MUST:
  1. Verify reservation is still valid
  2. Create booking record
  3. Convert reservation to confirmed booking
  4. Send confirmation email
  5. Update real-time availability
```

#### 4.1.3 Cancellation

```
GIVEN a customer wants to cancel
WHEN they request cancellation
THEN the system MUST:
  1. Check cancellation policy
  2. Process refund if applicable
  3. Release capacity back to pool
  4. Send cancellation confirmation
  5. Update real-time availability
```

### 4.2 Multi-Tenant Operations

#### 4.2.1 Organization Creation

```
GIVEN a system admin creates an organization
WHEN the organization is saved
THEN the system MUST:
  1. Create organization record
  2. Create default venue
  3. Create admin user with temp password
  4. Send welcome email with credentials
  5. Initialize Stripe Connect onboarding
```

#### 4.2.2 Data Access

```
GIVEN a user queries any data
WHEN the query is executed
THEN the system MUST:
  1. Verify user authentication
  2. Apply RLS policies
  3. Filter by organization_id
  4. Log access for audit
```

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Requirement |
|--------|-------------|
| API Response Time (P95) | <100ms |
| Database Query Time (P95) | <50ms |
| Page Load Time | <2s |
| Time to First Byte | <200ms |

### 5.2 Scalability

| Metric | Current | Target |
|--------|---------|--------|
| Organizations | 10 | 10,000+ |
| Venues | 50 | 100,000+ |
| Bookings/month | 100 | 1,000,000+ |
| Concurrent users | 100 | 10,000+ |

### 5.3 Availability

| Metric | Requirement |
|--------|-------------|
| Uptime | 99.99% |
| RTO (Recovery Time) | <15 min |
| RPO (Data Loss) | <1 min |
| Planned Maintenance | <4h/month |

### 5.4 Security

| Requirement | Standard |
|-------------|----------|
| Data Encryption | AES-256 at rest, TLS 1.3 in transit |
| Password Policy | Min 12 chars, complexity required |
| Session Management | Secure, HttpOnly cookies |
| Audit Logging | All admin actions logged |

---

## 6. Implementation Plan

### 6.1 Phase 1: Critical Fixes (Week 1-2)

**Goal:** Fix blocking issues that prevent enterprise adoption.

| Task | Owner | Effort | Priority |
|------|-------|--------|----------|
| Fix RLS recursion | Backend | 4h | P0 |
| Add optimistic locking | Backend | 8h | P0 |
| Add critical indexes | DBA | 2h | P0 |
| Fix double booking bug | Backend | 4h | P0 |

**Success Criteria:**
- [ ] Zero RLS recursion errors in logs
- [ ] Zero double bookings in test suite
- [ ] All critical queries <50ms

### 6.2 Phase 2: Performance (Week 3-4)

**Goal:** Achieve target response times.

| Task | Owner | Effort | Priority |
|------|-------|--------|----------|
| Add Redis caching | Backend | 16h | P1 |
| Optimize slow queries | Backend | 8h | P1 |
| Add connection pooling | DevOps | 4h | P1 |
| Performance testing | QA | 8h | P1 |

**Success Criteria:**
- [ ] P95 latency <100ms
- [ ] Cache hit rate >80%
- [ ] No connection exhaustion

### 6.3 Phase 3: Security (Week 5-6)

**Goal:** Enterprise-grade security.

| Task | Owner | Effort | Priority |
|------|-------|--------|----------|
| Add rate limiting | Backend | 8h | P1 |
| Implement audit logging | Backend | 8h | P1 |
| Security penetration test | Security | 16h | P1 |
| Fix identified vulnerabilities | Backend | 16h | P0 |

**Success Criteria:**
- [ ] Pass security audit
- [ ] All admin actions logged
- [ ] Rate limiting active

### 6.4 Phase 4: Scale (Week 7-8)

**Goal:** Prepare for 10x growth.

| Task | Owner | Effort | Priority |
|------|-------|--------|----------|
| Add read replicas | DevOps | 8h | P2 |
| Load testing (10k users) | QA | 8h | P1 |
| Horizontal scaling setup | DevOps | 8h | P2 |
| Documentation | All | 8h | P2 |

**Success Criteria:**
- [ ] Handle 10k concurrent users
- [ ] Failover tested
- [ ] Runbooks documented

---

## 7. Success Metrics

### 7.1 Technical Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| P95 Latency | 500ms | <100ms | APM |
| Error Rate | 2% | <0.1% | Logs |
| Uptime | 99% | 99.99% | Monitoring |
| Double Bookings | 5/month | 0/month | Incidents |

### 7.2 Business Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Enterprise Customers | 0 | 10 | CRM |
| Monthly Bookings | 100 | 100,000 | Database |
| Customer Satisfaction | N/A | >4.5/5 | Surveys |
| Churn Rate | N/A | <5% | Analytics |

---

## 8. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Migration breaks existing data | Medium | High | Staged rollout, backups |
| Performance regression | Medium | Medium | Load testing before deploy |
| Security vulnerability | Low | Critical | Penetration testing |
| Team bandwidth | High | Medium | Prioritize P0 items |

---

## 9. Appendices

### 9.1 Glossary

| Term | Definition |
|------|------------|
| RLS | Row Level Security - PostgreSQL feature for data isolation |
| Optimistic Locking | Concurrency control using version numbers |
| TTL | Time To Live - cache expiration time |
| P95 | 95th percentile - 95% of requests are faster |

### 9.2 References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Stripe Connect](https://stripe.com/docs/connect)

---

*Document approved by: Engineering Lead, Product Manager, Security Team*
