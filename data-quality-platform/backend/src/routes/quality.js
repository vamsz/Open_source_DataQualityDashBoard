const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const qualityController = require('../controllers/qualityController');

const router = express.Router();

/**
 * @route   GET /api/quality/summary
 * @desc    Get overall quality summary
 * @access  Private
 */
router.get('/summary', asyncHandler(async (req, res) => {
  await qualityController.getQualitySummary(req, res);
}));

/**
 * @route   GET /api/quality/dashboard/:tableId
 * @desc    Get KPI dashboard for a table
 * @access  Private
 */
router.get('/dashboard/:tableId', asyncHandler(async (req, res) => {
  await qualityController.getKPIDashboard(req, res);
}));

/**
 * @route   GET /api/quality/dashboards
 * @desc    Get all KPI dashboards
 * @access  Private
 */
router.get('/dashboards', asyncHandler(async (req, res) => {
  await qualityController.getAllKPIs(req, res);
}));

/**
 * @route   GET /api/quality/trends/:tableId
 * @desc    Get quality trends
 * @access  Private
 */
router.get('/trends/:tableId', asyncHandler(async (req, res) => {
  await qualityController.getQualityTrends(req, res);
}));

/**
 * @route   GET /api/quality/dqi/:tableId
 * @desc    Get comprehensive Data Quality Index for a table
 * @access  Private
 */
router.get('/dqi/:tableId', asyncHandler(async (req, res) => {
  await qualityController.getDQI(req, res);
}));

module.exports = router;


