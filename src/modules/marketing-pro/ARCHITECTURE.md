# MarketingPro 1.1 - Module Architecture

## Overview

MarketingPro 1.1 is a fully modular marketing automation system refactored from the original `Marketing.tsx` (2773 lines) into a clean, maintainable architecture with each file under 200 lines.

## Module Structure

```
/src/modules/marketing-pro/
├── index.ts                    # Module barrel export
├── ARCHITECTURE.md             # This documentation
├── types/
│   └── index.ts                # TypeScript type definitions
├── constants/
│   └── index.ts                # Shared constants & defaults
├── hooks/
│   └── useMarketingState.ts    # State management hook
├── utils/
│   └── theme.ts                # Theme utilities
├── pages/
│   └── MarketingProPage.tsx    # Main page with submenu
├── components/
│   ├── shared/
│   │   ├── index.ts
│   │   ├── StatsCard.tsx       # Reusable stats card
│   │   └── SectionHeader.tsx   # Mobile section header
│   ├── promotions/
│   │   ├── index.ts
│   │   ├── PromotionsTab.tsx   # Tab container
│   │   ├── PromotionsStats.tsx # Stats section
│   │   └── PromotionsTable.tsx # Table with CRUD
│   ├── gift-cards/
│   │   ├── index.ts
│   │   ├── GiftCardsTab.tsx    # Tab container
│   │   ├── GiftCardsStats.tsx  # Stats section
│   │   └── GiftCardsTable.tsx  # Table with CRUD
│   ├── reviews/
│   │   ├── index.ts
│   │   ├── ReviewsTab.tsx      # Tab container
│   │   ├── ReviewsStats.tsx    # Stats section
│   │   ├── ReviewsList.tsx     # Reviews list
│   │   ├── ReviewCard.tsx      # Single review card
│   │   └── ReviewPlatforms.tsx # Connected platforms
│   ├── email/
│   │   ├── index.ts
│   │   ├── EmailTab.tsx        # Tab container
│   │   ├── EmailStats.tsx      # Stats section
│   │   ├── CampaignsList.tsx   # Campaigns list
│   │   ├── TemplatesList.tsx   # Email templates
│   │   └── WorkflowsList.tsx   # Automation workflows
│   ├── affiliate/
│   │   ├── index.ts
│   │   ├── AffiliateTab.tsx    # Tab container
│   │   ├── AffiliateStats.tsx  # Stats section
│   │   ├── AffiliateTable.tsx  # Partners table
│   │   └── AffiliateSettings.tsx # Program settings
│   └── dialogs/
│       ├── index.ts
│       ├── CreatePromoDialog.tsx
│       ├── CreateGiftCardDialog.tsx
│       ├── CreateCampaignDialog.tsx
│       ├── AddAffiliateDialog.tsx
│       └── CreateWorkflowDialog.tsx
```

## File Size Compliance

All files are under 200 lines as per coding guidelines:

| Category | File | Lines |
|----------|------|-------|
| Types | types/index.ts | ~165 |
| Constants | constants/index.ts | ~155 |
| Hooks | useMarketingState.ts | ~105 |
| Utils | theme.ts | ~95 |
| Shared | StatsCard.tsx | ~65 |
| Shared | SectionHeader.tsx | ~40 |
| Promotions | PromotionsStats.tsx | ~40 |
| Promotions | PromotionsTable.tsx | ~160 |
| Promotions | PromotionsTab.tsx | ~20 |
| GiftCards | GiftCardsStats.tsx | ~40 |
| GiftCards | GiftCardsTable.tsx | ~175 |
| GiftCards | GiftCardsTab.tsx | ~20 |
| Reviews | ReviewsStats.tsx | ~40 |
| Reviews | ReviewCard.tsx | ~135 |
| Reviews | ReviewsList.tsx | ~105 |
| Reviews | ReviewPlatforms.tsx | ~100 |
| Reviews | ReviewsTab.tsx | ~20 |
| Email | EmailStats.tsx | ~40 |
| Email | CampaignsList.tsx | ~125 |
| Email | TemplatesList.tsx | ~105 |
| Email | WorkflowsList.tsx | ~130 |
| Email | EmailTab.tsx | ~55 |
| Affiliate | AffiliateStats.tsx | ~40 |
| Affiliate | AffiliateTable.tsx | ~165 |
| Affiliate | AffiliateSettings.tsx | ~115 |
| Affiliate | AffiliateTab.tsx | ~20 |
| Dialogs | CreatePromoDialog.tsx | ~95 |
| Dialogs | CreateGiftCardDialog.tsx | ~85 |
| Dialogs | CreateCampaignDialog.tsx | ~95 |
| Dialogs | AddAffiliateDialog.tsx | ~75 |
| Dialogs | CreateWorkflowDialog.tsx | ~140 |
| Page | MarketingProPage.tsx | ~195 |

## Key Features

### 1. Promotions Tab
- Stats: Active promos, redemptions, revenue impact, avg discount
- Table: Code, type, discount, usage, validity, status
- Actions: Create, edit, pause, duplicate, delete

### 2. Gift Cards Tab
- Stats: Total sold, active balance, redeemed, redemption rate
- Table: Code, amount, balance, recipient, status, expiry
- Actions: Create, bulk generate, resend email, deactivate

### 3. Reviews Tab
- Stats: Average rating, new reviews, response rate, positive %
- Reviews list with filter tabs (All, Pending, 5-star, 1-3 star)
- Connected platforms (Google, Facebook, Yelp, TripAdvisor)
- Rating distribution visualization

### 4. Email Campaigns Tab
- Stats: Total sent, open rate, click rate, conversions
- Campaigns list (sent, scheduled, drafts)
- Email templates library
- Automated workflows with enable/disable toggles

### 5. Affiliate Program Tab
- Stats: Active affiliates, clicks, revenue, commissions
- Partners table with performance metrics
- Program settings (commission rate, cookie duration, payouts)
- Referral link configuration

## Navigation

### Desktop
- Horizontal tab navigation with icons
- All 5 tabs visible simultaneously

### Mobile
- Dropdown selector for tab switching
- Section header showing current tab info
- Responsive tables with horizontal scroll

## State Management

The `useMarketingState` hook manages:
- Active tab selection
- Email templates (persisted to localStorage)
- Workflow states (enabled/disabled)
- Template CRUD operations

## Theming

All components use the centralized theme utilities:
- `getThemeClasses(isDark)` - Semantic CSS classes
- `getStatCardColors(color, isDark)` - Icon/background colors
- `getBadgeClasses(type, isDark)` - Status badge styling

## Usage

```tsx
// In App.tsx
import { MarketingProPage } from './modules/marketing-pro';

// Route: /marketing-pro
case 'marketing-pro':
  return <MarketingProPage />;

// Sidebar navigation
{ id: 'marketing-pro', label: 'MarketingPro 1.1', icon: Tag }
```

## Migration Notes

The original `Marketing.tsx` (2773 lines) has been refactored but kept as backup.
The new module is accessed via `/marketing-pro` route.

## Version History

- **1.1.0** (Nov 30, 2025): Initial modular architecture
  - Split into 30+ files, all under 200 lines
  - Added submenu navigation
  - Proper TypeScript types
  - Centralized state management
  - Theme utilities for dark/light mode
