const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const monitoringController = require('../controllers/monitoringController');

const router = express.Router();

/**
 * @route   GET /api/monitoring/status
 * @desc    Get monitoring status
 * @access  Private
 */
router.get('/status', asyncHandler(async (req, res) => {
  await monitoringController.getStatus(req, res);
}));

/**
 * @route   GET /api/monitoring/alerts
 * @desc    Get all alerts
 * @access  Private
 */
router.get('/alerts', asyncHandler(async (req, res) => {
  await monitoringController.getAlerts(req, res);
}));

/**
 * @route   GET /api/monitoring/alerts/statistics
 * @desc    Get alert statistics
 * @access  Private
 */
router.get('/alerts/statistics', asyncHandler(async (req, res) => {
  await monitoringController.getAlertStatistics(req, res);
}));

/**
 * @route   PATCH /api/monitoring/alerts/:alertId/read
 * @desc    Mark alert as read
 * @access  Private
 */
router.patch('/alerts/:alertId/read', asyncHandler(async (req, res) => {
  await monitoringController.markAlertAsRead(req, res);
}));

/**
 * @route   PATCH /api/monitoring/alerts/:alertId/dismiss
 * @desc    Dismiss alert
 * @access  Private
 */
router.patch('/alerts/:alertId/dismiss', asyncHandler(async (req, res) => {
  await monitoringController.dismissAlert(req, res);
}));

/**
 * @route   PUT /api/monitoring/thresholds
 * @desc    Update alert thresholds
 * @access  Public
 */
router.put('/thresholds', asyncHandler(async (req, res) => {
  await monitoringController.updateThresholds(req, res);
}));

/**
 * @route   POST /api/monitoring/check/:tableId
 * @desc    Trigger immediate quality check
 * @access  Private
 */
router.post('/check/:tableId', asyncHandler(async (req, res) => {
  await monitoringController.triggerCheck(req, res);
}));

module.exports = router;


