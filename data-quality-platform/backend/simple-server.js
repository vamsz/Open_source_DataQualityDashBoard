const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple upload route
const simpleUploadRouter = require('./src/routes/simpleUpload');
app.use('/api/simple', simpleUploadRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Simple server running (no database required)',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Simple server running on http://localhost:${PORT}`);
  console.log(`✅ Upload endpoint: http://localhost:${PORT}/api/simple/upload`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📁 Files will be saved to: backend/uploads/');
  console.log('');
  console.log('🔸 NOTE: This is a simplified server without database.');
  console.log('🔸 It will accept file uploads but won\'t do profiling yet.');
});

