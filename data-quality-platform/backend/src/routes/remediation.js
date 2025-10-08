const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const remediationController = require('../controllers/remediationController');

const router = express.Router();

/**
 * @route   GET /api/remediation/suggestions/:issueId
 * @desc    Get remediation suggestions for an issue
 * @access  Private
 */
router.get('/suggestions/:issueId', asyncHandler(async (req, res) => {
  await remediationController.getSuggestions(req, res);
}));

/**
 * @route   POST /api/remediation/apply/:issueId
 * @desc    Apply remediation action
 * @access  Private
 */
router.post('/apply/:issueId', asyncHandler(async (req, res) => {
  await remediationController.applyRemediation(req, res);
}));

/**
 * @route   GET /api/remediation/actions
 * @desc    Get all remediation actions
 * @access  Private
 */
router.get('/actions', asyncHandler(async (req, res) => {
  await remediationController.getAllActions(req, res);
}));

/**
 * @route   POST /api/remediation/rollback/:actionId
 * @desc    Rollback remediation action
 * @access  Private
 */
router.post('/rollback/:actionId', asyncHandler(async (req, res) => {
  await remediationController.rollbackAction(req, res);
}));

module.exports = router;


