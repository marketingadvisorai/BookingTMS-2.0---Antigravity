# Fix Z.ai 429 Error - Manual Steps

## 🚨 CRITICAL: Your Z.ai account is out of credits

**Error:** `Z.ai API error: 429 {"error":{"code":"1113","message":"Insufficient balance or no resource package. Please recharge."}}`

**Solution:** Switch to OpenAI (recommended) or recharge Z.ai

---

## ⚡ QUICKEST FIX: Switch to OpenAI (10 minutes)

Follow these manual steps to enable provider selection in the UI:

### Step 1: Update the Dialog UI Code

**File to Edit:** `/pages/AIAgents.tsx`

**What to Change:** Lines 1227-1260 (the dialog content section)

**Find This Code:**
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

**Replace With This Code:**
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
                    <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Z.ai Balance Error</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                      ⚠️ Your Z.ai account has insufficient balance.<br />
                      1. Recharge at <a href="https://docs.z.ai" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Z.ai Dashboard</a><br />
                      2. OR switch to OpenAI (recommended above)
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

**Also Update the Save Button Text (line 1271):**

Find:
```tsx
              Save API Key
```

Replace with:
```tsx
              Save Configuration
```

---

### Step 2: Get Your OpenAI API Key

1. **Visit OpenAI:**
   - Sign up: https://platform.openai.com/signup
   - Or login if you have an account

2. **Add Billing (REQUIRED):**
   - Go to: https://platform.openai.com/account/billing
   - Click "Add payment method"
   - Enter credit card details
   - **You MUST do this before the API will work!**

3. **Create API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it: "BookingTMS AI"
   - Copy the entire key (starts with `sk-`)
   - ⚠️ **Save it somewhere safe - you can't see it again!**

---

### Step 3: Configure in BookingTMS

1. **Refresh the page** after making the code change

2. **Go to AI Agents:**
   - Click "AI Agents" in the sidebar
   - Find "Customer Assistance" section

3. **Click "Configure AI Provider"**

4. **You'll now see:**
   - **Provider dropdown** → Select "⭐ OpenAI (GPT-3.5, GPT-4) - Recommended"
   - **Model dropdown** → Select "GPT-3.5 Turbo (Fast & Affordable)"
   - **API Key field** → Paste your OpenAI API key

5. **Click "Save Configuration"**

6. **Verify:** You should see "✅ OpenAI configured"

---

### Step 4: Test It!

1. **Click "Test in Embed"** button

2. **Start chatting:**
   - "Show me available escape rooms"
   - "I want to book for 4 people"

3. **Verify:**
   - No more Z.ai 429 errors
   - Intelligent, helpful responses
   - Smooth conversation flow

---

## 🔄 Alternative: Fix Z.ai Account

If you prefer to keep using Z.ai:

1. Visit: https://docs.z.ai
2. Login to your account
3. Go to billing/credits section
4. Purchase credits or subscribe
5. Return to BookingTMS and test

---

## 💰 OpenAI Cost

**GPT-3.5 Turbo (Recommended):**
- ~$0.002 per conversation
- ~$2/month for 1,000 conversations
- Very fast and affordable

**GPT-4:**
- ~$0.09 per conversation
- ~$90/month for 1,000 conversations
- Higher quality but expensive

**Recommendation:** Start with GPT-3.5 Turbo

---

## ✅ Checklist

After completing all steps:

- [ ] Code updated in `/pages/AIAgents.tsx`
- [ ] Page refreshed
- [ ] Dialog shows provider dropdown
- [ ] OpenAI selected by default
- [ ] OpenAI API key obtained
- [ ] Billing added to OpenAI account
- [ ] API key configured in BookingTMS
- [ ] Settings saved successfully
- [ ] Test chat works without errors
- [ ] No Z.ai 429 errors in console

---

## 🐛 Troubleshooting

### "I don't see the provider dropdown"
- Make sure you saved the file after editing
- Refresh the browser (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors

### "API key invalid" error from OpenAI
- Verify you copied the entire key
- Make sure it starts with `sk-`
- Try creating a new key

### "Exceeded quota" error from OpenAI
- You haven't added billing yet
- Go to https://platform.openai.com/account/billing
- Add payment method

### Still seeing Z.ai errors
- Clear localStorage and force switch:
  ```javascript
  // Open browser DevTools (F12), go to Console, paste this:
  localStorage.setItem('llm_provider', 'openai');
  localStorage.setItem('llm_model', 'gpt-3.5-turbo');
  localStorage.removeItem('zai_api_key');
  location.reload();
  ```

---

## 📚 Documentation

- **Full Guide:** `/SWITCH_TO_OPENAI_GUIDE.md`
- **Error Details:** `/ZAI_ERROR_429_FIX.md`
- **Implementation:** `/OPENAI_AS_PRIMARY_PROVIDER.md`

---

**Time Required:** ~15 minutes total  
**Difficulty:** Easy  
**Result:** Working AI chatbot with OpenAI

---

**Next Step:** Edit `/pages/AIAgents.tsx` lines 1227-1260 with the code above! 🚀
