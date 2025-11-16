# Backend Dashboard - Quick Reference Card

**Access**: Super Admin Only | **Location**: Sidebar → Backend Dashboard

---

## ⚡ Quick Actions

```bash
# Access Dashboard
Login as: superadmin / demo123
Navigate to: Backend Dashboard (Server icon)

# Run All Checks
Click: "Refresh All" button (top right)
```

---

## 📊 Status At-A-Glance

| Icon | Meaning | Action |
|------|---------|--------|
| 🟢 | Healthy/Connected | All good! |
| 🔴 | Unhealthy/Disconnected | Check config |
| 🟡 | Checking/Unknown | Wait or investigate |
| 🔵 | Mock/Not Implemented | Expected in dev |

---

## 🎯 5 Main Tabs

### 1️⃣ Connections
**Shows**: Supabase, Database, Services  
**Check**: Connection status + latency  
**Look For**: All services "connected"

### 2️⃣ Health Checks
**Shows**: Service health status  
**Check**: Database, Auth, Storage, Functions  
**Look For**: All services "healthy"

### 3️⃣ API Tests
**Shows**: API endpoint testing  
**Check**: Response codes + latency  
**Look For**: 200 status codes, <100ms

### 4️⃣ Environment
**Shows**: Required env variables  
**Check**: All variables present  
**Look For**: All checkmarks ✅

### 5️⃣ Monitoring
**Shows**: Real-time metrics (coming soon)  
**Status**: Planned for production

---

## 🚨 Troubleshooting

### All Red (Disconnected)
```bash
1. Check .env.local exists
2. Verify Supabase credentials
3. Restart dev server (npm run dev)
4. Click "Refresh All"
```

### Slow Response (>200ms)
```bash
1. Check internet connection
2. Check Supabase project region
3. Check database query optimization
4. Consider caching
```

### Missing Env Vars
```bash
1. Create .env.local in root
2. Add required variables:
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
3. Restart server
```

---

## ✅ Production Checklist

**Ready to Deploy When:**
- [x] All connections: 🟢 Connected
- [x] All health checks: 🟢 Healthy  
- [x] All env vars: ✅ Set
- [x] API latency: <100ms
- [x] Zero console errors

---

## 🔗 Quick Links

- Full Guide: `/BACKEND_DASHBOARD_GUIDE.md`
- Setup: `/SUPABASE_SETUP_GUIDE.md`
- Backend Docs: `/backend/README.md`

---

**Tip**: Bookmark this dashboard for quick backend health checks!
