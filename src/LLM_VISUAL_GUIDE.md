# LLM Connections - Visual Guide

## 🎨 User Interface Overview

This guide shows you what to expect when using the LLM Connections feature in the Backend Dashboard.

---

## 📍 Navigation

### How to Access
```
Login → Backend Dashboard → LLM Connections Tab
```

### Tab Location
```
┌─────────────────────────────────────────────────────┐
│  Connections | Health | API | Env | Monitoring | LLM │ ← Click here
└─────────────────────────────────────────────────────┘
```

---

## 🖼️ Main Interface Layout

### Page Header
```
┌──────────────────────────────────────────────────────┐
│  🧠 LLM API Connections            [Test All Button] │
│  Test connections to Large Language Model providers  │
└──────────────────────────────────────────────────────┘
```

### Security Alert (Top of Page)
```
┌──────────────────────────────────────────────────────┐
│  ⚠️ Security Note: API keys are stored locally in    │
│  your browser and never sent to our servers. They    │
│  are used only for direct API calls to the           │
│  respective LLM providers.                           │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Provider Cards

### Card Layout (Unconfigured)
```
┌──────────────────────────────────────────────────────┐
│  🤖  OpenAI                                          │
│     GPT-4, GPT-3.5, and other OpenAI models         │
│                                                      │
│  API Key (OPENAI_API_KEY)                           │
│  [Enter your OpenAI API key................] [Test] │
└──────────────────────────────────────────────────────┘
```

### Card Layout (Configured)
```
┌──────────────────────────────────────────────────────┐
│  🤖  OpenAI                          [Connected ✅]  │
│     GPT-4, GPT-3.5, and other OpenAI models         │
│                                                      │
│  API Key (OPENAI_API_KEY)                           │
│  [sk-**********************] [👁] [🗑]      [Test]  │
│                                                      │
│  ✅ Successfully connected to OpenAI API            │
│  ⏱ 850ms (Good)                                     │
│  Model: gpt-3.5-turbo                               │
│  Response: "Connection successful"                   │
│  Usage: {"prompt_tokens": 15, "completion_tokens": 5}│
└──────────────────────────────────────────────────────┘
```

### Card Layout (Testing)
```
┌──────────────────────────────────────────────────────┐
│  🤖  OpenAI                                          │
│     GPT-4, GPT-3.5, and other OpenAI models         │
│                                                      │
│  API Key (OPENAI_API_KEY)                           │
│  [sk-**********************] [👁] [🗑]   [🔄 Testing...]│
└──────────────────────────────────────────────────────┘
```

### Card Layout (Error)
```
┌──────────────────────────────────────────────────────┐
│  🤖  OpenAI                            [Failed ❌]   │
│     GPT-4, GPT-3.5, and other OpenAI models         │
│                                                      │
│  API Key (OPENAI_API_KEY)                           │
│  [sk-**********************] [👁] [🗑]      [Test]  │
│                                                      │
│  ❌ HTTP 401: Incorrect API key provided            │
│  ⏱ 450ms                                            │
│                                                      │
│  🚨 Error: {"error": {"message": "Invalid key"}}    │
└──────────────────────────────────────────────────────┘
```

---

## 🎭 All Provider Cards

### Complete Provider List
```
┌──────────────────────────────────────────────────────┐
│  🤖 OpenAI                                           │
│     GPT-4, GPT-3.5, and other OpenAI models         │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  🧠 Anthropic Claude                                 │
│     Claude 3 Opus, Sonnet, and Haiku models         │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  ✨ Google AI (Gemini)                               │
│     Gemini Pro and other Google AI models           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  💬 Cohere                                           │
│     Command and other Cohere models                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  🤗 Hugging Face                                     │
│     Access to Hugging Face model hub                │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  🦙 Together AI                                      │
│     Llama 2, Mistral, and other open-source models  │
└──────────────────────────────────────────────────────┘
```

---

## 🔘 Button States

### Test Button
```
[Test]                    ← Default state
[🔄 Testing...]          ← Loading state (disabled)
[Test]                    ← Ready to re-test
```

### Test All Button
```
[▶ Test All]             ← Default state (enabled when keys exist)
[▶ Test All]             ← Disabled (no keys configured)
[🔄 Testing...]          ← Testing in progress
```

### Show/Hide Button
```
[👁]                     ← Show key (hidden)
[👁️]                     ← Hide key (visible)
```

### Clear Button
```
[🗑]                     ← Clear key (red on hover)
```

---

## 🎨 Color Indicators

### Status Badges
```
[Connected ✅]           ← Green badge (success)
[Failed ❌]              ← Red badge (error)
[Testing... ⏳]          ← Yellow badge (in progress)
```

### Performance Ratings
```
⏱ 450ms (Excellent) 🟢   ← < 500ms
⏱ 850ms (Good) 🔵        ← 500ms-1.5s
⏱ 2.1s (Fair) 🟡         ← 1.5s-3s
⏱ 4.5s (Slow) 🔴         ← > 3s
```

### Success Indicators
```
✅ Success                ← Green checkmark
❌ Error                  ← Red X mark
⏱ Latency                ← Clock icon
🎯 Model                  ← Target icon
```

---

## 📚 Setup Guide Section

### Below All Provider Cards
```
┌──────────────────────────────────────────────────────┐
│  How to Get API Keys                                 │
│  Quick links to obtain API keys from each provider   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🤖 OpenAI                                           │
│  Sign up at platform.openai.com and generate an     │
│  API key from your account settings.                │
│                                                      │
│  🧠 Anthropic Claude                                 │
│  Visit console.anthropic.com to create an account   │
│  and get your API key.                              │
│                                                      │
│  ✨ Google AI (Gemini)                               │
│  Get your API key from Google AI Studio.            │
│                                                      │
│  💬 Cohere                                           │
│  Sign up at dashboard.cohere.com to get your        │
│  API key.                                           │
│                                                      │
│  🤗 Hugging Face                                     │
│  Create an account at huggingface.co and generate   │
│  a token in your settings.                          │
│                                                      │
│  🦙 Together AI                                      │
│  Visit api.together.xyz to sign up and get your     │
│  API key.                                           │
└──────────────────────────────────────────────────────┘
```

---

## 🌓 Dark Mode vs Light Mode

### Dark Mode Colors
```
Background: #0a0a0a (deepest)
Cards: #161616
Borders: #gray-800
Text: white
Secondary text: #gray-400
Primary button: #4f46e5
```

### Light Mode Colors
```
Background: #gray-50
Cards: white
Borders: #gray-200
Text: #gray-900
Secondary text: #gray-600
Primary button: #4f46e5
```

### Example Dark Mode
```
┌──────────────────────────────────────────────────────┐
│  [Dark background with white text]                   │
│  🤖 OpenAI                          [Connected ✅]   │
│     [Gray secondary text]                            │
│  [Dark input field with white text]       [Blue btn]│
└──────────────────────────────────────────────────────┘
```

### Example Light Mode
```
┌──────────────────────────────────────────────────────┐
│  [Light background with dark text]                   │
│  🤖 OpenAI                          [Connected ✅]   │
│     [Gray secondary text]                            │
│  [White input field with dark text]       [Blue btn]│
└──────────────────────────────────────────────────────┘
```

---

## 📱 Mobile Responsive Layout

### Desktop (> 768px)
```
┌──────────────────────────────────────────────────────┐
│  [Full width provider cards]                         │
│  [Input field + buttons side by side]                │
│  [Wide result display]                               │
└──────────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌───────────────────────┐
│  [Stacked cards]      │
│  [Full width input]   │
│  [Full width button]  │
│  [Stacked results]    │
└───────────────────────┘
```

---

## 🎬 User Interaction Flow

### First-Time Setup
```
1. [User lands on LLM tab]
   ↓
2. [Sees 6 provider cards, all empty]
   ↓
3. [Clicks on OpenAI input field]
   ↓
4. [Pastes API key: sk-...]
   ↓
5. [Key automatically saved to localStorage]
   ↓
6. [Clicks "Test" button]
   ↓
7. [Button shows "Testing..." with spinner]
   ↓
8. [Result appears in ~1 second]
   ↓
9. [Green "Connected" badge appears]
   ↓
10. [Response details displayed]
```

### Testing Multiple Providers
```
1. [User configures 3 providers]
   ↓
2. [Clicks "Test All" button]
   ↓
3. [Toast notification: "Testing 3 LLM provider(s)..."]
   ↓
4. [First provider tests (OpenAI)]
   ↓
5. [Result appears, second provider starts]
   ↓
6. [Second provider tests (Anthropic)]
   ↓
7. [Result appears, third provider starts]
   ↓
8. [Third provider tests (Google AI)]
   ↓
9. [Final result appears]
   ↓
10. [Toast: "All LLM connection tests completed"]
```

### Viewing/Hiding API Keys
```
1. [Key shown as: sk-**********************]
   ↓
2. [User clicks eye icon 👁]
   ↓
3. [Key revealed: sk-proj-abc123def456...]
   ↓
4. [User clicks eye icon again 👁️]
   ↓
5. [Key hidden: sk-**********************]
```

### Clearing an API Key
```
1. [Key configured and visible]
   ↓
2. [User clicks trash icon 🗑]
   ↓
3. [Toast: "OpenAI API key cleared"]
   ↓
4. [Input field clears]
   ↓
5. [Test result disappears]
   ↓
6. [Key removed from localStorage]
```

---

## 🎨 Toast Notifications

### Success Messages
```
✅ "Successfully connected to OpenAI API"
✅ "All LLM connection tests completed"
✅ "OpenAI API key cleared"
```

### Error Messages
```
❌ "Failed to connect to OpenAI: Invalid API key"
❌ "Please enter an API key first"
❌ "API key format invalid"
```

### Info Messages
```
ℹ️ "Testing 3 LLM provider(s)..."
ℹ️ "No API keys configured. Please add at least one API key."
```

---

## 🎯 Visual Hierarchy

### Information Priority
```
1. Provider Icon & Name (Largest, most prominent)
   🤖 OpenAI
   
2. Description (Secondary text)
   GPT-4, GPT-3.5, and other OpenAI models
   
3. API Key Label (Tertiary)
   API Key (OPENAI_API_KEY)
   
4. Input Field (Interactive element)
   [Enter your OpenAI API key...]
   
5. Action Buttons (Primary actions)
   [Test]
   
6. Result Display (Feedback area)
   ✅ Successfully connected
```

---

## 🔍 Details Panel Breakdown

### Successful Connection Details
```
┌──────────────────────────────────────────────────────┐
│  ✅ Successfully connected to OpenAI API             │  ← Status
│  ⏱ 850ms (Good)                                     │  ← Performance
│                                                      │
│  Model: gpt-3.5-turbo                               │  ← Model used
│  Response: "Connection successful"                   │  ← AI response
│  Usage: {"prompt_tokens": 15, ...}                  │  ← Token usage
└──────────────────────────────────────────────────────┘
```

### Failed Connection Details
```
┌──────────────────────────────────────────────────────┐
│  ❌ HTTP 401: Incorrect API key provided            │  ← Status
│  ⏱ 450ms                                            │  ← Performance
│                                                      │
│  🚨 Error: {                                        │  ← Error detail
│    "error": {                                       │
│      "message": "Invalid key",                      │
│      "type": "invalid_request_error"                │
│    }                                                │
│  }                                                  │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 Spacing & Layout

### Card Spacing
```
┌────────────────┐
│  Card 1        │
│                │ ← 16px padding inside
└────────────────┘
     ↕ 16px gap
┌────────────────┐
│  Card 2        │
│                │
└────────────────┘
```

### Input Field Spacing
```
Label                          ← 8px margin bottom
[Input field.............]     ← 10px height
     ↕ 12px gap
[Result display...........]
```

---

## 💡 Visual Tips

### What to Look For

**Good Connection**:
- 🟢 Green "Connected" badge
- ✅ Green checkmark in results
- Response time < 2 seconds
- Clear AI response text
- Token usage displayed

**Bad Connection**:
- 🔴 Red "Failed" badge
- ❌ Red X mark in results
- Error message displayed
- Detailed error object
- No AI response

**In Progress**:
- 🟡 Yellow processing badge
- 🔄 Spinning refresh icon
- "Testing..." text
- Button disabled
- No results yet

---

## 🎓 Visual Learning Path

### Step 1: Familiarize
```
□ Locate the LLM Connections tab
□ Scroll through all 6 provider cards
□ Read the security alert
□ Review the setup guide
```

### Step 2: Practice
```
□ Add one API key
□ Click the eye icon to show/hide
□ Test the connection
□ Review the results
```

### Step 3: Master
```
□ Configure multiple providers
□ Use "Test All" button
□ Compare response times
□ Clear and re-add keys
```

---

## 🎨 Design Elements Used

### Icons
- 🧠 Brain (tab icon)
- 🤖 Robot (OpenAI)
- 🧠 Brain (Anthropic)
- ✨ Sparkles (Google AI)
- 💬 Chat bubble (Cohere)
- 🤗 Hugging Face emoji
- 🦙 Llama (Together AI)
- 👁 Eye (show)
- 👁️ Eye off (hide)
- 🗑 Trash (clear)
- ⏱ Clock (time)
- ✅ Checkmark (success)
- ❌ X mark (error)
- 🔄 Refresh (loading)
- ▶ Play (test all)

### Colors
- **Primary**: #4f46e5 (vibrant blue)
- **Success**: Green (#22c55e)
- **Error**: Red (#ef4444)
- **Warning**: Yellow (#eab308)
- **Info**: Blue (#3b82f6)

### Typography
- **Headings**: Inter/Poppins (from globals.css)
- **Body**: Default sans-serif
- **Code**: Monospace for JSON

---

## 📸 Screenshot Equivalents

### Empty State
```
"When you first open the LLM tab, you'll see 6 cards,
each representing a different AI provider. All input
fields will be empty, ready for you to add your API keys."
```

### Configured State
```
"After adding API keys, you'll see asterisks masking
your keys, with eye and trash icons to show/clear them.
Test results will appear below each input field."
```

### Testing State
```
"When testing, the Test button shows a spinning icon
and 'Testing...' text. The button is disabled to
prevent multiple simultaneous tests."
```

### Success State
```
"Successful tests show a green 'Connected' badge at
the top-right of the card, with detailed results below
including response time, model, and AI response."
```

---

**Visual Guide Complete!**

This guide helps you understand what the LLM Connections interface looks like without seeing actual screenshots. Use it as a reference when navigating the feature for the first time.

**Last Updated**: November 4, 2025  
**Version**: 1.0
