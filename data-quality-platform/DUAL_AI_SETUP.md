# Dual AI Provider Setup - OpenRouter + Ollama

Your Data Quality Platform now supports **dual AI providers** with automatic fallback:

## 🎯 Provider Priority

1. **Primary**: OpenRouter GLM-4.5-Air (Free) - Cloud-based, no installation
2. **Fallback**: Ollama Gemma3:1b - Local, privacy-first

The system **automatically tries OpenRouter first**, and if it fails or isn't configured, it **seamlessly falls back to Ollama**.

---

## 🚀 Quick Setup

### Option 1: OpenRouter Only (Easiest)

```bash
# 1. Get FREE API key from OpenRouter
# Visit: https://openrouter.ai/keys

# 2. Add to backend/.env file
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=z-ai/glm-4.5-air:free

# 3. Start backend
cd backend
npm start

# That's it! No Ollama installation needed.
```

### Option 2: Ollama Only (Privacy-First)

```bash
# 1. Install Ollama
# Windows: https://ollama.com/download/windows
# macOS/Linux: curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull model
ollama pull gemma3:1b

# 3. Start backend (no .env changes needed)
cd backend
npm start

# Works offline, data stays local
```

### Option 3: Both (Recommended - Best Reliability)

```bash
# 1. Setup OpenRouter (Option 1)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# 2. Setup Ollama (Option 2)
ollama pull gemma3:1b

# 3. Start backend
cd backend
npm start

# ✅ Uses OpenRouter primarily
# ✅ Falls back to Ollama if OpenRouter fails
# ✅ Best of both worlds!
```

---

## 📋 Configuration

### Environment Variables

Create `backend/.env`:

```bash
# OpenRouter Configuration (Primary)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=z-ai/glm-4.5-air:free

# Ollama Configuration (Fallback)
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:1b

# Other settings
PORT=5000
NODE_ENV=development
```

### How It Works

```
File Upload → AI Analysis Needed
     ↓
Try OpenRouter (if API key exists)
     ├─ Success → Use OpenRouter response ✅
     └─ Fail → Fall back to Ollama
            ├─ Success → Use Ollama response ✅
            └─ Fail → Continue with basic profiling ⚠️
```

**Key Feature**: Process ALWAYS continues, even if both AI providers fail. You'll get basic data profiling at minimum.

---

## 🔍 Getting OpenRouter API Key (FREE)

1. **Visit**: https://openrouter.ai/keys
2. **Sign up** (free account)
3. **Create API key**
4. **Copy key** (starts with `sk-or-v1-...`)
5. **Add to .env**:
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

### GLM-4.5-Air Free Model

- **Model**: `z-ai/glm-4.5-air:free`
- **Cost**: 100% FREE
- **Limits**: Generous free tier
- **Quality**: Excellent for data quality analysis
- **Speed**: Fast responses

---

## 🏠 Installing Ollama (Fallback)

### Windows

1. Download: https://ollama.com/download/windows
2. Run installer
3. Ollama starts automatically
4. Pull model:
   ```bash
   ollama pull gemma3:1b
   ```

### macOS

```bash
# Install
brew install ollama

# Start service
ollama serve

# Pull model
ollama pull gemma3:1b
```

### Linux

```bash
# Install
curl -fsSL https://ollama.com/install.sh | sh

# Start service
ollama serve

# Pull model
ollama pull gemma3:1b
```

---

## ✅ Verify Setup

### Check AI Service Status

```bash
# Start backend
cd backend
npm start

# Check logs for:
# ✓ "AI Service: OpenRouter (z-ai/glm-4.5-air:free) with Ollama fallback"
# or
# ⚠ "AI Service: Ollama only (gemma3:1b) - No OpenRouter API key"
```

### Test with Health Check

```bash
# Call health endpoint
curl http://localhost:5000/api/monitoring/health

# Expected response:
{
  "status": "healthy",
  "primaryProvider": "OpenRouter",
  "providers": {
    "openrouter": {
      "status": "healthy",
      "model": "z-ai/glm-4.5-air:free",
      "available": true,
      "primary": true
    },
    "ollama": {
      "status": "healthy",
      "model": "gemma3:1b",
      "available": true,
      "fallback": true,
      "installedModels": ["gemma3:1b"]
    }
  }
}
```

### Upload Test Data

1. Start frontend: `cd frontend && npm run dev`
2. Open http://localhost:3000
3. Upload a CSV file
4. Check backend logs for:
   - `✓ Using OpenRouter for analysis` (if primary works)
   - `⚠ OpenRouter failed, falling back to Ollama...` (if fallback needed)

---

## 📊 Provider Comparison

| Feature | OpenRouter | Ollama |
|---------|-----------|--------|
| **Cost** | FREE | FREE |
| **Installation** | None (API only) | Local (~2GB) |
| **Internet** | Required | Not required |
| **Speed** | Fast (cloud) | Very fast (local) |
| **Privacy** | Data sent to API | Data stays local |
| **Model** | GLM-4.5-Air | Gemma3:1b |
| **Reliability** | Depends on network | Depends on local resources |
| **Setup Time** | 2 minutes | 10 minutes |

---

## 🎯 Recommended Scenarios

### Use OpenRouter Only When:
- ✅ You have stable internet
- ✅ You want zero installation
- ✅ You need fastest setup
- ✅ Privacy is not a concern

### Use Ollama Only When:
- ✅ You need offline capability
- ✅ Privacy is critical
- ✅ You have local GPU/resources
- ✅ You want no API dependencies

### Use Both (Recommended) When:
- ✅ You want maximum reliability
- ✅ You want automatic fallback
- ✅ You want best of both worlds
- ✅ Production deployment

---

## 🐛 Troubleshooting

### OpenRouter Issues

**Problem**: "OpenRouter API key not configured"
```bash
# Solution: Add API key to .env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Problem**: "OpenRouter request failed"
```bash
# Check:
1. API key is valid
2. Internet connection working
3. Free tier limits not exceeded

# System will auto-fallback to Ollama
```

### Ollama Issues

**Problem**: "Ollama not running"
```bash
# Start Ollama
ollama serve

# Or on Windows, check system tray
```

**Problem**: "Model not found"
```bash
# Pull model
ollama pull gemma3:1b

# Verify
ollama list
```

### Both Failing

**Problem**: Both providers unavailable
```bash
# Check backend logs
tail -f backend/logs/combined.log

# System continues with basic profiling
# Issues will be detected using rule-based logic
```

---

## 🔄 Switching Providers

### Switch from Ollama to OpenRouter

```bash
# Just add API key to .env
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Restart backend
# OpenRouter becomes primary automatically
```

### Switch from OpenRouter to Ollama Only

```bash
# Remove or comment out API key in .env
# OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Restart backend
# Ollama becomes primary automatically
```

### Force Use of Specific Provider

```bash
# In .env, leave one configured and remove the other

# OpenRouter only:
OPENROUTER_API_KEY=sk-or-v1-your-key-here
# (Don't start Ollama)

# Ollama only:
# (Don't set OPENROUTER_API_KEY)
# (Start Ollama)
```

---

## 📈 Performance Tips

### For Best OpenRouter Performance:
- Use stable internet connection
- Keep requests under 500 tokens (default)
- Monitor free tier usage

### For Best Ollama Performance:
- Use SSD for model storage
- Allocate sufficient RAM (4GB+)
- Consider GPU acceleration if available

### For Best Overall Performance:
- Configure both providers
- OpenRouter handles burst loads
- Ollama provides consistent baseline

---

## 🔐 Security Notes

### OpenRouter:
- API key stored in .env (add to .gitignore)
- Data transmitted over HTTPS
- Free tier has rate limits

### Ollama:
- All data processed locally
- No external API calls
- GDPR/HIPAA friendly

### Dual Setup:
- Sensitive data → Ollama processes locally
- Regular data → OpenRouter (faster)
- Best security + performance balance

---

## 📞 Support

### OpenRouter Support:
- Docs: https://openrouter.ai/docs
- Discord: https://discord.gg/openrouter

### Ollama Support:
- Docs: https://ollama.com/docs
- GitHub: https://github.com/ollama/ollama

### Platform Support:
- Check backend logs: `backend/logs/combined.log`
- Test health: `curl http://localhost:5000/api/monitoring/health`

---

## ✨ Summary

**Dual-provider setup gives you:**

✅ **Reliability** - Automatic failover if primary fails  
✅ **Flexibility** - Choose based on needs  
✅ **Zero downtime** - Always has a working provider  
✅ **Easy setup** - Just add API key or install Ollama  
✅ **Best performance** - Cloud speed + local privacy  

**Start with OpenRouter** (easiest), **add Ollama** for reliability!
