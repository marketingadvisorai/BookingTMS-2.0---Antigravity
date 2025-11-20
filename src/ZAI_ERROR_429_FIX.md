# Z.ai Error 429 Fix - Insufficient Balance

## ❌ Error Details

```json
{
  "error": {
    "code": "1113",
    "message": "Insufficient balance or no resource package. Please recharge."
  }
}
```

**Status Code:** 429 (Too Many Requests / Rate Limited)  
**Provider:** Z.ai  
**Root Cause:** Your Z.ai account has run out of credits or doesn't have an active subscription.

---

## ✅ Solution: Switch to OpenAI (Recommended)

Since OpenAI is now the **default and recommended** AI provider for BookingTMS, this is the perfect time to switch!

### Why OpenAI?

✅ **Better Quality** - GPT-3.5 and GPT-4 are industry-leading models  
✅ **More Reliable** - Higher uptime and better infrastructure  
✅ **Better Documentation** - Extensive docs and community support  
✅ **Familiar** - Most users already know ChatGPT  
✅ **Flexible Pricing** - Pay-as-you-go with clear pricing  

---

## 🚀 Quick Start: Switch to OpenAI

### Step 1: Get Your OpenAI API Key

1. **Sign Up/Login**
   - Visit: https://platform.openai.com/signup
   - Create account or log in

2. **Add Billing**
   - **CRITICAL**: Go to https://platform.openai.com/account/billing
   - Add payment method (credit card required)
   - OpenAI requires billing setup before API access
   - Typical usage: $0.002 per 1K tokens (~$0.01 per conversation)

3. **Create API Key**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name (e.g., "BookingTMS AI")
   - **Copy the key immediately** (you won't see it again!)
   - Example: `sk-proj-abc123...xyz789`

### Step 2: Configure in BookingTMS

1. **Open AI Agents Page**
   - Navigate to: **AI Agents** → **Customer Assistance**

2. **Click "Configure AI Provider"**
   - Look for the blue configuration card
   - Click the "Configure AI Provider" button

3. **Select OpenAI**
   - In the dialog, select "OpenAI (GPT-3.5, GPT-4) ⭐ Recommended"
   - The model will auto-switch to "GPT-3.5 Turbo"

4. **Paste Your API Key**
   - Paste the key you copied from OpenAI
   - Click "Save Configuration"

5. **Test It!**
   - Click "Test in Embed" button
   - Try chatting with the AI assistant
   - Verify responses are working

---

## 📊 Configuration Details

### Current Settings (After Fix)

| Setting | Value |
|---------|-------|
| **Default Provider** | OpenAI ⭐ |
| **Default Model** | GPT-3.5 Turbo |
| **Fallback Provider** | Z.ai (if configured) |

### Provider Comparison

| Feature | OpenAI | Z.ai |
|---------|--------|------|
| **Quality** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good |
| **Speed** | ⭐⭐⭐⭐⭐ Very Fast | ⭐⭐⭐⭐ Fast |
| **Reliability** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **Documentation** | ⭐⭐⭐⭐⭐ Extensive | ⭐⭐⭐ Limited |
| **Cost** | $0.002/1K tokens | Lower (when funded) |
| **Billing** | Credit card | Prepaid credits |

---

## 🔧 Alternative: Fix Z.ai Account

If you prefer to continue using Z.ai:

### Option A: Recharge Z.ai Account

1. Visit: https://docs.z.ai
2. Log in to your account
3. Go to billing/credits section
4. Purchase credits or subscribe to a plan
5. Wait for credits to be added
6. Return to BookingTMS and test

### Option B: Use Both Providers

You can configure **both** OpenAI and Z.ai:

1. Configure OpenAI as primary (recommended)
2. Keep Z.ai configured as backup
3. Switch between them anytime in AI Agents settings
4. Both API keys are saved separately in localStorage

---

## 🐛 Troubleshooting

### OpenAI Errors

#### Error 401 - Invalid API Key
```
❌ Incorrect API key provided
```
**Fix:**
- Double-check you copied the entire key
- Make sure it starts with `sk-`
- Create a new key if needed

#### Error 429 - Rate Limited
```
❌ Rate limit reached for requests
```
**Fix:**
- You've sent too many requests
- Wait a few minutes
- Consider upgrading your OpenAI plan

#### Error 402 - Billing Required
```
❌ You exceeded your current quota
```
**Fix:**
- Add billing at https://platform.openai.com/account/billing
- Add credits to your account
- Check your usage limits

### Still Getting Z.ai Errors?

If you're still seeing Z.ai errors after switching to OpenAI:

1. **Clear localStorage**
   ```javascript
   localStorage.removeItem('llm_provider');
   localStorage.removeItem('llm_model');
   location.reload();
   ```

2. **Verify Provider Setting**
   - Open AI Agents page
   - Check "AI Provider Configuration" card
   - Should show: "Provider: OpenAI • Model: gpt-3.5-turbo"

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for "Calling OpenAI API" (not Z.ai)
   - Check for any error messages

---

## 💡 Best Practices

### API Key Security

- ✅ **DO**: Store keys in environment variables for production
- ✅ **DO**: Use different keys for dev/staging/production
- ✅ **DO**: Rotate keys periodically
- ❌ **DON'T**: Share keys publicly
- ❌ **DON'T**: Commit keys to version control
- ❌ **DON'T**: Use production keys for testing

### Cost Management

1. **Monitor Usage**
   - Check: https://platform.openai.com/usage
   - Set up billing alerts
   - Review monthly spending

2. **Optimize Costs**
   - Use GPT-3.5 Turbo for most conversations (cheaper)
   - Only use GPT-4 when you need higher quality
   - Limit max tokens to reduce cost
   - Cache common responses

3. **Set Limits**
   - Set monthly budget limits in OpenAI dashboard
   - Monitor usage with email alerts
   - Use soft limits before hard limits

---

## 📝 Code Changes Made

### 1. Default Provider Changed to OpenAI
**File:** `/pages/AIAgents.tsx`

```tsx
// Before
const [llmProvider, setLlmProvider] = useState<'openai' | 'zai'>(
  (localStorage.getItem('llm_provider') as 'openai' | 'zai') || 'zai'
);

// After
const [llmProvider, setLlmProvider] = useState<'openai' | 'zai'>(
  (localStorage.getItem('llm_provider') as 'openai' | 'zai') || 'openai'
);
```

### 2. Default Model Changed
**File:** `/pages/AIAgents.tsx`

```tsx
// Before
const [llmModel, setLlmModel] = useState(
  localStorage.getItem('llm_model') || 'glm-4.6'
);

// After
const [llmModel, setLlmModel] = useState(
  localStorage.getItem('llm_model') || 'gpt-3.5-turbo'
);
```

### 3. Enhanced Error Handling
**File:** `/components/aiagents/BookingChatAssistant.tsx`

```tsx
// Added specific Z.ai 429 error handling
if (provider === 'zai' && response.status === 429) {
  if (errorData.error?.message?.includes('Insufficient balance')) {
    return "⚠️ Z.ai API Error: Your Z.ai account has insufficient balance. Please:\n\n1. Recharge your Z.ai account at https://docs.z.ai\n2. OR switch to OpenAI in AI Agents settings (recommended)\n\nI can still help you book - just without AI-powered responses for now!";
  }
}
```

### 4. Updated Customer Assistance UI
**File:** `/pages/AIAgents.tsx`

```tsx
// Updated configuration card to show current provider
<p className={`text-sm ${textClass}`}>AI Provider Configuration</p>
<p className={`text-xs mt-1 ${textMutedClass}`}>
  {llmProvider === 'openai' 
    ? (openaiApiKey ? '✅ OpenAI configured' : '⚙️ Configure OpenAI (Recommended)') 
    : (zaiApiKey ? '✅ Z.ai configured' : '⚙️ Configure Z.ai')}
</p>
<p className={`text-xs mt-1 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`}>
  Provider: {llmProvider === 'openai' ? 'OpenAI' : 'Z.ai'} • Model: {llmModel}
</p>
```

---

## ✅ Verification Checklist

After switching to OpenAI, verify:

- [ ] AI Agents page shows "Provider: OpenAI"
- [ ] Model shows "gpt-3.5-turbo"
- [ ] API key shows "✅ OpenAI configured"
- [ ] Test chat works without errors
- [ ] Console shows "Calling OpenAI API"
- [ ] No Z.ai 429 errors in console
- [ ] Chat responses are intelligent and relevant
- [ ] Booking flow works end-to-end

---

## 🎯 Next Steps

1. **Get OpenAI API Key** (5 minutes)
   - Sign up at OpenAI
   - Add billing information
   - Create API key

2. **Configure in BookingTMS** (2 minutes)
   - Open AI Agents page
   - Configure OpenAI provider
   - Paste API key and save

3. **Test It** (3 minutes)
   - Use "Test in Embed" feature
   - Have a conversation
   - Verify responses work

4. **Monitor Usage** (ongoing)
   - Check OpenAI dashboard weekly
   - Set up billing alerts
   - Optimize if needed

---

## 📚 Resources

### OpenAI Documentation
- **Platform Overview**: https://platform.openai.com/docs
- **API Reference**: https://platform.openai.com/docs/api-reference
- **Pricing**: https://openai.com/pricing
- **Best Practices**: https://platform.openai.com/docs/guides/production-best-practices

### Z.ai Documentation
- **Dashboard**: https://docs.z.ai
- **API Docs**: https://docs.z.ai/api
- **Billing**: https://docs.z.ai/billing

### BookingTMS Documentation
- **AI Integration Guide**: `/OPENAI_AS_PRIMARY_PROVIDER.md`
- **Model Fix Guide**: `/ZAI_MODEL_FIX_NOV_4.md`
- **Backend Dashboard**: `/BACKEND_DASHBOARD_GUIDE.md`

---

## 💬 Support

### Need Help?

1. **Check Console Logs**
   - Open DevTools (F12)
   - Look for detailed error messages

2. **Test Connection**
   - Go to Backend Dashboard → LLM Testing
   - Test OpenAI connection
   - View detailed logs

3. **Common Issues**
   - Invalid API key → Create new key
   - No billing → Add payment method
   - Rate limited → Wait or upgrade plan

---

**Status:** ✅ Fixed - OpenAI is now the default provider  
**Impact:** All AI Agent features (Customer Assistance chatbot)  
**Priority:** High  
**Date:** November 4, 2025

---

**Summary:**
The Z.ai 429 error is caused by insufficient account balance. The recommended solution is to switch to OpenAI, which is now the default provider. Follow the quick start guide above to get your OpenAI API key and configure it in BookingTMS. The entire process takes less than 10 minutes.
