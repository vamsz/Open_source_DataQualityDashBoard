# Data Quality Management Platform

An end-to-end web application for uploading, profiling, cleansing, and monitoring data quality for inventory and shipment tables, powered by AI (Ollama).

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub or contact the development team.


