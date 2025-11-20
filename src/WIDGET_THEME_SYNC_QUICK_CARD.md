# Widget Theme Auto-Sync - Quick Card

**Feature**: Automatic widget dark mode sync with admin dashboard  
**Date**: November 5, 2025  
**Status**: ✅ Complete

---

## 🎯 What It Does

**Widget previews automatically match your admin dashboard theme.**

- Admin in light mode → Widget preview in light mode
- Admin in dark mode → Widget preview in dark mode
- Toggle admin theme → Widget preview updates instantly

---

## ⚡ Quick Example

### Before:
```
Admin Dashboard: 🌙 Dark Mode
Widget Preview:  ☀️ Light Mode (always)
Result: Inconsistent ❌
```

### After:
```
Admin Dashboard: 🌙 Dark Mode
Widget Preview:  🌙 Dark Mode (auto-synced)
Result: Consistent ✅
```

---

## 🔧 How It Works

```
1. You toggle dark mode in admin dashboard
2. ThemeContext updates to 'dark'
3. EmbedPreview detects theme change
4. URL updates to include theme=dark
5. Widget preview renders in dark mode
```

**Zero configuration required!**

---

## 📝 URL Parameter

### Format:
```
/?widget=farebook&color=4f46e5&key=demo_abc&theme=dark
                                              ^^^^^^^^^^
                                              Auto-added!
```

### Parameters:
```
theme=light  →  Widget shows in light mode
theme=dark   →  Widget shows in dark mode
(no theme)   →  Defaults to light mode
```

---

## 🎨 Visual Indicator

When viewing widget embed code, you'll see:

```
┌─────────────────────────────────────┐
│ 🎨 Auto Theme Sync                  │
│                                     │
│ Widget preview automatically        │
│ matches your admin theme.           │
│                                     │
│ Currently showing: Dark Mode        │
└─────────────────────────────────────┘
```

---

## ✅ Benefits

### For You:
✅ No manual theme toggle needed  
✅ Preview exactly matches admin appearance  
✅ Faster workflow - one less click  
✅ Intuitive and automatic  

### For Testing:
✅ Easy to preview both themes  
✅ Consistent dark mode testing  
✅ Accurate embed preview  

---

## 📱 Affected Pages

**Where you'll see this**:
- Booking Widgets page → Embed Code tab
- Any widget preview in admin dashboard
- Direct widget URLs with theme parameter

---

## 🧪 Try It Now

1. Go to **Booking Widgets** page
2. Toggle dark mode in admin (top right)
3. Click **Embed Code** tab
4. See widget preview in dark mode!
5. Toggle back to light mode
6. See widget preview switch to light mode!

---

## 💡 Pro Tips

### Tip 1: Direct URLs
You can manually set theme in URL:
```
/?widget=farebook&theme=dark
```

### Tip 2: Preview Both Themes
1. Copy embed URL
2. Open in new tab with `theme=dark`
3. Open another tab with `theme=light`
4. Compare both versions side-by-side

### Tip 3: Testing Dark Mode
1. Enable dark mode in admin
2. All widget previews auto-update
3. Perfect for testing dark mode designs

---

## 📚 Documentation

**Full Guide**: `/WIDGET_THEME_AUTO_SYNC.md`  
**Theme Context**: `/components/layout/ThemeContext.tsx`  
**Widget Context**: `/components/widgets/WidgetThemeContext.tsx`

---

## 🔍 Technical Details

### Files Modified:
```
/components/widgets/EmbedPreview.tsx
  - Added useTheme() hook
  - Updated generateEmbedUrl()
  - Added visual indicator

/components/widgets/WidgetThemeContext.tsx
  - Added initialTheme prop
  - Updated constructor

/pages/Embed.tsx
  - Parse theme parameter
  - Apply dark mode classes
  - Pass theme to provider
```

### Lines of Code: ~30
### Breaking Changes: None
### Backwards Compatible: Yes

---

## ❓ FAQ

**Q: What if I want to override the auto-sync?**  
A: Manually add `theme=light` or `theme=dark` to the URL

**Q: Does this work for all widgets?**  
A: Yes! All 7 widgets support the theme parameter

**Q: What if I don't specify a theme?**  
A: Defaults to light mode

**Q: Can I toggle theme for just the widget?**  
A: Not yet - currently syncs with admin theme only

**Q: Does this affect my embedded widgets on my website?**  
A: Only if you include the theme parameter in your embed code

---

## 🎉 Summary

**What**: Auto-sync widget preview theme with admin theme  
**Why**: Better preview experience, less confusion  
**How**: URL parameter + theme context integration  
**When**: Active now (v3.2.10)  

**Result**: Seamless, intuitive, automatic! ✨

---

**Status**: ✅ Active  
**Version**: 3.2.10  
**Updated**: November 5, 2025

**Try it now!** Toggle dark mode in your admin dashboard 🌙
