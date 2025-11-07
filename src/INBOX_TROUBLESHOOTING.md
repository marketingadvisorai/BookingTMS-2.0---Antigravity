# 📋 Inbox Troubleshooting Guide

**Problem:** Can't find or access the chat inbox

---

## ✅ Quick Checklist

Run through these checks in order:

### 1. Are you on the correct page?
- [ ] URL should be `/ai-agents` or similar
- [ ] Page title shows "AI Agents" or similar
- [ ] Left sidebar shows "AI Agents" as active/selected

**Fix:** Navigate to AI Agents from the sidebar menu

---

### 2. Can you see the chat widget?
- [ ] Scroll down to "Customer Booking Assistant" section
- [ ] See a phone mockup or preview container
- [ ] See a blue circular chat bubble (bottom right of preview)

**Fix:** If not visible, check if the page loaded correctly (refresh)

---

### 3. Is the chat open?
- [ ] Chat widget is expanded (not just a bubble)
- [ ] You see the full chat interface with messages
- [ ] Header shows "Booking Assistant" text

**To fix:** Click the blue chat bubble to open the chat

---

### 4. Can you see the header icons?
- [ ] Chat header has a colored background (blue/purple)
- [ ] Top right shows small white icons
- [ ] You can count 3 icons in a row

**To fix:** Look specifically at the TOP RIGHT corner, not the message area

---

### 5. Are the callbacks connected?
- [ ] When you hover over icons, they highlight slightly
- [ ] Icons are clickable (cursor changes to pointer)

**To verify in console:**
```javascript
// Open browser console (F12) and type:
localStorage.getItem('chatConversations')
// Should return: null (if no conversations yet) or JSON data
```

---

## 🔍 Common Issues

### Issue 1: "I don't see any icons at all"

**Possible causes:**
1. Chat is not fully open (only bubble visible)
2. Looking at wrong section (message area instead of header)
3. Icons are very small (16x16px) and might be missed

**Solutions:**
1. Click chat bubble to fully expand
2. Look at the very top of the chat window
3. Look for white icons on colored background
4. Use Ctrl+F (Find) and search for icon symbols

---

### Issue 2: "Icons are there but clicking doesn't work"

**Possible causes:**
1. JavaScript error preventing dialog from opening
2. Dialog state not initialized
3. Import missing

**Solutions:**
1. Open browser console (F12) → Check for errors
2. Refresh the page
3. Clear browser cache (Ctrl+Shift+Del)

**Debug in console:**
```javascript
// Check if dialogs are imported
// Look for these in the Network tab:
// - ChatHistoryDialog.tsx
// - AssistantConfigDialog.tsx
```

---

### Issue 3: "Inbox opens but is empty"

**This is normal if:**
- You haven't had any conversations yet
- This is your first time using the chat
- Chat history was cleared

**To test:**
1. Close inbox dialog
2. Send a test message: "Show me available rooms"
3. Bot responds
4. Close chat
5. Open chat again
6. Click History icon
7. **Your conversation should now appear!**

---

### Issue 4: "History icon is grayed out or disabled"

**Check:**
1. `onOpenHistory` prop is passed to BookingChatAssistant
2. State `isChatHistoryOpen` exists in parent component
3. ChatHistoryDialog component is imported

**Verify in code:**
```tsx
// In AIAgents.tsx, check for:
const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

// In BookingChatAssistant, check for:
onOpenHistory={() => setIsChatHistoryOpen(true)}

// At bottom of AIAgents.tsx, check for:
<ChatHistoryDialog
  isOpen={isChatHistoryOpen}
  onClose={() => setIsChatHistoryOpen(false)}
/>
```

---

### Issue 5: "Settings icon works but History doesn't"

**This indicates:**
- Settings dialog is properly connected
- History dialog might have import/integration issue

**Fix:**
1. Check imports at top of AIAgents.tsx:
```tsx
import { ChatHistoryDialog } from '../components/aiagents/ChatHistoryDialog';
```

2. Check dialog is rendered:
```tsx
<ChatHistoryDialog
  isOpen={isChatHistoryOpen}
  onClose={() => setIsChatHistoryOpen(false)}
/>
```

3. Check file exists:
   - `/components/aiagents/ChatHistoryDialog.tsx`

---

## 🔧 Manual Verification

### Test 1: Check File Exists
```bash
# File should exist at:
/components/aiagents/ChatHistoryDialog.tsx
```

### Test 2: Check Import
```tsx
// In /pages/AIAgents.tsx, top of file:
import { ChatHistoryDialog } from '../components/aiagents/ChatHistoryDialog';
```

### Test 3: Check State
```tsx
// In AIAgents component:
const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
```

### Test 4: Check Prop Passing
```tsx
// In BookingChatAssistant component call:
onOpenHistory={() => setIsChatHistoryOpen(true)}
```

### Test 5: Check Dialog Render
```tsx
// Near end of AIAgents.tsx, before closing </div>:
<ChatHistoryDialog
  isOpen={isChatHistoryOpen}
  onClose={() => setIsChatHistoryOpen(false)}
/>
```

---

## 🎯 Step-by-Step Debugging

### Step 1: Visual Inspection
1. Open AI Agents page
2. Open chat widget
3. Look at header
4. **Take a screenshot** of the header
5. Check if icons are visible in screenshot

### Step 2: Console Check
```javascript
// Open console (F12)
// Check for errors - should be none related to chat
console.log('Testing inbox...')

// Try to manually trigger
// (This won't work but will show errors if any)
```

### Step 3: Network Check
1. Open DevTools → Network tab
2. Refresh page
3. Look for `ChatHistoryDialog` in loaded files
4. Should load successfully (200 status)

### Step 4: Element Inspection
1. Right-click chat header
2. Select "Inspect Element"
3. Look for button elements
4. Should see 3 buttons with icons

### Step 5: Click Test
1. Click where History icon should be
2. Watch console for errors
3. Check if dialog attempts to open

---

## 💡 Alternative Access (Workaround)

If icons aren't working, you can still access conversations:

**Browser Console Method:**
```javascript
// View all conversations
const conversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
console.log(conversations);

// View specific conversation
console.log(conversations[0]); // First conversation

// Export conversation
const text = conversations[0].messages
  .map(m => `${m.type}: ${m.text}`)
  .join('\n');
console.log(text);
```

---

## 📞 Getting Help

If still not working, gather this info:

**System Info:**
- Browser: Chrome/Firefox/Safari
- Version: ?
- Operating System: Windows/Mac/Linux
- Screen size: ?

**What you see:**
- Screenshot of chat header
- Screenshot of full chat widget
- Console errors (if any)

**What you tried:**
- List of troubleshooting steps completed
- Any error messages
- Whether Settings icon works

**Code verification:**
```bash
# Check these files exist:
/components/aiagents/ChatHistoryDialog.tsx
/components/aiagents/AssistantConfigDialog.tsx
/components/aiagents/BookingChatAssistant.tsx

# Check this file has correct imports:
/pages/AIAgents.tsx
```

---

## ✅ Expected Behavior

**When working correctly:**

1. **Chat closed:** Blue bubble visible
2. **Click bubble:** Chat expands
3. **See header:** Colored background, assistant name, 3 icons
4. **Hover History icon:** Slight highlight, cursor changes
5. **Click History icon:** Large dialog opens instantly
6. **Dialog shows:** 
   - Left panel with search/filters
   - Right panel with message viewer
   - No console errors

---

## 🎉 Success Criteria

✅ **You've found the inbox when:**
- You can click the History icon (📋)
- A large dialog opens (max-w-4xl)
- You see conversation list on left
- You see message details on right
- Search and filter controls work
- You can view/export/delete conversations

---

**Still stuck?** See:
- `/FIND_INBOX_30_SECONDS.md` - Ultra-quick guide
- `/CHAT_INBOX_LOCATION_GUIDE.md` - Detailed guide
- `/CHAT_INBOX_VISUAL_MAP.md` - Visual diagrams
- `/AI_CHAT_ENHANCEMENTS_GUIDE.md` - Full documentation

---

**Last Updated:** November 4, 2025  
**Troubleshooting Version:** 1.0.0
