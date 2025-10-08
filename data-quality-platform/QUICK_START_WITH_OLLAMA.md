# Quick Start Guide - Data Quality Platform with Ollama

Get your Data Quality Platform running in 5 minutes with comprehensive 7-dimension DQI analysis!

## 🚀 Prerequisites

- **Node.js** (v16+)
- **Ollama** installed and running
- **Gemma3:1b** model downloaded

## 📋 Step-by-Step Setup

### 1. Install Ollama and Pull Model

```bash
# Install Ollama (if not installed)
# Windows: Download from https://ollama.com/download/windows
# macOS/Linux: curl -fsSL https://ollama.com/install.sh | sh

# Pull the Gemma3:1b model
ollama pull gemma3:1b

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

### 2. Install Dependencies

```bash
# Navigate to project root
cd data-quality-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Start the Backend

```bash
cd backend
npm start

# Or use the batch file on Windows
START_BACKEND.bat
```

Backend will start on http://localhost:5000

### 4. Start the Frontend

```bash
# In a new terminal
cd frontend
npm run dev

# Or use the batch file on Windows
START_FRONTEND.bat
```

Frontend will start on http://localhost:3000

### 5. Test with Sample Data

1. Open http://localhost:3000 in your browser
2. Navigate to **Upload Data** page
3. Upload the included `sample-test-data.csv` file
4. Wait ~10-30 seconds for analysis to complete
5. Check the results:
   - **Dashboard**: View overall DQI score
   - **Issues**: See all detected data quality issues
   - **Quality**: Review 7-dimension breakdown
   - **Tables**: View uploaded datasets

## 🎯 What to Expect

### Sample Data Results

The test file has **30 records** with intentional quality issues:

- **~23 issues detected** across various categories
- **DQI Score**: ~88-91% (Good quality with room for improvement)

### Issue Breakdown

| Issue Type | Expected Count |
|------------|----------------|
| Duplicates | 4-5 |
| Missing Values | 7 |
| Invalid Values | 6 |
| Inconsistencies | 3 |
| Outliers | 3 |

### DQI Dimensions

All **7 dimensions** will be calculated:

1. ✅ **Accuracy** (~82%) - Correctness of values
2. ✅ **Completeness** (~93%) - Non-missing data
3. ✅ **Consistency** (~90%) - Format uniformity
4. ✅ **Timeliness** (~92%) - Data currency
5. ✅ **Validity** (~87%) - Format compliance
6. ✅ **Uniqueness** (~85%) - No duplicates
7. ✅ **Integrity** (~96%) - Relationship validity

## 📊 Using the Platform

### Upload Your Own Data

1. **Prepare CSV/Excel File**
   - Ensure headers in first row
   - Remove special characters from column names
   - Keep file size under 50MB

2. **Upload**
   - Go to Upload Data page
   - Select your file
   - Add optional description
   - Click Upload

3. **Review Results**
   - Dashboard shows overall score
   - Issues lists all detected problems
   - Quality shows dimension breakdown
   - Profile shows statistical analysis

### View Data Quality Index

```bash
# API endpoint to get DQI
curl http://localhost:5000/api/quality/dqi/{tableId}
```

Response includes:
- All 7 dimension scores
- Weighted composite DQI
- Issue counts by severity
- Dimension descriptions

### Interpret DQI Scores

| Score Range | Quality Level | Action Required |
|-------------|---------------|-----------------|
| 95-100% | Excellent | Maintain quality |
| 85-94% | Good | Minor improvements |
| 70-84% | Fair | Address key issues |
| 50-69% | Poor | Significant work needed |
| <50% | Critical | Immediate action required |

## 🔍 Troubleshooting

### Issue: No issues showing in portal

**Solution:**
```bash
# 1. Check Ollama is running
curl http://localhost:11434/api/tags

# 2. Check backend logs
cat backend/logs/combined.log

# 3. Restart backend
cd backend
npm start
```

### Issue: AI analysis error

**Solution:**
- Old error: "Unexpected end of JSON input" (from OpenRouter)
- **Fixed**: Now uses Ollama locally
- Ensure gemma3:1b is installed: `ollama list`

### Issue: Upload fails

**Check:**
- File format is CSV or Excel
- File has headers
- File size < 50MB
- Backend is running on port 5000

## 🎓 Understanding Your Results

### Accuracy Formula
```
Accuracy = (Correct Values / Total Values) × 100
```
Example: 950 correct out of 1000 = 95%

### Completeness Formula
```
Completeness = (Non-Missing / Total Expected) × 100
```
Example: 900 filled out of 1000 = 90%

### Consistency Formula
```
Consistency = (Consistent Records / Total Records) × 100
```
Example: 980 consistent out of 1000 = 98%

### Composite DQI Formula
```
DQI = Σ (Weight × Score)
    = 0.20×Accuracy + 0.15×Completeness + 0.15×Consistency 
      + 0.10×Timeliness + 0.20×Validity + 0.10×Uniqueness 
      + 0.10×Integrity
```

## 📝 Next Steps

1. **Upload Your Data** - Test with your own datasets
2. **Review Issues** - Check detected problems
3. **Improve Quality** - Use remediation suggestions
4. **Monitor Trends** - Track quality over time
5. **Export Results** - Download reports

## 🆘 Getting Help

If you encounter issues:

1. **Check Ollama Status**
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Review Backend Logs**
   ```bash
   tail -f backend/logs/combined.log
   ```

3. **Verify Database**
   - Check `backend/database.sqlite` exists
   - View tables with SQLite browser

4. **Test API**
   ```bash
   curl http://localhost:5000/api/data/tables
   ```

## 🌟 Key Features

✅ **7-Dimension DQI** - Comprehensive quality assessment  
✅ **Local AI with Ollama** - No API costs, privacy-preserving  
✅ **Real-time Analysis** - Instant results on upload  
✅ **Issue Detection** - Automatic problem identification  
✅ **Beautiful Dashboard** - Visual quality metrics  
✅ **Export Capabilities** - Download reports and data  

## 📚 Additional Resources

- `OLLAMA_SETUP.md` - Detailed Ollama configuration
- `TEST_DATA_ISSUES.md` - Test data documentation
- `AI_DETECTION_GUIDE.md` - AI detection details
- `README.md` - Full platform documentation

---

**Ready to analyze your data quality? Upload your first file now!** 🚀
