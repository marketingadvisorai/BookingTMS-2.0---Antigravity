# Supabase Connection Testing Guide

## 🎯 Quick Access

Your Supabase Test page is now accessible! Here's how to use it:

### Access the Test Page

1. **Login to BookingTMS** with Super Admin credentials:
   - Email: `admin@bookingtms.com` OR Username: `superadmin`
   - Password: `demo123`

2. **Navigate to Supabase Test**:
   - Look for "Supabase Test" in the sidebar (Super Admin only)
   - Or directly navigate to it using the routing

### Your Supabase Project Details

```
Project Name: BookingTMS - Beta V 0.1
Project ID:   ohfjkcajnqvethmrpdwc
URL:          https://ohfjkcajnqvethmrpdwc.supabase.co
```

---

## 🧪 What the Test Page Does

The Supabase Test page runs **5 comprehensive tests**:

### Test 1: Environment Variables ✅
- Checks if `projectId` and `publicAnonKey` are configured
- Displays your Supabase URL
- Shows key preview (first 20 characters)

**What you'll see:**
```json
{
  "projectId": "ohfjkcajnqvethmrpdwc",
  "url": "https://ohfjkcajnqvethmrpdwc.supabase.co",
  "keyPreview": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Test 2: Client Initialization ✅
- Creates Supabase client instance
- Verifies client can be initialized
- Checks connection readiness

**Success means:** Your app can communicate with Supabase

### Test 3: Database Connection 🔍
- Tests connection to `kv_store_84a71643` table
- Checks if database is reachable
- Validates table exists

**Possible outcomes:**
- ✅ **Success**: Table exists and is accessible
- ⚠️ **Warning**: Table exists but RLS (Row Level Security) is active or no data
- ❌ **Error**: Cannot connect to database

### Test 4: Authentication System 🔐
- Tests Supabase Auth system
- Checks for active session
- Retrieves current user info (if logged in)

**What you'll see:**
- No session: "Auth system ready (no active session)"
- Active session: Shows user email and ID
- Error: Auth system issue

### Test 5: Edge Functions 🚀
- Tests connection to your server functions
- Calls health check endpoint
- Verifies server is responding

**Endpoint tested:**
```
https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/make-server-84a71643/health
```

---

## 📊 Understanding Test Results

### All Green ✅
```
✅ Environment: Configuration found
✅ Client: Client initialized successfully
✅ Database: Connected (table exists, no data or RLS active)
✅ Auth: Auth system ready (no active session)
❌ Server: Cannot reach server (Expected - not deployed yet)
```

**This is GOOD!** Your Supabase project is connected and ready. The server error is expected since you haven't deployed edge functions yet.

### Partial Success ⚠️
Some tests pass, some fail. Common scenarios:

**Database RLS Warning:**
```
⚠️ Database: Connected (table exists, no data or RLS active)
```
This is **normal** and **good**! It means:
- Database is connected ✅
- Table exists ✅
- Row Level Security is active (secure) ✅
- No data yet or RLS policies need adjustment

**Auth No Session:**
```
✅ Auth: Auth system ready (no active session)
```
This is **expected**! It means:
- Auth system is working ✅
- You're testing as an unauthenticated user ✅
- You can still test the connection

### Connection Failed ❌
If you see red errors:

**Environment Error:**
```
❌ Environment: Missing project configuration
```
**Fix:** Check `/utils/supabase/info.tsx` - should have projectId and publicAnonKey

**Client Error:**
```
❌ Client: Failed to initialize
```
**Fix:** Clear browser cache, restart app, check console errors

**Database Error:**
```
❌ Database: Connection error: [error message]
```
**Fix:** 
1. Go to Supabase dashboard
2. Check if project is active
3. Verify database migrations were run
4. Check RLS policies

---

## 🛠️ Next Steps After Testing

### If All Tests Pass ✅

Your connection is verified! Now you can:

1. **Run Database Migrations**
   - Go to Supabase dashboard → SQL Editor
   - Run `/supabase/migrations/001_initial_schema.sql`
   - This creates all necessary tables

2. **Create Your First User**
   - Follow instructions in `/CONNECT_TO_SUPABASE.md` Step 6
   - Create auth user + profile in database

3. **Add Sample Data**
   - Use sample data script from `/CONNECT_TO_SUPABASE.md`
   - Populate games, customers, bookings

4. **Start Building**
   - Use Supabase hooks: `useBookings()`, `useGames()`, etc.
   - Implement real-time features
   - Connect forms to database

### If Tests Fail ❌

**Step 1: Check Project Status**
- Go to [app.supabase.com](https://app.supabase.com)
- Find project: "ohfjkcajnqvethmrpdwc"
- Verify status is "Active" (not "Paused" or "Inactive")

**Step 2: Check API Keys**
- Go to Settings → API in Supabase dashboard
- Copy the anon/public key
- Compare with key in `/utils/supabase/info.tsx`
- If different, you may need to update (contact support)

**Step 3: Check Browser Console**
- Open DevTools (F12)
- Look for errors when clicking "Run Tests"
- Note any CORS or network errors

**Step 4: Try Alternative Tests**

Test manually with this code in console:
```javascript
// Test 1: Check config
console.log('Project ID:', 'ohfjkcajnqvethmrpdwc');
console.log('Has Key:', !!publicAnonKey);

// Test 2: Ping Supabase
fetch('https://ohfjkcajnqvethmrpdwc.supabase.co/rest/v1/')
  .then(r => r.status)
  .then(status => console.log('API Status:', status))
  .catch(e => console.error('API Error:', e));
```

---

## 🔍 Troubleshooting Common Issues

### "Cannot reach server" (Test 5)
**Status:** ⚠️ Expected (not critical)

This is **normal** if you haven't deployed edge functions yet. Edge functions are optional for basic Supabase usage.

**To deploy edge functions later:**
1. Install Supabase CLI
2. Run `supabase functions deploy make-server-84a71643`
3. Configure environment variables in Supabase dashboard

### "RLS policy violation"
**Status:** ✅ This is actually good security!

Row Level Security (RLS) is **protecting your data**. This means:
- Your database is secure ✅
- Only authorized users can access data ✅
- You need to either:
  - Login as authenticated user
  - Or adjust RLS policies for testing

**Quick fix for testing:**
```sql
-- Temporarily disable RLS (testing only!)
ALTER TABLE kv_store_84a71643 DISABLE ROW LEVEL SECURITY;

-- Re-enable for production:
ALTER TABLE kv_store_84a71643 ENABLE ROW LEVEL SECURITY;
```

### "Project is paused"
**Status:** ❌ Critical

Free tier Supabase projects pause after inactivity.

**Fix:**
1. Go to Supabase dashboard
2. Find your project
3. Click "Resume Project"
4. Wait 1-2 minutes
5. Run tests again

### Browser CORS errors
**Status:** ❌ Configuration issue

**Fix:**
1. Go to Supabase dashboard → Authentication → URL Configuration
2. Add your app URL to **Site URL**:
   - Development: `http://localhost:3000`
   - Production: Your actual domain
3. Add to **Redirect URLs**:
   - `http://localhost:3000/**`
   - Your domain with `/**`

---

## 📖 Additional Resources

### Documentation
- **Complete Setup**: `/CONNECT_TO_SUPABASE.md`
- **Quick Start**: `/SUPABASE_QUICK_START.md`
- **Integration Guide**: `/SUPABASE_INTEGRATION_SUMMARY.md`
- **Backend Setup**: `/backend/README.md`

### Supabase Dashboard
- **URL**: https://app.supabase.com
- **Your Project**: ohfjkcajnqvethmrpdwc

### Support Links
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

---

## ✅ Testing Checklist

Use this checklist when testing your connection:

- [ ] **Login as Super Admin**
  - Email: `admin@bookingtms.com` OR Username: `superadmin`
  - Password: `demo123`

- [ ] **Navigate to Supabase Test page**
  - Click "Supabase Test" in sidebar

- [ ] **Click "Run Tests" button**
  - Wait for all 5 tests to complete

- [ ] **Verify Test Results**
  - ✅ Environment: Configuration found
  - ✅ Client: Initialized successfully
  - ✅ Database: Connected (or RLS warning - both OK)
  - ✅ Auth: System ready
  - ⚠️ Server: May fail (expected if not deployed)

- [ ] **Review Details**
  - Check project ID matches: `ohfjkcajnqvethmrpdwc`
  - Check URL: `https://ohfjkcajnqvethmrpdwc.supabase.co`
  - Note any specific error messages

- [ ] **Check Supabase Dashboard**
  - Verify project is "Active"
  - Check API keys are correct
  - Review logs for any issues

- [ ] **Test in Browser Console**
  - Open DevTools (F12)
  - Look for connection errors
  - Check network tab for API calls

---

## 🎉 Success Indicators

You'll know your connection is working when:

1. **All tests pass** (except possibly server - that's OK)
2. **No red errors** in browser console
3. **Project ID displays correctly**: `ohfjkcajnqvethmrpdwc`
4. **Client initializes** without errors
5. **Database responds** (even with RLS warning)
6. **Auth system is ready**

---

## 🚀 What's Next?

Once your connection is verified:

### Immediate Next Steps (Day 1)
1. ✅ Run database migrations
2. ✅ Create first user account
3. ✅ Add sample data (games, customers)
4. ✅ Test login with Supabase auth

### Short Term (Week 1)
1. Connect Dashboard to real data
2. Implement bookings CRUD with Supabase
3. Add real-time updates
4. Test multi-tenant isolation

### Medium Term (Month 1)
1. Deploy edge functions
2. Integrate Stripe payments
3. Add email/SMS notifications
4. Implement file storage
5. Deploy to production

---

**Current Status:** ✅ **Ready to Test!**

**Your Configuration:**
```
✅ Project ID:   ohfjkcajnqvethmrpdwc
✅ Project URL:  https://ohfjkcajnqvethmrpdwc.supabase.co
✅ Test Page:    Available in sidebar (Super Admin only)
✅ Environment:  Configured via /utils/supabase/info.tsx
```

**Last Updated:** November 4, 2025  
**Version:** 1.0  
**Maintained By:** BookingTMS Development Team

---

**Happy Testing! 🧪✨**

If you encounter any issues, refer to the troubleshooting section above or check the comprehensive documentation in `/CONNECT_TO_SUPABASE.md`.
