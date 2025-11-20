# Z.ai API Integration Guide - Booking Assistant

## Overview

The BookingTMS AI Booking Assistant now integrates with Z.ai's GLM-4 API to provide intelligent, conversational booking assistance. The system combines AI-powered natural language understanding with dynamic UI components to create an adaptive booking experience.

## 🚀 Quick Start

### 1. Get Your Z.ai API Key

1. Visit [Z.ai Dashboard](https://docs.z.ai)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key (format: `sk-...`)

### 2. Configure in BookingTMS

1. Go to **AI Agents** page
2. Find the **Customer Assistant** section
3. Click **"Configure API Key"** in AI Configuration
4. Paste your Z.ai API key
5. Click **"Save API Key"**

✅ Your Booking Assistant is now AI-powered!

### 3. Test the Integration

#### Option A: Live Preview (same page)
- Click the chat bubble in the preview section
- Type: "I want to book a room"
- Watch the AI respond and show available games

#### Option B: Full Embed Test
- Click **"Test in Embed"** button
- Opens full-page preview with the chat widget
- Test complete booking flow with AI responses

## 📚 Technical Implementation

### Architecture Overview

**Important:** Due to CORS restrictions, API calls to Z.ai are made **server-side** through our Supabase Edge Function.

```
Browser → Supabase Edge Function → Z.ai API
```

This architecture:
- ✅ Avoids CORS issues
- ✅ Keeps API keys secure server-side
- ✅ Allows request monitoring and logging
- ✅ Enables rate limiting and caching (future)

### API Configuration

**Frontend Endpoint:** `https://{projectId}.supabase.co/functions/v1/make-server-84a71643/chat`

**Backend Endpoints (Zhipu AI / Z.ai):**
- Primary: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- Fallback: `https://api.zhipuai.cn/api/paas/v4/chat/completions`

**Model:** `glm-4-flash` (fast & cost-effective)

**Note:** The system automatically tries multiple endpoints to ensure compatibility with different Z.ai API versions.

**Parameters:**
- `temperature`: 0.7 (balanced creativity)
- `max_tokens`: 200 (concise responses)

### Request Format

**Frontend → Backend:**
```typescript
// POST to: https://{projectId}.supabase.co/functions/v1/make-server-84a71643/chat
{
  apiKey: 'your-zai-api-key',
  messages: [
    { 
      role: 'system', 
      content: 'You are a helpful booking assistant...' 
    },
    { 
      role: 'user', 
      content: 'I want to book a room' 
    }
  ],
  model: 'glm-4-flash',
  temperature: 0.7,
  maxTokens: 200
}
```

**Backend → Z.ai:**
```typescript
// POST to: https://open.bigmodel.cn/api/paas/v4/chat/completions
// (automatically falls back to alternative endpoints if needed)
{
  model: 'glm-4-flash',
  messages: [
    { role: 'system', content: '...' },
    { role: 'user', content: '...' }
  ],
  temperature: 0.7,
  max_tokens: 200
}
```

### Response Format

```typescript
{
  choices: [
    {
      message: {
        content: "I'd love to help you book an escape room! Let me show you our available games:"
      }
    }
  ]
}
```

## 🎯 How It Works

### 1. **User Sends Message**
```
User: "I want to book a room"
```

### 2. **Frontend Calls Backend Server**
```typescript
const { projectId, publicAnonKey } = await import('../../../utils/supabase/info');

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-84a71643/chat`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      apiKey,
      messages: [...],
      model: 'glm-4-flash',
      temperature: 0.7,
      maxTokens: 200
    })
  }
);
```

### 2.5. **Backend Calls Z.ai API** (Server-Side)
```typescript
// Inside Supabase Edge Function (/supabase/functions/server/index.tsx)
// Tries multiple endpoints for compatibility
const endpoints = [
  "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  "https://api.zhipuai.cn/api/paas/v4/chat/completions"
];

for (const endpoint of endpoints) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [...],
      temperature: 0.7,
      max_tokens: 200
    })
  });
  
  if (response.ok) {
    return response.json();
  }
}
```

### 3. **AI Responds with Context**
```
AI: "I'd love to help you book an escape room! Let me show you our available games:"
```

### 4. **System Shows Dynamic UI**
- Displays game selector cards
- Shows calendar for date selection
- Presents time slot options
- Participant counter
- Checkout summary

### 5. **Conversation Context**
The AI has knowledge of:
- 4 escape room games (Mystery Mansion, Prison Break, Lost Temple, Zombie Outbreak)
- Difficulty levels (Easy, Medium, Hard)
- Duration (45-75 minutes)
- Player capacity (2-10 players)
- Pricing ($25-$35/person)
- Available time slots (10 AM - 8:30 PM)

## 💡 System Prompt

The AI is configured with this context:

```
You are a helpful booking assistant for BookingTMS escape rooms. 
Your goal is to help customers book escape room experiences.

Available games:
1. Mystery Mansion - Medium difficulty, 60 min, 2-8 players, $29/person
2. Prison Break - Hard difficulty, 75 min, 4-10 players, $35/person
3. Lost Temple - Easy difficulty, 45 min, 2-6 players, $25/person
4. Zombie Outbreak - Hard difficulty, 60 min, 4-8 players, $32/person

Available time slots: 10:00 AM, 11:30 AM, 1:00 PM, 2:30 PM, 4:00 PM, 5:30 PM, 7:00 PM, 8:30 PM

Guide the customer through:
1. Selecting a game (show them the options)
2. Picking a date
3. Choosing a time slot
4. Number of participants
5. Completing checkout

Keep responses concise and friendly. When appropriate, suggest showing them the available games or booking options.
```

## 🔧 Component Architecture

### BookingChatAssistant Component

**Location:** `/components/aiagents/BookingChatAssistant.tsx`

**Props:**
```typescript
interface BookingChatAssistantProps {
  chatColor: string;           // Primary theme color
  chatPosition: 'left' | 'right'; // Widget position
  chatGreeting: string;         // Initial greeting
  isOpen: boolean;             // Chat open state
  onToggle: () => void;        // Toggle handler
  apiKey?: string;             // Z.ai API key (optional)
}
```

**Key Methods:**

#### `callZaiAPI(userMessage: string): Promise<string>`
Makes API call to Z.ai and returns AI response.
- Handles authentication with API key
- Sends system prompt + user message
- Returns AI response or fallback text on error

#### `handleSendMessage(): void`
Processes user input:
1. Captures user message
2. Calls Z.ai API
3. Analyzes response
4. Determines which UI component to show
5. Displays AI response + UI

### UI Components Triggered

| User Intent | AI Response | UI Component |
|-------------|------------|--------------|
| "book room" | Suggests games | Game selector cards |
| "show prices" | Lists pricing | Game selector with prices |
| "what times" | Explains slots | Game selector first |
| General question | Answers naturally | Text only (no UI) |

## 🌐 Embed Testing

### Full-Page Test Preview

**Location:** AI Agents → Installation → "Test in Embed"

**Features:**
- Full-screen simulation of website
- Live chat widget with AI
- Real API calls to Z.ai
- Complete booking flow testing
- Customizable colors, position, greeting

**Use Cases:**
1. **Before Deployment**: Test AI responses before going live
2. **Demo to Clients**: Show working AI booking system
3. **Training Staff**: Familiarize team with AI capabilities
4. **QA Testing**: Verify all booking steps work correctly

## 🔐 Security & Storage

### API Key Storage

**Storage:** `localStorage`
```typescript
localStorage.setItem('zai_api_key', apiKey);
```

**Retrieval:**
```typescript
const apiKey = localStorage.getItem('zai_api_key') || '';
```

**Security Notes:**
- ⚠️ localStorage is browser-based (client-side)
- ✅ Good for MVP/development
- 🔒 For production: Move to secure backend
- 🛡️ API key should be server-side only in production

### Production Security Recommendations

```
MVP (Current) ✅
└── localStorage (browser)
    └── API key stored client-side
    └── Direct API calls from browser

Production (Future) 🔒
└── Backend server
    └── API key in environment variables
    └── Server-side API calls
    └── Frontend → Your Server → Z.ai
```

## 🎨 Customization Options

### Chat Widget Settings

**Color Customization:**
```typescript
chatColor: '#4f46e5' // Vibrant blue (default)
```

**Position:**
```typescript
chatPosition: 'right' // or 'left'
```

**Greeting Message:**
```typescript
chatGreeting: 'Hi! How can I help you today?'
```

**Dark Mode:**
Automatically inherits from ThemeContext
- Supports both light and dark modes
- Dynamic color adjustments
- Consistent with design system

## 📊 Example Conversations

### Booking Flow

```
👤 User: "I want to book an escape room"
🤖 AI:   "I'd love to help! Let me show you our available games:"
         [Shows 4 game cards]

👤 User: *Clicks "Mystery Mansion"*
🤖 AI:   "Great choice! Mystery Mansion is a medium level room. Let's pick a date:"
         [Shows calendar]

👤 User: *Selects December 15*
🤖 AI:   "Perfect! Here are the available time slots for December 15:"
         [Shows 8 time slots]

👤 User: *Clicks "7:00 PM"*
🤖 AI:   "Excellent! How many people will be joining you? (2-8 players)"
         [Shows participant counter]

👤 User: *Selects 4 people*
🤖 AI:   "Perfect! Here's your booking summary:"
         [Shows checkout summary with total: $116]

👤 User: *Clicks "Proceed to Checkout"*
🤖 AI:   "🎉 Awesome! Redirecting you to checkout..."
```

### FAQ Handling

```
👤 User: "What are your business hours?"
🤖 AI:   "We're open Monday-Sunday from 10 AM to 10 PM!"

👤 User: "How much does it cost?"
🤖 AI:   "Our escape rooms range from $25-$35 per person depending on the game. Would you like to see all available games?"
         [Shows game selector]

👤 User: "What's the easiest room?"
🤖 AI:   "Lost Temple is our easiest room - perfect for beginners! It's 45 minutes long, great for 2-6 players, and costs $25 per person."
```

## 🐛 Error Handling

### No API Key Configured

**Behavior:** Falls back to simple pattern matching
```typescript
if (!apiKey || !apiKey.trim()) {
  return "I'd love to help you book an escape room! Let me show you our available games:";
}
```

### API Call Fails

**Behavior:** Catches error and shows fallback
```typescript
try {
  const response = await fetch(...);
  ...
} catch (error) {
  console.error('Z.ai API error:', error);
  return "I'd love to help you book an escape room! Let me show you our available games:";
}
```

**User Experience:** Seamless fallback - users don't see errors

### CORS Error Fix

**Problem:** `TypeError: Failed to fetch` or CORS policy errors

**Solution:** API calls are now made server-side through Supabase Edge Functions to avoid CORS restrictions.

**Architecture:**
```
❌ Old (CORS Error):
Browser → Z.ai API (blocked by CORS)

✅ New (Working):
Browser → Supabase Edge Function → Z.ai API
```

**Why This Works:**
- Server-to-server calls have no CORS restrictions
- API keys stay secure on the server
- Browser only talks to our own backend

## 🧪 Testing Checklist

### Before Going Live

- [ ] API key is configured
- [ ] Test "book a room" query
- [ ] Test "show prices" query
- [ ] Test general questions
- [ ] Verify game selection works
- [ ] Verify date picker works
- [ ] Verify time slots work
- [ ] Verify participant count works
- [ ] Verify checkout summary calculates correctly
- [ ] Test in embed preview
- [ ] Test dark mode
- [ ] Test light mode
- [ ] Test mobile responsive
- [ ] Verify error handling (invalid API key)

### Example Test Queries

```
✅ "I want to book a room"
✅ "Show me available games"
✅ "What are the prices?"
✅ "What times are available?"
✅ "Tell me about Mystery Mansion"
✅ "What's the hardest room?"
✅ "Do you have rooms for 10 people?"
✅ "What's your cancellation policy?"
✅ "Are you open on weekends?"
```

## 📝 Code Locations

### Main Files

| File | Purpose | Lines |
|------|---------|-------|
| `/pages/AIAgents.tsx` | AI configuration UI, API key management | 1200+ |
| `/components/aiagents/BookingChatAssistant.tsx` | Chat component with Z.ai integration | 600+ |
| `/AI_BOOKING_ASSISTANT_IMPLEMENTATION.md` | Original implementation docs | Reference |

### Key Functions

**AIAgents.tsx:**
- `handleSaveApiKey()` - Saves API key to localStorage
- API key dialog (lines ~1200-1250)
- Embed test dialog (lines ~1250-1300)

**BookingChatAssistant.tsx:**
- `callZaiAPI()` - Makes API call to Z.ai
- `handleSendMessage()` - Processes messages with AI
- `renderComponent()` - Shows dynamic UI components

## 🎓 Best Practices

### 1. API Key Management
```typescript
// ✅ Good: Store in localStorage for MVP
localStorage.setItem('zai_api_key', apiKey);

// 🔒 Production: Move to backend
// Backend: process.env.ZAI_API_KEY
```

### 2. Error Handling
```typescript
// ✅ Good: Always provide fallback
try {
  const response = await callZaiAPI(message);
  return response;
} catch (error) {
  return fallbackResponse;
}
```

### 3. Response Analysis
```typescript
// ✅ Good: Analyze AI response to show UI
const lowerResponse = aiResponse.toLowerCase();
if (lowerResponse.includes('games') || lowerResponse.includes('available')) {
  showGameSelector();
}
```

### 4. User Experience
```typescript
// ✅ Good: Show typing indicator
setIsTyping(true);
const response = await callZaiAPI(message);
setIsTyping(false);
```

## 🚀 Future Enhancements

### Phase 2: Advanced Features

1. **Conversation Memory**
   - Remember user preferences
   - Context-aware responses
   - Multi-turn conversations

2. **Personalization**
   - User profiles
   - Booking history
   - Recommendations

3. **Multi-language Support**
   - Automatic language detection
   - Translated responses
   - Localized UI

4. **Analytics**
   - Track conversation success
   - Identify common questions
   - Improve prompts

5. **Integration**
   - Real-time availability
   - Live booking confirmation
   - Payment processing
   - Email notifications

## 📞 Support

### Common Issues

**Issue:** "Failed to fetch" or CORS error
- **Solution:** ✅ FIXED - Now uses server-side API calls
- **Check:** Ensure Supabase Edge Functions are deployed
- **Verify:** Backend server is running at `/supabase/functions/server/`

**Issue:** "API key not working"
- **Solution:** Verify key format (should start with valid Z.ai format)
- **Check:** Z.ai dashboard for valid key
- **Test:** Use "Test in Embed" to verify

**Issue:** "No AI responses"
- **Solution:** Check browser console for errors
- **Verify:** API key is saved in localStorage
- **Debug:** Check Network tab for failed requests

**Issue:** "Slow responses"
- **Normal:** API calls take 1-3 seconds
- **Expected:** Typing indicator shows during wait
- **Network:** Check your internet connection

**Issue:** "Backend not responding"
- **Check:** Supabase project is active
- **Verify:** Edge Functions are deployed
- **Test:** Call `/make-server-84a71643/health` endpoint

### Getting Help

1. Check browser console for errors
2. Verify API key in localStorage
3. Test with "Test in Embed" feature
4. Review Z.ai API documentation
5. Check network tab for failed requests

## 📚 Related Documentation

- [AI_BOOKING_ASSISTANT_IMPLEMENTATION.md](./AI_BOOKING_ASSISTANT_IMPLEMENTATION.md) - Original implementation
- [Z.ai Documentation](https://docs.z.ai/guides/llm/glm-4.6) - Official API docs
- [Guidelines.md](./guidelines/Guidelines.md) - Project guidelines
- [PRD_BOOKINGTMS_ENTERPRISE.md](./PRD_BOOKINGTMS_ENTERPRISE.md) - Product requirements

---

**Last Updated:** November 4, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready  
**API:** Z.ai GLM-4-Flash  
**Model:** glm-4-flash  
**Endpoint:** https://api.z.ai/v1/chat/completions
