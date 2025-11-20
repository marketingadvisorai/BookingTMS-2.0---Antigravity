# Auth Services Quick Reference Card 🔐

**Access**: Backend Dashboard → Auth Services Tab  
**Permission**: Super Admin Only  
**Version**: 1.0 (November 5, 2025)

---

## ⚡ Quick Access

```
Navigation: Sidebar → Backend Dashboard → Auth Services tab
```

---

## 📊 Service Status

| Service | Badge | Meaning |
|---------|-------|---------|
| **Supabase Auth** | 🟢 Active | Configured & working |
| **Google OAuth** | 🟢 Active | Ready for sign-in |
| **Facebook** | ⚫ Inactive | Not configured |
| **GitHub** | ⚫ Inactive | Not configured |

---

## 🚀 Quick Setup: Supabase Auth

1. Toggle "Enable Supabase Auth" → ON
2. Configure preferences (optional)
3. Click "Save Supabase Configuration"
4. Click "Test Connection"
5. Verify status: 🟢 Active

**Configuration Options:**
- ✅ Email Confirmation (recommended)
- ✅ Allow Public Signups (optional)
- ⏱️ Session Duration (default: 24 hours)

---

## 🔑 Quick Setup: Google OAuth

### Prerequisites
- Google Cloud Console access
- Supabase project

### Steps (5 minutes)

1. **Get Credentials** (2 min)
   ```
   Google Cloud Console → APIs & Services → Credentials
   → Create OAuth 2.0 Client → Copy Client ID & Secret
   ```

2. **Configure Supabase** (1 min)
   ```
   Supabase Dashboard → Authentication → Providers
   → Enable Google → Paste credentials
   ```

3. **Configure Backend** (1 min)
   ```
   Backend Dashboard → Auth Services
   → Paste Client ID & Secret → Save
   ```

4. **Add Redirect URI** (1 min)
   ```
   Copy redirect URI from dashboard
   → Add to Google Console authorized URIs
   ```

5. **Test** (30 sec)
   ```
   Click "Test Connection" → Verify 🟢 Active
   ```

---

## 📋 Configuration Storage

All settings saved to `localStorage`:

```typescript
// Supabase Auth
'supabase_auth_config' → { enabled, emailConfirmation, allowSignups, sessionDuration }

// Google OAuth
'google_auth_config' → { enabled, clientId, clientSecret, redirectUri, configured }

// OAuth Providers
'oauth_providers' → [{ id, name, enabled, configured, setupUrl }]
```

---

## 🎯 Common Tasks

### Check All Service Status
```
Click "Refresh All" button → View status cards
```

### Enable New OAuth Provider
```
1. Click "Setup" next to provider
2. Follow setup guide
3. Return to dashboard
4. Toggle provider ON
```

### Update Session Duration
```
Supabase Configuration → Session Duration → Enter hours (1-168) → Save
```

### Copy Redirect URI
```
Google OAuth section → Click copy icon next to Redirect URI
```

### View Environment Variables
```
Scroll to bottom → Environment Variables card
```

---

## 🔧 Connection Testing

### Test Supabase
```typescript
Click "Test Connection" in Supabase card
→ Checks: SUPABASE_URL & SUPABASE_ANON_KEY
→ Result: Active | Error
```

### Test Google OAuth
```typescript
Click "Test Connection" in Google card
→ Validates: Client ID & Client Secret present
→ Result: Active | Error
```

### Test All Services
```typescript
Click "Refresh All" in header
→ Tests all configured services
→ Updates all status badges
```

---

## 🐛 Quick Troubleshooting

### ❌ Supabase Error
```
Check: .env.local has NEXT_PUBLIC_SUPABASE_URL and KEY
Fix: Add environment variables → Restart server
```

### ❌ Google OAuth Error
```
Check: Client ID and Secret are correct
Fix: Re-paste credentials → Save → Test again
```

### ❌ OAuth Won't Enable
```
Reason: Not configured yet
Fix: Click "Setup" → Follow guide → Return → Enable
```

### ❌ Changes Don't Save
```
Check: Browser allows localStorage
Fix: Clear cache → Try again → Check console
```

---

## 📱 Mobile Tips

- Scroll horizontally for long content
- Large tap targets (44x44px minimum)
- Copy buttons easy to reach
- Collapsible sections save space

---

## 🎨 Status Badge Legend

| Badge | Icon | Color | Meaning |
|-------|------|-------|---------|
| Active | ✓ | Green | Working |
| Inactive | ⚠ | Gray | Not setup |
| Error | ✗ | Red | Problem |
| Configured | • | Blue | Ready |

---

## 🔐 Security Notes

✅ **Safe:**
- API keys stored in browser only
- Never sent to backend
- Masked in UI
- Copy with one click

⚠️ **Remember:**
- Don't commit keys to git
- Rotate secrets regularly
- Use env vars in production
- Monitor access logs

---

## 📚 Setup Guides

| Provider | Time | Link |
|----------|------|------|
| **Google** | 5 min | [Guide](https://supabase.com/docs/guides/auth/social-login/auth-google) |
| **Facebook** | 5 min | [Guide](https://supabase.com/docs/guides/auth/social-login/auth-facebook) |
| **GitHub** | 5 min | [Guide](https://supabase.com/docs/guides/auth/social-login/auth-github) |

---

## ⚡ Keyboard Shortcuts

```
Tab → Navigate between fields
Enter → Save current section
Esc → Cancel (where applicable)
```

---

## ✅ Pre-Launch Checklist

Before enabling for users:

- [ ] Supabase Auth: 🟢 Active
- [ ] Google OAuth: 🟢 Active (if needed)
- [ ] Test user sign-in flow
- [ ] Test user sign-out flow
- [ ] Verify session duration
- [ ] Check email confirmation
- [ ] Test on mobile
- [ ] Monitor error logs

---

## 🎯 Quick Commands

### View Status
```bash
Backend Dashboard → Auth Services → View badges
```

### Test Everything
```bash
Click "Refresh All" → Wait 2 seconds → Check results
```

### Enable Google Sign-In
```bash
Configure Google OAuth → Save → Test → Enable
```

### Disable Provider
```bash
Find provider → Toggle OFF → Confirm
```

---

## 📊 Environment Variables

**Required for Supabase:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Check Status:**
```
Auth Services → Scroll to bottom → Environment Variables card
```

---

## 💡 Pro Tips

1. **Test after every change**
   - Click "Test Connection" immediately
   - Don't assume it worked

2. **Use copy buttons**
   - Faster than manual copying
   - Prevents typos

3. **Check console for errors**
   - Open DevTools (F12)
   - Look for red errors
   - Share with support if stuck

4. **Keep documentation handy**
   - Save setup guide links
   - Bookmark this card
   - Share with team

5. **Monitor regularly**
   - Check status daily
   - Use "Refresh All" weekly
   - Set calendar reminders

---

## 🔄 Common Workflows

### Daily Check
```
1. Open Backend Dashboard
2. Click Auth Services
3. Look for green badges
4. If all green → Done
5. If any red → Investigate
```

### Add New Provider
```
1. Click "Setup" next to provider
2. Follow external guide
3. Get credentials
4. Paste in dashboard
5. Save configuration
6. Test connection
7. Enable provider
```

### Update Credentials
```
1. Get new credentials
2. Paste in respective fields
3. Click "Save"
4. Click "Test Connection"
5. Verify status: Active
```

---

## 🎉 Success = All Green

When everything works:
- ✅ Supabase: 🟢 Active
- ✅ Google: 🟢 Active
- ✅ All env vars: ✓
- ✅ Test connections: Success
- ✅ No console errors
- ✅ Users can sign in

---

**Need Help?** Check `/AUTH_SERVICES_BACKEND_DASHBOARD.md` for detailed documentation.

**Found a Bug?** Check console (F12) → Copy error → Report to team.

**Quick Start:** 30 seconds to check status, 5 minutes to configure Google OAuth! 🚀
