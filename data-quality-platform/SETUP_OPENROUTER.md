# OpenRouter API Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Your Free API Key

1. **Visit OpenRouter**: https://openrouter.ai/keys
2. **Sign Up** (free account)
   - Use Google, GitHub, or email
3. **Create API Key**:
   - Click "Create Key"
   - Name it: "Data Quality Platform"
   - Copy the key (starts with `sk-or-v1-...`)

### Step 2: Add API Key to Environment

Open `backend/.env` and update:

```env
# Replace this line with your actual API key:
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

**Example:**
```env
OPENROUTER_API_KEY=sk-or-v1-abc123def456...
OPENROUTER_MODEL=z-ai/glm-4.5-air:free
```

### Step 3: Restart the Backend

```powershell
# If backend is running, restart it:
cd backend
npm run dev
```

---

## About the Model: z-ai/glm-4.5-air:free

### Key Features:
- ✅ **FREE** - No cost for usage
- ✅ **Fast** - Quick response times
- ✅ **Smart** - Good for data quality tasks
- ✅ **No Rate Limits** - Generous free tier

### What It's Used For:
1. **Synthetic Data Generation** - Create test data
2. **Duplicate Detection** - Find similar records
3. **Missing Value Imputation** - Smart fill-ins
4. **Format Standardization** - Clean addresses, phones, etc.
5. **Outlier Detection** - Spot anomalies
6. **Remediation Suggestions** - AI-powered fixes

---

## Free Tier Details

OpenRouter offers generous free tier:
- **Free Models**: Including z-ai/glm-4.5-air:free
- **No Credit Card Required** (for free models)
- **Rate Limits**: Reasonable limits for development
- **Credits**: Optional paid credits for premium models

---

## Verify Setup

### Test API Connection:

1. **Check Backend Health**:
```powershell
curl http://localhost:3001/api/health
```

2. **Try AI Features**:
   - Upload a CSV file
   - Go to Issues page
   - Click on an issue
   - Check "AI-Powered Remediation Suggestions"

---

## Troubleshooting

### Error: "API key not configured"
**Solution**: Make sure `.env` file has your key:
```env
OPENROUTER_API_KEY=sk-or-v1-...
```

### Error: "Invalid API key"
**Solutions**:
1. Check for typos in the key
2. Ensure no extra spaces
3. Regenerate key at https://openrouter.ai/keys

### Error: "Rate limit exceeded"
**Solutions**:
1. Wait a few minutes
2. Check usage at https://openrouter.ai/activity
3. Free tier has reasonable limits

### Error: "Model not found"
**Solution**: Verify model name in `.env`:
```env
OPENROUTER_MODEL=z-ai/glm-4.5-air:free
```

---

## API Key Security

### ⚠️ Important:
- **Never commit** `.env` file to Git
- **Never share** your API key publicly
- **Regenerate** if accidentally exposed
- **Use environment variables** in production

### Good Practices:
```env
# ✅ Good - Real key in .env (gitignored)
OPENROUTER_API_KEY=sk-or-v1-abc123...

# ❌ Bad - Don't hardcode in source files
const apiKey = "sk-or-v1-abc123..."
```

---

## Alternative Models (Optional)

You can use other OpenRouter models by changing `.env`:

### Other Free Models:
```env
# Google Gemma
OPENROUTER_MODEL=google/gemma-7b-it:free

# Meta Llama
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct:free
```

### Paid Models (Better Quality):
```env
# GPT-4 Turbo
OPENROUTER_MODEL=openai/gpt-4-turbo

# Claude 3
OPENROUTER_MODEL=anthropic/claude-3-opus
```

**Note**: Paid models require adding credits at https://openrouter.ai/credits

---

## Getting Help

- **OpenRouter Docs**: https://openrouter.ai/docs
- **API Keys**: https://openrouter.ai/keys
- **Activity Log**: https://openrouter.ai/activity
- **Discord Support**: https://discord.gg/openrouter

---

## Next Steps

Once your API key is set up:

1. ✅ Start the application
2. ✅ Upload sample data
3. ✅ View AI-powered suggestions
4. ✅ Test remediation features
5. ✅ Monitor quality improvements

Happy data quality monitoring! 🚀

