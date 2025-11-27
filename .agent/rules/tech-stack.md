# BookingTMS 2.0 - Technology Stack Reference

> Last Updated: 2025-11-27
> Version: v2.1.0

## Overview

BookingTMS is a multi-tenant booking management system for escape rooms, activities, and venues. Built with modern enterprise-grade technologies following OpenAI/Anthropic-level engineering standards.

---

## Frontend Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Vite** | 5.x | Build tool and dev server |

### UI Framework & Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Accessible component library (Radix-based) |
| **Radix UI** | Headless accessible primitives |
| **Lucide React** | Icon library |
| **Framer Motion** | Animation library |

### State Management & Data Fetching
| Technology | Purpose |
|------------|---------|
| **TanStack Query** | Server state management, caching |
| **React Context** | Local state (auth, theme) |
| **Zustand** | Global client state (if needed) |

### Form Handling
| Technology | Purpose |
|------------|---------|
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |

---

## Backend Stack

### Database & Auth
| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database + Auth + Realtime |
| **PostgreSQL** | Primary database (via Supabase) |
| **Row Level Security (RLS)** | Multi-tenant data isolation |

### Edge Functions
| Technology | Purpose |
|------------|---------|
| **Supabase Edge Functions** | Serverless API endpoints (Deno) |
| **Stripe SDK** | Payment processing |

### External Services
| Service | Purpose |
|---------|---------|
| **Stripe** | Payments, subscriptions, Connect |
| **Resend** | Transactional emails |
| **Vercel** | Frontend hosting |

---

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── ui/             # shadcn/ui components
│   └── [feature]/      # Feature-specific components
├── modules/            # Feature modules (self-contained)
│   ├── embed-pro/      # Embeddable booking widgets
│   ├── activities/     # Activity management
│   ├── bookings/       # Booking management
│   └── ...
├── pages/              # Route pages
├── hooks/              # Shared hooks
├── lib/                # Utilities, Supabase client
├── types/              # Global TypeScript types
└── constants/          # App constants

supabase/
├── migrations/         # SQL migrations (numbered)
├── functions/          # Edge functions
└── .temp/              # Local Supabase state
```

---

## Naming Conventions

### Files
| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `BookingCard.tsx` |
| Hook | camelCase with `use` prefix | `useBookingFlow.ts` |
| Service | camelCase with `.service` suffix | `embedConfig.service.ts` |
| Types | camelCase with `.types` suffix | `widget.types.ts` |
| Utility | camelCase | `formatDate.ts` |

### Database
| Type | Convention | Example |
|------|------------|---------|
| Tables | snake_case, plural | `embed_configs` |
| Columns | snake_case | `created_at`, `organization_id` |
| Functions | snake_case | `generate_embed_key()` |
| Indexes | `idx_[table]_[column]` | `idx_bookings_date` |

### Git
| Type | Convention | Example |
|------|------------|---------|
| Branch | `feature/[scope]-[description]` | `feature/embed-pro-liquid-glass` |
| Commit | `type(scope): description` | `feat(embed-pro): add liquid glass design` |
| Tag | `v[major].[minor].[patch]-[feature]-[date]` | `v2.1.0-embed-pro-liquid-glass-2025-11-27` |

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...  # Edge functions only

# App
VITE_APP_URL=https://app.bookingtms.com
```

---

## Key Dependencies

```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@supabase/supabase-js": "^2.x",
  "@tanstack/react-query": "^5.x",
  "tailwindcss": "^3.4.x",
  "@radix-ui/react-*": "latest",
  "framer-motion": "^11.x",
  "lucide-react": "^0.x",
  "zod": "^3.x",
  "react-hook-form": "^7.x",
  "sonner": "^1.x",
  "date-fns": "^3.x"
}
```

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint

# Supabase local
npx supabase start
npx supabase db push
```
