# Payment Settings Modal - Design Specification

**Version:** 2.0  
**Date:** November 15, 2025  
**Status:** ✅ Production Standard  
**Purpose:** Multi-provider payment configuration with enterprise UI/UX

---

## 📋 Overview

The Payment Settings Modal is a large-format, professional interface for managing payment provider configurations across all games in the Booking TMS system. It supports multiple payment providers (Stripe, PayPal, 2Checkout, etc.) with a clean, scalable architecture.

---

## 🎯 Design Goals

1. **Double Desktop Width** - 2000px max width on desktop (vs standard 1000px modals)
2. **Multi-Provider Support** - Stripe, PayPal, 2Checkout with easy provider switching
3. **Scalable Architecture** - Ready for additional payment providers
4. **Professional UI/UX** - Clean, modern, enterprise-grade interface
5. **Responsive Design** - Works perfectly on mobile, tablet, and desktop

---

## 📐 Modal Dimensions

### Responsive Sizing Strategy

The Payment Settings Modal is **LARGER** than standard settings modals to accommodate:
- Multiple payment providers
- Stats cards and overview
- Grid layout of game cards
- Provider-specific configurations

### Size Specifications

| Screen Size | Width | Max Width | Height | Max Height | Rationale |
|-------------|-------|-----------|---------|------------|-----------|
| **Mobile** | 95vw | 500px | 95vh | 95vh | Full mobile experience |
| **Small Tablet** | 92vw | 800px | 92vh | 92vh | Comfortable iPad portrait |
| **Tablet** | 90vw | 1200px | 90vh | 90vh | Wider for side-by-side content |
| **Desktop** | 85vw | **2000px** | 88vh | 88vh | **Double standard width** |
| **Large Desktop** | 80vw | **2000px** | 85vh | 85vh | Optimal for 4K+ displays |

### Implementation

```tsx
className="
  /* Mobile: Compact full-screen */
  !w-[95vw] !max-w-[500px] !h-[95vh] !max-h-[95vh]
  
  /* Small Tablet: Wider modal */
  sm:!w-[92vw] sm:!max-w-[800px] sm:!h-[92vh]
  
  /* Tablet: Side-by-side ready */
  md:!w-[90vw] md:!max-w-[1200px] md:!h-[90vh]
  
  /* Desktop: DOUBLE WIDTH for payment management */
  lg:!w-[85vw] lg:!max-w-[2000px] lg:!h-[88vh]
  
  /* Large Desktop: Optimal 4K experience */
  xl:!w-[80vw] xl:!max-w-[2000px] xl:!h-[85vh]
  
  /* Base styles */
  !rounded-lg overflow-hidden p-0 flex flex-col
"
```

---

## 🎨 UI Structure

### Layout Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                      [X] │
│  Payment Settings · Multi-Provider Management                   │
├─────────────────────────────────────────────────────────────────┤
│  Provider Tabs:  [Stripe · Active] [PayPal · Soon] [2CO · Soon] │
├─────────────────────────────────────────────────────────────────┤
│  Stats Cards:                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                         │
│  │ Total   │  │Configured│  │ Pending │                         │
│  │   6     │  │    6     │  │    0    │                         │
│  └─────────┘  └─────────┘  └─────────┘                         │
├─────────────────────────────────────────────────────────────────┤
│  Games Section:                            [Sync All] Button    │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                  │
│  │  Game 1   │  │  Game 2   │  │  Game 3   │                  │
│  │  $30.00   │  │  $30.00   │  │  $30.00   │                  │
│  │ Configured│  │ Configured│  │ Configured│                  │
│  │ Product ID│  │ Product ID│  │ Product ID│                  │
│  │ Price ID  │  │ Price ID  │  │ Price ID  │                  │
│  └───────────┘  └───────────┘  └───────────┘                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                  │
│  │  Game 4   │  │  Game 5   │  │  Game 6   │                  │
│  └───────────┘  └───────────┘  └───────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Component Breakdown

### 1. Modal Header

**Design:**
- Icon + Title + Provider indicator
- Close button (X) on right
- Subtitle describing functionality

**Code:**
```tsx
<DialogHeader className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 dark:border-[#2a2a2a] flex-shrink-0">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
        <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <DialogTitle className="text-xl sm:text-2xl font-semibold">
          Stripe Payment Settings
        </DialogTitle>
        <DialogDescription className="text-sm sm:text-base">
          Manage Stripe payment configurations for all games in this widget
        </DialogDescription>
      </div>
    </div>
  </div>
</DialogHeader>
```

**Specifications:**
- Icon container: 48x48px with rounded-xl
- Title: text-xl on mobile, text-2xl on desktop
- Description: text-sm on mobile, text-base on desktop
- Padding: px-4 py-4 on mobile, px-6 py-5 on desktop

---

### 2. Provider Tabs

**Design:**
- Horizontal tab bar with provider badges
- Active provider highlighted in blue
- Coming soon providers in gray with badge

**Code:**
```tsx
<div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-[#2a2a2a] flex-shrink-0">
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Provider:</span>
    
    {/* Stripe - Active */}
    <Button
      variant="default"
      size="sm"
      className="gap-2 bg-blue-600 hover:bg-blue-700"
    >
      <span>Stripe</span>
      <Badge variant="secondary" className="bg-green-600 text-white">Active</Badge>
    </Button>
    
    {/* PayPal - Coming Soon */}
    <Button variant="outline" size="sm" className="gap-2" disabled>
      <span>PayPal</span>
      <Badge variant="outline">Coming Soon</Badge>
    </Button>
    
    {/* 2Checkout - Coming Soon */}
    <Button variant="outline" size="sm" className="gap-2" disabled>
      <span>2Checkout</span>
      <Badge variant="outline">Coming Soon</Badge>
    </Button>
  </div>
</div>
```

**Specifications:**
- Provider tabs in flex row
- Active: Blue background with green "Active" badge
- Inactive: Gray outline with "Coming Soon" badge
- Disabled state for non-implemented providers

---

### 3. Stats Cards

**Design:**
- 3-column grid (1 on mobile, 3 on desktop)
- Icon + Number + Label
- Color-coded backgrounds
- Subtle hover effects

**Code:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4 py-4 sm:px-6">
  {/* Total Games */}
  <Card className="border-gray-200 dark:border-[#2a2a2a]">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-3xl font-bold">6</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Games</p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Configured */}
  <Card className="border-gray-200 dark:border-[#2a2a2a]">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-3xl font-bold">6</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configured</p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Pending */}
  <Card className="border-gray-200 dark:border-[#2a2a2a]">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

**Specifications:**
- Icon size: 56x56px (w-14 h-14)
- Icon inner: 28x28px (w-7 h-7)
- Number: text-3xl font-bold
- Label: text-sm
- Grid: 1 column mobile → 3 columns desktop
- Gap: gap-4 on mobile, gap-6 on desktop

---

### 4. Games Section Header

**Design:**
- Section title "Games"
- Sync All button on right
- Badge showing configured count

**Code:**
```tsx
<div className="flex items-center justify-between px-4 sm:px-6 pb-3">
  <h3 className="text-lg font-semibold">Games</h3>
  <div className="flex items-center gap-3">
    <Badge variant="outline">6 of 6 configured</Badge>
    <Button
      variant="outline"
      size="sm"
      onClick={handleSyncAll}
      className="gap-2"
    >
      <RefreshCw className="w-4 h-4" />
      <span className="hidden sm:inline">Sync All</span>
    </Button>
  </div>
</div>
```

---

### 5. Game Cards Grid

**Design:**
- Responsive grid layout
- Card with game info + status
- Product/Price IDs displayed
- Configured status with checkmark

**Grid Breakpoints:**
```
Mobile:        1 column
Small Tablet:  2 columns
Tablet:        2 columns
Desktop:       3 columns
Large Desktop: 4 columns (when modal is 2000px wide)
```

**Code:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 px-4 sm:px-6 pb-6">
  {games.map((game) => (
    <Card key={game.id} className="border-gray-200 dark:border-[#2a2a2a] hover:border-blue-300 transition-colors">
      <CardContent className="p-4">
        {/* Game Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-base">{game.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">${game.price.toFixed(2)}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>

        {/* Configured Badge */}
        <Badge className="bg-green-600 text-white mb-3">Configured</Badge>

        {/* Product ID */}
        <div className="space-y-1.5 mb-2">
          <p className="text-xs text-gray-500">Product ID</p>
          <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate">
            {game.stripe_product_id}
          </p>
        </div>

        {/* Price ID */}
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500">Price ID</p>
          <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate">
            {game.stripe_price_id}
          </p>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Card Specifications:**
- Padding: p-4
- Border: border-gray-200 with hover effect
- Badge: Green "Configured" or Orange "Pending"
- Font: font-mono for IDs
- Hover: border-blue-300 on hover

---

## 🎨 Color Coding

### Provider Status Colors

| Status | Background | Border | Text | Icon |
|--------|-----------|--------|------|------|
| **Active** | bg-blue-600 | border-blue-600 | text-white | Blue icon |
| **Coming Soon** | bg-gray-100 | border-gray-300 | text-gray-600 | Gray icon |
| **Disabled** | bg-gray-50 | border-gray-200 | text-gray-400 | Gray icon |

### Game Status Colors

| Status | Badge BG | Icon Color | Border Hover |
|--------|----------|------------|--------------|
| **Configured** | bg-green-600 | text-green-600 | border-green-300 |
| **Pending** | bg-orange-600 | text-orange-600 | border-orange-300 |
| **Error** | bg-red-600 | text-red-600 | border-red-300 |

---

## 📱 Responsive Behavior

### Mobile (0-639px)

**Layout:**
- Stack all elements vertically
- 1 column grid for stats and games
- Full-width buttons
- Larger tap targets (min 44x44px)

**Adjustments:**
- Hide "Sync All" text, show icon only
- Simplify provider tabs (stack if needed)
- Reduce padding: px-4 py-4

---

### Small Tablet (640-767px)

**Layout:**
- 2 columns for game cards
- 3 columns for stats (if space allows)
- Show abbreviated button text

**Adjustments:**
- Moderate spacing: px-5 py-4
- Begin showing more metadata

---

### Tablet (768-1023px)

**Layout:**
- 2-3 columns for game cards
- Full stats cards row
- Horizontal provider tabs

**Adjustments:**
- Standard spacing: px-6 py-5
- Full button labels
- Side-by-side content where possible

---

### Desktop (1024px+)

**Layout:**
- **3-4 columns** for game cards (modal is 2000px wide!)
- Full horizontal layout
- All features visible
- Hover states active

**Adjustments:**
- Maximum spacing: px-6 py-6
- Full metadata display
- Tooltips on hover
- Advanced interactions

---

## 🔒 Close Button Specifications

**Position:** Top-right corner of dialog  
**Size:** 32x32px touch target  
**Icon:** X (cross) from lucide-react  
**Style:** Ghost button with hover effect  
**Color:** Gray default, darker on hover

**Implementation:**
```tsx
{/* Close button - automatically handled by shadcn Dialog */}
{/* DialogPrimitive.Close renders an X button by default */}
<DialogContent>
  {/* Content */}
</DialogContent>
```

**Note:** The shadcn/ui Dialog component automatically includes a close button (X) in the top-right. If custom styling is needed:

```tsx
import { X } from 'lucide-react';

<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</DialogPrimitive.Close>
```

---

## 🏗️ File Structure for Multi-Provider Support

### Component Organization

```
src/
├── components/
│   └── widgets/
│       ├── payment/
│       │   ├── PaymentSettingsModal.tsx          # Main modal container
│       │   ├── ProviderTabs.tsx                  # Provider selection tabs
│       │   ├── StatsCards.tsx                    # Total/Configured/Pending stats
│       │   ├── GameCard.tsx                      # Individual game card
│       │   ├── GameGrid.tsx                      # Responsive game grid
│       │   └── providers/
│       │       ├── StripeProvider.tsx            # Stripe-specific logic
│       │       ├── PayPalProvider.tsx            # PayPal (future)
│       │       └── TwoCheckoutProvider.tsx       # 2Checkout (future)
│       └── WidgetPaymentSettingsModal.tsx        # Legacy (to be replaced)
└── lib/
    └── payments/
        ├── PaymentProvider.types.ts              # Provider interfaces
        ├── PaymentProviderRegistry.ts            # Provider registry
        └── providers/
            ├── StripePaymentService.ts           # Stripe implementation
            ├── PayPalPaymentService.ts           # PayPal (future)
            └── TwoCheckoutPaymentService.ts      # 2Checkout (future)
```

---

## 🎯 Usage Examples

### Opening the Modal

```tsx
import { PaymentSettingsModal } from '@/components/widgets/payment/PaymentSettingsModal';

const [isOpen, setIsOpen] = useState(false);
const [games, setGames] = useState<Game[]>([]);

<PaymentSettingsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  games={games}
  venueId="venue-123"
  onUpdate={setGames}
  defaultProvider="stripe"
/>
```

---

## 📊 Comparison with Standard Modals

| Feature | Standard Modal | Payment Settings Modal |
|---------|---------------|------------------------|
| **Desktop Width** | 1000px | **2000px** (2x) |
| **Purpose** | General settings | Payment management |
| **Providers** | N/A | Multi-provider support |
| **Grid Columns** | 1-2 | **1-4** (responsive) |
| **Stats Cards** | Optional | **3 required** |
| **Complexity** | Simple | Enterprise-grade |

---

## ✅ Accessibility Checklist

- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Screen reader announces provider tabs
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Close button has aria-label
- [ ] Game cards are keyboard accessible
- [ ] Provider badges have proper labels
- [ ] Loading states announced to screen readers

---

## 🚀 Performance Considerations

1. **Lazy Load Providers:** Only load active provider code
2. **Virtual Scrolling:** For 50+ games, use virtualization
3. **Memoization:** Memo game cards to prevent re-renders
4. **Debounce Sync:** Debounce "Sync All" to prevent spam
5. **Optimistic Updates:** Show changes immediately, sync in background

---

## 📝 Implementation Checklist

### Phase 1: Structure
- [ ] Create new PaymentSettingsModal component
- [ ] Set up 2000px modal width on desktop
- [ ] Implement provider tabs UI
- [ ] Add stats cards section
- [ ] Create game card grid

### Phase 2: Stripe Integration
- [ ] Connect Stripe provider
- [ ] Fetch game configurations
- [ ] Display product/price IDs
- [ ] Implement sync functionality
- [ ] Add edit capabilities

### Phase 3: Multi-Provider Foundation
- [ ] Create provider abstraction layer
- [ ] Add PayPal placeholder
- [ ] Add 2Checkout placeholder
- [ ] Implement provider switching
- [ ] Document provider interface

### Phase 4: Polish
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add toast notifications
- [ ] Test responsiveness
- [ ] Accessibility audit
- [ ] Performance optimization

---

## 📚 Related Documentation

- `WIDGET_AND_SCREEN_DESIGN_GUIDELINES.md` - General widget design rules
- `STRIPE_INTEGRATION.md` - Stripe-specific implementation
- `PAYMENT_PROVIDER_ARCHITECTURE.md` - Multi-provider system design
- `REPOSITORY_STRUCTURE.md` - Project organization

---

**Last Updated:** November 15, 2025  
**Maintained By:** Development Team  
**Review Cycle:** Monthly or when adding new provider
