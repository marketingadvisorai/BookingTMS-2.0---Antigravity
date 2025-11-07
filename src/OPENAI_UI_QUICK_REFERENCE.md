# OpenAI API Configuration - Quick Reference

## 🎯 What Changed

**Removed Z.ai options from the AI Agents page. Now only OpenAI is available.**

---

## 📍 Where to Configure

**Path:** AI Agents → Customer Assistant Card → "Configure OpenAI" button

---

## 🔑 Dialog Fields

### Provider (Text Display Only)
```
OpenAI
```
- **Not editable** - Fixed to OpenAI
- No dropdown selection

### Model (Text Display Only)
```
gpt-3.5-turbo
```
- **Not editable** - Fixed to gpt-3.5-turbo
- Fast and cost-effective model

### API Key (Input Field)
```
[Password input field]
Placeholder: sk-...
```
- Enter your OpenAI API key
- Password type (hidden characters)

---

## 🔗 Getting Your API Key

**1. Visit:** https://platform.openai.com/api-keys

**2. Steps:**
- Sign in to OpenAI
- Click "Create new secret key"
- Copy the key (starts with "sk-")
- Paste into BookingTMS

**3. Paste & Save:**
- Paste key into dialog
- Click "Save API Key"
- Success toast appears

---

## 💾 What Gets Saved (localStorage)

```javascript
{
  "openai_api_key": "sk-...",      // Your API key
  "llm_provider": "openai",        // Always "openai"
  "llm_model": "gpt-3.5-turbo"     // Default model
}
```

---

## ✅ Visual States

### Before Configuration
```
⚙️ Configure OpenAI
Provider: OpenAI • Model: gpt-3.5-turbo
[Configure OpenAI Button]
```

### After Configuration
```
✅ OpenAI configured
Provider: OpenAI • Model: gpt-3.5-turbo
[Update Configuration Button]
```

---

## 🧪 Testing the Integration

### 1. Configure API Key
- Open AI Agents page
- Click "Configure OpenAI"
- Enter API key
- Click Save

### 2. Test Chat Widget
- Scroll to "Live Preview" section
- Click the chat bubble
- Send message: "Book a room"
- Verify AI response appears

### 3. Check Footer
Should show: **"Powered by OpenAI • Try: 'Book a room' or 'Show me prices'"**

---

## 🎨 Dark Mode Support

✅ All elements support dark mode:
- Dialog background
- Input fields
- Text labels
- Buttons
- Info boxes

---

## 📋 Quick Troubleshooting

### API Key Not Saving?
- Check browser console for errors
- Verify localStorage is enabled
- Try clearing cache and retry

### AI Not Responding?
- Verify API key starts with "sk-"
- Check OpenAI account has credits
- Review browser console for errors
- Check network tab for failed requests

### Dialog Not Opening?
- Hard refresh page (Ctrl+Shift+R)
- Check for JavaScript errors in console

---

## 🚀 Example API Key Format

```
sk-proj-1234567890abcdefghijklmnopqrstuvwxyz1234567890
```

- Starts with `sk-` or `sk-proj-`
- Typically 51 characters long
- Mix of letters and numbers

---

## 📝 API Details Shown in Dialog

```
Provider: OpenAI
Model: gpt-3.5-turbo (Fast & cost-effective)
Endpoint: https://api.openai.com/v1/chat/completions
```

---

## 🔄 Integration Flow

```
User enters API key
     ↓
Save to localStorage
     ↓
Update agentStates
     ↓
Chat widget uses key
     ↓
Backend calls OpenAI API
     ↓
AI response returned
     ↓
Displayed in chat
```

---

## 💡 Tips

1. **Keep API Key Safe:** Never share or commit to git
2. **Check Credits:** Ensure OpenAI account has available credits
3. **Test First:** Use a test message to verify integration works
4. **Update Anytime:** Click "Update Configuration" to change key
5. **Error Messages:** Check console for detailed error info

---

## 🎯 Files Modified

- `/pages/AIAgents.tsx` - Main UI changes

## 🎯 Files Verified (Working)

- `/components/aiagents/BookingChatAssistant.tsx` - Chat component
- `/supabase/functions/server/index.tsx` - Backend API endpoint

---

**Last Updated:** November 4, 2025  
**Status:** ✅ Production Ready
