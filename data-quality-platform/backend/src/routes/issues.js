const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const issueController = require('../controllers/issueController');

const router = express.Router();

/**
 * @route   GET /api/issues
 * @desc    Get all issues with filters
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  await issueController.getAllIssues(req, res);
}));

/**
 * @route   GET /api/issues/statistics
 * @desc    Get issue statistics
 * @access  Private
 */
router.get('/statistics', asyncHandler(async (req, res) => {
  await issueController.getIssueStatistics(req, res);
}));

/**
 * @route   GET /api/issues/:issueId
 * @desc    Get single issue
 * @access  Private
 */
router.get('/:issueId', asyncHandler(async (req, res) => {
  await issueController.getIssue(req, res);
}));

/**
 * @route   PATCH /api/issues/:issueId/status
 * @desc    Update issue status
 * @access  Private
 */
router.patch('/:issueId/status', asyncHandler(async (req, res) => {
  await issueController.updateIssueStatus(req, res);
}));

/**
 * @route   DELETE /api/issues/:issueId
 * @desc    Delete issue
 * @access  Private
 */
router.delete('/:issueId', asyncHandler(async (req, res) => {
  await issueController.deleteIssue(req, res);
}));

module.exports = router;


