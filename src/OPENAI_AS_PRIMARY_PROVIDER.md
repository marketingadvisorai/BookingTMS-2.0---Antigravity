# OpenAI as Primary AI Provider - Implementation Guide

## Overview
Updated the AI Agents configuration to use OpenAI as the primary/default AI provider for chatbots, with Z.ai as an alternative option.

---

## ✅ Changes Made

### 1. Default Provider Changed to OpenAI
**File:** `/pages/AIAgents.tsx`

**Changes:**
- Line 173: Default provider changed from `'zai'` to `'openai'`
- Line 176: Default model changed from `'glm-4.6'` to `'gpt-3.5-turbo'`

```tsx
// Before
const [llmProvider, setLlmProvider] = useState<'openai' | 'zai'>(\n  (localStorage.getItem('llm_provider') as 'openai' | 'zai') || 'zai'
);
const [llmModel, setLlmModel] = useState(
  localStorage.getItem('llm_model') || 'glm-4.6'
);

// After
const [llmProvider, setLlmProvider] = useState<'openai' | 'zai'>(
  (localStorage.getItem('llm_provider') as 'openai' | 'zai') || 'openai'
);
const [llmModel, setLlmModel] = useState(
  localStorage.getItem('llm_model') || 'gpt-3.5-turbo'
);
```

### 2. Updated API Configuration Dialog
**File:** `/pages/AIAgents.tsx` (Line ~1210)

**Changes Needed:**
- Changed dialog title from "Z.ai API Configuration" to "AI API Configuration"
- Updated description to be provider-agnostic
- Added provider selection dropdown (OpenAI vs Z.ai)
- Added model selection dropdown (dynamic based on provider)
- Updated API key input to handle both providers
- Added provider-specific getting started instructions

---

## 🎯 Features

### Provider Selection
Users can now choose between:
- **OpenAI** (Recommended) ⭐
  - GPT-3.5 Turbo (Fast & Affordable)
  - GPT-4 (Most Capable)
  - GPT-4 Turbo (Balanced)
- **Z.ai**
  - GLM-4.6 (Latest)
  - GLM-4 (Standard)

### Auto-Model Selection
When switching providers, the model automatically updates to the recommended default:
- OpenAI → GPT-3.5 Turbo
- Z.ai → GLM-4.6

### Dynamic Instructions
Getting started instructions change based on selected provider:
- **OpenAI**: Link to https://platform.openai.com/api-keys
- **Z.ai**: Link to https://docs.z.ai

---

## 📝 Implementation Steps

### Step 1: Update Dialog Structure
Add provider selection before API key input:

```tsx
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
      <SelectItem value="openai">OpenAI (GPT-3.5, GPT-4) ⭐ Recommended</SelectItem>
      <SelectItem value="zai">Z.ai (GLM-4.6)</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Step 2: Add Model Selection
Add dynamic model dropdown:

```tsx
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
```

### Step 3: Update API Key Input
Make input provider-aware:

```tsx
<Input
  id="apiKey"
  type="password"
  value={llmProvider === 'openai' ? openaiApiKey : zaiApiKey}
  onChange={(e) => llmProvider === 'openai' ? setOpenaiApiKey(e.target.value) : setZaiApiKey(e.target.value)}
  placeholder={`Enter your ${llmProvider === 'openai' ? 'OpenAI' : 'Z.ai'} API key`}
  className={`h-11 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}
/>
```

### Step 4: Add Provider-Specific Instructions
Replace static Z.ai instructions with dynamic content:

```tsx
{llmProvider === 'openai' ? (
  <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
    <div className="flex gap-2 mb-2">
      <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
      <div>
        <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Getting Started with OpenAI</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
          1. Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">OpenAI API Keys</a><br />
          2. Create a new secret key<br />
          3. Copy and paste it above
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
          3. Copy and paste it above
        </p>
      </div>
    </div>
  </div>
)}
```

### Step 5: Update Status Info
Replace static info with dynamic status:

```tsx
<div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
  <p className={`text-xs ${textMutedClass}`}>
    <strong>Provider:</strong> {llmProvider === 'openai' ? 'OpenAI' : 'Z.ai'}<br />
    <strong>Model:</strong> {llmModel}<br />
    <strong>Status:</strong> {(llmProvider === 'openai' ? openaiApiKey : zaiApiKey) ? '✅ Configured' : '❌ Not configured'}
  </p>
</div>
```

### Step 6: Update Save Button Text
```tsx
<Button 
  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
  onClick={handleSaveApiKey}
>
  <Save className="w-4 h-4 mr-2" />
  Save Configuration
</Button>
```

---

## 🧪 Testing

### Test Cases
1. **Default Behavior**
   - Open AI Agents page
   - Click "Configure API Key"
   - Verify OpenAI is selected by default
   - Verify GPT-3.5 Turbo is the default model

2. **Provider Switching**
   - Switch from OpenAI to Z.ai
   - Verify model changes to GLM-4.6
   - Verify instructions update
   - Switch back to OpenAI
   - Verify model changes to GPT-3.5 Turbo

3. **API Key Persistence**
   - Enter OpenAI API key
   - Save
   - Refresh page
   - Verify OpenAI key persists
   - Switch to Z.ai
   - Enter Z.ai API key
   - Save
   - Refresh page
   - Verify both keys are saved

4. **Chat Assistant**
   - Configure OpenAI API key
   - Test chat assistant
   - Verify OpenAI responses
   - Switch to Z.ai
   - Configure Z.ai API key
   - Test chat assistant
   - Verify Z.ai responses

---

## 📚 User Guide

### How to Configure OpenAI (Recommended)

1. **Get Your API Key**
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new secret key
   - Copy the key (you won't be able to see it again!)

2. **Configure in BookingTMS**
   - Go to AI Agents → Customer Assistance
   - Click "Configure API Key"
   - Select "OpenAI" from the Provider dropdown
   - Choose your model (GPT-3.5 Turbo recommended for cost/speed)
   - Paste your API key
   - Click "Save Configuration"

3. **Test It**
   - Click "Test in Embed"
   - Chat with the AI assistant
   - Verify responses are intelligent and helpful

### How to Switch to Z.ai

1. **Get Your API Key**
   - Visit [Z.ai Dashboard](https://docs.z.ai)
   - Generate an API key

2. **Configure in BookingTMS**
   - Go to AI Agents → Customer Assistance
   - Click "Configure API Key"
   - Select "Z.ai" from the Provider dropdown
   - Choose your model (GLM-4.6 recommended)
   - Paste your API key
   - Click "Save Configuration"

---

## 🔄 Migration Notes

### For Existing Z.ai Users
- Your existing Z.ai API key is preserved
- The system will NOT automatically switch you to OpenAI
- You can manually switch providers anytime

### For New Users
- OpenAI is now the default recommendation
- You'll see OpenAI selected first in the configuration
- Z.ai remains available as an alternative

### LocalStorage Keys
- `llm_provider`: 'openai' or 'zai'
- `llm_model`: Model name (gpt-3.5-turbo, gpt-4, glm-4.6, etc.)
- `openai_api_key`: OpenAI API key
- `zai_api_key`: Z.ai API key

---

## ✅ Benefits

### Why OpenAI as Default?

1. **Better Quality**: GPT-3.5 and GPT-4 are industry-leading models
2. **More Documentation**: Extensive documentation and community support
3. **Reliability**: OpenAI has robust infrastructure and high uptime
4. **Familiarity**: Most users are already familiar with ChatGPT
5. **Better Customer Support**: OpenAI has responsive support team

### Z.ai Still Available
- Lower cost for some use cases
- Good alternative for users outside certain regions
- Specific features that may be needed

---

## 🐛 Troubleshooting

### "API error: 401"
- Check your API key is correct
- Verify you copied the entire key
- For OpenAI: Ensure you have billing set up

### "API error: 429"
- You've hit rate limits
- For OpenAI: Check your usage limits
- Consider upgrading your plan

### Provider Won't Switch
- Clear localStorage and refresh
- Check browser console for errors
- Verify both API keys are valid

---

## 📖 Related Files

- `/pages/AIAgents.tsx` - Main configuration page
- `/components/aiagents/BookingChatAssistant.tsx` - Chat component
- `/supabase/functions/server/index.tsx` - Backend API handler
- `/ZAI_MODEL_FIX_NOV_4.md` - Previous Z.ai fix documentation

---

**Status:** ⏳ In Progress  
**Priority:** High  
**Impact:** All AI Agent features  
**Version:** 1.0  
**Date:** November 4, 2025

---

**Next Steps:**
1. Implement provider selection UI in dialog
2. Add model selection dropdown
3. Update API key handling
4. Add provider-specific instructions
5. Test all scenarios
6. Update customer assistance section to show OpenAI first
7. Update documentation and user guides
