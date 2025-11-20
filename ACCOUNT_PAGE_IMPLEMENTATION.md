# Account Page Implementation Guide

## Overview
Comprehensive account management page for all user roles with real Supabase integration.

## ✅ What Was Implemented

### 1. New Account Page (`src/pages/Account.tsx`)

**Features:**
- ✅ Real-time data sync with Supabase
- ✅ Role-based UI and permissions
- ✅ Profile management
- ✅ Password change
- ✅ Notification preferences
- ✅ Responsive design (mobile & desktop)
- ✅ Dark mode support
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

### 2. Supported User Roles

| Role | Badge Color | Icon | Permissions |
|------|-------------|------|-------------|
| **Super Admin** | Purple | 👑 Crown | Full system access |
| **Admin** | Blue | 🛡️ Shield | Organization management |
| **Beta Owner** | Indigo | 💼 Briefcase | Beta program access |
| **Manager** | Green | 👥 Users | Operations management |
| **Staff** | Amber | 👤 User | Daily operations |

### 3. Three Main Tabs

#### **Profile Tab**
- Personal Information
  - First Name
  - Last Name
  - Email (with verification)
  - Phone Number
  - Company/Organization
- Role & Permissions Display
  - Current role badge
  - Permission list based on role
  - Account status

#### **Security Tab**
- Change Password
  - Current password
  - New password
  - Confirm password
  - Show/hide password toggles
  - Validation (min 6 characters)
- Account Status
  - Active/Inactive status
  - Member since date

#### **Notifications Tab**
- Email Notifications toggle
- Push Notifications toggle
- SMS Notifications toggle
- Saved to user metadata

## 🔧 Technical Implementation

### Database Integration

**Tables Used:**
- `user_profiles` - User profile data
- `auth.users` - Authentication data

**Profile Structure:**
```typescript
interface UserProfile {
  id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  metadata: any; // Stores notification preferences
}
```

### Key Functions

#### 1. Load User Profile
```typescript
loadUserProfile()
- Fetches from user_profiles table
- Gets email from auth.users
- Loads notification preferences from metadata
- Creates profile if doesn't exist
```

#### 2. Update Profile
```typescript
handleUpdateProfile()
- Updates user_profiles table
- Updates email in auth (requires verification)
- Shows success toast
- Reloads profile data
```

#### 3. Update Password
```typescript
handleUpdatePassword()
- Validates password length (min 6 chars)
- Validates password match
- Updates via Supabase Auth
- Clears form on success
```

#### 4. Update Notifications
```typescript
handleUpdateNotifications()
- Saves preferences to metadata
- Updates user_profiles table
- Persists across sessions
```

### Auto-Create Profile

If user profile doesn't exist, it's automatically created:
```typescript
createUserProfile()
- Inserts new row in user_profiles
- Sets default role (from currentUser or 'staff')
- Sets status to 'active'
- Initializes empty metadata
```

## 🎨 UI/UX Features

### Profile Header Card
- Large avatar with initials
- Full name display
- Role badge
- Email address
- Company name (if set)
- "Change Photo" button

### Role-Based Permissions Display

**Super Admin / Admin / Beta Owner:**
- ✅ Manage Users
- ✅ Manage Venues
- ✅ Manage Bookings
- ✅ View Reports
- ✅ View Bookings
- ✅ Manage Profile

**Manager:**
- ✅ Manage Bookings
- ✅ View Reports
- ✅ View Bookings
- ✅ Manage Profile

**Staff:**
- ✅ View Bookings
- ✅ Manage Profile

### Responsive Design
- **Mobile**: Stacked layout, full-width inputs
- **Tablet**: 2-column grid for form fields
- **Desktop**: Optimized spacing and layout

### Dark Mode
- Automatic theme detection
- Consistent color scheme
- Proper contrast ratios

## 📝 Usage

### Navigate to Account Page
```typescript
// From anywhere in the app
onNavigate('account')
```

### Access from Header
User can click their profile in the header dropdown to access account settings.

## 🔐 Security Features

1. **Password Requirements**
   - Minimum 6 characters
   - Confirmation required
   - Show/hide toggles

2. **Email Verification**
   - Changing email requires verification
   - Verification email sent automatically
   - User notified via toast

3. **Row Level Security (RLS)**
   - Users can only access their own profile
   - Enforced at database level

## 🧪 Testing

### Test Profile Update
1. Navigate to Account page
2. Update first name, last name, phone
3. Click "Save Changes"
4. Verify toast notification
5. Refresh page - changes should persist

### Test Password Change
1. Go to Security tab
2. Enter new password (min 6 chars)
3. Confirm password
4. Click "Update Password"
5. Verify success toast
6. Try logging in with new password

### Test Notifications
1. Go to Notifications tab
2. Toggle email/push/SMS preferences
3. Click "Save Preferences"
4. Refresh page - preferences should persist

## 🐛 Troubleshooting

### TypeScript Errors
**Issue**: Property 'first_name' does not exist on type 'never'

**Solution**: The Supabase types have been generated. Restart your dev server:
```bash
# Stop current server
# Restart
npm run dev
```

### Profile Not Loading
**Issue**: Profile shows loading forever

**Check**:
1. User is authenticated
2. `user_profiles` table exists
3. RLS policies allow access
4. Network tab for errors

### Can't Update Profile
**Issue**: Save button doesn't work

**Check**:
1. All required fields filled
2. Console for errors
3. Supabase connection
4. RLS policies

## 🚀 Future Enhancements

### Planned Features
- [ ] Avatar upload to Supabase Storage
- [ ] Two-factor authentication (2FA)
- [ ] Activity log (recent logins, changes)
- [ ] Session management (active sessions)
- [ ] API key management
- [ ] Timezone selection
- [ ] Language preferences
- [ ] Export account data

### Role-Specific Features
- [ ] Super Admin: System-wide settings
- [ ] Admin: Organization settings
- [ ] Manager: Team management
- [ ] Staff: Shift preferences

## 📊 Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role VARCHAR CHECK (role IN ('super-admin', 'admin', 'beta-owner', 'manager', 'staff')),
  first_name VARCHAR,
  last_name VARCHAR,
  phone VARCHAR,
  company VARCHAR,
  status VARCHAR DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Metadata Structure
```json
{
  "emailNotifications": true,
  "pushNotifications": true,
  "smsNotifications": false,
  "timezone": "America/New_York",
  "language": "en",
  "lastLogin": "2025-11-09T12:00:00Z"
}
```

## 📱 Mobile Optimization

- Touch-friendly buttons (min 44x44px)
- Stacked form layout
- Full-width inputs
- Larger tap targets
- Optimized spacing
- Responsive tabs

## ♿ Accessibility

- Proper ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast (WCAG AA)
- Form validation messages

## 🎯 Summary

✅ **Implemented:**
- Complete account management page
- Real Supabase integration
- All user roles supported
- Profile, security, and notifications
- Responsive & accessible
- Dark mode support
- Auto-create profiles
- Password management
- Email verification

✅ **Tested:**
- Profile loading
- Profile updates
- Password changes
- Notification preferences
- Role-based permissions

✅ **Production Ready:**
- Error handling
- Loading states
- Toast notifications
- Form validation
- Security best practices

**The Account page is fully functional and ready for all user roles!** 🎉
