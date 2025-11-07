# 📋 Chat Inbox - How to Access

**Quick Answer:** The inbox is the **History icon** (📋) in the chat header, right next to the Settings icon.

---

## 🎯 Where to Find the Inbox

### Step-by-Step:

1. **Go to AI Agents page** (`/ai-agents`)
   
2. **Scroll down to "Customer Booking Assistant"** section

3. **Click the chat bubble** (blue floating button at bottom right of preview)
   - This opens the chat widget
   
4. **Look at the chat header** (top right corner)
   - You'll see 3 icons next to the assistant name:
     - 📋 **History icon** ← THIS IS THE INBOX!
     - ⚙️ **Settings icon**
     - ➖ **Minimize icon**

5. **Click the History icon** to open the inbox

---

## 📸 Visual Guide

```
┌─────────────────────────────────────────┐
│  🤖 Booking Assistant ⭐                │  ← Chat Header
│     AI-Powered • Online                  │
│                                           │
│                    [📋] [⚙️] [➖]        │  ← ICONS HERE!
│                     ↑    ↑    ↑          │
│                   INBOX SETTINGS MINIMIZE│
└─────────────────────────────────────────┘
│  Chat messages appear here...           │
│                                          │
│  💡 Quick suggestions                   │
│  🎮 Show me available rooms              │
│  📅 Book for tonight                     │
└──────────────────────────────────────────┘
│  [Type your message...]        [Send]   │
│  Powered by BookingTMS AI                │
└──────────────────────────────────────────┘
```

---

## 📋 What the Inbox Shows

When you click the History icon, you'll see:

### Left Panel: Conversation List
- **Search bar** - Find conversations by keyword
- **Time filters** - All, Today, Week, Month
- **Conversation cards** showing:
  - Conversation title (first message)
  - Message count badge
  - Timestamp

### Right Panel: Message Details
- Full conversation thread
- Bot and user messages
- Timestamps for each message
- **Export button** - Download as text file
- **Delete button** - Remove conversation

---

## 🔍 Troubleshooting

### "I don't see the History icon"

**Check these:**

1. ✅ **Is the chat open?**
   - The icons only appear when the chat widget is expanded
   - Click the blue chat bubble to open it

2. ✅ **Are you on the AI Agents page?**
   - Navigate to `/ai-agents` or click "AI Agents" in sidebar

3. ✅ **Is the preview showing?**
   - Scroll down to "Customer Booking Assistant" section
   - You should see a phone mockup with the chat widget

4. ✅ **Look in the top-right of the chat header**
   - The icons are small and white
   - They appear next to the assistant name

### "The inbox is empty"

**This is normal if:**
- You haven't had any conversations yet
- This is your first time opening the chat
- Chat history was cleared

**To populate the inbox:**
1. Have a conversation with the assistant
2. Send a few messages
3. Close the chat
4. Open History - your conversation will be there!

---

## 🎨 Icon Reference

The icons in the chat header:

| Icon | Name | Purpose | Location |
|------|------|---------|----------|
| 📋 | History | Open inbox/chat history | Top right (1st icon) |
| ⚙️ | Settings | Configure assistant | Top right (2nd icon) |
| ➖ | Minimize | Close chat widget | Top right (3rd icon) |

**Note:** All icons are white and appear on the colored chat header background.

---

## 💡 Quick Actions in Inbox

Once you open the History:

### Search Conversations
```
🔍 [Search conversations...]
```
- Type keywords to filter
- Searches both titles and message content

### Filter by Time
```
[All] [Today] [Week] [Month]
```
- Click to filter by time period
- Default shows all conversations

### View Conversation
```
[Conversation Title]     [5 messages]
📅 Nov 4, 2025 14:30
```
- Click any conversation to view details
- Right panel shows full message thread

### Export Conversation
```
[📥 Export] [🗑️ Delete]
```
- Export: Downloads as .txt file
- Delete: Removes conversation (with confirmation)

### Clear All
```
[🗑️ Clear All History]
```
- Deletes all conversations
- Shows confirmation dialog

---

## 📊 Inbox Features

### ✅ What You Can Do

1. **Search** - Find conversations by keyword
2. **Filter** - Show recent conversations (today/week/month)
3. **View** - Read full message threads
4. **Export** - Download conversations as text
5. **Delete** - Remove individual conversations
6. **Clear All** - Delete entire history

### 🔄 Auto-Save

Conversations are automatically saved:
- Every message is recorded
- Saves to browser localStorage
- Persists across page refreshes
- Maximum 20 conversations (oldest deleted automatically)

---

## 🎯 Common Use Cases

### Review Past Bookings
1. Open inbox
2. Search for customer name or game
3. View conversation details
4. Export if needed for records

### Track Customer Questions
1. Filter by time period (e.g., "Today")
2. Review common questions
3. Use to improve assistant configuration

### Audit Trail
1. Open inbox
2. Export conversation as text
3. Save for compliance/records
4. Share with team if needed

---

## 🔧 Technical Details

**Storage Location:**
```tsx
localStorage.getItem('chatConversations')
```

**Data Structure:**
```tsx
{
  id: "1730734800000",
  title: "I'd like to book Mystery Mansion",
  messages: [
    {
      id: "1",
      type: "bot",
      text: "Hi! How can I help you today?",
      timestamp: "2025-11-04T14:30:00Z"
    },
    // ... more messages
  ],
  timestamp: "2025-11-04T14:30:00Z"
}
```

**Auto-Save Trigger:**
- Fires on every new message
- Saves entire conversation state
- Updates existing conversation or creates new one

---

## 🚀 Quick Test

**To verify the inbox is working:**

1. **Open chat widget** (click blue bubble)
2. **Look at top right** - See 3 icons: 📋 ⚙️ ➖
3. **Click first icon** (📋 History)
4. **Inbox opens** in a dialog
5. **If empty:** Have a conversation first, then check again

**Expected Result:**
- Large dialog opens (max-w-4xl)
- Left panel shows conversation list
- Right panel shows message details
- Search and filter controls visible

---

## 📞 Still Can't Find It?

### Visual Clues

**Look for:**
- White icons on colored background (chat header)
- Small icons (4x4 size)
- Positioned in top-right corner of chat
- Next to "Booking Assistant" text

### Alternative Access

If icons aren't visible, you can also:

1. **Open browser console** (F12)
2. **Type:** `localStorage.getItem('chatConversations')`
3. **Press Enter** - See raw conversation data
4. **Verify data exists** - If yes, UI issue; if no, no conversations yet

---

## 🎉 Summary

**The inbox is the History icon (📋) in the chat header.**

**Access Steps:**
1. Go to AI Agents page
2. Open chat widget (click bubble)
3. Look at top-right of chat header
4. Click first icon (📋 History)
5. Inbox dialog opens

**Features:**
- View all past conversations
- Search and filter
- Export as text
- Delete conversations
- Auto-saves every message

**Location in Code:**
- Component: `/components/aiagents/ChatHistoryDialog.tsx`
- Trigger: History icon in chat header (lines 577-585)
- Integration: `/pages/AIAgents.tsx` (state: `isChatHistoryOpen`)

---

**Last Updated:** November 4, 2025  
**Component Version:** 1.0.0  
**Status:** ✅ Fully Functional
