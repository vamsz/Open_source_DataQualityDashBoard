const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const profileController = require('../controllers/profileController');

const router = express.Router();

/**
 * @route   GET /api/profile/:tableId
 * @desc    Get profile for a table
 * @access  Private
 */
router.get('/:tableId', asyncHandler(async (req, res) => {
  await profileController.getTableProfile(req, res);
}));

/**
 * @route   GET /api/profile
 * @desc    Get all profiles
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  await profileController.getAllProfiles(req, res);
}));

/**
 * @route   GET /api/profile/:tableId/column/:columnName
 * @desc    Get column profile details
 * @access  Private
 */
router.get('/:tableId/column/:columnName', asyncHandler(async (req, res) => {
  await profileController.getColumnProfile(req, res);
}));

/**
 * @route   GET /api/profile/:tableId/compare
 * @desc    Compare profiles over time
 * @access  Private
 */
router.get('/:tableId/compare', asyncHandler(async (req, res) => {
  await profileController.compareProfiles(req, res);
}));

module.exports = router;


