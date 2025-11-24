# Notification System Quick Reference

**Quick access guide for developers working with the BookingTMS notification system**

---

## 📋 Table of Contents
1. [Basic Usage](#basic-usage)
2. [Available Notification Types](#available-notification-types)
3. [User Settings](#user-settings)
4. [Components](#components)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Basic Usage

### Import the Context
```tsx
import { useNotifications } from '@/lib/notifications/NotificationContext';
```

### Access Notification State
```tsx
function MyComponent() {
  const { 
    notifications,      // Array of all notifications
    unreadCount,        // Number of unread notifications
    settings,           // User settings object
    markAsRead,         // Function to mark notification as read
    markAllAsRead,      // Function to mark all as read
    deleteNotification, // Function to delete a notification
    clearAll,           // Function to clear all notifications
    updateSettings,     // Function to update settings
    playNotificationSound // Function to play notification sound
  } = useNotifications();

  return (
    <div>
      <Badge>{unreadCount}</Badge>
    </div>
  );
}
```

---

## 📬 Available Notification Types

### Type Reference
```typescript
type NotificationType = 
  | 'booking'        // Booking-related (new, modified, check-in)
  | 'payment'        // Payment-related (received, failed, refund)
  | 'cancellation'   // Booking cancellation
  | 'message'        // Messages and inquiries
  | 'staff'          // Staff-related (shifts, assignments)
  | 'system';        // System alerts and maintenance

type NotificationPriority = 'low' | 'medium' | 'high';
```

### Complete Type List (12 Subtypes)
1. **booking** - Booking Received (high priority)
2. **booking** - Booking Modified (medium priority)
3. **booking** - Booking Check-in (medium priority)
4. **payment** - Payment Received (high priority)
5. **payment** - Payment Failed (high priority)
6. **payment** - Refund Processed (medium priority)
7. **cancellation** - Booking Cancelled (high priority)
8. **message** - Customer Inquiry (high priority)
9. **message** - New Chat Message (medium priority)
10. **staff** - Shift Reminder (medium priority)
11. **system** - System Maintenance (low priority)
12. **system** - System Alert (high priority)

---

## ⚙️ User Settings

### Settings Object Structure
```typescript
interface NotificationSettings {
  // Sound Notifications
  soundEnabled: boolean;
  soundVolume: number; // 0-100
  soundForBookings: boolean;
  soundForPayments: boolean;
  soundForCancellations: boolean;
  soundForMessages: boolean;

  // Desktop Notifications
  desktopEnabled: boolean;
  desktopForBookings: boolean;
  desktopForPayments: boolean;
  desktopForCancellations: boolean;
  desktopForMessages: boolean;

  // Email & SMS
  emailEnabled: boolean;
  smsEnabled: boolean;
  smsPhoneNumber: string;

  // Quiet Hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "08:00"

  // In-App
  showInAppNotifications: boolean;
}
```

### Update Settings
```tsx
// Update multiple settings at once
updateSettings({
  soundEnabled: true,
  soundVolume: 75,
  emailEnabled: false
});

// Settings automatically saved to localStorage
```

### Check Settings
```tsx
const { settings } = useNotifications();

if (settings.soundEnabled) {
  playNotificationSound();
}

if (settings.quietHoursEnabled) {
  // Check if in quiet hours before showing notification
}
```

---

## 🧩 Components

### 1. NotificationCenter (Bell Icon Dropdown)
**Location**: `/components/notifications/NotificationCenter.tsx`  
**Used In**: Header component

```tsx
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

// Already integrated in Header.tsx
<NotificationCenter />
```

**Features**:
- Bell icon with unread count badge
- Dropdown with last 5 notifications
- Quick actions (mark as read, delete)
- "View All" link to Notifications page
- Dark mode support

### 2. Notifications Page
**Location**: `/pages/Notifications.tsx`  
**Route**: `/notifications`

```tsx
// Navigate to notifications page
<Link href="/notifications">View All Notifications</Link>
```

**Features**:
- Full list of notifications
- Filter by type (All, Bookings, Payments, etc.)
- Search notifications
- Bulk actions (Mark all read, Clear all)
- Priority indicators
- Action buttons with metadata
- Empty state
- Dark mode support

### 3. NotificationSettings Panel
**Location**: `/components/notifications/NotificationSettings.tsx`  
**Used In**: Account Settings page

```tsx
import { NotificationSettings } from '@/components/notifications/NotificationSettings';

// In Account Settings
<TabsContent value="notifications">
  <NotificationSettings />
</TabsContent>
```

**Features**:
- All user controls
- Staged save workflow (pending changes)
- Cancel/Save buttons
- Test sound button
- Quiet hours scheduling
- Dark mode support

---

## 🎯 Common Patterns

### Pattern 1: Show Toast on New Notification
```tsx
import { toast } from 'sonner';
import { useNotifications } from '@/lib/notifications/NotificationContext';

function MyComponent() {
  const { settings } = useNotifications();

  // This happens automatically in NotificationContext
  // But you can manually trigger:
  const showNotification = (notification: Notification) => {
    if (settings.showInAppNotifications) {
      toast.success(notification.title, {
        description: notification.message,
      });
    }
  };
}
```

### Pattern 2: Play Sound on Event
```tsx
function BookingCreated() {
  const { settings, playNotificationSound } = useNotifications();

  const handleBookingCreated = () => {
    // Create booking...
    
    // Play sound if enabled
    if (settings.soundEnabled && settings.soundForBookings) {
      playNotificationSound();
    }
  };
}
```

### Pattern 3: Check Quiet Hours
```tsx
function NotificationHelper() {
  const { settings } = useNotifications();

  const isQuietHours = () => {
    if (!settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = settings.quietHoursStart;
    const end = settings.quietHoursEnd;

    // Handle overnight (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    return currentTime >= start && currentTime <= end;
  };

  const shouldNotify = !isQuietHours();
}
```

### Pattern 4: Filter Notifications by Type
```tsx
function BookingNotifications() {
  const { notifications } = useNotifications();

  const bookingNotifications = notifications.filter(
    n => n.type === 'booking'
  );

  const highPriorityNotifications = notifications.filter(
    n => n.priority === 'high'
  );
}
```

### Pattern 5: Request Desktop Notification Permission
```tsx
function RequestPermissionButton() {
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser does not support notifications');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast.success('Desktop notifications enabled');
      }
    }
  };

  return <Button onClick={requestPermission}>Enable Desktop Notifications</Button>;
}
```

### Pattern 6: Show Desktop Notification
```tsx
function showDesktopNotification(notification: Notification) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  new Notification(notification.title, {
    body: notification.message,
    icon: '/notification-icon.png',
    badge: '/notification-badge.png',
    tag: notification.id,
  });
}
```

---

## 🛠️ Troubleshooting

### Issue: Settings Not Persisting
**Cause**: LocalStorage not saving properly  
**Solution**:
```tsx
// Check if localStorage is available
if (typeof window !== 'undefined') {
  localStorage.setItem('notificationSettings', JSON.stringify(settings));
}

// Check if settings are loading
const saved = localStorage.getItem('notificationSettings');
console.log('Saved settings:', saved);
```

### Issue: Sound Not Playing
**Cause**: Browser requires user interaction before playing audio  
**Solution**:
- Sound will only play after user interacts with page
- Test button provides initial interaction
- Check browser console for audio errors

```tsx
// Debug sound
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('AudioContext created:', audioContext);
    // ... rest of sound code
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};
```

### Issue: Notifications Not Appearing
**Cause**: Quiet hours enabled or in-app notifications disabled  
**Solution**:
```tsx
// Check settings
const { settings } = useNotifications();
console.log('Sound enabled:', settings.soundEnabled);
console.log('In-app enabled:', settings.showInAppNotifications);
console.log('Quiet hours:', settings.quietHoursEnabled);
```

### Issue: Desktop Notifications Not Working
**Cause**: Permission not granted  
**Solution**:
```tsx
// Check permission status
console.log('Notification permission:', Notification.permission);

// Request permission
if (Notification.permission === 'default') {
  Notification.requestPermission();
}
```

### Issue: Duplicate Toasts
**Cause**: Multiple toast calls  
**Solution**: Ensure only one source triggers toasts (NotificationContext OR component, not both)

```tsx
// ✅ CORRECT - Toast in component only
const handleSave = () => {
  updateSettings(pendingSettings); // No toast here
  toast.success('Settings saved'); // Toast here
};

// ❌ WRONG - Duplicate toasts
const handleSave = () => {
  updateSettings(pendingSettings); // Shows toast
  toast.success('Settings saved'); // Shows another toast
};
```

### Issue: Settings Not Syncing After Save
**Cause**: useEffect missing dependency  
**Solution**:
```tsx
// ✅ CORRECT
React.useEffect(() => {
  setPendingSettings(settings);
  setHasChanges(false);
}, [settings]); // Include settings dependency

// ❌ WRONG
React.useEffect(() => {
  setPendingSettings(settings);
  setHasChanges(false);
}, []); // Empty array only runs once
```

---

## 📚 Additional Resources

### Documentation Files
- `/NOTIFICATION_SYSTEM_COMPLETE.md` - Complete system overview
- `/NOTIFICATION_SETTINGS_WORKING_FIX.md` - Detailed bug fix guide
- `/NOTIFICATION_SYSTEM_ROUTER_FIX.md` - Router integration
- `/guidelines/Guidelines.md` - Main guidelines (see v3.2.2)

### Type Definitions
- `/types/notifications.ts` - Full type definitions

### Example Implementations
- `/components/notifications/NotificationCenter.tsx` - Dropdown component
- `/components/notifications/NotificationSettings.tsx` - Settings panel
- `/pages/Notifications.tsx` - Full page implementation
- `/lib/notifications/NotificationContext.tsx` - Context implementation

### Mock Data
- `/lib/notifications/mockData.ts` - Example notifications for testing

---

## 🎓 Best Practices

### 1. Always Check Settings Before Notifications
```tsx
const { settings } = useNotifications();

if (settings.soundEnabled && settings.soundForBookings) {
  playNotificationSound();
}
```

### 2. Use Proper Notification Types
```tsx
// ✅ CORRECT - Use specific type
const notification = {
  type: 'booking' as const,
  priority: 'high' as const,
  // ...
};

// ❌ WRONG - String literals without const
const notification = {
  type: 'booking',
  priority: 'high',
  // ...
};
```

### 3. Provide Actionable Notifications
```tsx
// ✅ CORRECT - With action URL and label
const notification = {
  title: 'New Booking',
  message: 'John booked Escape Room A',
  actionUrl: '/bookings/BK-12345',
  actionLabel: 'View Booking',
  // ...
};
```

### 4. Use Appropriate Priority Levels
```tsx
// High priority: Requires immediate attention
{ priority: 'high' } // Payment failed, booking cancelled

// Medium priority: Important but not urgent
{ priority: 'medium' } // Booking modified, refund processed

// Low priority: Informational
{ priority: 'low' } // System maintenance scheduled
```

### 5. Handle Quiet Hours Properly
```tsx
// Check quiet hours before showing notifications
if (!isQuietHours() && settings.soundEnabled) {
  playNotificationSound();
}
```

---

## 🔗 Quick Links

- **Main Guidelines**: `/guidelines/Guidelines.md`
- **Design System**: `/guidelines/DESIGN_SYSTEM.md`
- **Component Library**: `/guidelines/COMPONENT_LIBRARY.md`
- **Project Status**: `/PROJECT_STATUS_SUMMARY.md`

---

**Last Updated**: November 3, 2025  
**Version**: 3.2.2  
**Status**: Production Ready ✅
