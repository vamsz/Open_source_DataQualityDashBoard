const { Issue, Table, Column } = require('../database/models');
const logger = require('../utils/logger');

/**
 * Issue Controller
 */

class IssueController {
  /**
   * Get all issues
   */
  async getAllIssues(req, res) {
    try {
      const {
        tableId,
        status,
        severity,
        issueType,
        limit = 50,
        offset = 0
      } = req.query;

      const where = {};
      if (tableId) where.table_id = tableId;
      if (status) where.status = status;
      if (severity) where.severity = severity;
      if (issueType) where.issue_type = issueType;

      const issues = await Issue.findAndCountAll({
        where,
        include: [
          { model: Table },
          { model: Column, required: false }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['severity', 'DESC'],
          ['detected_at', 'DESC']
        ]
      });

      res.json({
        issues: issues.rows,
        total: issues.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      logger.error('Get issues error:', error);
      res.status(500).json({
        error: 'Failed to get issues',
        message: error.message
      });
    }
  }

  /**
   * Get single issue
   */
  async getIssue(req, res) {
    try {
      const { issueId } = req.params;

      const issue = await Issue.findByPk(issueId, {
        include: [
          { model: Table },
          { model: Column, required: false }
        ]
      });

      if (!issue) {
        return res.status(404).json({
          error: 'Issue not found'
        });
      }

      res.json({ issue });
    } catch (error) {
      logger.error('Get issue error:', error);
      res.status(500).json({
        error: 'Failed to get issue',
        message: error.message
      });
    }
  }

  /**
   * Update issue status
   */
  async updateIssueStatus(req, res) {
    try {
      const { issueId } = req.params;
      const { status } = req.body;

      const issue = await Issue.findByPk(issueId);

      if (!issue) {
        return res.status(404).json({
          error: 'Issue not found'
        });
      }

      const updateData = { status };
      
      if (status === 'resolved') {
        updateData.resolved_at = new Date();
      }

      await issue.update(updateData);

      logger.info(`Issue ${issueId} status updated to ${status}`);

      res.json({
        message: 'Issue status updated',
        issue
      });
    } catch (error) {
      logger.error('Update issue status error:', error);
      res.status(500).json({
        error: 'Failed to update issue status',
        message: error.message
      });
    }
  }

  /**
   * Delete issue
   */
  async deleteIssue(req, res) {
    try {
      const { issueId } = req.params;

      const issue = await Issue.findByPk(issueId);

      if (!issue) {
        return res.status(404).json({
          error: 'Issue not found'
        });
      }

      await issue.destroy();

      logger.info(`Issue ${issueId} deleted`);

      res.json({
        message: 'Issue deleted successfully'
      });
    } catch (error) {
      logger.error('Delete issue error:', error);
      res.status(500).json({
        error: 'Failed to delete issue',
        message: error.message
      });
    }
  }

  /**
   * Get issue statistics
   */
  async getIssueStatistics(req, res) {
    try {
      const { tableId } = req.query;

      const where = tableId ? { table_id: tableId } : {};

      const issues = await Issue.findAll({ where });

      const stats = {
        total: issues.length,
        byStatus: this.groupBy(issues, 'status'),
        bySeverity: this.groupBy(issues, 'severity'),
        byType: this.groupBy(issues, 'issue_type'),
        avgImpactScore: issues.length > 0
          ? (issues.reduce((sum, i) => sum + parseFloat(i.impact_score || 0), 0) / issues.length).toFixed(2)
          : 0
      };

      res.json(stats);
    } catch (error) {
      logger.error('Get issue statistics error:', error);
      res.status(500).json({
        error: 'Failed to get issue statistics',
        message: error.message
      });
    }
  }

  /**
   * Helper: Group by field
   */
  groupBy(items, field) {
    return items.reduce((acc, item) => {
      const key = item[field];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
}

module.exports = new IssueController();


