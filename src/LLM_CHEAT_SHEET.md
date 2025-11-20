# LLM Connections - Cheat Sheet

## 🚀 Quick Access
```
Login → Backend Dashboard → LLM Connections Tab
```
**Permission**: Super Admin only

---

## 📋 6 Supported Providers

| # | Provider | Icon | Key Format | Get Key |
|---|----------|------|------------|---------|
| 1 | OpenAI | 🤖 | `sk-...` | platform.openai.com |
| 2 | Anthropic | 🧠 | `sk-ant-...` | console.anthropic.com |
| 3 | Google AI | ✨ | Standard | makersuite.google.com |
| 4 | Cohere | 💬 | Standard | dashboard.cohere.com |
| 5 | Hugging Face | 🤗 | Token | huggingface.co |
| 6 | Together AI | 🦙 | Standard | api.together.xyz |

---

## ⚡ Quick Actions

### Add API Key
```
1. Paste key in input field
2. Auto-saved to localStorage
3. Click [Test] button
```

### Show/Hide Key
```
Click [👁] icon to toggle visibility
```

### Clear Key
```
Click [🗑] icon to remove key
```

### Test One Provider
```
Click [Test] button on provider card
```

### Test All Providers
```
Click [Test All] button at top of page
```

---

## 🎯 Performance Ratings

| Time | Rating | Color |
|------|--------|-------|
| < 500ms | Excellent | 🟢 Green |
| 500ms-1.5s | Good | 🔵 Blue |
| 1.5s-3s | Fair | 🟡 Yellow |
| > 3s | Slow | 🔴 Red |

---

## 🔒 Security Checklist

- ✅ Keys stored in browser only
- ✅ Never sent to BookingTMS
- ✅ Direct calls to providers
- ✅ Super Admin access only
- ✅ Show/hide toggle available
- ✅ One-click removal

---

## ✅ Success Indicators

**Connected**:
- 🟢 Green "Connected" badge
- ✅ Checkmark in results
- Response time displayed
- AI response shown

**Failed**:
- 🔴 Red "Failed" badge
- ❌ X mark in results
- Error message shown
- Details for debugging

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Invalid key format | Check starts with `sk-` (OpenAI) or `sk-ant-` (Anthropic) |
| Connection failed | Verify internet + key is active |
| Slow response | Normal for some providers |
| Rate limit | Wait a few minutes |

---

## 💰 Cost Per Test

| Provider | Approx. Cost |
|----------|--------------|
| OpenAI GPT-3.5 | ~$0.0001 |
| Claude Haiku | ~$0.00003 |
| Gemini Pro | ~$0.00003 |
| Others | Varies |

**Note**: Most providers offer free tiers

---

## 🎨 UI Elements

### Buttons
```
[Test]              → Test one provider
[Test All]          → Test all configured
[👁]                → Show key
[👁️]                → Hide key
[🗑]                → Clear key
```

### Status Badges
```
[Connected ✅]      → Success
[Failed ❌]         → Error
[Testing... ⏳]     → In progress
```

---

## 📊 Result Display

### Success
```
✅ Successfully connected
⏱ 850ms (Good)
Model: gpt-3.5-turbo
Response: "Connection successful"
Usage: {"tokens": 20}
```

### Error
```
❌ HTTP 401: Invalid key
⏱ 450ms
Error: {"message": "Invalid key"}
```

---

## 🎓 Quick Start (60 Seconds)

1. **Get Key** (30s)
   - Go to provider website
   - Sign up / login
   - Generate API key
   - Copy to clipboard

2. **Add Key** (15s)
   - Paste in input field
   - Auto-saved instantly

3. **Test** (15s)
   - Click [Test] button
   - Wait for result
   - Verify success ✅

**Total**: 60 seconds

---

## 🔗 Provider Links

### Quick Links
```
OpenAI:         https://platform.openai.com
Anthropic:      https://console.anthropic.com
Google AI:      https://makersuite.google.com
Cohere:         https://dashboard.cohere.com
Hugging Face:   https://huggingface.co
Together AI:    https://api.together.xyz
```

---

## 💡 Pro Tips

1. **Start Simple**: Test one provider first
2. **Compare**: Try 2-3 providers to compare
3. **Monitor**: Check response times regularly
4. **Backup**: Configure multiple providers
5. **Secure**: Clear keys on shared computers

---

## 📱 Mobile vs Desktop

### Desktop
- Side-by-side layout
- Wider cards
- More visible details

### Mobile
- Stacked layout
- Full-width cards
- Scrollable results

---

## 🎯 Common Use Cases

### 1. First Setup
```
Get key → Add key → Test → Verify
```

### 2. Comparison
```
Add 3 keys → Test All → Compare times
```

### 3. Debugging
```
Test → See error → Check key → Re-test
```

### 4. Monitoring
```
Weekly test → Check times → Ensure working
```

---

## 📈 Success Metrics

### Good Setup
- ✅ Response < 1.5s
- ✅ 100% success rate
- ✅ Multiple providers

### Excellent Setup
- ✅ Response < 1s
- ✅ 3+ providers
- ✅ Regular testing

---

## 🆘 Need Help?

### Documentation
- **Full Guide**: `/LLM_INTEGRATION_GUIDE.md`
- **Quick Start**: `/LLM_QUICK_START.md`
- **Visual Guide**: `/LLM_VISUAL_GUIDE.md`

### Quick Fixes
- Check provider status page
- Regenerate API key
- Try different provider
- Check internet connection

---

## 🔑 API Key Formats

### OpenAI
```
sk-proj-abc123...
sk-abc123...
(starts with "sk-")
```

### Anthropic
```
sk-ant-api03-abc123...
(starts with "sk-ant-")
```

### Others
```
Standard format
(at least 20 characters)
```

---

## 🎨 Color Guide

### Dark Mode
- Background: `#0a0a0a`
- Cards: `#161616`
- Primary: `#4f46e5`

### Light Mode
- Background: `#gray-50`
- Cards: `white`
- Primary: `#4f46e5`

---

## 🎬 Workflow

```
┌──────────────┐
│  Get API Key │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Add to UI   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Test Conn   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Verify OK   │
└──────────────┘
```

---

## 📅 Maintenance Schedule

### Daily
- ❌ Not needed

### Weekly
- ❌ Not needed

### Monthly
- ✅ Test all connections
- ✅ Check performance

### Quarterly
- ✅ Rotate API keys
- ✅ Review providers
- ✅ Update if needed

---

## 🎯 Remember

1. **Super Admin Only** - Access restricted
2. **Local Storage** - Keys stay in browser
3. **Direct Calls** - No backend involvement
4. **Test First** - Verify before production
5. **Multiple Providers** - Good for backup

---

## 📊 At a Glance

```
Feature          Status
─────────────────────────
Providers:       6 ✅
Storage:         localStorage ✅
Security:        Client-only ✅
Dark Mode:       Yes ✅
Mobile:          Responsive ✅
Testing:         Real API ✅
Documentation:   Complete ✅
```

---

## 🚀 Next Steps

1. ✅ Read this cheat sheet
2. ✅ Get one API key
3. ✅ Add and test it
4. ✅ Verify success
5. ✅ Add more providers (optional)
6. ✅ Test regularly

---

**Print this page for quick reference!**

**Last Updated**: November 4, 2025  
**Version**: 1.0  
**Quick Reference**: Always available
