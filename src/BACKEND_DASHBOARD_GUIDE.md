# Backend Dashboard - Developer Guide

**Version**: 1.0.0  
**Created**: November 4, 2025  
**Purpose**: Monitor and test backend services, connections, and API endpoints

---

## 🎯 Overview

The **Backend Dashboard** is a comprehensive developer tool for monitoring, testing, and managing all backend connections and services in BookingTMS. It provides real-time status checks, health monitoring, API testing, and environment validation.

### Key Features

✅ **Connection Monitoring** - Real-time status of all backend services  
✅ **Health Checks** - Service health with response times  
✅ **API Testing** - Test endpoints and measure latency  
✅ **Environment Validation** - Check required environment variables  
✅ **Development Ready** - Step-by-step setup guide included  
✅ **Dark Mode Support** - Full dark/light theme compatibility  
✅ **Super Admin Only** - Restricted to administrators

---

## 🚀 Quick Access

### How to Access

1. **Login as Super Admin**
   - Username: `superadmin`
   - Password: `demo123`

2. **Navigate to Backend Dashboard**
   - Click "Backend Dashboard" in the sidebar
   - Or set `currentPage = 'backend-dashboard'`

3. **Run Checks**
   - Click "Refresh All" to test all connections
   - View results in real-time

### Navigation Path

```
Sidebar → Backend Dashboard (Server icon, Super Admin only)
```

---

## 📊 Dashboard Sections

### 1. Quick Stats (Top Cards)

Four metric cards showing at-a-glance status:

| Metric | Description | Status |
|--------|-------------|--------|
| **Database** | Supabase connection status | Connected/Disconnected |
| **Health Checks** | Number of healthy services | X/Y healthy |
| **API Endpoints** | Total endpoints being monitored | Count |
| **Avg Response** | Average response time | Milliseconds |

### 2. Connections Tab

**Purpose**: Monitor all backend service connections

**Features:**
- Supabase database connection status
- Connection latency in milliseconds
- Detailed error messages
- JSON response preview
- Real-time status updates

**Status Indicators:**
- 🟢 **Connected** - Service is accessible and responding
- 🔴 **Disconnected** - Service cannot be reached
- 🟡 **Checking** - Currently testing connection
- ⚠️ **Error** - Connection failed with error

**What It Checks:**
```typescript
✓ Supabase PostgreSQL database
✓ Database table accessibility (kv_store_84a71643)
✓ Connection latency
✓ Response validation
```

### 3. Health Checks Tab

**Purpose**: Monitor health of individual services

**Services Monitored:**
1. **Database** - PostgreSQL connection health
2. **Authentication** - Supabase Auth service
3. **Storage** - Supabase Storage buckets
4. **Edge Functions** - Serverless functions status

**Health Status:**
- 🟢 **Healthy** - Service operating normally
- 🟠 **Degraded** - Service experiencing issues
- 🔴 **Unhealthy** - Service not functioning
- ⚪ **Unknown** - Status cannot be determined

**Metrics Shown:**
- Response time (milliseconds)
- Status message
- Last check timestamp

### 4. API Tests Tab

**Purpose**: Test backend API endpoints

**Endpoints Tested:**
```typescript
GET  /api/health         - Health check endpoint
GET  /api/bookings       - Bookings API
GET  /api/customers      - Customers API
```

**For Each Endpoint:**
- HTTP method (GET, POST, etc.)
- Full URL path
- Status code (200, 404, 500, etc.)
- Response latency
- Success/error message

**Status Types:**
- 🟢 **200-299** - Successful responses
- 🔵 **Mock** - Endpoint not yet implemented (returning mock data)
- 🔴 **Error** - Request failed or endpoint unavailable

### 5. Environment Tab

**Purpose**: Validate required environment variables

**Variables Checked:**
```bash
✓ SUPABASE_URL                    # Supabase project URL
✓ SUPABASE_ANON_KEY              # Public anonymous key
✓ SUPABASE_SERVICE_ROLE_KEY      # Server-side admin key
```

**Status Indicators:**
- ✅ **Set** - Variable is configured
- ❌ **Missing** - Variable needs to be set

**Security Note:**
> Environment variables are checked server-side for security. Values are never exposed to the frontend.

### 6. Monitoring Tab

**Purpose**: Real-time metrics (Coming Soon)

**Planned Features:**
- Live request tracking
- Performance metrics
- Error rate monitoring
- Database query analytics
- API usage statistics
- Response time graphs
- Request volume charts

---

## 🔧 Development Setup

### Step-by-Step Guide

The dashboard includes an interactive setup guide with 4 steps:

#### Step 1: Set up Supabase

Create a Supabase project and add credentials:

```bash
# Create .env.local file in project root
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**How to Get Credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to Settings → API
4. Copy Project URL and keys

#### Step 2: Run Database Migrations

Apply the initial schema:

```bash
# Initialize Supabase (if not done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

**What This Does:**
- Creates `kv_store_84a71643` table
- Sets up user tables
- Configures permissions
- Initializes database schema

#### Step 3: Deploy Edge Functions

Deploy the server edge function:

```bash
# Deploy the main server function
supabase functions deploy server

# Verify deployment
supabase functions list
```

**Edge Function Structure:**
```
/supabase/functions/server/
  ├── index.tsx        # Main server routes
  └── kv_store.tsx     # Key-value store utilities
```

#### Step 4: Test Connection

1. Click "Refresh All" button in dashboard
2. Check connection status
3. Verify all services are healthy
4. Test API endpoints

---

## 🎨 UI Components

### Refresh Button

**Location**: Top right of dashboard  
**Function**: Run all connection tests  
**States:**
- Normal: "Refresh All" with refresh icon
- Loading: "Refreshing..." with spinning icon (disabled)

### Status Badges

Color-coded badges for quick status identification:

```tsx
Connected  → Green badge (#10b981)
Healthy    → Green badge (#10b981)
Mock       → Blue badge (#3b82f6)
Error      → Red badge (#ef4444)
Unknown    → Gray badge (#6b7280)
Checking   → Yellow badge (#f59e0b)
```

### Alert Messages

Information alerts for important notices:

- 🔵 **Info** - No data available, run checks
- ⚠️ **Warning** - Configuration needed
- ℹ️ **Note** - Additional information

---

## 💻 Technical Details

### Component Structure

```typescript
BackendDashboard
├── Header (title, description, refresh button)
├── Quick Stats (4 metric cards)
├── Tabs
│   ├── Connections (service status)
│   ├── Health (service health)
│   ├── API Tests (endpoint testing)
│   ├── Environment (env vars)
│   └── Monitoring (coming soon)
└── Setup Guide (4-step guide)
```

### State Management

```typescript
const [connections, setConnections] = useState<ConnectionStatus[]>([]);
const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
const [envVars, setEnvVars] = useState<Record<string, boolean>>({});
const [isRefreshing, setIsRefreshing] = useState(false);
const [lastCheck, setLastCheck] = useState<Date | null>(null);
const [apiTests, setApiTests] = useState<any[]>([]);
```

### Type Definitions

```typescript
interface ConnectionStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'checking' | 'error';
  message: string;
  latency?: number;
  details?: any;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime?: number;
  message: string;
  timestamp: string;
}
```

### Check Functions

```typescript
checkAllConnections()        // Run all checks
checkSupabaseConnection()    // Test Supabase
checkEnvironmentVariables()  // Validate env vars
checkApiEndpoints()          // Test API routes
runHealthChecks()            // Check service health
```

---

## 🎯 Use Cases

### 1. Initial Setup

**Scenario**: Setting up backend for the first time

**Steps:**
1. Access Backend Dashboard
2. Note which services show "disconnected"
3. Follow setup guide to configure missing services
4. Click "Refresh All" after each step
5. Verify all services show "connected"

### 2. Debugging Connection Issues

**Scenario**: Backend services not responding

**Steps:**
1. Open Backend Dashboard
2. Click "Refresh All" to get latest status
3. Check Connections tab for error messages
4. Review Health Checks for degraded services
5. Check Environment tab for missing variables
6. Fix issues and re-test

### 3. API Development

**Scenario**: Testing new API endpoints

**Steps:**
1. Add endpoint to `apiTests` array
2. Implement endpoint in backend
3. Click "Refresh All" to test
4. Check API Tests tab for results
5. Verify status code and latency

### 4. Production Readiness

**Scenario**: Preparing for deployment

**Checklist:**
- ✅ Database: Connected
- ✅ Authentication: Healthy
- ✅ Storage: Healthy
- ✅ All env vars: Set
- ✅ API endpoints: Responding
- ✅ Average latency: < 100ms

---

## 🔒 Security & Permissions

### Access Control

**Who Can Access:**
- ✅ Super Admin (full access)
- ❌ Admin (no access)
- ❌ Manager (no access)
- ❌ Staff (no access)

**Implementation:**
```typescript
// In Sidebar.tsx (lines 54-68)
if (isRole('super-admin')) {
  navItems.push({
    id: 'backend-dashboard',
    label: 'Backend Dashboard',
    icon: Server,
    permission: 'accounts.view' as Permission
  });
}
```

### Security Considerations

**Environment Variables:**
- Never expose service role keys to frontend
- Check variables server-side only
- Use visual indicators (✅/❌) instead of values

**Connection Details:**
- Sanitize error messages before display
- Limit detailed error info to development
- Hide sensitive connection strings

**API Testing:**
- Use mock responses in development
- Implement proper authentication for real endpoints
- Rate limit test requests in production

---

## 🎨 Dark Mode Support

### Theme Integration

```typescript
const { theme } = useTheme();
const isDark = theme === 'dark';
```

### Color Variables

```typescript
// Background layers
const bgPrimary = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
const bgCard = isDark ? 'bg-[#161616]' : 'bg-white';
const bgElevated = isDark ? 'bg-[#1e1e1e]' : 'bg-white';

// Text colors
const textPrimary = isDark ? 'text-white' : 'text-gray-900';
const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

// Borders
const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';
```

### Status Colors

Status colors remain consistent in both themes:
- Green: `#10b981` (success/healthy)
- Red: `#ef4444` (error/unhealthy)
- Yellow: `#f59e0b` (warning/checking)
- Blue: `#3b82f6` (info/mock)
- Gray: `#6b7280` (unknown)

---

## 📝 Future Enhancements

### Phase 1 (Current)
- ✅ Connection monitoring
- ✅ Health checks
- ✅ API endpoint testing
- ✅ Environment validation
- ✅ Setup guide

### Phase 2 (Planned)
- ⏳ Real-time monitoring
- ⏳ Performance graphs
- ⏳ Error rate tracking
- ⏳ Request logging
- ⏳ Database query analytics

### Phase 3 (Future)
- 📋 Automated alerts
- 📋 Incident management
- 📋 Custom dashboards
- 📋 Export reports
- 📋 Historical data analysis

---

## 🐛 Troubleshooting

### Dashboard Won't Load

**Symptoms:**
- Blank page
- Error in console

**Solutions:**
1. Check if logged in as Super Admin
2. Verify App.tsx includes BackendDashboard import
3. Check Sidebar.tsx has backend-dashboard route
4. Clear browser cache and reload

### "Refresh All" Does Nothing

**Symptoms:**
- Button doesn't trigger checks
- No loading state

**Solutions:**
1. Check browser console for errors
2. Verify Supabase client is properly configured
3. Check network tab for failed requests
4. Try hard refresh (Ctrl+Shift+R)

### All Services Show "Disconnected"

**Symptoms:**
- Every service shows red status
- No successful connections

**Solutions:**
1. Check .env.local file exists
2. Verify environment variables are set correctly
3. Restart development server
4. Check Supabase project is active
5. Verify project URL and keys are correct

### Environment Variables Not Showing

**Symptoms:**
- All variables show ❌
- Environment tab empty

**Solutions:**
1. Create .env.local in project root
2. Add all required variables
3. Restart dev server (npm run dev)
4. Check variable names match exactly
5. Ensure no extra spaces or quotes

---

## 📚 Related Documentation

- **Main PRD**: `/PRD_BOOKINGTMS_ENTERPRISE.md`
- **Backend Architecture**: `/backend/README.md`
- **Supabase Setup**: `/SUPABASE_SETUP_GUIDE.md`
- **Development Guide**: `/DEV_MODE_GUIDE.md`
- **Quick Start**: `/QUICK_START.md`

---

## ✅ Checklist for Production

Before deploying to production:

### Backend Services
- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Edge functions deployed
- [ ] Environment variables set
- [ ] All connections showing "connected"
- [ ] All health checks showing "healthy"

### Security
- [ ] Service role key is server-side only
- [ ] API endpoints have authentication
- [ ] Rate limiting implemented
- [ ] Error messages sanitized
- [ ] CORS configured properly

### Monitoring
- [ ] Real-time monitoring enabled
- [ ] Error tracking configured
- [ ] Performance metrics tracked
- [ ] Alerts set up
- [ ] Logging implemented

### Testing
- [ ] All API endpoints tested
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Backup strategy in place
- [ ] Rollback plan documented

---

## 💡 Pro Tips

### Tip 1: Quick Health Check
Bookmark the Backend Dashboard for instant access to system health.

### Tip 2: Monitor Before Deploy
Always check the dashboard before deploying updates to ensure all services are healthy.

### Tip 3: Use Latency Metrics
Monitor response times to identify performance issues early.

### Tip 4: Environment Validation
Check environment tab when moving between dev/staging/production.

### Tip 5: Regular Checks
Set up a routine to check the dashboard daily during active development.

---

## 🎉 Success Metrics

**Dashboard is Working When:**
- ✅ All connections show "connected"
- ✅ Health checks show "healthy"
- ✅ API tests return expected responses
- ✅ Environment variables all set
- ✅ Response times < 100ms
- ✅ No console errors

**Development is Ready When:**
- ✅ Database accessible
- ✅ Auth service operational
- ✅ Storage buckets configured
- ✅ Edge functions deployed
- ✅ All tests passing
- ✅ Documentation complete

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Access**: Super Admin Only

---

*Built for developers, by developers* 🛠️  
*Part of the BookingTMS Admin Portal*
