# Auth Services Visual Guide 📊

**Version**: 1.0  
**Created**: November 5, 2025  
**For**: Visual learners and quick navigation

---

## 🗺️ Navigation Map

```
┌─────────────────────────────────────────────────┐
│         BookingTMS Admin Portal                 │
└─────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │    Sidebar Menu       │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Backend Dashboard    │
        │  (Super Admin Only)   │
        └───────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────┐
│                   TAB NAVIGATION                          │
├───────────────────────────────────────────────────────────┤
│ Connections │ 🔐 AUTH SERVICES │ Database │ Health │ ... │
└───────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Auth Services Page   │
        │  (This Guide)         │
        └───────────────────────┘
```

---

## 📊 Page Layout

```
┌──────────────────────────────────────────────────────────┐
│  🔐 Authentication Services                              │
│  Manage authentication providers and user verification  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  🛡️ Service Status                  [Refresh All ↻]     │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │  🗄️ Supabase Auth   │  │  🔑 Google OAuth    │      │
│  │  Email/password     │  │  Sign in with       │      │
│  │  authentication     │  │  Google account     │      │
│  │                     │  │                     │      │
│  │  Status: 🟢 Active  │  │  Status: 🟢 Active  │      │
│  │  [Test Connection]  │  │  [Test Connection]  │      │
│  └─────────────────────┘  └─────────────────────┘      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  🗄️ Supabase Authentication                             │
├──────────────────────────────────────────────────────────┤
│  Enable Supabase Auth                         [ON/OFF]   │
│  ─────────────────────────────────────────────────────   │
│  Require Email Confirmation                   [ON/OFF]   │
│  ─────────────────────────────────────────────────────   │
│  Allow Public Signups                         [ON/OFF]   │
│  ─────────────────────────────────────────────────────   │
│  Session Duration (hours)              [24    ]          │
│                                                           │
│                     [Save Configuration]                  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  🔑 Google OAuth Configuration           [Configured ✓]  │
├──────────────────────────────────────────────────────────┤
│  ⓘ Setup Required: Configure Google OAuth in Supabase   │
│     📖 View Setup Guide →                                │
│  ─────────────────────────────────────────────────────   │
│  Enable Google OAuth                          [ON/OFF]   │
│  ─────────────────────────────────────────────────────   │
│  Google Client ID                                        │
│  [your-client-id.apps.googleusercontent.com    ] [📋]   │
│  ─────────────────────────────────────────────────────   │
│  Google Client Secret                                    │
│  [••••••••••••••••••••••••••••••               ] [📋]   │
│  ─────────────────────────────────────────────────────   │
│  Redirect URI                                            │
│  [http://localhost:3000/auth/callback/google   ] [📋]   │
│                                                           │
│              [Save Google OAuth Configuration]            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  ⚙️ Other OAuth Providers                                │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │  📘 Facebook    [Configured ✓]  [Setup] [ON/OFF]  │ │
│  │  Ready to use                                      │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  🐙 GitHub      Configuration required  [Setup ↗]  │ │
│  │  Not configured                         [OFF]      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ⚠️ Note: Each provider requires configuration in both   │
│     Supabase Dashboard and provider's developer console  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  🔑 Environment Variables                                │
├──────────────────────────────────────────────────────────┤
│  NEXT_PUBLIC_SUPABASE_URL                          [✓]   │
│  https://xxx.supabase.co                                 │
│                                                           │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY                     [✓]   │
│  ••••••••••••••••                                        │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Status Indicator Flow

```
Service Configuration Status
═════════════════════════════

NOT CONFIGURED
    ↓
┌───────────────┐
│  ⚫ Inactive   │  Gray Badge
│  Not setup    │  
└───────────────┘
    ↓
  [Click Setup]
    ↓
CONFIGURING
    ↓
┌───────────────┐
│  Paste Creds  │
│  Save Config  │
└───────────────┘
    ↓
  [Click Test]
    ↓
┌───────────────┐
│  Testing...   │  Yellow/Loading
│  Please wait  │
└───────────────┘
    ↓
   Success?
   ↓     ↓
  YES   NO
   ↓     ↓
┌─────┐ ┌─────┐
│ 🟢  │ │ 🔴  │
│ACTV │ │ERROR│
└─────┘ └─────┘
   ↓         ↓
 READY   FIX IT
```

---

## 🎯 Google OAuth Setup Flow

```
STEP 1: GET CREDENTIALS
┌──────────────────────────────┐
│   Google Cloud Console       │
│                              │
│   1. Create Project          │
│   2. Enable APIs             │
│   3. Create OAuth Client     │
│   4. Copy Client ID          │
│   5. Copy Client Secret      │
└──────────────────────────────┘
         ↓
STEP 2: CONFIGURE SUPABASE
┌──────────────────────────────┐
│    Supabase Dashboard        │
│                              │
│   1. Open Auth Settings      │
│   2. Find Google Provider    │
│   3. Paste Client ID         │
│   4. Paste Client Secret     │
│   5. Save                    │
└──────────────────────────────┘
         ↓
STEP 3: CONFIGURE BACKEND
┌──────────────────────────────┐
│   Backend Dashboard          │
│   Auth Services Tab          │
│                              │
│   1. Paste Client ID         │
│   2. Paste Client Secret     │
│   3. Copy Redirect URI       │
│   4. Save Configuration      │
└──────────────────────────────┘
         ↓
STEP 4: ADD REDIRECT URI
┌──────────────────────────────┐
│   Google Cloud Console       │
│   (Return here)              │
│                              │
│   1. Open OAuth Settings     │
│   2. Add Redirect URI        │
│   3. Save                    │
└──────────────────────────────┘
         ↓
STEP 5: TEST
┌──────────────────────────────┐
│   Backend Dashboard          │
│                              │
│   1. Click "Test Connection" │
│   2. Verify Status: 🟢       │
│   3. Done! ✅                │
└──────────────────────────────┘
```

---

## 🔐 Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│              USER INTERACTION                   │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│        AuthServicesTab Component                │
│         (React State Management)                │
└─────────────────────────────────────────────────┘
        │                               │
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  Configuration   │          │ Connection Test  │
│  Save to         │          │ Check Status     │
│  localStorage    │          │ Update Badge     │
└──────────────────┘          └──────────────────┘
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  localStorage:   │          │  Visual Feedback │
│  • supabase_     │          │  • Toast Message │
│    auth_config   │          │  • Badge Color   │
│  • google_       │          │  • Status Text   │
│    auth_config   │          └──────────────────┘
│  • oauth_        │
│    providers     │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  Page Refresh    │
│  → Auto-load     │
│  → useEffect     │
└──────────────────┘
```

---

## 🎨 Component Hierarchy

```
AuthServicesTab
├── Service Status Overview
│   ├── Supabase Auth Card
│   │   ├── Status Badge
│   │   ├── Description
│   │   └── Test Button
│   └── Google OAuth Card
│       ├── Status Badge
│       ├── Description
│       └── Test Button
│
├── Supabase Auth Configuration
│   ├── Enable Toggle
│   ├── Email Confirmation Toggle
│   ├── Allow Signups Toggle
│   ├── Session Duration Input
│   └── Save Button
│
├── Google OAuth Configuration
│   ├── Setup Instructions Alert
│   ├── Enable Toggle
│   ├── Client ID Input
│   │   └── Copy Button
│   ├── Client Secret Input
│   │   └── Copy Button
│   ├── Redirect URI Display
│   │   └── Copy Button
│   └── Save Button
│
├── Other OAuth Providers
│   ├── Facebook Card
│   │   ├── Status Badge
│   │   ├── Setup Button
│   │   └── Enable Toggle
│   ├── GitHub Card
│   │   ├── Status Badge
│   │   ├── Setup Button
│   │   └── Enable Toggle
│   └── Info Alert
│
└── Environment Variables
    ├── SUPABASE_URL Status
    └── SUPABASE_ANON_KEY Status
```

---

## 🎯 User Journey Map

```
FIRST-TIME USER
    │
    ▼
┌─────────────────┐
│ Open Backend    │
│ Dashboard       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ See Status:     │
│ All Red/Gray    │
│ ❌ Not Setup    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Configure       │
│ Supabase Auth   │
│ ✅ Save         │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Test Connection │
│ 🟢 Active       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Click Google    │
│ Setup Guide     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Get Credentials │
│ from Google     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Paste in        │
│ Backend         │
│ ✅ Save         │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Copy Redirect   │
│ URI             │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Add to Google   │
│ Console         │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Test Connection │
│ 🟢 Active       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ ALL DONE! ✨    │
│ Users can sign  │
│ in with Google  │
└─────────────────┘


RETURNING USER
    │
    ▼
┌─────────────────┐
│ Open Backend    │
│ Dashboard       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Quick Status    │
│ Check           │
│ 🟢 All Active   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ No Action       │
│ Needed ✅       │
└─────────────────┘
```

---

## 📊 Configuration States

```
SUPABASE AUTH STATES
═══════════════════════

State 1: Disabled
┌─────────────────────────┐
│ Enabled:        [OFF]   │
│ Email Confirm:  [--]    │
│ Allow Signups:  [--]    │
│ Session:        [--]    │
│ Status:         ⚫ Off  │
└─────────────────────────┘

State 2: Enabled (Basic)
┌─────────────────────────┐
│ Enabled:        [ON]    │
│ Email Confirm:  [OFF]   │
│ Allow Signups:  [ON]    │
│ Session:        [24]    │
│ Status:         🟢 On   │
└─────────────────────────┘

State 3: Enabled (Secure)
┌─────────────────────────┐
│ Enabled:        [ON]    │
│ Email Confirm:  [ON]    │
│ Allow Signups:  [OFF]   │
│ Session:        [12]    │
│ Status:         🟢 On   │
└─────────────────────────┘


GOOGLE OAUTH STATES
══════════════════════

State 1: Not Configured
┌─────────────────────────┐
│ Client ID:      [empty] │
│ Client Secret:  [empty] │
│ Status:         ⚫ Off  │
│ Configured:     ❌      │
└─────────────────────────┘

State 2: Partial Config
┌─────────────────────────┐
│ Client ID:      [✓]     │
│ Client Secret:  [empty] │
│ Status:         🔴 Err  │
│ Configured:     ❌      │
└─────────────────────────┘

State 3: Fully Configured
┌─────────────────────────┐
│ Client ID:      [✓]     │
│ Client Secret:  [✓]     │
│ Status:         🟢 Act  │
│ Configured:     ✅      │
└─────────────────────────┘
```

---

## 🎨 Visual Color Coding

```
STATUS COLORS
═════════════

🟢 GREEN (Emerald)
   → Active
   → Working
   → Configured
   → Success

⚫ GRAY (Secondary)
   → Inactive
   → Not configured
   → Disabled
   → Neutral

🔴 RED (Destructive)
   → Error
   → Failed
   → Problem
   → Warning

🔵 BLUE (Info)
   → Configured badge
   → Information
   → Neutral status
   → Note

🟡 YELLOW (Warning)
   → Testing
   → In progress
   → Caution
   → Attention needed
```

---

## 🔧 Interaction Patterns

```
BUTTON STATES
═════════════

[Test Connection]
    ↓ Click
[Testing... ⌛]
    ↓ Complete
[Test Connection]
+ Status updates


[Save Configuration]
    ↓ Click
[Saving... ⌛]
    ↓ Complete
[Save Configuration]
+ Toast notification


[📋 Copy]
    ↓ Click
[✓ Copied!]
    ↓ 2 seconds
[📋 Copy]


[Setup ↗]
    ↓ Click
Opens new tab
→ External guide
```

---

## 📱 Mobile Layout

```
DESKTOP VIEW (>768px)
┌───────────────────────────────┐
│  Status Overview              │
│  ┌──────────┐  ┌──────────┐  │
│  │ Supabase │  │  Google  │  │
│  └──────────┘  └──────────┘  │
└───────────────────────────────┘

MOBILE VIEW (<768px)
┌──────────────┐
│  Status      │
│  ┌──────────┐│
│  │ Supabase ││
│  └──────────┘│
│  ┌──────────┐│
│  │  Google  ││
│  └──────────┘│
└──────────────┘

All cards stack vertically
Full width utilization
Touch-friendly buttons
```

---

## 🎯 Quick Action Matrix

```
┌─────────────┬──────────┬──────────┬─────────┐
│   Action    │   Time   │   Steps  │ Result  │
├─────────────┼──────────┼──────────┼─────────┤
│ View Status │ 5 sec    │ 1        │ 🟢 See  │
│ Test All    │ 10 sec   │ 2        │ ✅ Test │
│ Setup Supa  │ 2 min    │ 4        │ 🟢 Done │
│ Setup Googe │ 5 min    │ 8        │ 🟢 Done │
│ Add FB/GH   │ 5 min    │ 6        │ 🟢 Done │
└─────────────┴──────────┴──────────┴─────────┘
```

---

## ✅ Visual Checklist

```
SETUP COMPLETE WHEN:
═══════════════════════

┌─────────────────────────┐
│ □ Supabase Auth         │
│   └─ 🟢 Active          │
│                         │
│ □ Google OAuth          │
│   └─ 🟢 Active          │
│                         │
│ □ Environment Vars      │
│   ├─ ✓ SUPABASE_URL     │
│   └─ ✓ SUPABASE_KEY     │
│                         │
│ □ Test Connections      │
│   ├─ ✅ Supabase OK     │
│   └─ ✅ Google OK       │
│                         │
│ □ User Flow Test        │
│   ├─ ✅ Can sign up     │
│   ├─ ✅ Can sign in     │
│   └─ ✅ Can sign out    │
└─────────────────────────┘

ALL CHECKED = READY TO USE ✨
```

---

**Visual Guide Complete!** Use this for quick navigation and understanding of the Auth Services interface.

For detailed documentation, see: `/AUTH_SERVICES_BACKEND_DASHBOARD.md`

For quick setup, see: `/AUTH_SERVICES_QUICK_CARD.md`
