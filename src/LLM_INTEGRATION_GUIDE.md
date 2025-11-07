# LLM Integration Guide

## Overview

The Backend Dashboard now includes comprehensive LLM (Large Language Model) API connection testing, allowing Super Admin users to test connections to 6 major LLM providers directly from the admin interface.

## Supported LLM Providers

### 1. 🤖 OpenAI
- **Models**: GPT-4, GPT-3.5-turbo, and more
- **API Key Format**: Starts with `sk-`
- **Test Model**: `gpt-3.5-turbo`
- **Get API Key**: https://platform.openai.com/signup
- **Docs**: https://platform.openai.com/docs

### 2. 🧠 Anthropic Claude
- **Models**: Claude 3 Opus, Sonnet, Haiku
- **API Key Format**: Starts with `sk-ant-`
- **Test Model**: `claude-3-haiku-20240307`
- **Get API Key**: https://console.anthropic.com/
- **Docs**: https://docs.anthropic.com/

### 3. ✨ Google AI (Gemini)
- **Models**: Gemini Pro, Gemini Ultra
- **API Key Format**: Standard format
- **Test Model**: `gemini-pro`
- **Get API Key**: https://makersuite.google.com/app/apikey
- **Docs**: https://ai.google.dev/docs

### 4. 💬 Cohere
- **Models**: Command, Command Light
- **API Key Format**: Standard format
- **Test Model**: `command`
- **Get API Key**: https://dashboard.cohere.com/
- **Docs**: https://docs.cohere.com/

### 5. 🤗 Hugging Face
- **Models**: Access to entire model hub
- **API Key Format**: Standard token format
- **Test Model**: `gpt2`
- **Get API Key**: https://huggingface.co/settings/tokens
- **Docs**: https://huggingface.co/docs

### 6. 🦙 Together AI
- **Models**: Llama 2, Mistral, and other open-source models
- **API Key Format**: Standard format
- **Test Model**: `togethercomputer/llama-2-7b-chat`
- **Get API Key**: https://api.together.xyz/
- **Docs**: https://docs.together.ai/

## Features

### ✅ API Key Management
- **Secure Storage**: API keys stored locally in browser's localStorage
- **Never Sent to Backend**: Keys only used for direct calls to LLM providers
- **Show/Hide Toggle**: View or mask your API keys
- **Clear Option**: Easy removal of stored keys

### ✅ Connection Testing
- **Individual Tests**: Test each provider separately
- **Bulk Testing**: "Test All" button for configured providers
- **Real Response**: Actual API calls to verify connectivity
- **Performance Metrics**: Latency tracking with ratings

### ✅ Results Display
- **Status Badges**: Connected/Failed status
- **Response Time**: Latency with performance rating (Excellent/Good/Fair/Slow)
- **Model Information**: Shows which model was tested
- **API Response**: Displays actual response from the model
- **Usage Data**: Token usage information (when available)
- **Error Details**: Clear error messages for troubleshooting

### ✅ Dark Mode Support
- Full dark mode compatibility
- Follows BookingTMS design system
- Uses vibrant blue (#4f46e5) for primary actions

## How to Use

### Step 1: Access the Dashboard
1. Login as **Super Admin** (Backend Dashboard is Super Admin only)
2. Navigate to **Backend Dashboard** from the sidebar
3. Click on the **"LLM Connections"** tab

### Step 2: Add API Keys
1. Find your desired LLM provider
2. Enter your API key in the input field
3. The key is automatically saved to localStorage
4. Use the eye icon to show/hide the key
5. Use the trash icon to clear the key

### Step 3: Test Connection
1. Click the **"Test"** button for a specific provider
2. Or click **"Test All"** to test all configured providers
3. Wait for the test to complete (typically 0.5-3 seconds)
4. View the results below the input field

### Step 4: Review Results
- **Status Badge**: Green "Connected" or red "Failed"
- **Response Time**: Shows latency with performance rating
- **Model**: Which model was tested
- **Response**: The actual text response from the API
- **Usage**: Token usage statistics
- **Error**: Detailed error information if the test failed

## API Key Validation

The system performs basic validation before making API calls:

### OpenAI
- Must start with `sk-`
- Minimum 20 characters

### Anthropic
- Must start with `sk-ant-`
- Minimum 20 characters

### Other Providers
- Minimum 20 characters
- Standard format validation

## Performance Ratings

Response times are rated as follows:

| Latency | Rating | Color | Description |
|---------|--------|-------|-------------|
| < 500ms | Excellent | 🟢 Green | Optimal performance |
| 500ms - 1.5s | Good | 🔵 Blue | Normal performance |
| 1.5s - 3s | Fair | 🟡 Yellow | Acceptable performance |
| > 3s | Slow | 🔴 Red | Poor performance |

## Security & Privacy

### 🔒 Security Features
1. **Local Storage Only**: API keys never leave your browser
2. **No Backend Transmission**: Keys not sent to BookingTMS servers
3. **Direct API Calls**: Communication goes directly to LLM providers
4. **Password Masking**: Keys hidden by default
5. **Easy Cleanup**: One-click key removal

### ⚠️ Best Practices
1. **Never Share Keys**: Keep your API keys private
2. **Use Test Keys**: Consider using test/development keys initially
3. **Monitor Usage**: Check your usage on provider dashboards
4. **Rotate Keys**: Regularly update your API keys
5. **Clear When Done**: Remove keys from public/shared computers

## Troubleshooting

### Connection Failed
- **Invalid API Key**: Check key format and validity
- **Expired Key**: Generate a new key from provider
- **Rate Limit**: Wait and try again later
- **Network Issues**: Check internet connection
- **CORS Issues**: Some providers may have restrictions

### API Key Format Invalid
- Verify key format matches provider requirements
- Check for extra spaces or characters
- Regenerate key from provider dashboard

### Slow Response Times
- **Normal**: Some providers naturally slower
- **Network**: Check internet connection speed
- **Server Load**: Provider servers may be busy
- **Model Size**: Larger models take longer

## Technical Implementation

### Files Structure
```
/pages/BackendDashboard.tsx         # Main dashboard with LLM tab
/utils/backend/llmTests.ts          # LLM testing utilities
```

### Key Functions
```typescript
// Test a specific LLM provider
testLLMProvider(providerId: string, apiKey: string): Promise<LLMConnectionResult>

// Validate API key format
validateApiKeyFormat(providerId: string, apiKey: string): { valid: boolean, message: string }

// Get performance rating
getLLMPerformanceRating(ms: number): { rating: string, label: string, color: string }

// Format latency display
formatLLMLatency(ms: number): string
```

### Provider Configuration
```typescript
interface LLMProvider {
  id: string;              // Unique identifier
  name: string;            // Display name
  envVar: string;          // Environment variable name
  apiUrl: string;          // API endpoint
  testModel: string;       // Model used for testing
  description: string;     // Short description
  icon: string;           // Emoji icon
}
```

## Integration with AI Agents Page

While the LLM connections tab is primarily for testing, you can use these connections for the AI Agents feature:

1. Test and validate your LLM API keys here first
2. Store working keys securely
3. Use the same keys in your AI Agents configuration
4. Monitor performance and switch providers as needed

## Cost Considerations

### API Call Costs
Each test makes a minimal API call:
- **OpenAI GPT-3.5**: ~$0.0001 per test
- **Claude Haiku**: ~$0.00003 per test
- **Gemini Pro**: ~$0.00003 per test
- **Other Providers**: Varies by model

### Free Tiers
Many providers offer free tiers:
- **OpenAI**: $5 free credit for new accounts
- **Anthropic**: Limited free tier
- **Google AI**: Generous free tier
- **Cohere**: Free tier available
- **Hugging Face**: Many free models
- **Together AI**: Free tier available

## Future Enhancements

### Planned Features
- [ ] Model selection dropdown (not just test model)
- [ ] Custom prompt testing
- [ ] Token usage tracking
- [ ] Cost estimation
- [ ] Response comparison between providers
- [ ] Historical test results
- [ ] Export test results
- [ ] Automated testing scheduler
- [ ] Performance benchmarking
- [ ] Integration with AI Agents page

## Support Resources

### OpenAI
- Docs: https://platform.openai.com/docs
- Community: https://community.openai.com/
- Status: https://status.openai.com/

### Anthropic
- Docs: https://docs.anthropic.com/
- Discord: https://discord.gg/anthropic
- Status: https://status.anthropic.com/

### Google AI
- Docs: https://ai.google.dev/docs
- Forum: https://discuss.ai.google.dev/

### Cohere
- Docs: https://docs.cohere.com/
- Discord: https://discord.gg/cohere

### Hugging Face
- Docs: https://huggingface.co/docs
- Forum: https://discuss.huggingface.co/
- Discord: https://discord.gg/huggingface

### Together AI
- Docs: https://docs.together.ai/
- Discord: https://discord.gg/togetherai

## FAQ

### Q: Are my API keys secure?
**A:** Yes. Keys are stored in localStorage and only used for direct API calls to providers. They never pass through BookingTMS servers.

### Q: Can I use multiple providers simultaneously?
**A:** Yes! You can configure and test as many providers as you want.

### Q: Do I need all providers?
**A:** No. Only configure the providers you plan to use.

### Q: What happens if I clear my browser data?
**A:** Your API keys will be lost. You'll need to re-enter them.

### Q: Can other users see my API keys?
**A:** No. Keys are stored per-browser, per-user. Super Admin access is required to even view this page.

### Q: How often should I test connections?
**A:** Test when:
- First setting up
- Changing API keys
- Troubleshooting issues
- Before important deployments

### Q: Which provider should I use?
**A:** Depends on your needs:
- **Best Quality**: GPT-4, Claude 3 Opus
- **Best Value**: GPT-3.5, Claude Haiku, Gemini Pro
- **Open Source**: Llama 2 (via Together AI)
- **Specialized**: Depends on use case

---

## Quick Reference Card

### Access Path
Login → Backend Dashboard → LLM Connections Tab

### Minimum Requirements
- Super Admin role
- Valid API key from at least one provider
- Internet connection

### Test Time
- Typical: 0.5-3 seconds per provider
- Depends on provider and network

### Storage
- Location: Browser localStorage
- Key: `llm_api_keys`
- Persistence: Until cleared or deleted

### Permissions
- View: Super Admin only
- Edit: Super Admin only
- Test: Super Admin only

---

**Last Updated**: November 4, 2025  
**Version**: 1.0  
**Maintained By**: BookingTMS Development Team

