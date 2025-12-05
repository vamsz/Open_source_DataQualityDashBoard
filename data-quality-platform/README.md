# Data Quality Management Platform

An end-to-end web application for uploading, profiling, cleansing, and monitoring data quality for inventory and shipment tables, powered by AI (Ollama).

---

# ⚡ START HERE - Quick Launch Guide

## 🎯 What You Have

A **Data Quality Platform** with **AI-powered issue detection** that works **3 ways**:

1. **OpenRouter** (cloud, fast, free) ← Recommended first
2. **Ollama** (local, private, free) ← Best for privacy
3. **Both** (maximum reliability) ← Best overall

---

## 🚀 Fastest Start (2 Minutes)

### Step 1: Start Backend

**Double-click this file:**
```
📁 data-quality-platform/START_BACKEND_HERE.bat
```

**OR in PowerShell:**
```powershell
cd data-quality-platform/backend
node minimal-server.js
```

**Wait for:**
```
✅  Backend:    http://localhost:3001
✅  AI Analysis - DUAL MODE (if Ollama running)
```

### Step 2: Start Frontend

**New terminal:**
```powershell
cd data-quality-platform/frontend
npm run dev
```

### Step 3: Use It!

1. Open: **http://localhost:3000**
2. Click: **"Upload Data"**
3. Select any **CSV file**
4. Wait **10-30 seconds**
5. Click: **"Issues"**
6. **See detected problems!** ✅

---

## 🤖 Enable AI Analysis

### Option A: Ollama (Local, Private)

```bash
# 1. Download Ollama
https://ollama.com/download

# 2. Install & pull model
ollama pull gemma3:1b

# 3. Restart backend
# ✅ AI now works locally!
```

### Option B: OpenRouter (Cloud, Fast)

```bash
# 1. Get FREE key
https://openrouter.ai/keys

# 2. Create backend/.env:
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# 3. Restart backend
# ✅ AI now works via cloud!
```

---

## ✅ What Works Now

| Feature | Without AI | With Ollama | With OpenRouter | With Both |
|---------|-----------|-------------|-----------------|-----------|
| Upload Files | ✅ | ✅ | ✅ | ✅ |
| Data Profiling | ✅ | ✅ | ✅ | ✅ |
| Issue Detection | Basic | ✅✅ AI | ✅✅ AI | ✅✅✅ Best |
| Quality Scores | ✅ | ✅ | ✅ | ✅ |
| Works Offline | ✅ | ✅ | ❌ | ⚠️ Partial |

---

## 🎯 Next Steps

1. **Test it**: Upload a CSV file right now
2. **Enable AI**: Install Ollama OR add OpenRouter key
3. **Explore**: Check all 7 quality dimensions

---

# 📚 Full Platform Documentation

## Features

- **Data Upload**: Upload CSV/Excel files with progress tracking and validation
- **Data Profiling**: Comprehensive statistics including count, distinct count, nulls, min/max, averages, and sparsity
- **Quality KPIs**: Real-time dashboard showing Accuracy, Completeness, Consistency, Uniqueness, Validity, Timeliness, and Integrity
- **Issue Explorer**: View, categorize, and manage detected data quality issues
- **AI-Powered Remediation**: Automated data cleansing using Ollama (Gemma3:1b model)
  - Synthetic data generation
  - Entity resolution/record linkage
  - Missing value imputation
  - Text/format standardization
  - Outlier detection
- **Continuous Monitoring**: Real-time quality monitoring with customizable alerts
- **Validation Reports**: Compare before/after metrics with export functionality

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** for data storage
- **Redis** for caching
- **Socket.IO** for real-time updates
- **Sequelize** ORM
- **Ollama** for AI-powered data quality tasks

### Frontend
- **React.js** with Material-UI
- **Plotly.js** for visualizations
- **Axios** for API calls
- **Socket.IO Client** for real-time updates

### DevOps
- **Docker** & Docker Compose
- **Node-cron** for scheduled jobs

## Prerequisites

- Node.js >= 16
- PostgreSQL >= 15
- Redis >= 7
- OpenRouter API Key (get from https://openrouter.ai/keys)
- Docker & Docker Compose (optional)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd data-quality-platform
```

### 2. Get OpenRouter API Key

1. Visit https://openrouter.ai/keys
2. Create an account (free tier available)
3. Generate an API key
4. Copy the key for the next step

### 3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Install dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all
```

### 5. Set up database

```bash
# Start PostgreSQL and Redis (if using Docker)
docker-compose up -d postgres redis

# Or set up manually and run init script
psql -U postgres -f database/init.sql
```

### 6. Start the application

```bash
# Development mode (runs both backend and frontend)
npm run dev

# Or start separately:
npm run dev:backend
npm run dev:frontend
```

The backend will be available at `http://localhost:3001`
The frontend will be available at `http://localhost:3000`

## Using Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## API Documentation

### Data Management
- `POST /api/data/upload` - Upload CSV/Excel file
- `GET /api/data/tables` - Get all tables
- `GET /api/data/tables/:tableId` - Get table details
- `GET /api/data/tables/:tableId/data` - Get table data (paginated)
- `GET /api/data/tables/:tableId/export` - Export table data
- `DELETE /api/data/tables/:tableId` - Delete table

### Profiling
- `GET /api/profile/:tableId` - Get table profile
- `GET /api/profile/:tableId/column/:columnName` - Get column profile
- `GET /api/profile/:tableId/compare` - Compare profiles over time

### Quality
- `GET /api/quality/summary` - Get overall quality summary
- `GET /api/quality/dashboard/:tableId` - Get KPI dashboard
- `GET /api/quality/trends/:tableId` - Get quality trends

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `GET /api/issues/:issueId` - Get issue details
- `PATCH /api/issues/:issueId/status` - Update issue status
- `DELETE /api/issues/:issueId` - Delete issue
- `GET /api/issues/statistics` - Get issue statistics

### Remediation
- `GET /api/remediation/suggestions/:issueId` - Get AI-powered suggestions
- `POST /api/remediation/apply/:issueId` - Apply remediation
- `GET /api/remediation/actions` - Get remediation history
- `POST /api/remediation/rollback/:actionId` - Rollback action

### Monitoring
- `GET /api/monitoring/status` - Get monitoring status
- `GET /api/monitoring/alerts` - Get alerts
- `PATCH /api/monitoring/alerts/:alertId/read` - Mark alert as read
- `PATCH /api/monitoring/alerts/:alertId/dismiss` - Dismiss alert
- `POST /api/monitoring/check/:tableId` - Trigger immediate check

## AI-Powered Features

The platform uses OpenRouter API with the z-ai/glm-4.5-air:free model for:

1. **Synthetic Data Generation**: Generate realistic test data matching your schema
2. **Entity Resolution**: Identify duplicate or similar records
3. **Missing Value Imputation**: Intelligent filling of missing values
4. **Format Standardization**: Normalize addresses, phone numbers, etc.
5. **Outlier Detection**: AI-powered anomaly detection
6. **Remediation Suggestions**: Contextual fix recommendations

## Monitoring Jobs

The platform runs several automated jobs:

- **Re-profiling**: Every 6 hours
- **KPI Checks**: Every hour
- **Drift Detection**: Every 3 hours
- **Alert Generation**: Every 30 minutes
- **Cleanup**: Daily at midnight

## Configuration

Key environment variables:

```env
# OpenRouter AI Configuration
OPENROUTER_API_KEY=your-api-key-here
OPENROUTER_MODEL=z-ai/glm-4.5-air:free

# Database
DATABASE_NAME=data_quality_db
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379
```

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project Structure

```
data-quality-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── database/        # Database models
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utility functions
│   ├── uploads/             # Uploaded files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   └── package.json
├── database/
│   └── init.sql            # Database initialization
├── docker-compose.yml
└── package.json
```

---

# 📄 Data Quality Platform - LaTeX Documentation

## Overview

This directory contains comprehensive LaTeX documentation for the Data Quality Platform. The document provides detailed technical documentation including architecture, AI agents, technology stack, processes, and complete system specifications.

## File Information

- **Main File**: `Data_Quality_Platform_Documentation.tex`
- **Document Type**: Article (12pt, A4)
- **Total Sections**: 11 major sections + 3 appendices
- **Pages**: ~50+ pages (estimated)

## Compilation Instructions

### Option 1: Using Overleaf (Recommended)

1. Go to [Overleaf](https://www.overleaf.com)
2. Create a new project (Blank Project)
3. Upload `Data_Quality_Platform_Documentation.tex`
4. Click "Recompile" button
5. Download PDF

**Overleaf Compiler Settings**:
- Compiler: pdfLaTeX
- Main document: `Data_Quality_Platform_Documentation.tex`

### Option 2: Local Compilation (TeXLive/MiKTeX)

```bash
# Install LaTeX distribution first:
# - Windows: MiKTeX (https://miktex.org/download)
# - Mac: MacTeX (https://www.tug.org/mactex/)
# - Linux: TeXLive (sudo apt-get install texlive-full)

# Compile the document
pdflatex Data_Quality_Platform_Documentation.tex
pdflatex Data_Quality_Platform_Documentation.tex  # Run twice for TOC

# View the PDF
# The output will be: Data_Quality_Platform_Documentation.pdf
```

### Option 3: Using Docker

```bash
# Using Docker with TeXLive
docker run --rm -v ${PWD}:/data -w /data texlive/texlive \
  pdflatex Data_Quality_Platform_Documentation.tex
```

## Required LaTeX Packages

The document uses the following packages (automatically installed in Overleaf):

- **Core**: inputenc, geometry, hyperref
- **Graphics**: graphicx, tikz, pgfplots
- **Code Listings**: listings, xcolor
- **Tables**: booktabs, longtable
- **Math**: amsmath, amssymb
- **Algorithms**: algorithm, algpseudocode
- **Formatting**: fancyhdr, float, enumitem

## Document Structure

### Main Sections

1. **Introduction** (3 pages)
   - Overview and objectives
   - Problem statement

2. **System Architecture** (5 pages)
   - High-level architecture diagram
   - Layer descriptions (Frontend, Backend, AI, Data)

3. **Technology Stack** (4 pages)
   - Frontend technologies
   - Backend technologies
   - AI/ML stack
   - Database and storage
   - DevOps tools

4. **AI Agents and Intelligence** (6 pages)
   - Dual-provider architecture
   - 5 specialized AI agents
   - Agent communication flow
   - Prompt engineering
   - Response parsing

5. **Data Quality Index (DQI)** (5 pages)
   - Seven dimensions with formulas
   - Composite DQI calculation
   - Scoring interpretation

6. **Application Workflow** (7 pages)
   - End-to-end data flow
   - 6 core processes with algorithms
   - Issue detection and storage

7. **Database Models** (4 pages)
   - ER diagram
   - 6 table schemas with SQL

8. **API Endpoints** (3 pages)
   - 30+ REST API endpoints
   - Request/response formats

9. **Frontend Application** (3 pages)
   - Application routes
   - UI components
   - Visualization libraries

10. **Deployment Architecture** (4 pages)
    - Docker Compose setup
    - Container architecture
    - Deployment modes
    - Environment configuration

11. **Features and Capabilities** (3 pages)
    - Feature summary
    - AI agent capabilities
    - Quality issue detection

### Appendices

- **Appendix A**: Quick Start Guide
- **Appendix B**: API Response Examples
- **Appendix C**: Glossary

## Customization

### Change Title/Author

Edit lines 50-60:

```latex
\title{
    \Huge \textbf{Your Custom Title}\\
    ...
}
\author{
    Your Name\\
    \texttt{your-email@example.com}
}
```

### Change Colors

Edit lines 35-40 for color schemes:

```latex
\lstset{
    keywordstyle=\color{blue}\bfseries,  % Change 'blue'
    commentstyle=\color{green!60!black}, % Change 'green'
    ...
}
```

### Add Figures

To add external images:

```latex
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{your-image.png}
\caption{Your Caption}
\end{figure}
```

## Key Features of the Document

### Visual Elements

1. **Architecture Diagrams**: TikZ-based system architecture
2. **Flowcharts**: Process flow diagrams
3. **Tables**: Comprehensive technology stack tables
4. **Algorithms**: Pseudocode for key processes
5. **Code Listings**: Syntax-highlighted code examples

### Mathematical Formulas

- Quality dimension formulas (Accuracy, Completeness, etc.)
- Composite DQI calculation
- Statistical measures (mean, stddev, etc.)

### Code Examples

- JavaScript/Node.js backend code
- SQL database schemas
- JSON API responses
- Bash/shell commands

## Troubleshooting

### Issue: Missing Package Errors

**Solution**: Install missing packages:
```bash
# MiKTeX
mpm --install=<package-name>

# TeXLive
tlmgr install <package-name>
```

### Issue: TikZ Compilation Errors

**Solution**: Ensure pgf and tikz are installed:
```bash
tlmgr install pgf tikz pgfplots
```

### Issue: Long Compilation Time

**Solution**: Use draft mode for faster compilation:
```latex
\documentclass[12pt,a4paper,draft]{article}
```

### Issue: Table of Contents Not Showing

**Solution**: Run pdflatex twice:
```bash
pdflatex document.tex  # First pass
pdflatex document.tex  # Second pass (generates TOC)
```

## Output Specifications

- **Format**: PDF/A (print-ready)
- **Page Size**: A4 (210mm × 297mm)
- **Margins**: 1 inch all sides
- **Font Size**: 12pt base
- **Line Spacing**: Single
- **Estimated Pages**: 50-60 pages
- **File Size**: ~2-5 MB (with diagrams)

## Professional Features

1. **Hyperlinked TOC**: Click to navigate sections
2. **Colored Links**: Internal references highlighted
3. **Page Headers**: Section names in header
4. **Page Numbers**: Centered footer
5. **Bibliography**: Reference section included
6. **Index**: Glossary of terms

## Version Control

- **Version**: 1.0
- **Date**: October 10, 2025
- **Author**: Data Quality Engineering Team
- **Last Updated**: \today (automatic)

## Export Options

### PDF Export
- Default output format
- Portable and universally readable

### DOCX Export
Use pandoc:
```bash
pandoc Data_Quality_Platform_Documentation.tex -o output.docx
```

### HTML Export
```bash
htlatex Data_Quality_Platform_Documentation.tex
```

## Maintenance

To update the documentation:

1. **Update Technology Versions**: Edit Section 3 (Tech Stack)
2. **Add New Features**: Update Section 11 (Features)
3. **Update API Endpoints**: Modify Section 8 (API Endpoints)
4. **Add New Diagrams**: Use TikZ code in respective sections

## Contact & Support

For questions about the documentation:
- Check the main sections above.
- Review inline LaTeX comments
- Consult LaTeX documentation: https://www.latex-project.org/

## License

This documentation follows the same license as the Data Quality Platform project.

---

**Happy Documenting!** 📚✨
