-- Data Quality Management Platform Database Initialization

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS data_quality_db;

-- Connect to the database
\c data_quality_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema if needed
CREATE SCHEMA IF NOT EXISTS public;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE data_quality_db TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

-- Create indexes for better performance
-- Note: Tables are created by Sequelize migrations/sync, these are additional optimizations

-- Performance tuning settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Reload configuration (requires superuser)
SELECT pg_reload_conf();

-- Create sample admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Note: This will be created by the application, this is just for reference
-- INSERT INTO users (id, username, email, password, role, status, created_at, updated_at)
-- VALUES (
--   uuid_generate_v4(),
--   'admin',
--   'admin@example.com',
--   '$2a$10$XYZ...', -- bcrypt hash of 'admin123'
--   'admin',
--   'active',
--   NOW(),
--   NOW()
-- );

COMMENT ON DATABASE data_quality_db IS 'Data Quality Management Platform - Inventory and Shipment Data Quality Monitoring';


