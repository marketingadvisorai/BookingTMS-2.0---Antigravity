# Notification Settings Testing Guide

## Testing User-Specific Notification Settings

### Prerequisites
- Development server is running on http://localhost:3004
- Multiple test user accounts available

### Test User Credentials
- **Super Admin**: username: `superadmin`, password: `demo123`
- **Admin**: username: `admin`, password: `demo123`
- **Manager**: username: `manager`, password: `demo123`
- **Staff**: username: `staff`, password: `demo123`

### Testing Steps

#### 1. Test User-Specific Storage
1. Open browser to http://localhost:3004
2. Login as **superadmin**
3. Navigate to **Settings** → **Notifications**
4. Change some notification settings (e.g., enable/disable sound notifications, change volume)
5. Click **"Save Notification Settings"**
6. Verify success toast appears

#### 2. Verify Different Users Have Separate Settings
1. **Logout** from superadmin account
2. Login as **admin** (different user)
3. Navigate to **Settings** → **Notifications**
4. Verify the settings are **different** from superadmin's settings (should be defaults)
5. Change admin's settings to different values
6. Save admin's settings

#### 3. Verify Settings Persist Per User
1. **Logout** from admin account
2. Login back as **superadmin**
3. Navigate to **Settings** → **Notifications**
4. Verify superadmin's previous settings are still saved
5. **Logout** and login as **admin**
6. Verify admin's settings are still saved and different from superadmin's

#### 4. Test All User Roles
Repeat the above steps for:
- **Manager** role
- **Staff** role

Each role should maintain its own notification settings independently.

### Expected Behavior
- ✅ Each user has their own notification settings storage
- ✅ Settings persist when logging out and back in
- ✅ Different users can have different notification preferences
- ✅ Settings work for all user roles (super-admin, admin, manager, staff)
- ✅ Toast notifications confirm successful saves
- ✅ UI updates to reflect saved settings

### Technical Implementation Details
- Settings are stored in localStorage with keys like: `notificationSettings_userId`
- Guest users (not logged in) use key: `notificationSettings_guest`
- When user changes, settings automatically reload for that user
- NotificationProvider is wrapped inside AuthProvider to ensure proper access

### Verification in Browser Console
Open browser console and run:
```javascript
// Check current user's notification settings
const currentUser = JSON.parse(localStorage.getItem('currentUserId'));
console.log('Current user:', currentUser);
console.log('User settings:', JSON.parse(localStorage.getItem(`notificationSettings_${currentUser}`)));

// List all notification settings in localStorage
Object.keys(localStorage).filter(key => key.startsWith('notificationSettings_')).forEach(key => {
  console.log(key, JSON.parse(localStorage.getItem(key)));
});
```

## Features Working

### Notification Settings Categories
1. **Sound Notifications**
   - Master sound toggle
   - Volume control (0-100%)
   - Test sound button
   - Event-specific sounds (bookings, payments, cancellations)

2. **Push Notifications**
   - Desktop/browser notifications
   - New booking alerts
   - Staff updates

3. **Email Notifications**
   - Booking notifications
   - Reports & analytics
   - Marketing & updates

4. **SMS Notifications**
   - Critical alerts
   - Phone number configuration

5. **Quiet Hours**
   - Enable/disable quiet hours
   - Start/end time configuration
   - Do Not Disturb functionality

6. **Additional Preferences**
   - In-app notifications toggle
   - Group similar notifications

### User Roles Tested
- ✅ Super Admin
- ✅ Admin
- ✅ Manager
- ✅ Staff

All notification settings now work properly and are saved per user!