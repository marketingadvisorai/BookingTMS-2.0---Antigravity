# Architecture Separation: Venues vs Booking Widgets

Version: 0.1.2  
Date: November 11, 2025

---

## 🎯 **SEPARATION STRATEGY**

### **Core Principle:**
- **Venues** = Admin management with full payment integration
- **Booking Widgets** = Template gallery (future) without payment
- **Shared** = Configuration interface (CalendarWidgetSettings)

---

## 📦 **MODULE STRUCTURE**

```
┌─────────────────────────────────────────────────────────────┐
│                    VENUES MODULE                             │
│                  (Admin Management)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Venues.tsx                                                  │
│  ├─ Venue CRUD operations                                   │
│  ├─ CalendarWidgetSettings (for configuration)  ← Shared    │
│  ├─ CalendarWidget (for preview with payment)   ← Uses      │
│  ├─ Payment Integration ✅                                  │
│  ├─ Stripe Integration ✅                                   │
│  └─ Booking Management ✅                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                BOOKING WIDGETS MODULE                        │
│                  (Template Gallery)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  BookingWidgets.tsx (Future)                                │
│  ├─ Template Gallery                                        │
│  ├─ CalendarWidgetSettings (for demo config)    ← Shared    │
│  ├─ CalendarWidget (display only, no payment)   ← Template  │
│  ├─ ListWidget (template)                                   │
│  ├─ GridWidget (template)                                   │
│  ├─ Payment Integration ❌ (Not needed)                     │
│  └─ Just visual templates                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   SHARED COMPONENTS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CalendarWidgetSettings.tsx                                 │
│  ├─ Configuration interface                                 │
│  ├─ Used by BOTH Venues and Widgets                         │
│  ├─ Generates widgetConfig                                  │
│  └─ No module-specific logic                                │
│                                                              │
│  CalendarWidget.tsx                                         │
│  ├─ Customer-facing booking interface                       │
│  ├─ Used in Venues (with payment) ✅                        │
│  ├─ Used in Widgets (template only) ❌ payment              │
│  └─ Accepts config prop for behavior                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **CURRENT IMPLEMENTATION**

### **1. Venues Module (Admin)**

**Purpose:** Full venue management with payment integration

**Features:**
- Create/Edit venues
- Configure games with CalendarWidgetSettings
- Preview with full CalendarWidget (payment enabled)
- Stripe integration
- Booking management

**Code:**
```typescript
// src/pages/Venues.tsx

// Uses CalendarWidgetSettings for configuration
<CalendarWidgetSettings
  config={selectedVenue.widgetConfig}
  onConfigChange={handleUpdateWidgetConfig}
  embedContext={{
    venueId: selectedVenue.id,
    // ... venue context
  }}
/>

// Uses CalendarWidget for preview with payment
<CalendarWidget 
  primaryColor={selectedVenue.primaryColor}
  config={{
    ...selectedVenue.widgetConfig,
    venueId: selectedVenue.id,      // ✅ Enables payment
    enablePayment: true,             // ✅ Payment active
  }}
/>
```

### **2. Booking Widgets Module (Future)**

**Purpose:** Template gallery for widget selection

**Features:**
- Browse widget templates
- Preview different layouts
- Select template for venue
- NO payment processing (just templates)

**Code (Future):**
```typescript
// src/pages/BookingWidgets.tsx (NOT YET CREATED)

// Uses CalendarWidgetSettings for demo config
<CalendarWidgetSettings
  config={demoConfig}
  onConfigChange={setDemoConfig}
  embedContext={{
    // No venueId (just demo)
  }}
/>

// Uses CalendarWidget as template (no payment)
<CalendarWidget 
  primaryColor="#2563eb"
  config={{
    ...demoConfig,
    // ❌ NO venueId (template mode)
    enablePayment: false,  // ❌ Payment disabled
    isTemplate: true,      // Template mode
  }}
/>
```

---

## 🔐 **PAYMENT INTEGRATION SEPARATION**

### **Venues - Payment Enabled:**

```typescript
// Venues.tsx passes full context
<CalendarWidget 
  config={{
    ...widgetConfig,
    venueId: venue.id,           // ✅ Required for payment
    venueName: venue.name,       // ✅ For booking records
    embedKey: venue.embedKey,    // ✅ For verification
    enablePayment: true,         // ✅ Enable checkout
  }}
/>

// CalendarWidget.tsx checks
const handleCheckout = () => {
  if (!config?.venueId) {
    toast.error('Venue configuration is missing');
    return;  // Blocks payment
  }
  
  if (!config?.enablePayment) {
    toast.error('Payment not available in template mode');
    return;  // Blocks payment
  }
  
  // Proceed with payment ✅
  createBooking();
  processPayment();
};
```

### **Booking Widgets - Payment Disabled:**

```typescript
// BookingWidgets.tsx (future) passes template config
<CalendarWidget 
  config={{
    ...demoConfig,
    // ❌ NO venueId
    enablePayment: false,        // ❌ Disable checkout
    isTemplate: true,            // Template mode
  }}
/>

// CalendarWidget.tsx behavior
const handleCheckout = () => {
  if (!config?.enablePayment || config?.isTemplate) {
    toast.info('This is a template preview. Configure in Venues to enable booking.');
    return;  // Shows message, no payment
  }
  
  // Payment code never runs in template mode
};
```

---

## 🎨 **SHARED CONFIGURATION**

### **CalendarWidgetSettings - Universal Config:**

**Used By:**
- ✅ Venues (for actual venue configuration)
- ✅ Booking Widgets (for template demos, future)

**Features:**
- General settings (display options)
- Games management
- Availability settings
- Custom settings
- SEO options
- Advanced options

**Code:**
```typescript
// src/components/widgets/CalendarWidgetSettings.tsx

interface CalendarWidgetSettingsProps {
  config: VenueWidgetConfig;
  onConfigChange: (config: VenueWidgetConfig) => void;
  embedContext?: {
    embedKey?: string;
    primaryColor?: string;
    venueName?: string;
    baseUrl?: string;
    venueId?: string;  // ✅ Present in Venues
                       // ❌ Absent in Widgets (future)
  };
  onPreview?: () => void;
}

// This component is MODULE-AGNOSTIC
// It just manages widgetConfig
// Doesn't care if it's for Venues or Widgets
```

---

## 📋 **CONFIGURATION FLOW**

### **Venues Configuration Flow:**

```
1. Admin opens Venues page
        ↓
2. Clicks "Configure Widget"
        ↓
3. CalendarWidgetSettings renders
        ↓
4. Admin configures:
   - Games
   - Display options
   - Availability
   - SEO
        ↓
5. Configuration saved to venue.widget_config
        ↓
6. Admin clicks "Preview"
        ↓
7. CalendarWidget renders with:
   - config.games (from settings)
   - config.venueId (from venue)
   - enablePayment: true ✅
        ↓
8. Full booking + payment available ✅
```

### **Booking Widgets Flow (Future):**

```
1. User opens Booking Widgets gallery
        ↓
2. Selects "Calendar Template"
        ↓
3. CalendarWidgetSettings renders (demo mode)
        ↓
4. User configures demo:
   - Demo games
   - Display options
   - Colors
        ↓
5. Demo config stored in state (not DB)
        ↓
6. User clicks "Preview Template"
        ↓
7. CalendarWidget renders with:
   - config.games (demo data)
   - NO config.venueId
   - enablePayment: false ❌
        ↓
8. Visual preview only, no booking ❌
        ↓
9. User clicks "Use This Template"
        ↓
10. Template saved to venue selection
```

---

## 🔀 **SEPARATION CHECKLIST**

### **Venues Module:**
- [x] Uses CalendarWidgetSettings for configuration
- [x] Uses CalendarWidget for preview
- [x] Passes venueId to enable payment
- [x] Stripe integration active
- [x] Booking creation enabled
- [x] Full payment processing
- [x] Separate from widget gallery

### **Booking Widgets Module (Future):**
- [ ] Separate page/route (not created yet)
- [ ] Uses CalendarWidgetSettings for demos
- [ ] Uses CalendarWidget for template preview
- [ ] Does NOT pass venueId
- [ ] Payment integration disabled
- [ ] No booking creation
- [ ] Template selection only
- [ ] Independent from venue management

### **Shared Components:**
- [x] CalendarWidgetSettings is module-agnostic
- [x] CalendarWidget supports both modes
- [x] Configuration types are shared
- [x] No tight coupling

---

## 🚀 **FUTURE: BOOKING WIDGETS PAGE**

### **When to Create:**

When you want users to:
1. Browse different booking interface templates
2. Preview how different layouts look
3. Select a template for their venue
4. Customize template before applying

### **Structure:**

```typescript
// src/pages/BookingWidgets.tsx (FUTURE)

export default function BookingWidgets() {
  const [selectedTemplate, setSelectedTemplate] = useState('calendar');
  const [demoConfig, setDemoConfig] = useState(createDefaultConfig());
  const [showPreview, setShowPreview] = useState(false);

  const templates = [
    { id: 'calendar', name: 'Calendar View', component: CalendarWidget },
    { id: 'list', name: 'List View', component: ListWidget },
    { id: 'grid', name: 'Grid View', component: GridWidget },
    // ... more templates
  ];

  return (
    <div>
      <h1>Booking Widget Templates</h1>
      
      {/* Template Gallery */}
      <TemplateGallery 
        templates={templates}
        onSelect={setSelectedTemplate}
      />

      {/* Configuration */}
      <CalendarWidgetSettings
        config={demoConfig}
        onConfigChange={setDemoConfig}
        embedContext={{
          // No venueId - template mode
        }}
        onPreview={() => setShowPreview(true)}
      />

      {/* Template Preview (No Payment) */}
      <CalendarWidget
        config={{
          ...demoConfig,
          enablePayment: false,  // ❌ Disabled
          isTemplate: true
        }}
      />

      {/* Apply to Venue Button */}
      <Button onClick={applyTemplateToVenue}>
        Use This Template
      </Button>
    </div>
  );
}
```

---

## 🎯 **SUMMARY**

### **Current State:**
✅ **Venues Module**
- Complete admin management
- CalendarWidgetSettings for configuration
- CalendarWidget with payment
- Fully functional
- Separate from widget templates

❌ **Booking Widgets Module**
- Not created yet
- Future feature
- Will share CalendarWidgetSettings
- Will use CalendarWidget without payment

✅ **Shared Components**
- CalendarWidgetSettings (configuration tool)
- CalendarWidget (booking interface)
- Module-agnostic design
- Reusable across contexts

### **Separation Achieved:**
1. ✅ Venues code is separate from widget gallery
2. ✅ Payment integration is venue-specific
3. ✅ Configuration tool is shared (future-ready)
4. ✅ CalendarWidget supports both modes
5. ✅ No tight coupling between modules
6. ✅ Easy to add widget gallery later

### **Payment Integration:**
- ✅ **Venues:** Full payment with Stripe
- ❌ **Widgets:** No payment (just templates)
- 🔐 **CalendarWidget:** Checks context before enabling payment

---

**Architecture is clean, separated, and future-ready!** 🚀
