# 🚀 Quick Guide: Switch to OpenAI (10 Minutes)

## What Happened?

You're seeing this error from Z.ai:
```
Error 429: Insufficient balance or no resource package. Please recharge.
```

**Translation:** Your Z.ai account is out of credits.

**Solution:** Switch to OpenAI (recommended) ⭐

---

## ⚡ 3-Step Fix

### Step 1: Get OpenAI API Key (5 min)

1. **Go to OpenAI:**
   ```
   https://platform.openai.com/signup
   ```

2. **Add Billing** (REQUIRED):
   ```
   https://platform.openai.com/account/billing
   ```
   - Add credit card
   - No upfront payment required
   - You only pay for what you use
   - Typical cost: ~$0.01 per conversation

3. **Create API Key:**
   ```
   https://platform.openai.com/api-keys
   ```
   - Click "Create new secret key"
   - Name it "BookingTMS"
   - **Copy the key** (starts with `sk-`)
   - ⚠️ You won't see it again!

### Step 2: Configure in BookingTMS (2 min)

1. **Open AI Agents Page**
   ```
   Navigate: AI Agents → Customer Assistance
   ```

2. **Click "Configure AI Provider"**
   - Look for the configuration card
   - Click the button

3. **Configure OpenAI**
   ```
   Provider: OpenAI (GPT-3.5, GPT-4) ⭐ Recommended
   Model: GPT-3.5 Turbo
   API Key: [paste your key]
   ```

4. **Save**
   - Click "Save Configuration"
   - You'll see: "✅ OpenAI configured"

### Step 3: Test It (3 min)

1. **Click "Test in Embed"**
2. **Start Chatting**
   - Try: "Show me available escape rooms"
   - Try: "I want to book for 4 people"
3. **Verify**
   - Should get intelligent responses
   - No errors in console
   - Chat works smoothly

---

## ✅ You're Done!

Your AI chatbot is now powered by OpenAI. It will:
- Give better, more natural responses
- Be more reliable
- Cost about the same (pay-as-you-go)
- Work immediately

---

## 🔄 Want to Use Both?

You can keep both OpenAI and Z.ai configured:

1. **Configure OpenAI** (as above)
2. **Keep Z.ai configured** (your key is saved)
3. **Switch anytime:**
   - Go to AI Agents → Configure AI Provider
   - Select provider from dropdown
   - Both keys are saved

---

## 📊 Quick Comparison

| Feature | OpenAI | Z.ai |
|---------|--------|------|
| **Setup** | 5 min ⭐ | 5 min |
| **Quality** | Excellent ⭐ | Good |
| **Reliability** | Very High ⭐ | Medium |
| **Cost** | ~$0.01/chat | Lower (when funded) |
| **Support** | Excellent ⭐ | Limited |
| **Recommended** | ✅ Yes | For advanced users |

---

## 🐛 Troubleshooting

### "Invalid API key"
- Make sure you copied the entire key
- Should start with `sk-`
- Create a new one if needed

### "You exceeded your quota"
- Add billing at OpenAI dashboard
- Add payment method
- Check usage limits

### Still seeing Z.ai errors?
- Verify provider shows "OpenAI" in settings
- Clear browser cache and reload
- Check console for "Calling OpenAI API"

---

## 💡 Pro Tips

1. **Monitor Usage**
   - Check: https://platform.openai.com/usage
   - Set up billing alerts
   - Typical usage: $5-20/month for active site

2. **Choose Right Model**
   - **GPT-3.5 Turbo**: Fast & cheap (recommended for most)
   - **GPT-4**: Better quality, more expensive
   - **GPT-4 Turbo**: Balanced option

3. **Set Limits**
   - Set monthly budget in OpenAI dashboard
   - Get email alerts at 50%, 75%, 90%
   - Prevents surprise bills

---

## 📞 Need Help?

### Check These First:
1. Browser console (F12) for error messages
2. AI Agents page → verify "Provider: OpenAI"
3. OpenAI dashboard → check billing is set up

### Common Issues:
- ✅ No billing set up → Add payment method
- ✅ Wrong API key → Create new one
- ✅ Provider not switched → Verify in settings

---

**Total Time:** ~10 minutes  
**Cost:** Pay-as-you-go (typically $5-20/month)  
**Difficulty:** Easy ⭐  
**Result:** Better AI chatbot with OpenAI

---

## 🎯 What Changed in BookingTMS?

We updated the system to make OpenAI the **default and recommended** provider:

✅ OpenAI is now selected by default  
✅ GPT-3.5 Turbo is the default model  
✅ Z.ai is still available as an alternative  
✅ Better error messages for Z.ai issues  
✅ Provider status shows in Customer Assistance  

---

**Ready to switch?** Follow Step 1 above! 🚀
