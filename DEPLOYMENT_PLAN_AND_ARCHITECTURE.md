# 🚀 BookingTMS Deployment Plan & Architecture

## 📋 **Complete Deployment Plan**

### **Phase 1: Backend Deployment (Current - Almost Complete)** ✅

#### **Status:** Build Successful, Needs Start Command Fix

**What We're Using:**
- **Platform:** Render (Free Tier)
- **Runtime:** Node.js 22.16.0
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Payment:** Stripe
- **Email:** SendGrid
- **SMS:** Twilio
- **AI:** OpenAI

**Backend URL:** `https://bookingtms-backend-api.onrender.com`

**Current Tasks:**
1. ✅ Fixed all TypeScript compilation errors
2. ✅ Build completed successfully
3. ⏳ **Manual Fix Needed:** Update start command from `yarn start` to `npm start`
4. ⏳ Add environment variables
5. ⏳ Verify service health

---

### **Phase 2: Frontend Deployment (Next)**

#### **What We're Using for Frontend:**

**Option 1: Vercel (Recommended)** ⭐
- **Platform:** Vercel
- **Framework:** React + Vite
- **Language:** TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui
- **State Management:** React Context/Hooks
- **Routing:** React Router
- **Build:** Vite

**Why Vercel:**
- ✅ Free tier with generous limits
- ✅ Automatic deployments from GitHub
- ✅ Edge network (fast globally)
- ✅ Perfect for React/Vite apps
- ✅ Easy environment variable management

**Option 2: Netlify**
- Similar to Vercel
- Also excellent for React apps

**Option 3: Render Static Site**
- Keep everything on Render
- Simpler management

---

## 🔗 **Backend-Frontend Connection Architecture**

### **Current Frontend Stack:**
```
Frontend (React + Vite + TypeScript)
├── UI Framework: Tailwind CSS
├── Components: shadcn/ui + Radix UI
├── Icons: Lucide React
├── Forms: React Hook Form
├── Validation: Zod
├── HTTP Client: Fetch API / Axios
├── Date Handling: date-fns
└── Calendar: react-day-picker
```

### **Connection Flow:**

```
┌─────────────────────────────────────────┐
│         USER BROWSER                     │
│  (React App - Vite)                      │
│  https://your-app.vercel.app             │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS Requests
               │ (REST API)
               ▼
┌─────────────────────────────────────────┐
│      BACKEND API (Express)               │
│  https://bookingtms-backend-api          │
│         .onrender.com                    │
├─────────────────────────────────────────┤
│  Routes:                                 │
│  • POST /api/bookings                    │
│  • GET  /api/bookings                    │
│  • POST /api/payments                    │
│  • POST /api/config/save                 │
│  • GET  /api/config                      │
│  • POST /api/webhooks/stripe             │
└──────────────┬──────────────────────────┘
               │
               ├──────────────┐
               │              │
               ▼              ▼
    ┌──────────────┐  ┌──────────────┐
    │  SUPABASE    │  │   STRIPE     │
    │  (Database)  │  │  (Payments)  │
    └──────────────┘  └──────────────┘
```

---

## 🔌 **API Connections**

### **1. Authentication Flow:**
```typescript
// Frontend sends request
POST https://bookingtms-backend-api.onrender.com/api/auth/login
Body: { email, password }

// Backend validates with Supabase
// Returns JWT token

// Frontend stores token
localStorage.setItem('token', jwt)

// Frontend includes in all requests
Headers: { Authorization: 'Bearer <token>' }
```

### **2. Booking Creation Flow:**
```typescript
// Frontend
POST https://bookingtms-backend-api.onrender.com/api/bookings
Headers: { Authorization: 'Bearer <token>' }
Body: {
  game_id: "uuid",
  customer_id: "uuid",
  booking_date: "2025-11-15",
  time_slot: "14:00-16:00",
  number_of_players: 4
}

// Backend
1. Validates JWT token
2. Checks availability in Supabase
3. Creates booking record
4. Processes payment via Stripe
5. Sends confirmation email via SendGrid
6. Returns booking confirmation
```

### **3. Payment Flow:**
```typescript
// Frontend
1. User fills booking form
2. Frontend calls backend to create payment intent

POST https://bookingtms-backend-api.onrender.com/api/payments/create-intent
Body: { amount, currency, booking_id }

// Backend
1. Creates Stripe Payment Intent
2. Returns client_secret

// Frontend
1. Uses Stripe.js to collect payment
2. Confirms payment with client_secret
3. Stripe webhook notifies backend
4. Backend updates booking status
```

---

## 🔐 **Environment Variables**

### **Backend Environment Variables (Render):**
```bash
# Server
NODE_ENV=production
PORT=3001
API_BASE_URL=https://bookingtms-backend-api.onrender.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
JWT_SECRET=[auto-generated]
ENCRYPTION_KEY=[auto-generated]

# CORS
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173

# Optional Services
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=AC...
OPENAI_API_KEY=sk-...
```

### **Frontend Environment Variables (Vercel):**
```bash
# Backend API
VITE_BACKEND_API_URL=https://bookingtms-backend-api.onrender.com

# Stripe (Public Key Only)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase (Public URL Only)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
VITE_APP_NAME=BookingTMS
VITE_APP_VERSION=0.1.0
```

---

## 📁 **Project Structure**

```
Booking-TMS-Beta-Dev-V0.1/
├── src/
│   ├── backend/              # ✅ Deployed to Render
│   │   ├── api/
│   │   │   ├── server.ts     # Express server
│   │   │   ├── routes/       # API routes
│   │   │   └── bookings/     # Booking endpoints
│   │   ├── services/         # Business logic
│   │   │   ├── stripe.service.ts
│   │   │   └── BookingService.ts
│   │   ├── middleware/       # Auth, error handling
│   │   ├── config/           # Supabase, secrets
│   │   └── package.json      # Backend dependencies
│   │
│   ├── components/           # ⏳ To deploy to Vercel
│   │   ├── booking/          # Booking UI
│   │   ├── backend/          # Admin panel
│   │   └── ui/               # shadcn/ui components
│   │
│   ├── shared/               # Shared between frontend/backend
│   │   └── config/
│   │
│   └── types/                # TypeScript types
│
├── public/                   # Static assets
├── index.html                # Frontend entry
├── vite.config.ts            # Vite configuration
└── package.json              # Frontend dependencies
```

---

## 🔄 **Deployment Workflow**

### **Backend (Render):**
```
1. Push to backend-render-deploy branch
2. Render auto-deploys
3. Runs: npm install && npm run build
4. Starts: npm start
5. Service available at: https://bookingtms-backend-api.onrender.com
```

### **Frontend (Vercel - Recommended):**
```
1. Connect GitHub repo to Vercel
2. Set root directory: ./
3. Framework: Vite
4. Build command: npm run build
5. Output directory: dist
6. Add environment variables
7. Deploy
8. Service available at: https://your-app.vercel.app
```

---

## 🎯 **Immediate Next Steps**

### **Step 1: Fix Backend Start Command (1 minute)**
1. Go to: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/settings
2. Find "Start Command"
3. Change from: `yarn start`
4. Change to: `npm start`
5. Click "Save Changes"

### **Step 2: Add Backend Environment Variables (5 minutes)**
1. Go to: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env
2. Add all required variables (see FINAL_RENDER_CONFIG.md)
3. Click "Save Changes"
4. Service will auto-redeploy

### **Step 3: Verify Backend (2 minutes)**
```bash
# Test health endpoint
curl https://bookingtms-backend-api.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-11-11T...",
  "uptime": 123.456,
  "environment": "production"
}
```

### **Step 4: Deploy Frontend to Vercel (10 minutes)**
1. Go to: https://vercel.com
2. Sign in with GitHub
3. Import repository
4. Configure:
   - Framework: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables
6. Deploy

### **Step 5: Update Frontend API URL (2 minutes)**
Create `.env.production` in root:
```bash
VITE_BACKEND_API_URL=https://bookingtms-backend-api.onrender.com
```

### **Step 6: Update CORS in Backend (1 minute)**
Update `ALLOWED_ORIGINS` in Render to include your Vercel URL:
```
https://your-app.vercel.app,http://localhost:5173
```

### **Step 7: Configure Stripe Webhooks (3 minutes)**
1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://bookingtms-backend-api.onrender.com/api/webhooks/stripe`
3. Select events
4. Copy webhook secret
5. Update `STRIPE_WEBHOOK_SECRET` in Render

---

## 🏗️ **Architecture Decisions**

### **Why Separate Backend and Frontend?**
✅ **Scalability:** Scale independently  
✅ **Performance:** Frontend on edge network  
✅ **Security:** Backend secrets isolated  
✅ **Development:** Teams can work independently  
✅ **Deployment:** Deploy frontend without backend restart  

### **Why Render for Backend?**
✅ **Free tier** with good limits  
✅ **Auto-deploy** from GitHub  
✅ **Built-in** SSL certificates  
✅ **Easy** environment variables  
✅ **Good** for Node.js/Express  

### **Why Vercel for Frontend?**
✅ **Best** for React/Vite  
✅ **Global** edge network  
✅ **Instant** deployments  
✅ **Preview** deployments for PRs  
✅ **Free** tier generous  

---

## 📊 **Technology Stack Summary**

### **Frontend:**
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui + Radix UI
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Routing:** React Router
- **HTTP:** Fetch API
- **State:** React Context/Hooks

### **Backend:**
- **Runtime:** Node.js 22
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **ORM:** Supabase Client
- **Auth:** JWT + Supabase Auth
- **Payments:** Stripe
- **Email:** SendGrid
- **SMS:** Twilio
- **AI:** OpenAI

### **Infrastructure:**
- **Backend Host:** Render
- **Frontend Host:** Vercel (recommended)
- **Database:** Supabase Cloud
- **CDN:** Vercel Edge Network
- **SSL:** Automatic (both platforms)

---

## 🔒 **Security Measures**

### **Backend:**
✅ Helmet.js for security headers  
✅ CORS configuration  
✅ Rate limiting  
✅ JWT authentication  
✅ Input validation  
✅ SQL injection prevention (Supabase)  
✅ Environment variable encryption  

### **Frontend:**
✅ HTTPS only  
✅ Secure token storage  
✅ XSS prevention  
✅ CSRF protection  
✅ Input sanitization  

---

## 📈 **Performance Optimizations**

### **Backend:**
- Compression middleware
- Response caching
- Database query optimization
- Connection pooling

### **Frontend:**
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization
- Edge caching (Vercel)

---

## 🎉 **Summary**

**Backend Status:** ✅ Build Successful (needs start command fix)  
**Frontend Status:** ⏳ Ready to deploy  
**Database:** ✅ Supabase configured  
**Payments:** ⏳ Needs Stripe webhook setup  
**Email/SMS:** ⏳ Needs API keys  

**Estimated Time to Full Deployment:** ~30 minutes  
**Cost:** $0 (all free tiers)  

**Next Action:** Fix start command in Render Dashboard, then add environment variables!
