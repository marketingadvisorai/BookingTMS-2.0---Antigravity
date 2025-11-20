# LLM Connections - Quick Start Guide

## 🚀 60-Second Setup

### Step 1: Get an API Key (Choose One)
Pick the easiest option for you:

#### Option A: OpenAI (Most Popular)
1. Go to https://platform.openai.com/signup
2. Sign up and verify email
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

#### Option B: Google AI (Free & Easy)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

#### Option C: Anthropic Claude (High Quality)
1. Go to https://console.anthropic.com/
2. Sign up for account
3. Navigate to API Keys
4. Generate new key (starts with `sk-ant-`)
5. Copy the key

### Step 2: Add to Dashboard
1. Login to BookingTMS as **Super Admin**
2. Click **Backend Dashboard** in sidebar
3. Click **LLM Connections** tab
4. Paste your API key in the appropriate field
5. Click **Test** button

### Step 3: Verify Connection
✅ **Success**: You'll see:
- Green "Connected" badge
- Response time (usually < 1 second)
- Test message from the AI model

❌ **Failed**: Check:
- API key is correct
- No extra spaces in key
- Key hasn't expired
- Internet connection is working

---

## 📊 Dashboard Features

### Main Interface
```
┌─────────────────────────────────────────────┐
│  LLM API Connections          [Test All]    │
├─────────────────────────────────────────────┤
│                                             │
│  🤖 OpenAI                     [Connected]  │
│  GPT-4, GPT-3.5, and other OpenAI models   │
│  API Key: ****************** [👁] [🗑]     │
│  [Test]                                     │
│                                             │
│  ✅ Successfully connected to OpenAI API    │
│  ⏱ 850ms (Good)                            │
│  Model: gpt-3.5-turbo                       │
│  Response: "Connection successful"          │
│                                             │
└─────────────────────────────────────────────┘
```

### Available Providers

| Provider | Icon | Best For | Free Tier |
|----------|------|----------|-----------|
| **OpenAI** | 🤖 | General purpose, most popular | $5 credit |
| **Anthropic** | 🧠 | High quality, safety-focused | Limited |
| **Google AI** | ✨ | Free tier, multimodal | Generous |
| **Cohere** | 💬 | Text generation, embeddings | Yes |
| **Hugging Face** | 🤗 | Open source models | Yes |
| **Together AI** | 🦙 | Llama 2, open source | Yes |

---

## 🎯 Common Use Cases

### Test Before Production
```
1. Add test API key
2. Click "Test" button
3. Verify response time < 2s
4. Check response quality
5. Use in production ✅
```

### Compare Providers
```
1. Add keys for multiple providers
2. Click "Test All"
3. Compare response times
4. Compare quality
5. Choose best option
```

### Troubleshoot Connection
```
1. Test connection
2. View error details
3. Fix issue (key, network, etc.)
4. Re-test
5. Success ✅
```

---

## ⚡ Pro Tips

### 🔒 Security
- ✅ Keys stored in browser only
- ✅ Never sent to BookingTMS servers
- ✅ Use eye icon to show/hide
- ✅ Clear keys on shared computers

### 💰 Cost Optimization
- Start with free tiers
- Use cheaper models for testing
- Monitor usage on provider dashboards
- Each test costs ~$0.0001

### 🚀 Performance
- **< 500ms**: Excellent ⚡
- **500ms-1.5s**: Good ✅
- **1.5s-3s**: Acceptable ⚠️
- **> 3s**: Slow 🐌

### 🎨 Best Practices
1. **Test regularly**: Before important changes
2. **Rotate keys**: Update every few months
3. **Monitor usage**: Check provider dashboards
4. **Have backup**: Configure 2+ providers
5. **Document**: Note which works best

---

## 🔧 Troubleshooting

### "Invalid API Key Format"
**Problem**: Key doesn't match expected format  
**Solution**: 
- OpenAI keys start with `sk-`
- Anthropic keys start with `sk-ant-`
- Check for extra spaces or characters

### "Connection Failed"
**Problem**: Can't reach API  
**Solution**:
- Check internet connection
- Verify key is active
- Check provider status page
- Try again in a few minutes

### "Slow Response Time"
**Problem**: Taking > 3 seconds  
**Solution**:
- Normal for some providers
- Try different time of day
- Check internet speed
- Consider faster provider

### "Rate Limit Exceeded"
**Problem**: Too many requests  
**Solution**:
- Wait a few minutes
- Upgrade to paid tier
- Use different provider temporarily

---

## 📱 Quick Actions

### View All Keys
```typescript
// Access localStorage directly (browser console)
JSON.parse(localStorage.getItem('llm_api_keys'))
```

### Clear All Keys
```typescript
// Remove all stored keys (browser console)
localStorage.removeItem('llm_api_keys')
```

### Export Configuration
```typescript
// Backup your configuration
const config = localStorage.getItem('llm_api_keys');
console.log(config); // Copy and save securely
```

---

## 🎓 Learning Resources

### Recommended Starting Order
1. **Week 1**: Get OpenAI key, test connection
2. **Week 2**: Try Google AI (free tier)
3. **Week 3**: Add Anthropic for comparison
4. **Week 4**: Explore open-source options

### Best Documentation
- **OpenAI**: https://platform.openai.com/docs (most comprehensive)
- **Google AI**: https://ai.google.dev/tutorials (great tutorials)
- **Anthropic**: https://docs.anthropic.com/ (clear and concise)

### Community Support
- **OpenAI Forum**: https://community.openai.com/
- **Discord Servers**: Most providers have active Discord communities
- **Stack Overflow**: Tag with provider name

---

## 📋 Checklist

### First-Time Setup
- [ ] Choose LLM provider
- [ ] Sign up for account
- [ ] Generate API key
- [ ] Add key to dashboard
- [ ] Test connection
- [ ] Verify response
- [ ] Note performance
- [ ] Save key securely

### Regular Maintenance
- [ ] Test connections monthly
- [ ] Monitor usage/costs
- [ ] Rotate keys quarterly
- [ ] Update to new models
- [ ] Check for outages
- [ ] Review performance
- [ ] Compare alternatives
- [ ] Update documentation

---

## 💡 Example Responses

### OpenAI GPT-3.5
```
✅ Successfully connected to OpenAI API
⏱ 850ms (Good)
Model: gpt-3.5-turbo
Response: "Connection successful"
Usage: {"prompt_tokens": 15, "completion_tokens": 5}
```

### Anthropic Claude
```
✅ Successfully connected to Anthropic API
⏱ 650ms (Good)
Model: claude-3-haiku-20240307
Response: "Connection successful"
Usage: {"input_tokens": 15, "output_tokens": 5}
```

### Google Gemini
```
✅ Successfully connected to Google AI API
⏱ 420ms (Excellent)
Model: gemini-pro
Response: "Connection successful"
```

---

## 🆘 Need Help?

### Quick Answers
1. **Where are keys stored?** Browser localStorage only
2. **Are keys secure?** Yes, never sent to our servers
3. **Can I use multiple?** Yes, test as many as you want
4. **What if I lose keys?** Regenerate from provider
5. **Who can access this?** Super Admin only

### Getting Support
1. Check this guide first
2. Review provider documentation
3. Test with different provider
4. Check provider status page
5. Contact provider support

### Emergency Actions
- **Compromised Key**: Regenerate immediately at provider
- **Lost Key**: Can't recover, generate new one
- **Billing Issues**: Contact provider directly
- **Technical Issues**: Check provider status first

---

## 🎯 Success Metrics

### Good Setup
- ✅ Response time < 1.5s
- ✅ 100% success rate
- ✅ Keys backed up securely
- ✅ Alternative provider ready
- ✅ Usage monitored

### Excellent Setup
- ✅ Multiple providers configured
- ✅ Response time < 1s
- ✅ Monthly testing scheduled
- ✅ Cost optimization strategy
- ✅ Documentation updated

---

**Remember**: Start simple with one provider, then expand as needed!

**Last Updated**: November 4, 2025  
**Version**: 1.0  
**Next Review**: December 4, 2025
