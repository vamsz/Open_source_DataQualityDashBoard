# Test Data Quality Issues Documentation

This document describes the intentional data quality issues in `sample-test-data.csv` for testing the DQI framework.

## Dataset Overview
- **Total Records**: 30 customers
- **Columns**: 9 (CustomerID, Name, Email, PhoneNumber, Age, SignupDate, City, Country, Status)

## Intentional Data Quality Issues

### 1. **Accuracy Issues** (Invalid Values)
- **Row 3**: Invalid email format `bob.wilson@invalid` (missing TLD)
- **Row 5**: Age = 150 (outlier, unrealistic)
- **Row 13**: Age = -5 (negative age, impossible)
- **Row 16**: Incomplete email `nancy@incomplete` (no domain)
- **Row 17**: Phone without country code `5550116`
- **Row 20**: Age = 999 (extreme outlier)

**Expected Detection**: 6 accuracy issues

### 2. **Completeness Issues** (Missing Values)
- **Row 4**: Missing Age
- **Row 8**: Missing PhoneNumber
- **Row 9**: Invalid SignupDate (text instead of date)
- **Row 10**: Missing Status
- **Row 19**: Missing Name
- **Row 24**: Missing Age
- **Row 30**: Missing Age (duplicate of row 4)

**Expected Detection**: 7 completeness issues across 3 columns

### 3. **Consistency Issues** (Format Inconsistencies)
- **Emails**: 
  - Row 12: `JACK.ANDERSON@EMAIL.COM` (all uppercase)
  - Other rows: lowercase format
- **Status**:
  - Row 12: `ACTIVE` (uppercase)
  - Row 22: `inactive` (lowercase)
  - Other rows: Proper case `Active` or `Inactive`
- **PhoneNumbers**:
  - Mixed formats: `+1-555-XXXX`, `555-XXXX`, `5550116`

**Expected Detection**: 3 consistency issues (case inconsistencies in email and status)

### 4. **Timeliness Issues** (Outdated Data)
- **Row 26**: SignupDate = 2020-01-15 (4+ years old)
- **Row 27**: SignupDate = 2019-06-20 (5+ years old)

**Expected Detection**: 2 timeliness issues for old records

### 5. **Validity Issues** (Type/Format Violations)
- **Row 9**: SignupDate = `invalid-date` (not a valid date format)
- **Row 13**: Age = -5 (violates range constraint)
- **Row 3**: Email without proper TLD
- **Row 16**: Email without complete domain
- **Row 17**: Phone number without proper format

**Expected Detection**: 5+ validity issues

### 6. **Uniqueness Issues** (Duplicates)
- **Rows 1, 6, 15**: Exact duplicates (John Smith with same data)
- **Rows 4, 30**: Exact duplicates (Alice Brown)

**Expected Detection**: 
- 3 duplicate records (Row 1 group)
- 2 duplicate records (Row 4 group)
- Total: 4-5 duplicate issues

### 7. **Integrity Issues** (Relationship Violations)
- All records have matching Country data (USA)
- CustomerIDs are unique and sequential (good integrity)
- No orphaned references

**Expected Detection**: High integrity score (95%+)

## Expected DQI Scores

Based on the issues above, the expected scores are:

| Dimension | Expected Score | Reasoning |
|-----------|---------------|-----------|
| **Accuracy** | ~80-85% | 6 invalid values out of 270 total values |
| **Completeness** | ~92-95% | 7 missing values out of 270 cells |
| **Consistency** | ~88-92% | Format inconsistencies in 3-4 records |
| **Timeliness** | ~90-93% | 2 outdated records out of 30 |
| **Validity** | ~85-90% | 5-7 format violations |
| **Uniqueness** | ~83-87% | 5 duplicate records out of 30 |
| **Integrity** | ~95%+ | Good relational structure |

### **Composite DQI Score**: ~88-91%

## Testing Instructions

1. **Start Backend and Frontend**:
   ```bash
   cd data-quality-platform/backend
   npm start
   
   # In another terminal
   cd data-quality-platform/frontend
   npm run dev
   ```

2. **Ensure Ollama is Running**:
   ```bash
   # Check Ollama
   curl http://localhost:11434/api/tags
   
   # If not running, start it
   ollama serve
   
   # Ensure gemma3:1b is installed
   ollama pull gemma3:1b
   ```

3. **Upload Test File**:
   - Navigate to http://localhost:3000
   - Go to "Upload Data" page
   - Upload `sample-test-data.csv`
   - Wait for processing to complete

4. **Verify Results**:
   - **Dashboard**: Check overall DQI score (~88-91%)
   - **Issues Portal**: Should show 20-25 detected issues
   - **Quality Page**: View all 7 dimension scores
   - **Profile Page**: See statistical analysis

5. **Check Issue Types**:
   - Navigate to "Issues" page
   - Filter by:
     - Type: duplicate, missing, invalid, inconsistent, outlier
     - Severity: critical, high, medium, low
   - Verify issue details and affected records

## API Testing

Test the DQI endpoint:

```bash
# Get all tables
curl http://localhost:5000/api/data/tables

# Get DQI for table (replace :tableId with actual ID)
curl http://localhost:5000/api/quality/dqi/1

# Get all issues
curl http://localhost:5000/api/issues

# Get issues for specific table
curl "http://localhost:5000/api/issues?tableId=1"
```

## Expected API Response

```json
{
  "tableId": 1,
  "tableName": "sample-test-data",
  "qualityScore": 89.45,
  "dqi": {
    "accuracy": 82.50,
    "completeness": 93.33,
    "consistency": 90.00,
    "timeliness": 91.67,
    "validity": 87.22,
    "uniqueness": 85.00,
    "integrity": 96.50,
    "overallScore": 89.45,
    "dimensions": {
      "accuracy": {
        "score": 82.50,
        "weight": 0.20,
        "description": "Measures how closely data values match the true or accepted values"
      },
      ...
    }
  },
  "issues": {
    "total": 23,
    "critical": 2,
    "high": 5,
    "medium": 10,
    "low": 6
  }
}
```

## Success Criteria

✅ All issue types detected correctly  
✅ DQI scores within expected ranges  
✅ Issues displayed in Issues portal  
✅ Dimension breakdown visible in Quality page  
✅ No "Unexpected JSON" errors  
✅ Background processing completes successfully  

## Troubleshooting

If issues are not detected:
1. Check backend logs: `backend/logs/combined.log`
2. Verify Ollama is running and responding
3. Check database: `backend/database.sqlite`
4. Review quality service logs for errors
5. Ensure background processing completed
