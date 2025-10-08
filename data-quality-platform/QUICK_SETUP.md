# ⚡ Quick Setup - Choose Your AI Provider

## 🎯 3 Setup Options

### Option 1: OpenRouter (Easiest - 2 Minutes)

```bash
# 1. Get FREE API key: https://openrouter.ai/keys
# 2. Create backend/.env:
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# 3. Start
cd backend && npm start
cd frontend && npm run dev

# ✅ Done! No installation needed.
```

**Pros**: Zero installation, cloud-based, fast setup  
**Cons**: Requires internet

---

### Option 2: Ollama (Privacy-First - 10 Minutes)

```bash
# 1. Install Ollama: https://ollama.com/download
# 2. Pull model:
ollama pull gemma3:1b

# 3. Start (no .env needed)
cd backend && npm start
cd frontend && npm run dev

# ✅ Done! Works offline.
```

**Pros**: Local, private, no API keys  
**Cons**: ~2GB download, local resources

---

### Option 3: Both (Best - 12 Minutes)

```bash
# 1. Setup OpenRouter (Option 1)
# 2. Setup Ollama (Option 2)
# 3. Start servers

# ✅ Primary: OpenRouter
# ✅ Fallback: Ollama
# ✅ Maximum reliability!
```

**Pros**: Automatic failover, best reliability  
**Cons**: Slightly longer setup

---

## 🚀 After Setup

1. Open: http://localhost:3000
2. Upload CSV file
3. View Results:
   - **Dashboard** → Overall DQI score
   - **Issues** → Detected problems
   - **Quality** → 7-dimension breakdown

---

## 📊 How It Works

```
File Upload
    ↓
Try OpenRouter (if configured)
    ├─ Works? → ✅ Use it
    └─ Fails? → Try Ollama
            ├─ Works? → ✅ Use it
            └─ Fails? → ⚠️ Basic profiling
```

**Result**: Issues ALWAYS detected and displayed!

---

## ✅ Verify It's Working

### Check Logs:
```bash
# Backend should show:
✓ AI Service: OpenRouter with Ollama fallback
# or
⚠ AI Service: Ollama only
```

### Upload Test File:
1. Upload any CSV
2. Wait 10-30 seconds
3. Check **Issues** page
4. Should see detected problems!

---

## 🐛 Quick Troubleshooting

**No issues showing?**
- Wait 30 seconds (background processing)
- Check backend logs: `backend/logs/combined.log`
- Refresh Issues page

**OpenRouter not working?**
- Verify API key in `.env`
- Check internet connection
- System auto-falls back to Ollama

**Ollama not working?**
- Run: `ollama serve`
- Verify model: `ollama list`
- Should see `gemma3:1b`

---

## 📚 Full Documentation

- `DUAL_AI_SETUP.md` - Complete dual-provider guide
- `README.md` - Full platform docs
- `AI_DETECTION_GUIDE.md` - AI detection details

---

## 💡 Recommendations

| Scenario | Recommended Setup |
|----------|------------------|
| Quick test | OpenRouter only |
| Production | Both (failover) |
| Privacy-critical | Ollama only |
| No internet | Ollama only |
| Fastest setup | OpenRouter only |

---

**Ready in 2 minutes with OpenRouter!** 🚀  
**Need privacy? Use Ollama!** 🔒  
**Want both? Get maximum reliability!** ✨
