# OpenAI Model Selector - Quick Guide

**⚡ 30-Second Quick Start**

---

## 🎯 What You Can Do Now

Choose from **6 different OpenAI models** for your AI Booking Assistant:

| Model | Best For | Cost |
|-------|----------|------|
| **GPT-4o Mini** ⭐ | General use (DEFAULT) | 💰 Low |
| **GPT-4o** | Complex queries | 💰💰💰 High |
| **GPT-4 Turbo** | Legacy support | 💰💰 Moderate |
| **GPT-3.5 Turbo** | High volume | 💰 Lowest |
| **O1 Preview** | Advanced reasoning | 💰💰💰💰 Highest |
| **O1 Mini** | Quick reasoning | 💰💰 Moderate |

---

## 🚀 How to Select a Model

### Step 1: Open Configuration
```
AI Agents Page → Customer Assistant → "Configure OpenAI"
```

### Step 2: Choose Model
```
Click the "Model" dropdown → Select your preferred model
```

### Step 3: Save
```
Click "Save API Key" → Done! ✅
```

---

## 💡 Quick Recommendations

**🆕 New Users:**
- Use **GPT-4o Mini** (default) - Perfect balance

**💰 Budget Conscious:**
- Use **GPT-3.5 Turbo** - Cheapest option

**🎯 Best Quality:**
- Use **GPT-4o** - Most capable

**🧠 Complex Problems:**
- Use **O1 Preview** - Advanced reasoning

---

## 🔍 Where Model Appears

After selecting a model, you'll see it in:

1. **AI Configuration Section**  
   `Provider: OpenAI • Model: gpt-4o-mini`

2. **API Configuration Dialog**  
   Model dropdown shows current selection

3. **API Details Box**  
   `Model: gpt-4o-mini`

4. **Save Confirmation**  
   `OpenAI API key and model (gpt-4o-mini) saved successfully`

---

## 🛠️ Technical Details

### Storage
```javascript
localStorage.getItem('llm_model')  // Returns: "gpt-4o-mini"
```

### Default
```javascript
Default: "gpt-4o-mini"  // If not set or invalid
```

### Supported Values
```javascript
'gpt-4o'
'gpt-4o-mini'
'gpt-4-turbo'
'gpt-3.5-turbo'
'o1-preview'
'o1-mini'
```

---

## 📖 Full Documentation

See `/OPENAI_MODEL_SELECTOR_IMPLEMENTATION.md` for:
- Complete technical details
- API integration guide
- Troubleshooting steps
- Model comparison chart
- Testing checklist

---

## ✅ Quick Test

1. Select a model → Save
2. Refresh page
3. Open configuration dialog
4. Verify model is still selected ✅

---

**Last Updated:** November 4, 2025  
**Status:** ✅ Production Ready
