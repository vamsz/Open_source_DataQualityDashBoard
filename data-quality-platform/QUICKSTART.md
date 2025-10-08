# Quick Start Guide - Data Quality Management Platform

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v15 or higher) - [Download](https://www.postgresql.org/download/)
3. **Redis** (v7 or higher) - [Download](https://redis.io/download/)
4. **OpenRouter API Key** - [Get Free Key](https://openrouter.ai/keys)

## Step 1: Get OpenRouter API Key

1. Visit **https://openrouter.ai/keys**
2. Sign up for a free account
3. Click "Create Key" and give it a name (e.g., "Data Quality Platform")
4. Copy your API key (starts with `sk-or-...`)
5. Keep it safe - you'll add it to the .env file in Step 3

## Step 2: Setup Database

### Windows (PostgreSQL)

1. Open pgAdmin or psql command line
2. Create database:

```sql
CREATE DATABASE data_quality_db;
```

### Or use the init script:

```bash
psql -U postgres -f database/init.sql
```

## Step 3: Start Redis

### Windows
```bash
# If installed via chocolatey:
redis-server

# Or via WSL:
wsl redis-server
```

### Docker (Alternative)
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

## Step 4: Configure Environment

Create `.env` file in the `backend` directory:

```bash
# Copy the example
cp backend/.env.example backend/.env

# Edit backend/.env with your settings:
```

```env
NODE_ENV=development
PORT=3001

DATABASE_NAME=data_quality_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_postgres_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

REDIS_URL=redis://localhost:6379

# IMPORTANT: Add your OpenRouter API key here!
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_MODEL=z-ai/glm-4.5-air:free

FRONTEND_URL=http://localhost:3000
```

## Step 5: Install Dependencies

```bash
# From the root directory
npm run install:all

# This will install dependencies for both backend and frontend
```

## Step 6: Start the Application

### Option A: Run Both Services Together (Recommended)

```bash
# From the root directory
npm run dev
```

This will start:
- Backend on http://localhost:3001
- Frontend on http://localhost:3000

### Option B: Run Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 7: Access the Application

1. Open your browser and go to: **http://localhost:3000**
2. Create a new account (Register)
3. Login with your credentials
4. Start uploading data!

## Step 8: Verify Everything is Working

### Check Backend Health
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-06T...",
  "version": "1.0.0"
}
```

### Check OpenRouter API
Make sure you've added your API key to `backend/.env`:
```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

You can test it at https://openrouter.ai/playground

## Troubleshooting

### Issue: "Cannot connect to database"
- Ensure PostgreSQL is running
- Check DATABASE_PASSWORD in `.env` matches your PostgreSQL password
- Verify database `data_quality_db` exists

### Issue: "Redis connection failed"
- Start Redis server: `redis-server`
- Check Redis is running on port 6379: `redis-cli ping` (should return "PONG")

### Issue: "OpenRouter API error"
- Verify your API key is correct in `backend/.env`
- Check you have credits at https://openrouter.ai/credits
- The z-ai/glm-4.5-air:free model should work with free tier

### Issue: Port already in use
- Backend (3001): Change PORT in backend/.env
- Frontend (3000): Change port in frontend/vite.config.js

### Issue: "Module not found"
```bash
# Delete node_modules and reinstall
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

## Using Docker (Alternative Setup)

If you prefer Docker:

```bash
# Make sure Docker is installed and running

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will automatically set up:
- PostgreSQL database
- Redis cache
- Backend API
- Frontend UI

Access the application at http://localhost:3000

## Default Admin User (Optional)

You can create an admin user after starting the application by registering through the UI, or manually in the database:

```sql
-- Connect to your database
INSERT INTO users (id, username, email, password, role, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@example.com',
  '$2a$10$XYZabc123...', -- Use bcrypt to hash 'admin123'
  'admin',
  'active',
  NOW(),
  NOW()
);
```

## Next Steps

1. **Upload Sample Data**: Go to "Upload Data" and upload a CSV/Excel file
2. **View Profile**: Check the data profiling statistics
3. **Monitor Quality**: View KPI dashboard and quality metrics
4. **Resolve Issues**: Check detected issues and apply AI-powered fixes
5. **Set Up Alerts**: Configure monitoring thresholds

## Need Help?

- Check the README.md for detailed documentation
- Review API documentation in README.md
- Check console logs for error messages
- Ensure all prerequisites are properly installed

## Quick Commands Reference

```bash
# Install all dependencies
npm run install:all

# Start development (both services)
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build for production
npm run build

# Run with Docker
docker-compose up -d

# View Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

Happy data quality monitoring! 🚀

