# Login Page Documentation

**Version**: 1.0.0  
**Created**: November 4, 2025  
**Location**: `/pages/Login.tsx`

---

## 📋 Overview

The Login page provides role-based authentication for BookingTMS with a clean, modern interface inspired by contemporary SaaS platforms. Users first select their role, then enter credentials.

### Key Features

✅ **Role-Based Login** - 4 distinct user roles with visual differentiation  
✅ **Two-Step Flow** - Role selection → Credentials entry  
✅ **Dark Mode Support** - Full dark mode with 3-tier background system  
✅ **Responsive Design** - Mobile-first, works on all screen sizes  
✅ **Form Validation** - Client-side validation with clear error messages  
✅ **Demo Mode** - Pre-filled credentials for testing  
✅ **Accessibility** - Keyboard navigation and ARIA labels  
✅ **Loading States** - Visual feedback during authentication  
✅ **Error Handling** - User-friendly error messages  

---

## 🎨 Design System Compliance

### Colors (Light Mode)
```tsx
Background: bg-white
Text Primary: text-gray-900
Text Secondary: text-gray-600
Input Background: bg-gray-100
Input Border: border-gray-300
Card Border: border-gray-200
Primary Button: bg-[#4f46e5]
```

### Colors (Dark Mode)
```tsx
Background: bg-[#1e1e1e] (Level 3 - Modal)
Text Primary: text-white
Text Secondary: text-gray-400
Input Background: bg-[#161616] (Level 2)
Input Border: border-gray-700
Card Border: border-gray-700
Primary Button: bg-[#4f46e5]
```

### 3-Tier Background System (Dark Mode)
- **Overlay**: `bg-black/50` - Semi-transparent backdrop
- **Modal**: `bg-[#1e1e1e]` - Elevated surface (Level 3)
- **Inputs**: `bg-[#161616]` - Nested elements (Level 2)

---

## 🎯 User Roles

### 1. Super Admin
- **Icon**: Shield (purple)
- **Color**: `#8b5cf6` (dark) / `#7c3aed` (light)
- **Access**: Full system access + user management
- **Demo Credentials**: superadmin / demo123

### 2. Admin
- **Icon**: UserCog (blue)
- **Color**: `#3b82f6` (dark) / `#2563eb` (light)
- **Access**: Full operational access
- **Demo Credentials**: admin / demo123

### 3. Manager
- **Icon**: Users (green)
- **Color**: `#10b981` (dark) / `#059669` (light)
- **Access**: View and limited edit access
- **Demo Credentials**: manager / demo123

### 4. Staff
- **Icon**: User (amber)
- **Color**: `#f59e0b` (dark) / `#d97706` (light)
- **Access**: Basic view-only access
- **Demo Credentials**: staff / demo123

---

## 🔄 User Flow

### Step 1: Role Selection
```
1. User opens login page
2. Sees 4 role options with descriptions
3. Clicks desired role button
4. Transitions to credentials form
```

### Step 2: Credentials Entry
```
1. Username field appears
2. Password field appears
3. User enters credentials
4. Clicks "Sign In" button
5. System validates input
6. On success: Redirects to dashboard
7. On error: Shows error message
```

### Navigation
```
- "Back to Role Selection" button returns to Step 1
- "Forgot your password?" shows coming soon message
- Terms/Privacy links show info toasts
- X button closes modal (goes back in history)
```

---

## 💻 Technical Implementation

### Component Structure

```tsx
Login.tsx
├── State Management
│   ├── selectedRole (UserRole | null)
│   ├── username (string)
│   ├── password (string)
│   ├── loading (boolean)
│   └── errors (object)
├── Role Selection View
│   ├── 4 Role Buttons
│   └── Demo Access Info
└── Login Form View
    ├── Username Input
    ├── Password Input
    ├── Sign In Button
    ├── Back Button
    └── Forgot Password Link
```

### Key Functions

#### `handleRoleSelect(role)`
```typescript
// Sets selected role and clears errors
setSelectedRole(role);
setErrors({});
```

#### `handleBack()`
```typescript
// Returns to role selection, clears form
setSelectedRole(null);
setUsername('');
setPassword('');
setErrors({});
```

#### `validateForm()`
```typescript
// Validates username and password
// Returns true if valid, false otherwise
// Sets errors object with validation messages
```

#### `handleLogin(e)`
```typescript
// Prevents default form submission
// Validates form
// Calls AuthContext login method
// Shows success/error toast
// Redirects to dashboard on success
```

---

## 🔌 Integration with AuthContext

### Login Method
```typescript
const { login } = useAuth();

await login(username, password, selectedRole);
```

### Expected Behavior
1. AuthContext receives credentials and role
2. Validates against backend/Supabase
3. Sets currentUser in context
4. Stores JWT token (if applicable)
5. Updates authentication state
6. Component redirects to dashboard

### Error Handling
```typescript
try {
  await login(username, password, selectedRole);
  toast.success('Successfully logged in');
  navigate('/dashboard');
} catch (error) {
  toast.error('Invalid username or password');
}
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Visual Testing
- [ ] Login page displays correctly in light mode
- [ ] Login page displays correctly in dark mode
- [ ] All 4 role buttons render with correct icons and colors
- [ ] Modal is centered and responsive
- [ ] Typography is readable and properly sized
- [ ] Icons are the correct size and color

#### Functional Testing
- [ ] Clicking role button transitions to form
- [ ] Username field accepts input
- [ ] Password field masks input
- [ ] Validation shows errors for empty fields
- [ ] Validation shows error for short password
- [ ] "Back" button returns to role selection
- [ ] Form clears when going back
- [ ] "Sign In" button triggers login
- [ ] Loading state shows during authentication
- [ ] Success redirects to dashboard
- [ ] Error shows toast notification

#### Responsive Testing
- [ ] Works at 375px (mobile)
- [ ] Works at 768px (tablet)
- [ ] Works at 1024px+ (desktop)
- [ ] Modal doesn't overflow viewport
- [ ] Buttons are easy to tap on mobile

#### Accessibility Testing
- [ ] Tab navigation works through all elements
- [ ] Enter key submits form
- [ ] Escape key closes modal
- [ ] Screen reader announces role buttons
- [ ] Form errors are announced
- [ ] Focus indicators are visible

### Demo Credentials

For testing, use these pre-configured credentials:

| Role | Username | Password |
|------|----------|----------|
| Super Admin | superadmin | demo123 |
| Admin | admin | demo123 |
| Manager | manager | demo123 |
| Staff | staff | demo123 |

---

## 🚀 Usage

### Accessing the Login Page

#### Option 1: Query Parameter
```
http://localhost:3000/?login
```

#### Option 2: Direct Path (when routing is configured)
```
http://localhost:3000/login
```

### From Code
```tsx
// Navigate to login
navigate('/login');

// Or open in new tab
window.open('/?login', '_blank');
```

---

## 🎨 Customization

### Changing Role Colors
```typescript
// In the roles array
{
  id: 'super-admin',
  label: 'Super Admin Login',
  icon: Shield,
  color: isDark ? '#8b5cf6' : '#7c3aed', // Change these
}
```

### Adding New Role
```typescript
const roles = [
  // ... existing roles
  {
    id: 'new-role' as UserRole,
    label: 'New Role Login',
    description: 'Description here',
    icon: YourIcon,
    color: isDark ? '#yourDarkColor' : '#yourLightColor',
  },
];
```

### Changing Modal Size
```tsx
// In modal div
className="... max-w-md ..." // Change to max-w-lg, max-w-xl, etc.
```

---

## 🔒 Security Considerations

### Current Implementation (Demo)
⚠️ **WARNING**: Current implementation is for DEMO purposes only

**What's NOT secure:**
- Passwords are not hashed
- No actual backend validation
- Demo credentials are hardcoded
- No rate limiting
- No session management
- No CSRF protection

### Production Requirements

#### Must Implement:
1. **Backend Validation**
   ```typescript
   // Call actual authentication API
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username, password, role })
   });
   ```

2. **Password Hashing**
   - Never store plain text passwords
   - Use bcrypt or similar on backend
   - Minimum 12 character requirement

3. **Rate Limiting**
   - Limit login attempts (5 per 15 minutes)
   - Lock account after failed attempts
   - CAPTCHA after 3 failed attempts

4. **Session Management**
   - Use JWT tokens or sessions
   - Implement refresh tokens
   - Set appropriate expiration times

5. **HTTPS Only**
   - Never transmit credentials over HTTP
   - Enforce HTTPS in production
   - Use secure cookies

6. **Input Sanitization**
   - Validate and sanitize all inputs
   - Prevent SQL injection
   - Prevent XSS attacks

7. **Logging & Monitoring**
   - Log all authentication attempts
   - Monitor for suspicious activity
   - Alert on brute force attempts

---

## 🐛 Troubleshooting

### Issue: Login button doesn't work
**Solution**: Check that AuthContext is properly configured and the login method exists.

### Issue: Dark mode not working
**Solution**: Verify ThemeContext is wrapped around the component in App.tsx.

### Issue: Validation doesn't show
**Solution**: Check that errors state is being set and rendered correctly.

### Issue: Redirect doesn't work after login
**Solution**: Ensure react-router-dom is configured and navigate is imported from useNavigate.

### Issue: Demo credentials don't work
**Solution**: Verify AuthContext.login() method accepts and handles demo credentials.

### Issue: Modal not centered on mobile
**Solution**: Check viewport height and padding, ensure `items-center justify-center` classes are present.

---

## 📝 File Dependencies

### Required Components
- `@/components/ui/input` - Input field component
- `@/components/ui/label` - Label component
- `@/components/ui/button` - Button component
- `@/components/layout/ThemeContext` - Theme management
- `@/lib/auth/AuthContext` - Authentication state

### Required Libraries
- `react` - useState, FormEvent
- `react-router-dom` - useNavigate
- `lucide-react` - Icons (X, Shield, UserCog, Users, User)
- `sonner` - Toast notifications

### Type Definitions
```typescript
type UserRole = 'super-admin' | 'admin' | 'manager' | 'staff' | null;
```

---

## 🔄 Future Enhancements

### Phase 1 (Near-term)
- [ ] Connect to Supabase Auth backend
- [ ] Implement real password validation
- [ ] Add "Remember Me" checkbox
- [ ] Add password visibility toggle
- [ ] Implement rate limiting
- [ ] Add CAPTCHA after failed attempts

### Phase 2 (Medium-term)
- [ ] Add two-factor authentication (2FA)
- [ ] Implement password reset flow
- [ ] Add social login (Google, Microsoft)
- [ ] Session management improvements
- [ ] Audit log for login attempts
- [ ] Biometric authentication (fingerprint, face)

### Phase 3 (Long-term)
- [ ] Single Sign-On (SSO) support
- [ ] LDAP/Active Directory integration
- [ ] Magic link authentication
- [ ] Passwordless authentication
- [ ] Multi-device session management

---

## 📊 Metrics & Analytics

### Track These Events
1. **Role Selection**
   - Which roles are most commonly selected
   - Time spent on role selection screen

2. **Login Attempts**
   - Success rate by role
   - Failed login attempts
   - Time to successful login

3. **User Behavior**
   - "Forgot password" clicks
   - "Back" button usage
   - Form abandonment rate

4. **Performance**
   - Page load time
   - API response time
   - Error rate

---

## ✅ Completion Checklist

### Design
- [x] Dark mode support implemented
- [x] Responsive design (mobile-first)
- [x] Follows design system colors
- [x] Uses 3-tier background system
- [x] Icons and colors for each role
- [x] Professional, modern UI

### Functionality
- [x] Role selection flow
- [x] Credentials entry form
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] Demo credentials
- [x] Navigation (back button)
- [x] Integration with AuthContext

### Accessibility
- [x] Keyboard navigation
- [x] ARIA labels
- [x] Focus indicators
- [x] Error announcements
- [x] Touch targets ≥44px

### Documentation
- [x] Complete documentation file
- [x] Usage examples
- [x] Security considerations
- [x] Troubleshooting guide
- [x] Future enhancements

---

## 📞 Support

**Questions?** Review:
1. This documentation
2. `/lib/auth/README.md` - Auth system docs
3. `/guidelines/DESIGN_SYSTEM.md` - Design system
4. `/frontend/QUICK_START.md` - Component patterns

---

**Last Updated**: November 4, 2025  
**Maintained By**: BookingTMS Development Team  
**Status**: ✅ Complete - Ready for Supabase Integration
