# OpenAI Provider UI Update - Quick Fix

## 🚨 IMMEDIATE ACTION REQUIRED

Your Z.ai account is out of credits (Error 429). You need to switch to OpenAI through the UI.

---

## ✅ What's Been Done

1. ✅ Default provider changed to OpenAI in code
2. ✅ Default model changed to GPT-3.5 Turbo
3. ✅ Error handling added to show helpful message
4. ✅ Customer Assistance section updated
5. ⚠️ **INCOMPLETE**: Dialog UI needs provider selection dropdowns

---

## 🔧 Fix Needed

Replace the API Configuration Dialog content in `/pages/AIAgents.tsx` (around line 1227-1260).

### Find This Section:
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="apiKey" className={textClass}>API Key</Label>
    <Input
      id="apiKey"
      type="password"
      value={zaiApiKey}
      onChange={(e) => setZaiApiKey(e.target.value)}
      placeholder="Enter your Z.ai API key"
      className={`h-11 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}
    />
  </div>

  <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
    <div className="flex gap-2 mb-2">
      <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
      <div>
        <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Getting Started</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
          1. Visit <a href="https://docs.z.ai" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Z.ai Dashboard</a><br />
          2. Generate an API key<br />
          3. Model: glm-4.6 (recommended)
        </p>
      </div>
    </div>
  </div>

  <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
    <p className={`text-xs ${textMutedClass}`}>
      <strong>API Endpoint:</strong> https://api.z.ai/v1/chat/completions<br />
      <strong>Model:</strong> glm-4.6 (latest GLM-4 model)
    </p>
  </div>
</div>
```

### Replace With This:
```tsx
<div className="space-y-4">
  {/* Provider Selection */}
  <div className="space-y-2">
    <Label htmlFor="provider" className={textClass}>AI Provider</Label>
    <Select value={llmProvider} onValueChange={(value: 'openai' | 'zai') => {
      setLlmProvider(value);
      setLlmModel(value === 'openai' ? 'gpt-3.5-turbo' : 'glm-4.6');
    }}>
      <SelectTrigger className="h-11">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="openai">⭐ OpenAI (GPT-3.5, GPT-4) - Recommended</SelectItem>
        <SelectItem value="zai">Z.ai (GLM-4.6)</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Model Selection */}
  <div className="space-y-2">
    <Label htmlFor="model" className={textClass}>Model</Label>
    <Select value={llmModel} onValueChange={setLlmModel}>
      <SelectTrigger className="h-11">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {llmProvider === 'openai' ? (
          <>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Affordable)</SelectItem>
            <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Balanced)</SelectItem>
          </>
        ) : (
          <>
            <SelectItem value="glm-4.6">GLM-4.6 (Latest)</SelectItem>
            <SelectItem value="glm-4">GLM-4 (Standard)</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  </div>

  {/* API Key Input */}
  <div className="space-y-2">
    <Label htmlFor="apiKey" className={textClass}>API Key</Label>
    <Input
      id="apiKey"
      type="password"
      value={llmProvider === 'openai' ? openaiApiKey : zaiApiKey}
      onChange={(e) => llmProvider === 'openai' ? setOpenaiApiKey(e.target.value) : setZaiApiKey(e.target.value)}
      placeholder={`Enter your ${llmProvider === 'openai' ? 'OpenAI' : 'Z.ai'} API key`}
      className={`h-11 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}
    />
  </div>

  {/* Provider-specific instructions */}
  {llmProvider === 'openai' ? (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex gap-2 mb-2">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
        <div>
          <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Getting Started with OpenAI</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
            1. Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">OpenAI API Keys</a><br />
            2. Add billing at <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">OpenAI Billing</a> ⚠️ Required<br />
            3. Create a new secret key<br />
            4. Copy and paste it above
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex gap-2 mb-2">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
        <div>
          <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Getting Started with Z.ai</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
            1. Visit <a href="https://docs.z.ai" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Z.ai Dashboard</a><br />
            2. Generate an API key<br />
            3. Recharge your account (you have insufficient balance)<br />
            4. Copy and paste it above
          </p>
        </div>
      </div>
    </div>
  )}

  {/* Status Info */}
  <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
    <p className={`text-xs ${textMutedClass}`}>
      <strong>Provider:</strong> {llmProvider === 'openai' ? 'OpenAI' : 'Z.ai'}<br />
      <strong>Model:</strong> {llmModel}<br />
      <strong>Status:</strong> {(llmProvider === 'openai' ? openaiApiKey : zaiApiKey) ? '✅ Configured' : '❌ Not configured'}
    </p>
  </div>
</div>
```

---

## 📍 Exact Location

**File:** `/pages/AIAgents.tsx`  
**Lines:** Approximately 1227-1260  
**Inside:** `{/* API Key Configuration Dialog */}` → `<DialogContent>` → `<div className="space-y-4">`

---

## 🎯 After Making This Change

1. **Refresh the page**
2. **Go to AI Agents → Customer Assistance**
3. **Click "Configure AI Provider"**
4. **You'll now see:**
   - Provider dropdown (OpenAI selected by default)
   - Model dropdown (GPT-3.5 Turbo selected)
   - API key input
   - Getting started instructions for OpenAI

---

## 🚀 Then Follow These Steps

### 1. Get OpenAI API Key (5 minutes)

**A. Sign Up/Login**
- Visit: https://platform.openai.com/signup
- Create account or log in

**B. Add Billing** ⚠️ **CRITICAL - REQUIRED**
- Visit: https://platform.openai.com/account/billing
- Click "Add payment method"
- Add credit card
- **This is required before API access works!**

**C. Create API Key**
- Visit: https://platform.openai.com/api-keys
- Click "Create new secret key"
- Name it "BookingTMS AI"
- **Copy the entire key** (starts with `sk-proj-` or `sk-`)
- ⚠️ You won't see it again!

### 2. Configure in BookingTMS (2 minutes)

1. **Open the dialog**:
   - Go to: AI Agents → Customer Assistance
   - Click "Configure AI Provider"

2. **Select OpenAI**:
   - Provider: "⭐ OpenAI (GPT-3.5, GPT-4) - Recommended"
   - Model: "GPT-3.5 Turbo (Fast & Affordable)"
   - API Key: Paste your key

3. **Save**:
   - Click "Save Configuration"
   - You should see "✅ OpenAI configured"

### 3. Test It (1 minute)

1. **Click "Test in Embed"**
2. **Try chatting**:
   - "Show me available escape rooms"
   - "I want to book for 4 people"
3. **Verify**:
   - No more Z.ai 429 errors
   - Intelligent responses
   - Smooth conversation

---

## 💰 Cost Information

### OpenAI Pricing (Pay-as-you-go)

**GPT-3.5 Turbo:**
- **Input:** $0.50 per 1M tokens (~$0.0005 per conversation)
- **Output:** $1.50 per 1M tokens (~$0.0015 per conversation)
- **Average:** ~$0.002 per customer conversation
- **Monthly (1000 conversations):** ~$2.00

**GPT-4:**
- **Input:** $30 per 1M tokens (~$0.03 per conversation)
- **Output:** $60 per 1M tokens (~$0.06 per conversation)
- **Average:** ~$0.09 per customer conversation
- **Monthly (1000 conversations):** ~$90.00

**Recommendation:** Start with GPT-3.5 Turbo. Upgrade to GPT-4 only if you need higher quality.

### Z.ai Pricing (Prepaid)
- Requires prepaid credits
- Your account currently has **$0.00** (insufficient balance)
- Need to recharge at https://docs.z.ai

---

## 🐛 Troubleshooting

### After UI Update

#### "I don't see the provider dropdown"
- Clear browser cache and refresh
- Make sure you replaced the code correctly
- Check browser console for errors

#### "Save button doesn't work"
- Make sure both provider and API key are set
- Check that the key is not empty
- Look for error toasts

### After Switching to OpenAI

#### Error 401: "Incorrect API key"
- Double-check you copied the entire key
- Make sure it starts with `sk-`
- Create a new key if needed

#### Error 402: "You exceeded your current quota"
- You haven't added billing yet
- Go to: https://platform.openai.com/account/billing
- Add payment method

#### Error 429: "Rate limit reached"
- You're sending too many requests too fast
- Wait a few minutes
- Consider upgrading your OpenAI tier

#### Still seeing Z.ai errors
- Clear localStorage: Open DevTools (F12) → Console → Run:
  ```javascript
  localStorage.removeItem('llm_provider');
  localStorage.removeItem('zai_api_key');
  localStorage.setItem('llm_provider', 'openai');
  location.reload();
  ```

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Dialog shows provider dropdown
- [ ] OpenAI is selected by default
- [ ] GPT-3.5 Turbo is selected by default
- [ ] Can paste OpenAI API key
- [ ] Save button works
- [ ] Settings persist after refresh
- [ ] Customer Assistance shows "Provider: OpenAI"
- [ ] Test chat works without errors
- [ ] No Z.ai 429 errors in console
- [ ] Chat responses are intelligent

---

## 📝 Summary

**Problem:** Z.ai account has insufficient balance (Error 429)

**Solution:** Switch to OpenAI (now the default provider)

**Steps:**
1. Update dialog UI code (above)
2. Get OpenAI API key (5 min)
3. Add billing to OpenAI account (required)
4. Configure OpenAI in BookingTMS (2 min)
5. Test the chat (1 min)

**Time:** ~10 minutes total  
**Cost:** ~$2/month for 1000 conversations  
**Result:** Working AI chatbot with better quality responses

---

**Status:** ⏳ Waiting for dialog UI update  
**Priority:** 🔴 Critical (blocking AI features)  
**Next Step:** Replace dialog code in `/pages/AIAgents.tsx`

