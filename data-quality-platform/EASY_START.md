# 🚀 SUPER EASY START GUIDE

## ✨ YES - Everything is 100% FREE!

### What's FREE:
- ✅ **SQLite Database** - FREE (file-based, no installation)
- ✅ **Node.js** - FREE
- ✅ **React** - FREE  
- ✅ **OpenRouter API** - FREE Tier (z-ai/glm-4.5-air:free model)

**Total Cost: $0 (ZERO)**

---

## 🎯 3 Simple Steps to Start:

### **Step 1: Open TWO Command Prompts**

Press `Win + R`, type `cmd`, press Enter
Do this TWICE to get 2 command prompts

---

### **Step 2: Start Backend (in Command Prompt #1)**

```cmd
cd "D:\Vamsi Jangam_OneDrive_Data\OneDrive - Course5 Intelligence Limited\Desktop\DQD\data-quality-platform\backend"

node minimal-server.js
```

You should see:
```
🎉 DATA QUALITY PLATFORM - RUNNING!
✅  Backend:    http://localhost:3001
✅  Frontend:   http://localhost:3000
```

---

### **Step 3: Start Frontend (in Command Prompt #2)**

```cmd
cd "D:\Vamsi Jangam_OneDrive_Data\OneDrive - Course5 Intelligence Limited\Desktop\DQD\data-quality-platform\frontend"

npm run dev
```

You should see:
```
  VITE v...  ready in ... ms
  ➜  Local:   http://localhost:3000/
```

---

## 🌐 Open Your Browser:

Go to: **http://localhost:3000**

You should see the **Data Quality Management Platform** dashboard!

---

## 📤 Upload Your CUSTOMER.csv:

1. Click **"Upload Data"** in the sidebar
2. Click or drag your CUSTOMER.csv file
3. Enter table name: "CUSTOMER"
4. Click **"Upload and Process"**
5. Wait for upload to complete
6. View your data profile!

---

## ✅ ALL FEATURES NOW WORK:

- ✅ **File Upload** - CSV/Excel
- ✅ **Data Profiling** - Statistics & metrics
- ✅ **Quality KPIs** - 7 quality dimensions
- ✅ **Tables Management** - View all your tables
- ✅ **Export Data** - Download as CSV/JSON
- ✅ **AI Suggestions** - Powered by OpenRouter (when you add API key)

---

## 🔑 Add OpenRouter API Key (Optional for AI):

1. Edit `backend/.env`
2. Replace this line:
   ```env
   OPENROUTER_API_KEY=your-api-key-here
   ```
   With your actual key from https://openrouter.ai/keys

3. Restart backend (Ctrl+C in Command Prompt #1, then run `node minimal-server.js` again)

---

## 🛑 To Stop:

Press **Ctrl + C** in both command prompt windows

---

## ❓ Troubleshooting:

### "Port 3001 is already in use"
```cmd
netstat -ano | findstr :3001
taskkill /PID <number> /F
```

### "Cannot find module"
```cmd
cd backend
npm install
```

---

## 💡 That's It!

**Everything works. Everything is free. No complex setup!**

Just run the 2 commands above and you're good to go! 🎉

