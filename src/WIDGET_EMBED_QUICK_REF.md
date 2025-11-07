# Widget & Embed Step - Quick Reference

**Component**: `/components/games/AddGameWizard.tsx`  
**Status**: ✅ Complete

---

## 🎯 What Changed?

### Before (6 Steps)
```
Step 4: Media & Widget (combined)
Step 6: Review & Publish
```

### After (7 Steps)
```
Step 4: Media Upload (media only)
Step 6: Widget & Embed ⭐ NEW STEP
Step 7: Review & Publish
```

---

## 📋 Step 6: Widget & Embed

### Features

1. **Widget Selection** (6 options)
   - Calendar Single Event / Room Booking Page ⭐ **Default**
   - List Widget
   - Multi-Step Widget
   - Quick Book Widget
   - Calendar Widget
   - FareBook Widget

2. **Direct Booking Link**
   - Format: `https://bookingtms.com/book/{game-id}?widget={widget-id}`
   - Copy button with success feedback

3. **Embed Codes** (3 formats)
   - **HTML**: JavaScript embed code
   - **React**: Component with useEffect
   - **WordPress**: Installation + shortcode

4. **Installation Guide**
   - 3-step visual walkthrough
   - Pro tip box

---

## 💻 Code Snippets

### Widget Selection Pattern
```tsx
{widgetOptions.map((widget) => {
  const isSelected = gameData.selectedWidget === widget.id;
  return (
    <div
      onClick={() => updateGameData('selectedWidget', widget.id)}
      className={isSelected 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 hover:border-blue-300'
      }
    >
      {/* Widget content */}
    </div>
  );
})}
```

### Generate Embed Code
```tsx
const generateEmbedCode = () => {
  const gameId = gameData.name.toLowerCase().replace(/\s+/g, '-');
  return `<div id="bookingtms-widget"></div>
<script>
  script.setAttribute('data-game-id', '${gameId}');
  script.setAttribute('data-widget', '${gameData.selectedWidget}');
</script>`;
};
```

### Copy to Clipboard
```tsx
const handleCopyCode = () => {
  navigator.clipboard.writeText(generateEmbedCode());
  setCopied(true);
  toast.success('Embed code copied to clipboard!');
  setTimeout(() => setCopied(false), 2000);
};
```

---

## 🎨 UI Patterns

### Selected Widget Card
```
✅ Blue border (border-blue-500)
✅ Light blue background (bg-blue-50)
✅ Check icon (right side)
✅ "Recommended" badge (if default)
```

### Copy Button States
```
Default: <Copy /> Copy Code
Copied:  <Check /> Copied!
```

### Code Display
```tsx
<ScrollArea className="h-[300px] bg-gray-900 border-gray-700 p-4">
  <pre className="text-sm text-green-400">
    <code>{embedCode}</code>
  </pre>
</ScrollArea>
```

---

## 📱 Mobile Responsive

- Widget cards: `space-y-3` (stack vertically)
- Installation guide: `grid-cols-1 sm:grid-cols-3`
- Buttons: Full width on mobile `w-full sm:w-auto`
- Code blocks: Horizontal scroll if needed

---

## ✅ Default Configuration

```tsx
// In gameData initial state
selectedWidget: 'calendar-single-event'  // ⭐ Default
```

**Why Calendar Single Event?**
- Versatile (events + rooms)
- Feature-rich calendar view
- Professional appearance
- User-friendly interface

---

## 🔧 Imports Added

```tsx
// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';

// Icons
import { Copy } from 'lucide-react';
```

---

## 🚀 User Flow

1. **Configure Game** (Steps 1-5)
2. **Choose Widget** (Step 6)
   - See 6 options
   - Calendar Single Event pre-selected
   - Click to change selection
3. **Copy Booking Link**
   - One-click copy
   - Share with customers
4. **Get Embed Code**
   - Choose format (HTML/React/WordPress)
   - One-click copy
   - Implement on website
5. **Review Installation Guide**
   - 3-step walkthrough
   - Pro tips
6. **Proceed to Review** (Step 7)
7. **Publish Game**

---

## 📚 Related Files

- Component: `/components/games/AddGameWizard.tsx`
- Booking Widgets: `/pages/BookingWidgets.tsx`
- Widget Components: `/components/widgets/*`
- Documentation: `/WIDGET_EMBED_STEP_COMPLETE.md`

---

## 🎉 Quick Summary

**✅ Widget selection separated from media upload**  
**✅ New dedicated step for widget & embed codes**  
**✅ 6 widget options with Calendar Single Event as default**  
**✅ Direct booking link generation**  
**✅ 3 embed code formats (HTML/React/WordPress)**  
**✅ Copy to clipboard functionality**  
**✅ Professional installation guide**  
**✅ Mobile responsive design**

**Users can now immediately get their booking links and embed codes after configuring their game!** 🚀

---

**Last Updated**: November 4, 2025
