# Venue Management System - User Guide

## 📋 Overview

The Venue Management System allows you to create and manage multiple venues (Escape Rooms, Smash Rooms, Axe Throwing, etc.) with individual Calendar Booking Widgets for each venue.

## ✨ Key Features

### 1. **Multi-Venue Support**
- Create unlimited venues with different types
- Each venue has its own booking widget configuration
- Separate branding and settings per venue

### 2. **Venue Types Available**
- 🔐 Escape Room
- 💥 Smash Room
- 🪓 Axe Throwing
- 🔫 Laser Tag
- 🥽 VR Experience
- 🎮 Arcade
- 🏢 Other

### 3. **Calendar Widget Integration**
- Each venue uses the Calendar Booking Widget
- Built-in game/event creation wizard
- Full customization per venue

### 4. **Individual Configurations**
- Unique embed codes for each venue
- Custom brand colors
- Separate event/room management
- Independent ticket pricing

## 🚀 Getting Started

### Step 1: Access Venue Management
1. Open your Booking TMS dashboard
2. Click on **"Venues"** in the left sidebar menu (Building icon)
3. You'll see the Venue Management page

### Step 2: Create Your First Venue

1. **Click "Create Venue" button**
2. **Fill in venue details:**
   - **Venue Name*** (Required): e.g., "Downtown Escape Room"
   - **Venue Type***: Select from dropdown (Escape Room, Smash Room, etc.)
   - **Description**: Brief description of your venue
   - **Address**: Physical location
   - **Phone**: Contact number
   - **Email**: Contact email
   - **Website**: Your venue website URL
   - **Brand Color**: Choose your primary color (used in widget)

3. **Click "Create Venue"**

### Step 3: Configure Your Widget

After creating a venue, you'll see it in the venue grid. Each venue card has action buttons:

#### **Configure Button** (Settings Icon)
- Opens the Calendar Widget Settings
- **Add Events/Rooms** using the built-in wizard:
  - Event name and description
  - Pricing (adult/child)
  - Duration and difficulty
  - Operating hours
  - Images and gallery
  - Waivers and policies
- **Configure ticket types**
- **Set cancellation policies**
- **Add custom questions**

#### **Preview Button** (Eye Icon)
- See how your widget looks
- Test the booking flow
- View with your brand colors

#### **Embed Button** (Code Icon)
- Get your unique widget key
- Copy embed code for your website
- Instructions for HTML, React, and WordPress

#### **Edit Button** (Pencil Icon)
- Update venue information
- Change brand colors
- Modify contact details

## 📊 Dashboard Stats

The Venue Management page shows:
- **Total Venues**: Number of venues created
- **Active Venues**: Currently active venues
- **Widgets Created**: Total widgets generated
- **Total Events**: Sum of all events across venues

## 🎨 Design Guidelines

### User-Friendly Features

1. **Visual Venue Cards**
   - Emoji icons for quick identification
   - Color-coded by brand color
   - Status badges (Active/Inactive)
   - Quick stats display

2. **Intuitive Actions**
   - Clear button labels with icons
   - Organized in logical groups
   - Confirmation dialogs for destructive actions

3. **Responsive Design**
   - Works on desktop, tablet, and mobile
   - Adaptive layouts
   - Touch-friendly buttons

4. **Dark Mode Support**
   - Automatic theme switching
   - Consistent styling across modes

### Best Practices

1. **Naming Conventions**
   - Use descriptive venue names
   - Include location if you have multiple venues
   - Example: "Downtown Escape Room" vs "Westside Escape Room"

2. **Brand Colors**
   - Choose colors that match your venue's branding
   - Ensure good contrast for readability
   - Test in both light and dark modes

3. **Event Configuration**
   - Add high-quality images
   - Write clear descriptions
   - Set accurate pricing and duration
   - Include all necessary policies

## 🔧 Widget Configuration Details

### Calendar Widget Features

Each venue's widget includes:

1. **Event/Room Management**
   - Add unlimited events/rooms
   - Rich media support (images, videos)
   - Detailed descriptions and FAQs
   - Difficulty ratings and success rates

2. **Booking Settings**
   - Operating days and hours
   - Time slot intervals
   - Advance booking windows
   - Cancellation policies

3. **Pricing Options**
   - Multiple ticket types
   - Adult and child pricing
   - Group discounts
   - Veteran discounts (optional)

4. **Customer Information**
   - Custom questions
   - Required fields
   - Contact information collection

## 📝 Embed Code Usage

### HTML Websites
```html
<!-- Booking Widget for Your Venue -->
<div id="booking-widget-[VENUE_KEY]"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://yourdomain.com/widget.js';
    script.setAttribute('data-venue-key', '[VENUE_KEY]');
    script.setAttribute('data-widget-type', 'calendar');
    script.setAttribute('data-primary-color', '#2563eb');
    script.async = true;
    document.getElementById('booking-widget-[VENUE_KEY]').appendChild(script);
  })();
</script>
```

### React Applications
```jsx
import { useEffect } from 'react';

export function BookingWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://yourdomain.com/widget.js';
    script.setAttribute('data-venue-key', '[VENUE_KEY]');
    script.setAttribute('data-widget-type', 'calendar');
    script.async = true;
    document.getElementById('booking-widget').appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <div id="booking-widget" />;
}
```

### WordPress
1. Go to Pages or Posts
2. Edit the page where you want the widget
3. Switch to HTML/Code Editor
4. Paste the embed code
5. Update/Publish your page

## 🔐 Data Storage

- **Local Storage**: Venue data is stored in browser localStorage
- **Key**: `venues_data`
- **Format**: JSON array of venue objects
- **Persistence**: Data persists across sessions
- **Future**: Ready for Supabase integration

## 🎯 Use Cases

### Multiple Location Business
Create separate venues for each physical location:
- "Downtown Escape Room"
- "Westside Escape Room"
- "Airport Location"

### Different Activity Types
Create venues for different activities:
- "Escape Rooms" (with multiple room events)
- "Axe Throwing Arena"
- "Smash Room Experience"

### Separate Brands
Manage multiple brands under one account:
- "Mystery Manor Escape Rooms"
- "Rage Room NYC"
- "Bullseye Axe Throwing"

## 🛠️ Troubleshooting

### Venue Not Showing
- Check if venue is set to "Active"
- Verify widget configuration is complete
- Ensure at least one event/room is added

### Widget Not Displaying
- Verify embed code is correctly copied
- Check that venue key matches
- Ensure script is loading (check browser console)

### Events Not Appearing
- Confirm events are added in widget settings
- Check operating hours are set
- Verify events are not in the past

## 📞 Support

For additional help:
- Check the in-app tooltips and descriptions
- Review the Calendar Widget Settings documentation
- Contact support through the Help menu

## 🔄 Updates and Roadmap

### Current Version (v0.1)
- ✅ Multi-venue management
- ✅ Calendar widget integration
- ✅ Local storage persistence
- ✅ Embed code generation
- ✅ Full CRUD operations

### Planned Features
- 🔜 Supabase database integration
- 🔜 Analytics per venue
- 🔜 Booking management per venue
- 🔜 Revenue tracking per venue
- 🔜 Staff assignment per venue
- 🔜 Custom domain support

---

**Last Updated**: November 8, 2025  
**Version**: 0.1.0  
**Component**: Venue Management System
