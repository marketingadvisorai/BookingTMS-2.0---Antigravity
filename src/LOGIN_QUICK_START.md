# Login Page - Quick Start Guide

**⚡ Fast reference for using the new login page**

---

## 🚀 How to Access

### Option 1: Add Query Parameter ✅ **EASIEST**
```
http://localhost:3000/?login
```

### Option 2: Direct URL (when routing configured)
```
http://localhost:3000/login
```

---

## 🎯 Demo Credentials

**For Testing - Use these credentials:**

| Role | Username | Password |
|------|----------|----------|
| 🛡️ **Super Admin** | `superadmin` | `demo123` |
| 👨‍💼 **Admin** | `admin` | `demo123` |
| 👥 **Manager** | `manager` | `demo123` |
| 👤 **Staff** | `staff` | `demo123` |

---

## 🎨 Features at a Glance

✅ **4 Role Types** - Select your role first, then login  
✅ **Dark Mode** - Fully supports dark/light theme  
✅ **Responsive** - Works on mobile, tablet, desktop  
✅ **Auto-fill Demo** - Click role to see demo credentials  
✅ **Form Validation** - Real-time error checking  
✅ **Loading States** - Visual feedback during login  

---

## 🔄 Login Flow

```
1. Open /?login
   ↓
2. See 4 role buttons (Super Admin, Admin, Manager, Staff)
   ↓
3. Click your role
   ↓
4. Enter username and password
   ↓
5. Click "Sign In"
   ↓
6. Redirected to Dashboard
```

---

## 🎨 What It Looks Like

### Role Selection Screen
```
┌─────────────────────────────────────┐
│  Log in to BookingTMS            ×  │
│  Manage your bookings, customers... │
├─────────────────────────────────────┤
│                                     │
│  🛡️  Super Admin Login              │
│     Full system access + user mgmt  │
│                                     │
│  👨‍💼  Admin Login                    │
│     Full operational access         │
│                                     │
│  👥  Manager Login                  │
│     View and limited edit access    │
│                                     │
│  👤  Staff Login                    │
│     Basic view-only access          │
│                                     │
│  ──── Demo Access ────              │
│                                     │
│  Testing Mode: Click any role      │
│  • Super Admin: superadmin/demo123 │
│  • Admin: admin/demo123            │
│  • Manager: manager/demo123        │
│  • Staff: staff/demo123            │
│                                     │
├─────────────────────────────────────┤
│  By continuing, you agree to our    │
│  Terms and have read our Privacy... │
└─────────────────────────────────────┘
```

### Login Form Screen (after selecting role)
```
┌─────────────────────────────────────┐
│  Enter your credentials          ×  │
│  Sign in as Super Admin             │
├─────────────────────────────────────┤
│                                     │
│  Username                           │
│  ┌─────────────────────────────┐   │
│  │ Enter your username         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Password                           │
│  ┌─────────────────────────────┐   │
│  │ ••••••••                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Sign In              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Back to Role Selection     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Forgot your password?              │
│                                     │
├─────────────────────────────────────┤
│  By continuing, you agree to our... │
└─────────────────────────────────────┘
```

---

## 🧪 Quick Test

**1. Open login page:**
```
http://localhost:3000/?login
```

**2. Click "Super Admin Login"**

**3. Enter credentials:**
- Username: `superadmin`
- Password: `demo123`

**4. Click "Sign In"**

**5. You should see:**
- ✅ Success toast: "Successfully logged in as Super Admin Login"
- ✅ Redirect to Dashboard

---

## 🎨 Color Guide

### Light Mode
- Background: White
- Input: Light gray (#f3f4f6)
- Text: Dark gray (#111827)
- Primary Button: Indigo (#4f46e5)

### Dark Mode
- Background: Dark gray (#1e1e1e)
- Input: Darker gray (#161616)
- Text: White
- Primary Button: Indigo (#4f46e5)

### Role Colors
- 🛡️ Super Admin: Purple (#8b5cf6)
- 👨‍💼 Admin: Blue (#3b82f6)
- 👥 Manager: Green (#10b981)
- 👤 Staff: Amber (#f59e0b)

---

## 🔧 Integration Points

### AuthContext Integration
```typescript
// The login function is called like this:
const { login } = useAuth();
await login(username, password, selectedRole);
```

### After Login
```typescript
// On success:
- Sets currentUser in AuthContext
- Stores user role
- Redirects to /dashboard
- Shows success toast

// On error:
- Shows error toast
- Keeps user on login page
- Clears password field
```

---

## ⚡ Quick Customization

### Change Modal Size
```tsx
// In Login.tsx, line ~57
className="... max-w-md ..." // Change to max-w-lg or max-w-xl
```

### Change Primary Color
```tsx
// In Login.tsx, find all instances of:
bg-[#4f46e5] // Change to your color
hover:bg-[#4338ca] // Change to darker shade
```

### Add New Role
```tsx
// In Login.tsx, roles array:
{
  id: 'your-role' as UserRole,
  label: 'Your Role Login',
  description: 'Your description',
  icon: YourIcon, // from lucide-react
  color: isDark ? '#yourColor' : '#yourColor',
}
```

---

## 🐛 Common Issues

### Login page doesn't show
**Fix**: Make sure you're using `/?login` in the URL

### Dark mode not working
**Fix**: Toggle theme in header after login, or check ThemeContext

### Can't login
**Fix**: Use demo credentials exactly as shown (case-sensitive)

### Form validation fails
**Fix**: Username must not be empty, password minimum 6 characters

### Redirect doesn't work
**Fix**: Check App.tsx has proper routing setup

---

## 📝 Next Steps

After login page works:

1. **Connect to Supabase**
   - See `/SUPABASE_QUICK_START.md`
   - Update AuthContext to use real auth

2. **Add Password Reset**
   - Create reset password page
   - Add email sending logic

3. **Add 2FA**
   - Implement two-factor authentication
   - Add SMS/Email verification

4. **Session Management**
   - Add JWT token handling
   - Implement refresh tokens

---

## 📚 Full Documentation

For complete details, see:
- **Full Docs**: `/LOGIN_PAGE_DOCUMENTATION.md`
- **Auth System**: `/lib/auth/README.md`
- **Design System**: `/guidelines/DESIGN_SYSTEM.md`

---

**Created**: November 4, 2025  
**Status**: ✅ Ready to Use  
**Demo Mode**: Active (use demo credentials)
