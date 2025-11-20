# Booking TMS with Venues v0.01 - Release Notes

## 🎉 Initial Release
**Release Date:** November 8, 2025  
**Version:** 0.01  
**Tag:** `Booking-TMS-with-Venues-0.01`

---

## 📋 Overview
This release introduces a comprehensive multi-venue management system for Booking TMS, allowing users to create and manage multiple venues with independent booking widgets.

---

## ✨ Key Features

### 🏢 Multi-Venue Management
- **Create Multiple Venues**: Support for different venue types (Escape Room, Smash Room, Axe Throwing, Laser Tag, VR Experience, Arcade, etc.)
- **Venue Details**: Complete venue information including name, type, description, address, phone, email, website, and primary color
- **Active/Inactive Status**: Toggle venue availability
- **Venue Statistics**: Dashboard showing total venues, active venues, total events/rooms, and total bookings

### 🎮 Isolated Widget Configurations
- **Separate Widget Config per Venue**: Each venue maintains its own independent configuration
- **Games/Events Management**: Add, edit, and manage games/events specific to each venue
- **Ticket Types**: Configure custom ticket types and pricing per venue
- **Custom Questions**: Set up venue-specific booking questions
- **No Data Conflicts**: Complete data isolation between venues

### ⚙️ Widget Settings
- **Calendar Booking Widget**: Full integration with the calendar widget system
- **Step-by-Step Game Creation**: User-friendly interface for adding events/rooms
- **Live Preview**: Real-time preview of widget appearance
- **Theme Customization**: Venue-specific primary colors and branding

### 📦 Embed & Integration
- **Multiple Embed Options**:
  - Widget Key for identification
  - Preview Link for testing
  - Direct Embed Link
  - Script Embed Code
  - iFrame Embed Code
  
- **Working Features**:
  - Copy to clipboard functionality
  - Open links in new tab
  - Download HTML files with embed code
  - Download iFrame HTML files
  
- **EmbedPreview Component**: Full-featured embed code generator with:
  - Widget configuration
  - Multiple embed methods (iframe, script, React, WordPress)
  - Embed tester
  - Complete documentation
  - Download test pages

### 💾 Auto-Save Functionality
- **Automatic Data Persistence**: All venue data automatically saved to localStorage
- **Real-time Updates**: Changes reflected immediately across the application
- **No Manual Save Required**: Create, edit, and configure venues with automatic persistence

### 📱 Responsive Design
- **Mobile-First**: Fully responsive across all screen sizes
- **Desktop Optimized**: Enhanced layouts for larger screens
- **Full-Screen Dialogs on Mobile**: Optimal mobile experience
- **Adaptive UI Components**: Buttons, forms, and cards adjust to screen size

### 🎨 User Interface
- **Modern Design**: Clean, professional interface following design guidelines
- **Dark Mode Support**: Full dark mode compatibility
- **Intuitive Navigation**: Easy-to-use venue management interface
- **Action Buttons**: Configure, Preview, Embed, and Edit options per venue
- **Toast Notifications**: User feedback for all actions

---

## 🔧 Technical Implementation

### Data Structure
```typescript
interface Venue {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  widgetConfig: any;
  embedKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Storage
- **localStorage Key**: `venues_data`
- **Format**: JSON serialized array of venue objects
- **Automatic Sync**: State and localStorage kept in sync

### Components
- **Venues Page**: Main venue management interface (`src/pages/Venues.tsx`)
- **Calendar Widget Settings**: Configuration interface (`src/components/widgets/CalendarWidgetSettings.tsx`)
- **Calendar Widget**: Preview component (`src/components/widgets/CalendarWidget.tsx`)
- **Embed Preview**: Embed code generator (`src/components/widgets/EmbedPreview.tsx`)

---

## 🚀 Usage

### Creating a Venue
1. Click "Create Venue" button
2. Fill in venue details (name, type, description, contact info)
3. Choose primary color
4. Click "Create Venue"
5. Venue is automatically saved and appears in the list

### Configuring a Venue Widget
1. Click "Configure" on any venue card
2. Add games/events using the step-by-step interface
3. Configure ticket types and pricing
4. Add custom booking questions
5. Changes are automatically saved
6. Click "Save Changes" to close

### Previewing a Venue Widget
1. Click "Preview" on any venue card
2. See live preview of how the widget will appear
3. Test the booking flow
4. Close when done

### Getting Embed Code
1. Click "Embed" on any venue card
2. Choose your preferred embed method:
   - Copy widget key
   - Copy preview link
   - Copy direct embed link
   - Copy script code or iframe code
   - Download HTML test files
3. Use the embed code on your website

---

## 📊 Statistics & Monitoring
- **Total Venues**: Count of all created venues
- **Active Venues**: Count of currently active venues
- **Total Events/Rooms**: Sum of all games across all venues
- **Total Bookings**: Placeholder for future booking integration

---

## 🔒 Data Isolation
Each venue maintains completely separate:
- Widget configuration
- Games/events list
- Ticket types
- Custom questions
- Embed key
- Settings

**No cross-venue data conflicts!**

---

## 🎯 Future Enhancements
- Backend persistence (database integration)
- Real booking tracking per venue
- Analytics and reporting
- Multi-user access control
- Venue templates
- Bulk operations
- Export/import functionality

---

## 📝 Notes
- This is a frontend-only implementation using localStorage
- All data is stored locally in the browser
- For production use, backend integration is recommended
- Embed codes are generated but require actual widget deployment

---

## 🐛 Known Issues
- Pre-existing TypeScript errors in `tsconfig.json` (not related to venues feature)
- Embed URLs are placeholder-based (require actual deployment setup)

---

## 👥 Credits
Developed for Booking TMS  
Version: 0.01  
Release: Initial Multi-Venue Management System

---

## 📞 Support
For questions or issues, please refer to the project documentation or contact the development team.
