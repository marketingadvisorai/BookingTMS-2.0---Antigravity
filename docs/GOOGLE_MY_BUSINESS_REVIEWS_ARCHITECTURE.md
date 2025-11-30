# Google My Business Reviews Integration Architecture

## Version: 2.0 (Planned)
## Date: November 30, 2025
## Status: 🔶 ARCHITECTURE DEFINED - MARKED FOR v2.0

---

## Overview

This document outlines the architecture for integrating Google My Business (GMB) reviews into BookingTMS, enabling automatic review management, AI-powered responses, and reputation monitoring.

---

## Why v2.0?

### Complexity Factors:
1. **OAuth 2.0 Flow** - Requires Google Cloud Console setup, client credentials, and refresh token management
2. **API Quotas** - Google Business Profile API has strict rate limits
3. **Webhook Implementation** - Real-time review notifications require Pub/Sub setup
4. **AI Response Generation** - Needs fine-tuned prompts and human approval workflows
5. **Multi-location Support** - Complex for organizations with multiple GMB locations
6. **Review Verification** - Prevent spam/fake review detection

### Current Priority:
Focus on core booking functionality, promo codes, gift cards, and email campaigns in v1.x.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BookingTMS v2.0 Review System                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────┐       │
│  │   GMB OAuth  │─────▶│  Token Store │─────▶│ Review Fetcher   │       │
│  │   Connect    │      │  (Encrypted) │      │ (Cron: 15min)    │       │
│  └──────────────┘      └──────────────┘      └────────┬─────────┘       │
│                                                        │                 │
│                                                        ▼                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────┐       │
│  │ Google Cloud │◀─────│  Pub/Sub     │◀─────│ New Review       │       │
│  │  Pub/Sub     │      │  Webhook     │      │ Notification     │       │
│  └──────────────┘      └──────────────┘      └────────┬─────────┘       │
│                                                        │                 │
│                                                        ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Review Processing Pipeline                    │   │
│  ├─────────────┬────────────────┬──────────────┬───────────────────┤   │
│  │ Sentiment   │ AI Response    │ Approval     │ Auto-Reply        │   │
│  │ Analysis    │ Generation     │ Queue        │ (if approved)     │   │
│  └─────────────┴────────────────┴──────────────┴───────────────────┘   │
│                                                        │                 │
│                                                        ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         Dashboard UI                               │   │
│  ├─────────────┬────────────────┬──────────────┬───────────────────┤   │
│  │ Review Feed │ Response       │ Analytics    │ Settings          │   │
│  │             │ Editor         │ & Reports    │ & Preferences     │   │
│  └─────────────┴────────────────┴──────────────┴───────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Planned)

### Table: `gmb_connections`
```sql
CREATE TABLE gmb_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  google_account_id VARCHAR(255) NOT NULL,
  google_account_email VARCHAR(255),
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `gmb_locations`
```sql
CREATE TABLE gmb_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES gmb_connections(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id), -- Optional mapping to venue
  gmb_location_name VARCHAR(500) NOT NULL, -- e.g., "accounts/123/locations/456"
  display_name VARCHAR(255),
  address JSONB,
  primary_phone VARCHAR(50),
  website_url TEXT,
  average_rating NUMERIC(2,1),
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  sync_enabled BOOLEAN DEFAULT true,
  auto_reply_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `gmb_reviews`
```sql
CREATE TABLE gmb_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gmb_review_id VARCHAR(255) UNIQUE NOT NULL, -- Google's review ID
  reviewer_display_name VARCHAR(255),
  reviewer_profile_photo_url TEXT,
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  comment TEXT,
  comment_language VARCHAR(10),
  create_time TIMESTAMP WITH TIME ZONE,
  update_time TIMESTAMP WITH TIME ZONE,
  
  -- Response tracking
  our_reply TEXT,
  our_reply_time TIMESTAMP WITH TIME ZONE,
  reply_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, replied, skipped
  
  -- AI analysis
  sentiment_score NUMERIC(3,2), -- -1.0 to 1.0
  sentiment_label VARCHAR(20), -- positive, neutral, negative
  topics TEXT[], -- Extracted topics: ['service', 'price', 'staff']
  ai_suggested_reply TEXT,
  ai_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Workflow
  assigned_to UUID REFERENCES users(id),
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: `gmb_review_templates`
```sql
CREATE TABLE gmb_review_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50), -- positive, negative, neutral, thank_you, apology
  content TEXT NOT NULL,
  variables TEXT[], -- Supported variables: {customer_name}, {rating}, {venue_name}
  is_default BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## API Integration Requirements

### Google Business Profile API

**Required OAuth Scopes:**
```
https://www.googleapis.com/auth/business.manage
```

**Key Endpoints:**
| Endpoint | Purpose |
|----------|---------|
| `accounts.list` | List GMB accounts |
| `accounts/{accountId}/locations.list` | List locations |
| `accounts/{accountId}/locations/{locationId}/reviews.list` | Fetch reviews |
| `accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply` | Reply to review |

**Rate Limits:**
- 60 requests/minute per project
- 1,000 requests/day for free tier

---

## Edge Functions (Planned)

### 1. `gmb-oauth-callback`
Handles OAuth callback and stores tokens securely.

### 2. `gmb-sync-reviews`
Scheduled function to fetch new reviews from GMB.

### 3. `gmb-generate-reply`
Uses AI to generate context-aware reply suggestions.

### 4. `gmb-post-reply`
Posts approved replies back to GMB.

---

## AI Response Generation

### Prompt Strategy
```
You are a professional customer service representative for {business_name}.
Generate a polite, personalized response to this review.

Review Rating: {star_rating}/5
Review Comment: {comment}
Customer Name: {reviewer_name}
Business Type: {business_type}
Previous Response Style: {response_examples}

Guidelines:
1. Thank the customer for their feedback
2. Address specific points mentioned
3. If negative, apologize and offer resolution
4. Keep response under 200 words
5. Match brand voice: {brand_voice}
6. Include call-to-action if appropriate

Response:
```

### Model Options
1. **OpenAI GPT-4** - Best quality, higher cost
2. **Claude 3** - Good balance of quality and cost
3. **GPT-3.5 Turbo** - Fastest, lowest cost for simple responses

---

## Workflow: Review Response Process

```
New Review Received
        │
        ▼
┌───────────────────┐
│ Sentiment Analysis │
│ (AI Classification)│
└─────────┬─────────┘
          │
          ▼
    ┌─────────────┐
    │ Star Rating │
    └──────┬──────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌───────┐    ┌───────┐
│ 4-5 ★ │    │ 1-3 ★ │
│ Stars │    │ Stars │
└───┬───┘    └───┬───┘
    │            │
    ▼            ▼
┌─────────┐  ┌─────────────┐
│ Auto-   │  │ Manual      │
│ Reply   │  │ Review      │
│ Queue   │  │ Required    │
└────┬────┘  └──────┬──────┘
     │              │
     ▼              ▼
┌─────────────────────────┐
│    AI Generate Reply    │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ Auto-Approved │──No───┐
    │     (4-5 ★)?  │       │
    └───────┬───────┘       │
           Yes              │
            │               ▼
            ▼         ┌──────────┐
    ┌───────────┐     │ Approval │
    │ Post Reply│     │ Queue    │
    │ to GMB    │     └────┬─────┘
    └───────────┘          │
                           ▼
                    ┌────────────┐
                    │ Human      │
                    │ Approves/  │
                    │ Edits      │
                    └─────┬──────┘
                          │
                          ▼
                   ┌───────────┐
                   │ Post Reply│
                   │ to GMB    │
                   └───────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (v2.0)
- [ ] GMB OAuth integration
- [ ] Location management
- [ ] Review fetching and storage
- [ ] Basic reply functionality
- [ ] Review listing UI

### Phase 2: AI Integration (v2.1)
- [ ] Sentiment analysis
- [ ] AI reply generation
- [ ] Response templates
- [ ] Approval workflows

### Phase 3: Automation (v2.2)
- [ ] Auto-reply for positive reviews
- [ ] Smart notifications
- [ ] Analytics dashboard
- [ ] Response time tracking

### Phase 4: Advanced (v2.3)
- [ ] Multi-platform (Yelp, TripAdvisor)
- [ ] Review request campaigns
- [ ] Reputation alerts
- [ ] Competitor analysis

---

## Prerequisites for Implementation

1. **Google Cloud Console Project**
   - Enable Business Profile API
   - Create OAuth 2.0 credentials
   - Set up Pub/Sub for notifications

2. **Environment Variables**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://your-app.com/api/gmb/callback
   GMB_PUBSUB_TOPIC=projects/your-project/topics/gmb-reviews
   ```

3. **Encryption Setup**
   - Implement secure token storage
   - Use Supabase Vault or similar

4. **AI Service**
   - OpenAI API key or alternative
   - Fine-tuned prompts for industry

---

## Current Alternative (v1.x)

Until v2.0 GMB integration:

### Manual Review Management
The existing `reviews` table in MarketingPro supports:
- Manual review entry
- Star rating tracking
- Response logging
- Basic analytics

### Third-Party Options
Consider integrations with:
- **Podium** - Review management platform
- **Birdeye** - Reputation management
- **ReviewTrackers** - Multi-platform aggregation

These can be integrated via Zapier or Make.com workflows.

---

## Summary

**Google My Business review integration is marked for BookingTMS v2.0** due to:
- Complex OAuth setup requirements
- API quota management
- AI integration complexity
- Need for approval workflows

**Current v1.x Focus:**
- ✅ Promo codes with Stripe integration
- ✅ Gift cards with balance tracking
- ✅ Email campaigns with promo codes
- ✅ Basic manual review tracking

**v2.0 Will Include:**
- GMB OAuth connection
- Automatic review sync
- AI-powered response suggestions
- Auto-reply for positive reviews
- Review analytics dashboard
