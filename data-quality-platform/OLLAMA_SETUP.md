# Ollama Setup Guide for Data Quality Platform

This platform uses **Ollama** with the **Gemma3:1b** model for AI-powered data quality analysis.

## Prerequisites

1. **Install Ollama** (if not already installed)
   - Windows: Download from https://ollama.com/download/windows
   - macOS: Download from https://ollama.com/download/mac
   - Linux: `curl -fsSL https://ollama.com/install.sh | sh`

## Setup Steps

### 1. Start Ollama Service

Ollama should auto-start after installation. To verify:

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags
```

If not running, start it:
- **Windows**: Ollama runs automatically via system tray
- **macOS**: Run `ollama serve` in terminal
- **Linux**: Run `ollama serve` in terminal

### 2. Pull the Gemma3:1b Model

```bash
ollama pull gemma3:1b
```

This downloads the lightweight Gemma 3 model (~2GB) which is perfect for data quality analysis.

### 3. Verify Model Installation

```bash
ollama list
```

You should see `gemma3:1b` in the list.

### 4. Configure Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
# Ollama Configuration
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:1b

# Other configs...
PORT=5000
NODE_ENV=development
```

### 5. Test Ollama Connection

```bash
# Test with a simple prompt
curl http://localhost:11434/api/generate -d '{
  "model": "gemma3:1b",
  "prompt": "Hello",
  "stream": false
}'
```

## Data Quality Index (DQI) Framework

The platform calculates a comprehensive **7-dimension Data Quality Index**:

### 1. **Accuracy** (Weight: 20%)
- Formula: `(Number of Correct Values / Total Number of Values) × 100`
- Measures how closely data values match the true or accepted values
- Detects invalid values and outliers

### 2. **Completeness** (Weight: 15%)
- Formula: `(Number of Non-Missing Values / Total Expected Values) × 100`
- Measures the extent to which all required data is present
- Tracks missing/null values

### 3. **Consistency** (Weight: 15%)
- Formula: `(Number of Consistent Records / Total Records) × 100`
- Measures if data is the same across different datasets
- Detects format inconsistencies and case mismatches

### 4. **Timeliness** (Weight: 10%)
- Formula: `(Number of Timely Records / Total Records) × 100`
- Measures if data is up-to-date and available within useful timeframe
- Analyzes date columns for currency

### 5. **Validity** (Weight: 20%)
- Formula: `(Number of Valid Records / Total Records) × 100`
- Measures if data conforms to the syntax (format, type, range)
- Validates data types and patterns (email, phone, etc.)

### 6. **Uniqueness** (Weight: 10%)
- Formula: `(Number of Unique Records / Total Records) × 100`
- Measures the extent to which records are free from duplicates
- Detects exact and partial duplicates

### 7. **Integrity** (Weight: 10%)
- Formula: `(Records with Valid Relationships / Total Records) × 100`
- Measures correctness of relationships between data elements
- Validates referential integrity

### Composite DQI Score

```
DQI = Σ (Weight_i × Score_i)
    = 0.20×Accuracy + 0.15×Completeness + 0.15×Consistency 
      + 0.10×Timeliness + 0.20×Validity + 0.10×Uniqueness 
      + 0.10×Integrity
```

## Usage

1. **Upload a CSV/Excel file** via the Upload Data page
2. The system will automatically:
   - Profile the data
   - Detect quality issues
   - Calculate all 7 DQI dimensions
   - Generate a composite DQI score
   - Display issues in the Issues portal

3. **View Results**:
   - **Dashboard**: Overall DQI score and metrics
   - **Issues Portal**: All detected data quality issues
   - **Quality Page**: Detailed dimension breakdown
   - **Profile Page**: Statistical analysis

## Troubleshooting

### Issue: "AI analysis error: Unexpected end of JSON input"
**Solution**: This error occurred with OpenRouter. The platform now uses Ollama which returns plain text, eliminating this issue.

### Issue: "No issues found" in Issues portal
**Solution**: 
1. Make sure Ollama is running: `curl http://localhost:11434/api/tags`
2. Verify gemma3:1b is installed: `ollama list`
3. Check backend logs for errors
4. Wait for background processing to complete after upload

### Issue: Ollama not responding
**Solution**:
1. Restart Ollama service
2. Check if port 11434 is available
3. Try: `ollama serve` in terminal

### Issue: Model download slow
**Solution**: The gemma3:1b model is ~2GB. Ensure stable internet connection.

## API Endpoints

### Get DQI for a table
```bash
GET /api/quality/dqi/:tableId
```

Response includes:
- All 7 dimension scores
- Composite DQI score
- Issue counts by severity
- Dimension descriptions and weights

## Performance

- **Gemma3:1b**: Fast, lightweight model ideal for data analysis
- **Local execution**: No API costs, privacy-preserving
- **Optimal for**: Datasets up to 10,000 rows

## Alternative Models

If you prefer a different model:

```bash
# Install larger model for more accuracy
ollama pull gemma3:3b

# Update .env
OLLAMA_MODEL=gemma3:3b
```

Supported models:
- `gemma3:1b` - Fastest, 2GB
- `gemma3:3b` - Balanced, 6GB
- `llama3.1:latest` - Most accurate, 8GB+

## Support

For issues or questions:
1. Check Ollama status: https://ollama.com/
2. Review backend logs: `backend/logs/combined.log`
3. Verify model installation: `ollama list`
