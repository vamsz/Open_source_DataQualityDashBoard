const express = require('express');
const upload = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');
const dataController = require('../controllers/dataController');

const router = express.Router();

/**
 * @route   POST /api/data/upload
 * @desc    Upload and process CSV/Excel file
 * @access  Public
 */
router.post('/upload', upload.single('file'), asyncHandler(async (req, res) => {
  await dataController.uploadFile(req, res);
}));

/**
 * @route   GET /api/data/tables
 * @desc    Get all tables
 * @access  Public
 */
router.get('/tables', asyncHandler(async (req, res) => {
  await dataController.getTables(req, res);
}));

/**
 * @route   GET /api/data/tables/:tableId
 * @desc    Get single table
 * @access  Public
 */
router.get('/tables/:tableId', asyncHandler(async (req, res) => {
  await dataController.getTable(req, res);
}));

/**
 * @route   GET /api/data/tables/:tableId/data
 * @desc    Get table data with pagination
 * @access  Public
 */
router.get('/tables/:tableId/data', asyncHandler(async (req, res) => {
  await dataController.getTableData(req, res);
}));

/**
 * @route   GET /api/data/tables/:tableId/export
 * @desc    Export table data
 * @access  Public
 */
router.get('/tables/:tableId/export', asyncHandler(async (req, res) => {
  await dataController.exportTableData(req, res);
}));

/**
 * @route   DELETE /api/data/tables/:tableId
 * @desc    Delete table
 * @access  Public
 */
router.delete('/tables/:tableId', asyncHandler(async (req, res) => {
  await dataController.deleteTable(req, res);
}));

module.exports = router;
