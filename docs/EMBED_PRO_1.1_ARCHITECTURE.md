# Embed Pro 1.1 - System Architecture

## Overview

Embed Pro 1.1 is a standalone embedding management system that separates widget embedding from the activity creation wizard, providing a dedicated, powerful interface for managing all embed configurations across venues and activities.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EMBED PRO 1.1                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │   Embed Manager  │    │  Preview Engine  │    │  Analytics Hub   │       │
│  │   (Dashboard)    │◄──►│  (Live Preview)  │◄──►│  (Usage Stats)   │       │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘       │
│           │                       │                        │                 │
│           ▼                       ▼                        ▼                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      EMBED SERVICE LAYER                             │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │ EmbedConfig │  │ CodeGen     │  │ Webhook     │  │ Analytics  │  │    │
│  │  │ Service     │  │ Service     │  │ Service     │  │ Service    │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      API ENDPOINTS                                    │    │
│  │  POST /api/embed/create     GET /api/embed/:id                       │    │
│  │  PUT  /api/embed/:id        DELETE /api/embed/:id                    │    │
│  │  GET  /api/embed/preview    POST /api/embed/generate-code            │    │
│  │  GET  /api/embed/analytics  POST /api/embed/webhook                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE DATABASE                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │embed_configs │  │ activities   │  │   venues     │  │embed_analytics│    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ERD - EMBED PRO 1.1                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐           ┌─────────────────────┐
│   organizations     │           │      venues         │
├─────────────────────┤           ├─────────────────────┤
│ id (PK)             │◄──────────┤ organization_id(FK) │
│ name                │     1:N   │ id (PK)             │
│ slug                │           │ name                │
│ status              │           │ embed_key           │
│ stripe_account_id   │           │ settings (JSONB)    │
└─────────────────────┘           └──────────┬──────────┘
         │                                   │
         │ 1:N                               │ 1:N
         ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│   embed_configs     │           │    activities       │
├─────────────────────┤           ├─────────────────────┤
│ id (PK, UUID)       │           │ id (PK)             │
│ organization_id(FK) │           │ venue_id (FK)       │
│ name                │◄──────────┤ name                │
│ type (enum)         │     N:1   │ stripe_product_id   │
│ target_type (enum)  │           │ stripe_prices(JSONB)│
│ target_id (UUID)    │           │ schedule (JSONB)    │
│ embed_key (unique)  │           │ settings (JSONB)    │
│ config (JSONB)      │           └─────────────────────┘
│ style (JSONB)       │
│ is_active           │                    │
│ analytics_enabled   │                    │ 1:N
│ created_at          │                    ▼
│ updated_at          │           ┌─────────────────────┐
│ created_by          │           │  activity_sessions  │
└──────────┬──────────┘           ├─────────────────────┤
           │                      │ id (PK)             │
           │ 1:N                  │ activity_id (FK)    │
           ▼                      │ start_time          │
┌─────────────────────┐           │ capacity_remaining  │
│  embed_analytics    │           └─────────────────────┘
├─────────────────────┤
│ id (PK)             │
│ embed_config_id(FK) │
│ event_type          │
│ metadata (JSONB)    │
│ ip_address          │
│ user_agent          │
│ referrer            │
│ created_at          │
└─────────────────────┘
```

---

## 📁 File Structure (< 250 lines per file)

```
src/
├── modules/
│   └── embed-pro/
│       ├── index.ts                      # Module exports
│       ├── types/
│       │   ├── index.ts                  # Type exports
│       │   ├── embed-config.types.ts     # Embed config types
│       │   └── embed-analytics.types.ts  # Analytics types
│       │
│       ├── services/
│       │   ├── index.ts                  # Service exports
│       │   ├── embedConfig.service.ts    # Config CRUD service
│       │   ├── codeGenerator.service.ts  # Code generation service
│       │   ├── preview.service.ts        # Preview service
│       │   └── analytics.service.ts      # Analytics service
│       │
│       ├── hooks/
│       │   ├── index.ts                  # Hook exports
│       │   ├── useEmbedConfigs.ts        # Config management hook
│       │   ├── useCodeGenerator.ts       # Code generation hook
│       │   ├── useEmbedPreview.ts        # Preview hook
│       │   └── useEmbedAnalytics.ts      # Analytics hook
│       │
│       ├── components/
│       │   ├── index.ts                  # Component exports
│       │   ├── EmbedProDashboard.tsx     # Main dashboard
│       │   ├── EmbedConfigList.tsx       # Config list view
│       │   ├── EmbedConfigCard.tsx       # Config card item
│       │   ├── CreateEmbedModal.tsx      # Create embed modal
│       │   ├── EmbedCodeDisplay.tsx      # Code display/copy
│       │   ├── EmbedPreviewPanel.tsx     # Live preview panel
│       │   ├── EmbedStyleEditor.tsx      # Style customization
│       │   ├── EmbedAnalyticsCard.tsx    # Analytics display
│       │   └── EmbedTypeSelector.tsx     # Type selection UI
│       │
│       └── utils/
│           ├── index.ts                  # Utility exports
│           ├── embedHelpers.ts           # Helper functions
│           └── codeTemplates.ts          # Code templates
│
├── pages/
│   └── EmbedPro.tsx                      # Main page (< 150 lines)
│
└── supabase/
    └── migrations/
        └── 050_embed_configs_table.sql   # Database migration
```

---

## 🗃️ Database Schema

### `embed_configs` Table

```sql
CREATE TABLE embed_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Embed Type
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'booking-widget',      -- Full booking flow
    'calendar-widget',     -- Calendar only
    'button-widget',       -- Book Now button
    'inline-widget',       -- Inline booking
    'popup-widget'         -- Popup/modal
  )),
  
  -- Target (what to embed)
  target_type VARCHAR(50) NOT NULL CHECK (target_type IN (
    'activity',            -- Single activity
    'venue',               -- All venue activities
    'multi-activity'       -- Selected activities
  )),
  target_id UUID,          -- activity_id or venue_id
  target_ids UUID[],       -- For multi-activity selection
  
  -- Embed Key (unique identifier for this embed)
  embed_key VARCHAR(100) UNIQUE NOT NULL,
  
  -- Configuration (JSONB for flexibility)
  config JSONB NOT NULL DEFAULT '{
    "showPricing": true,
    "showCalendar": true,
    "showTimeSlots": true,
    "allowMultipleBookings": false,
    "redirectAfterBooking": null,
    "language": "en",
    "timezone": "UTC"
  }'::jsonb,
  
  -- Styling (JSONB for customization)
  style JSONB NOT NULL DEFAULT '{
    "primaryColor": "#2563eb",
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937",
    "borderRadius": "8px",
    "fontFamily": "Inter, system-ui, sans-serif",
    "buttonStyle": "filled",
    "theme": "light"
  }'::jsonb,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  analytics_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_embed_configs_org ON embed_configs(organization_id);
CREATE INDEX idx_embed_configs_key ON embed_configs(embed_key);
CREATE INDEX idx_embed_configs_target ON embed_configs(target_type, target_id);
```

### `embed_analytics` Table

```sql
CREATE TABLE embed_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  embed_config_id UUID NOT NULL REFERENCES embed_configs(id) ON DELETE CASCADE,
  
  -- Event Type
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'view',                -- Widget viewed
    'interaction',         -- User interacted
    'date_selected',       -- Date selection
    'time_selected',       -- Time slot selection
    'checkout_started',    -- Started checkout
    'booking_completed',   -- Completed booking
    'error'                -- Error occurred
  )),
  
  -- Event Data
  metadata JSONB DEFAULT '{}',
  
  -- Tracking
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_embed_analytics_config ON embed_analytics(embed_config_id);
CREATE INDEX idx_embed_analytics_event ON embed_analytics(event_type);
CREATE INDEX idx_embed_analytics_date ON embed_analytics(created_at);
```

---

## 🔌 API Endpoints

### Supabase Edge Functions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/embed/config` | POST | Create new embed config |
| `/embed/config/:id` | GET | Get embed config by ID |
| `/embed/config/:id` | PUT | Update embed config |
| `/embed/config/:id` | DELETE | Delete embed config |
| `/embed/config/by-key/:key` | GET | Get config by embed key |
| `/embed/generate-code` | POST | Generate embed code |
| `/embed/preview` | POST | Get preview data |
| `/embed/analytics` | POST | Record analytics event |
| `/embed/analytics/:configId` | GET | Get analytics for config |

---

## 🎨 Widget Types

### 1. Booking Widget (Full Flow)
- Complete booking experience
- Calendar + Time slots + Checkout
- Best for: Landing pages, dedicated booking pages

### 2. Calendar Widget
- Calendar view only
- Shows availability at a glance
- Best for: Informational pages

### 3. Button Widget
- "Book Now" button
- Opens popup with full booking flow
- Best for: Headers, CTAs, minimal space

### 4. Inline Widget
- Embedded inline with page content
- Responsive, flows with content
- Best for: Blog posts, service pages

### 5. Popup Widget
- Modal/popup booking interface
- Triggered by click/hover/scroll
- Best for: Exit intent, promotional

---

## 🔐 Security

### RLS Policies

```sql
-- Embed configs: Organization-based access
CREATE POLICY "embed_configs_org_access" ON embed_configs
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Embed configs: Public read for active widgets
CREATE POLICY "embed_configs_public_read" ON embed_configs
  FOR SELECT USING (is_active = true);

-- Analytics: Insert allowed from public (for tracking)
CREATE POLICY "embed_analytics_public_insert" ON embed_analytics
  FOR INSERT WITH CHECK (true);

-- Analytics: Read only for organization members
CREATE POLICY "embed_analytics_org_read" ON embed_analytics
  FOR SELECT USING (
    embed_config_id IN (
      SELECT id FROM embed_configs 
      WHERE organization_id IN (
        SELECT organization_id FROM user_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );
```

---

## 📦 Code Generation Templates

### HTML Embed
```html
<div id="bookflow-widget-{embed_key}"></div>
<script src="https://{domain}/embed/bookflow.js" 
        data-key="{embed_key}" 
        data-theme="light">
</script>
```

### React/Next.js
```tsx
import { BookFlowWidget } from '@bookflow/react';

<BookFlowWidget 
  embedKey="{embed_key}"
  theme="light"
  onBookingComplete={(booking) => console.log(booking)}
/>
```

### WordPress
```php
[bookflow_widget key="{embed_key}" theme="light"]
```

### iFrame (Universal)
```html
<iframe 
  src="https://{domain}/embed?key={embed_key}"
  width="100%" 
  height="600"
  frameborder="0"
  style="border-radius: 8px;">
</iframe>
```

---

## 📈 Analytics Events

| Event | Description | Metadata |
|-------|-------------|----------|
| `view` | Widget loaded | `{ page: string }` |
| `interaction` | User clicked/touched | `{ element: string }` |
| `date_selected` | Date picked | `{ date: string }` |
| `time_selected` | Time slot chosen | `{ time: string, activityId: string }` |
| `checkout_started` | Checkout initiated | `{ amount: number, items: array }` |
| `booking_completed` | Booking successful | `{ bookingId: string, amount: number }` |
| `error` | Error occurred | `{ error: string, code: string }` |

---

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure
- [x] Database migration
- [x] Type definitions
- [x] Base services

### Phase 2: UI Components
- [x] Dashboard layout
- [x] Config list/cards
- [x] Create/Edit modals

### Phase 3: Code Generation
- [x] Template system
- [x] Multi-format output
- [x] Copy functionality

### Phase 4: Preview System
- [x] Live preview panel
- [x] Style customization
- [x] Real-time updates

### Phase 5: Analytics
- [x] Event tracking
- [x] Analytics dashboard
- [x] Usage reports

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2025-11-27 | Initial release - Standalone embed management |

