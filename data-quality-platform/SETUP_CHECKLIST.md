# Setup Checklist - Data Quality Platform

Follow this checklist to get your platform running with comprehensive 7-dimension DQI analysis!

## ✅ Pre-Installation Checklist

- [ ] **Node.js installed** (v16 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org/

- [ ] **Git installed** (for cloning/pulling updates)
  - Check: `git --version`
  - Download: https://git-scm.com/

- [ ] **Port 5000 available** (for backend)
  - Check: `netstat -an | findstr 5000` (Windows)
  - Close any conflicting applications

- [ ] **Port 3000 available** (for frontend)
  - Check: `netstat -an | findstr 3000` (Windows)
  - Close any conflicting applications

## 📥 Ollama Installation

- [ ] **Download Ollama**
  - Windows: https://ollama.com/download/windows
  - macOS: https://ollama.com/download/mac
  - Linux: `curl -fsSL https://ollama.com/install.sh | sh`

- [ ] **Install Ollama**
  - Run the installer
  - Accept default settings
  - Restart computer if prompted

- [ ] **Verify Ollama is running**
  ```bash
  # Should return list of models (or empty if none installed yet)
  curl http://localhost:11434/api/tags
  ```
  - ✅ If returns JSON response: Ollama is running!
  - ❌ If fails: Start Ollama manually or restart computer

- [ ] **Pull Gemma3:1b model**
  ```bash
  ollama pull gemma3:1b
  ```
  - Wait for download (~2GB)
  - This may take 5-15 minutes depending on internet speed

- [ ] **Verify model installation**
  ```bash
  ollama list
  ```
  - ✅ Should see `gemma3:1b` in the list

## 🔧 Platform Installation

### Backend Setup

- [ ] **Navigate to backend directory**
  ```bash
  cd data-quality-platform/backend
  ```

- [ ] **Install dependencies**
  ```bash
  npm install
  ```
  - Wait for installation to complete
  - Should see no errors

- [ ] **Create .env file (optional)**
  ```bash
  # Create .env with:
  OLLAMA_API_URL=http://localhost:11434
  OLLAMA_MODEL=gemma3:1b
  PORT=5000
  NODE_ENV=development
  ```

- [ ] **Verify backend files exist**
  - [ ] `src/services/aiService.js`
  - [ ] `src/services/qualityService.js`
  - [ ] `src/controllers/dataController.js`
  - [ ] `database.sqlite` (created automatically on first run)

### Frontend Setup

- [ ] **Navigate to frontend directory**
  ```bash
  cd data-quality-platform/frontend
  ```

- [ ] **Install dependencies**
  ```bash
  npm install
  ```
  - Wait for installation to complete
  - Should see no errors

- [ ] **Verify frontend files exist**
  - [ ] `src/pages/Dashboard.jsx`
  - [ ] `src/pages/Issues.jsx`
  - [ ] `src/pages/Upload.jsx`

## 🚀 First Run

### Start Backend

- [ ] **Open terminal in backend directory**
  ```bash
  cd data-quality-platform/backend
  ```

- [ ] **Start backend server**
  ```bash
  npm start
  # Or on Windows: START_BACKEND.bat
  ```

- [ ] **Verify backend is running**
  - ✅ Should see: "Server running on port 5000"
  - ✅ No error messages
  - ✅ Check: http://localhost:5000/api/data/tables

### Start Frontend

- [ ] **Open NEW terminal in frontend directory**
  ```bash
  cd data-quality-platform/frontend
  ```

- [ ] **Start frontend server**
  ```bash
  npm run dev
  # Or on Windows: START_FRONTEND.bat
  ```

- [ ] **Verify frontend is running**
  - ✅ Should see: "Local: http://localhost:3000"
  - ✅ Browser opens automatically (or open manually)

## 🧪 Test with Sample Data

- [ ] **Open platform in browser**
  - Navigate to: http://localhost:3000

- [ ] **Navigate to Upload Data page**
  - Click "Upload Data" in sidebar

- [ ] **Upload test file**
  - Select `sample-test-data.csv` from project root
  - Add description (optional): "Test data for DQI validation"
  - Click "Upload"

- [ ] **Wait for processing**
  - Should see "Processing..." message
  - Wait 10-30 seconds
  - Backend logs show: "Starting profiling...", "Quality checks..."

- [ ] **Verify upload success**
  - ✅ Upload completes without errors
  - ✅ Redirected to Tables or Dashboard page

## ✅ Verification Tests

### Check Dashboard

- [ ] **Navigate to Dashboard**
  - Click "Dashboard" in sidebar

- [ ] **Verify metrics shown**
  - [ ] Overall DQI Score displayed (~88-91%)
  - [ ] 7 dimension scores visible
  - [ ] Charts/graphs rendering

### Check Issues Portal

- [ ] **Navigate to Issues**
  - Click "Issues" in sidebar

- [ ] **Verify issues detected**
  - [ ] Issues list is populated (20-25 issues expected)
  - [ ] NOT showing "No issues found"
  - [ ] Can filter by Status, Severity, Type
  - [ ] Issues show:
    - [ ] Duplicates
    - [ ] Missing values
    - [ ] Invalid values
    - [ ] Inconsistencies
    - [ ] Outliers

### Check Quality Page

- [ ] **Navigate to Quality**
  - Click "Quality" in sidebar

- [ ] **Verify DQI breakdown**
  - [ ] All 7 dimensions shown:
    - [ ] Accuracy (~82%)
    - [ ] Completeness (~93%)
    - [ ] Consistency (~90%)
    - [ ] Timeliness (~92%)
    - [ ] Validity (~87%)
    - [ ] Uniqueness (~85%)
    - [ ] Integrity (~96%)
  - [ ] Composite score displayed (~89%)
  - [ ] Dimension descriptions visible

### Check Tables

- [ ] **Navigate to Tables**
  - Click "Tables" in sidebar

- [ ] **Verify table details**
  - [ ] Test table listed
  - [ ] Row count: 30
  - [ ] Column count: 9
  - [ ] Quality score displayed
  - [ ] Can view table details
  - [ ] Can export data

## 🔍 API Verification

- [ ] **Test API endpoints**

  **Get all tables:**
  ```bash
  curl http://localhost:5000/api/data/tables
  ```
  - ✅ Should return list of tables

  **Get DQI for table 1:**
  ```bash
  curl http://localhost:5000/api/quality/dqi/1
  ```
  - ✅ Should return complete DQI breakdown

  **Get all issues:**
  ```bash
  curl http://localhost:5000/api/issues
  ```
  - ✅ Should return list of issues

  **Get issues for table 1:**
  ```bash
  curl http://localhost:5000/api/issues?tableId=1
  ```
  - ✅ Should return filtered issues

## 📊 Expected Results Summary

After completing all steps, you should see:

| Component | Expected Result |
|-----------|----------------|
| **Ollama** | Running on port 11434 |
| **Backend** | Running on port 5000 |
| **Frontend** | Running on port 3000 |
| **Test Data** | Uploaded successfully |
| **Issues** | 20-25 detected |
| **DQI Score** | 88-91% |
| **Dimensions** | All 7 calculated |

## ❌ Troubleshooting

If any step fails, refer to:

### Ollama Issues

**Problem**: Ollama not responding
```bash
# Check if running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

**Problem**: Model not found
```bash
# Check installed models
ollama list

# If gemma3:1b missing, install it
ollama pull gemma3:1b
```

### Backend Issues

**Problem**: Port 5000 already in use
- Close conflicting application
- Or change port in backend .env: `PORT=5001`

**Problem**: Database errors
- Delete `backend/database.sqlite`
- Restart backend (will recreate database)

**Problem**: AI analysis errors
- Check Ollama is running
- Check backend logs: `backend/logs/combined.log`

### Frontend Issues

**Problem**: Port 3000 already in use
- Close conflicting application
- Or change port in `vite.config.js`

**Problem**: API connection failed
- Verify backend is running on port 5000
- Check CORS settings in backend

### No Issues Detected

**Problem**: Issues portal shows "No issues found"

**Solution:**
1. Wait 30 seconds after upload (background processing)
2. Check backend logs for errors
3. Verify Ollama is running
4. Refresh the Issues page
5. Try uploading again

## 🎉 Success Criteria

✅ All checklist items completed  
✅ Ollama running with gemma3:1b  
✅ Backend running without errors  
✅ Frontend accessible at localhost:3000  
✅ Test data uploaded successfully  
✅ Issues visible in Issues portal  
✅ DQI scores calculated (all 7 dimensions)  
✅ No error messages in console/logs  

## 📚 Next Steps

Once setup is complete:

1. **Upload your own data** - Try with real CSV/Excel files
2. **Explore features** - Review all pages and functionality
3. **Review issues** - Analyze detected data quality problems
4. **Export results** - Download reports and cleaned data
5. **Monitor quality** - Track improvements over time

## 📖 Additional Resources

- `OLLAMA_SETUP.md` - Detailed Ollama guide
- `QUICK_START_WITH_OLLAMA.md` - Quick start guide  
- `TEST_DATA_ISSUES.md` - Test data documentation
- `CHANGES_SUMMARY.md` - What changed and why
- `README.md` - Full platform documentation

## 🆘 Still Having Issues?

1. **Check all logs**:
   - Backend: `backend/logs/combined.log`
   - Browser console (F12)

2. **Verify all services**:
   ```bash
   # Ollama
   curl http://localhost:11434/api/tags
   
   # Backend
   curl http://localhost:5000/api/data/tables
   
   # Frontend
   # Open http://localhost:3000 in browser
   ```

3. **Restart everything**:
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Restart Ollama: `ollama serve`
   - Start backend: `npm start`
   - Start frontend: `npm run dev`

---

**Congratulations!** 🎉 Your Data Quality Platform is now ready to use with comprehensive 7-dimension DQI analysis powered by local AI!
