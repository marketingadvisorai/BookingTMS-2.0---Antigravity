# BookingTMS Troubleshooting Guide

Quick solutions to common issues.

---

## 🔥 Critical Errors

### ❌ "process is not defined"

**Status**: ✅ **FIXED**

**What happened**: The app tried to access environment variables in the browser where `process` doesn't exist.

**Solution**: Already fixed in latest code. Just restart:
```bash
# Stop server (Ctrl+C)
npm run dev
```

**Verify**:
- App should start without errors
- Console shows either "📦 Supabase not configured" or "✅ Supabase connected"

**Still broken?** See `/SUPABASE_ENV_FIX.md`

---

## ⚠️ Common Issues

### App won't start

**Check Node modules**:
```bash
rm -rf node_modules
npm install
npm run dev
```

**Check for syntax errors**:
```bash
# Look for red error messages in terminal
# Fix any TypeScript errors shown
```

---

### Environment variables not loading

**Checklist**:
- [ ] `.env.local` exists in project root (not in subdirectory)
- [ ] Variables start with `NEXT_PUBLIC_` for client access
- [ ] No quotes around values
- [ ] Dev server restarted after creating file

**Example `.env.local`**:
```bash
# ✅ Correct
NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# ❌ Wrong
NEXT_PUBLIC_SUPABASE_URL="https://abc.supabase.co"  # No quotes
SUPABASE_URL=https://abc.supabase.co  # Missing NEXT_PUBLIC_
```

**Verify**:
```bash
node verify-env.js
```

---

### "Supabase not configured" but I have .env.local

**Solution**:
1. Verify file location:
   ```bash
   ls -la .env.local  # Should be in root
   ```

2. Check file contents:
   ```bash
   cat .env.local  # Should show your variables
   ```

3. Restart server:
   ```bash
   npm run dev
   ```

4. Clear browser cache:
   - Open DevTools (F12)
   - Right-click refresh button
   - "Empty Cache and Hard Reload"

---

### Login doesn't work

**Mock Mode (no .env.local)**:
- Use any email from mock users:
  - `superadmin@bookingtms.com`
  - `admin@bookingtms.com`
  - `manager@bookingtms.com`
- Password: anything (mock mode ignores password)

**Supabase Mode (with .env.local)**:
- Use credentials created in Supabase dashboard
- Make sure user profile exists in `users` table
- Check Supabase dashboard for auth errors

---

### Dark mode not working

**Check**:
1. ThemeContext imported?
   ```typescript
   import { useTheme } from '@/components/layout/ThemeContext';
   ```

2. Theme variable defined?
   ```typescript
   const { theme } = useTheme();
   const isDark = theme === 'dark';
   ```

3. Dark mode classes applied?
   ```typescript
   <div className={isDark ? 'bg-[#161616]' : 'bg-white'}>
   ```

---

### Page looks wrong / styling broken

**Common causes**:

1. **Forgot explicit styling**:
   ```typescript
   // ❌ Wrong - relies on defaults
   <Input placeholder="Name" />
   
   // ✅ Right - explicit styling
   <Input 
     className="h-12 bg-gray-100 border-gray-300"
     placeholder="Name" 
   />
   ```

2. **Mobile-first responsive broke**:
   ```typescript
   // ❌ Wrong
   <div className="grid-cols-3 md:grid-cols-1">
   
   // ✅ Right
   <div className="grid-cols-1 md:grid-cols-3">
   ```

3. **Dark mode classes missing**:
   ```typescript
   // Add dark mode support
   const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
   ```

---

### TypeScript errors

**Common fixes**:

1. **Missing type**:
   ```typescript
   // Add explicit type
   const items: Item[] = [];
   ```

2. **Undefined check**:
   ```typescript
   // Add optional chaining
   user?.name
   ```

3. **Any type (quick fix)**:
   ```typescript
   // Temporary workaround
   const data: any = response;
   ```

---

### Performance issues / slow loading

**Quick fixes**:

1. **Check browser DevTools**:
   - Network tab: Look for slow requests
   - Performance tab: Check for re-renders

2. **Add React.memo**:
   ```typescript
   export const Component = React.memo(({ props }) => {
     // ...
   });
   ```

3. **Optimize images**:
   ```typescript
   // Use proper sizes
   <img loading="lazy" width={300} height={200} />
   ```

---

### Real-time updates not working

**Supabase Realtime checklist**:
- [ ] Supabase connected (not mock mode)
- [ ] Real-time enabled on table (Supabase dashboard)
- [ ] Channel subscribed properly
- [ ] Cleanup function returns unsubscribe

**Example**:
```typescript
useEffect(() => {
  const channel = supabase
    .channel('my-channel')
    .on('postgres_changes', { /*...*/ }, (payload) => {
      // Handle change
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);  // Important!
  };
}, []);
```

---

### Database/Migration errors

**"relation does not exist"**:
- Migration didn't run
- Go to Supabase SQL Editor
- Run `/supabase/migrations/001_initial_schema.sql`

**"row-level security policy violation"**:
- Not authenticated
- Wrong organization_id
- Missing RLS policy

**"permission denied"**:
- Using anon key for admin operation
- Need service role key (server-side only)

---

## 🧪 Testing Checklist

Before asking for help, verify:

- [ ] `npm run dev` starts without errors
- [ ] No red errors in terminal
- [ ] No red errors in browser console
- [ ] Can navigate to all pages
- [ ] Dark mode toggle works
- [ ] Login works (mock or real)
- [ ] `.env.local` in correct location (if using Supabase)

---

## 🔧 Debug Mode

**Enable verbose logging**:
```typescript
// Add to any component
console.log('Theme:', theme);
console.log('User:', currentUser);
console.log('Supabase:', supabase);
```

**Check environment in browser**:
```javascript
// In browser console (F12)
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
```

---

## 📚 Documentation Reference

- **Environment Issues**: `/SUPABASE_ENV_FIX.md`
- **Connection Guide**: `/CONNECT_TO_SUPABASE.md`
- **Design Guidelines**: `/guidelines/Guidelines.md`
- **Quick Start**: `/guidelines/AI_AGENT_QUICK_START.md`
- **Dark Mode**: `/DARK_MODE_COLOR_GUIDE.md`

---

## 🆘 Still Stuck?

1. **Run verification**:
   ```bash
   node verify-env.js
   ```

2. **Check console**:
   - Browser DevTools (F12) → Console tab
   - Terminal where `npm run dev` is running

3. **Review docs**:
   - Check relevant guide for your issue
   - Look for similar examples in `/pages` or `/components`

4. **Clean restart**:
   ```bash
   # Stop server
   # Clear browser cache
   # Clear terminal
   npm run dev
   ```

---

**Most issues are quick fixes!** 🚀

**Common pattern**: Restart server + Clear cache = Fixed ✅
