# Calendar Single Event Widget - Embed Fix

## Issue
The Calendar Single Event widget (singlegame) is not showing in the embed preview iframe.

## Investigation Summary

### ✅ What's Working
1. **Component Structure** - CalendarSingleEventBookingPage.tsx is correctly implemented
2. **Widget ID Mapping** - 'singlegame' is correctly mapped in Embed.tsx line 166-167
3. **Context Provider** - WidgetThemeProvider is now wrapping the Embed page
4. **URL Parameter Parsing** - Embed.tsx correctly reads `?widget=singlegame`
5. **Conditional Rendering** - Component correctly uses `currentStep === 'booking'` at line 425

### 🔍 What to Check
1. **Console Logs** - Added debug logging to Embed.tsx:
   - Line 23: Logs URL params on mount
   - Line 150: Logs widget rendering
   - Line 167: Logs when singlegame widget is selected

2. **URL Format** - The embed URL should be: `/?widget=singlegame&color=2563eb&key=...`

### 🧪 Testing Steps

1. **Test the widget directly:**
   ```
   Open browser console
   Navigate to: /?widget=singlegame&color=2563eb
   Check console for debug messages
   ```

2. **Expected Console Output:**
   ```
   📍 Embed page loaded with params: { widget: 'singlegame', color: '2563eb', key: '' }
   📍 Full URL: http://.../?widget=singlegame&color=2563eb
   🎯 Rendering widget: singlegame with color: #2563eb
   ✅ Rendering Calendar Single Event widget
   ```

3. **If No Output:**
   - App.tsx might not be detecting the `?widget` param
   - Check if isEmbedMode is set to true
   - Verify ThemeProvider is working

4. **If Widget Renders But Is Blank:**
   - Check browser console for React errors
   - Check if ImageWithFallback is failing
   - Check if any imported components are missing

### 🐛 Potential Issues

1. **Image Loading**
   - CalendarSingleEventBookingPage uses ImageWithFallback for hero image
   - If image fails to load, hero section might be blank
   - Check network tab for 404s

2. **Theme Context**
   - Component uses `useWidgetTheme()` hook
   - Requires WidgetThemeProvider wrapper (now added)
   - Check if `widgetTheme` and `getCurrentPrimaryColor` are defined

3. **Missing Dependencies**
   - Component imports many UI components (Dialog, Card, Badge, etc.)
   - If any are missing, widget won't render
   - Check for import errors

### 🔧 Current Fixes Applied

1. **Added WidgetThemeProvider** to Embed.tsx (Line 174)
2. **Fixed primaryColor logic** in CalendarSingleEventBookingPage.tsx (Line 42)
   ```tsx
   const primaryColor = propPrimaryColor || getCurrentPrimaryColor() || '#2563eb';
   ```
3. **Added debug logging** to Embed.tsx

### 📋 Next Steps

1. Open browser console
2. Navigate to BookingWidgets page
3. Select "Calendar Single Event / Room Booking Page"
4. Check the EmbedTester preview iframe
5. Look for console messages
6. If still blank, check for React errors
7. Verify image URLs are loading
8. Check if Dialog/Card/other UI components are rendering

### 🎯 Most Likely Issue

Based on the code review, the widget SHOULD be working now. The most likely remaining issues are:

1. **Image Loading Failure** - The hero image might not be loading, making it appear blank
2. **CSS Issue** - Some styling might be causing the content to be invisible
3. **Component Import Error** - One of the many UI components might have an issue

### 🔍 Debug Commands

Run these in browser console:
```javascript
// Check if embed mode is active
console.log('Embed mode:', window.location.search.includes('widget'));

// Check URL params
const params = new URLSearchParams(window.location.search);
console.log('Widget:', params.get('widget'));
console.log('Color:', params.get('color'));

// Check if component is mounted
console.log('Body content:', document.body.innerHTML.length);
```

---

**Status**: Fixes applied, needs browser testing with console logs to verify.
