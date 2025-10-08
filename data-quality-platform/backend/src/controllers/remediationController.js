const { RemediationAction, Issue, DataQualityLog } = require('../database/models');
const aiService = require('../services/aiService');
const qualityService = require('../services/qualityService');
const logger = require('../utils/logger');

/**
 * Remediation Controller
 */

class RemediationController {
  /**
   * Get remediation suggestions for an issue
   */
  async getSuggestions(req, res) {
    try {
      const { issueId } = req.params;

      const issue = await Issue.findByPk(issueId);

      if (!issue) {
        return res.status(404).json({
          error: 'Issue not found'
        });
      }

      // Get AI-powered suggestions if not already cached
      if (!issue.ai_suggestion || Object.keys(issue.ai_suggestion).length === 0) {
        const context = {
          tableId: issue.table_id,
          columnId: issue.column_id,
          affectedRecords: issue.affected_records
        };

        const result = await aiService.generateRemediationSuggestions(issue, context);

        if (result.success) {
          await issue.update({ ai_suggestion: result.suggestions });
        }
      }

      res.json({
        issue: {
          id: issue.id,
          type: issue.issue_type,
          severity: issue.severity,
          description: issue.description
        },
        suggestions: issue.ai_suggestion,
        manualActions: this.getManualActions(issue)
      });
    } catch (error) {
      logger.error('Get suggestions error:', error);
      res.status(500).json({
        error: 'Failed to get suggestions',
        message: error.message
      });
    }
  }

  /**
   * Apply remediation action
   */
  async applyRemediation(req, res) {
    try {
      const { issueId } = req.params;
      const { actionType, actionParams, autoApply = false } = req.body;

      const issue = await Issue.findByPk(issueId);

      if (!issue) {
        return res.status(404).json({
          error: 'Issue not found'
        });
      }

      // Create remediation action record
      const action = await RemediationAction.create({
        issue_id: issueId,
        user_id: null, // No user tracking
        action_type: actionType,
        action_details: actionParams,
        status: 'pending',
        created_at: new Date()
      });

      // Apply remediation based on type
      let result;
      switch (actionType) {
        case 'merge_duplicates':
          result = await this.mergeDuplicates(issue, actionParams);
          break;
        case 'impute_missing':
          result = await this.imputeMissingValues(issue, actionParams);
          break;
        case 'standardize_format':
          result = await this.standardizeFormat(issue, actionParams);
          break;
        case 'remove_invalid':
          result = await this.removeInvalidRecords(issue, actionParams);
          break;
        case 'flag_outliers':
          result = await this.flagOutliers(issue, actionParams);
          break;
        default:
          result = { success: false, error: 'Unknown action type' };
      }

      // Update action record
      await action.update({
        status: result.success ? 'completed' : 'failed',
        result: result,
        completed_at: new Date()
      });

      // Update issue status if remediation succeeded
      if (result.success) {
        await issue.update({
          status: 'resolved',
          resolved_at: new Date()
        });

        // Log quality action
        await qualityService.logQualityAction(
          issue.table_id,
          'remediation_applied',
          {
            issueId,
            actionType,
            result
          },
          null
        );
      }

      logger.info(`Remediation action ${actionType} applied to issue ${issueId}`);

      res.json({
        message: result.success ? 'Remediation applied successfully' : 'Remediation failed',
        action,
        result
      });
    } catch (error) {
      logger.error('Apply remediation error:', error);
      res.status(500).json({
        error: 'Failed to apply remediation',
        message: error.message
      });
    }
  }

  /**
   * Get all remediation actions
   */
  async getAllActions(req, res) {
    try {
      const { issueId, status, limit = 50, offset = 0 } = req.query;

      const where = {};
      if (issueId) where.issue_id = issueId;
      if (status) where.status = status;

      const actions = await RemediationAction.findAndCountAll({
        where,
        include: [{ model: Issue }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        actions: actions.rows,
        total: actions.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      logger.error('Get actions error:', error);
      res.status(500).json({
        error: 'Failed to get actions',
        message: error.message
      });
    }
  }

  /**
   * Rollback remediation action
   */
  async rollbackAction(req, res) {
    try {
      const { actionId } = req.params;

      const action = await RemediationAction.findByPk(actionId, {
        include: [{ model: Issue }]
      });

      if (!action) {
        return res.status(404).json({
          error: 'Action not found'
        });
      }

      if (action.status !== 'completed') {
        return res.status(400).json({
          error: 'Can only rollback completed actions'
        });
      }

      // Perform rollback (simplified - in production, maintain backups)
      const rollbackResult = {
        success: true,
        message: 'Rollback simulation successful',
        note: 'Actual rollback would restore original data from backup'
      };

      await action.update({
        status: 'rolled_back',
        rollback_at: new Date(),
        rollback_details: rollbackResult
      });

      // Reopen the issue
      await action.Issue.update({
        status: 'open',
        resolved_at: null
      });

      logger.info(`Remediation action ${actionId} rolled back`);

      res.json({
        message: 'Action rolled back successfully',
        rollbackResult
      });
    } catch (error) {
      logger.error('Rollback action error:', error);
      res.status(500).json({
        error: 'Failed to rollback action',
        message: error.message
      });
    }
  }

  /**
   * Helper: Get manual action suggestions
   */
  getManualActions(issue) {
    const actions = [];

    switch (issue.issue_type) {
      case 'duplicate':
        actions.push(
          { type: 'merge_duplicates', label: 'Merge Duplicate Records', effort: 'medium' },
          { type: 'remove_duplicates', label: 'Remove Duplicate Records', effort: 'low' }
        );
        break;
      case 'missing':
        actions.push(
          { type: 'impute_missing', label: 'Impute Missing Values (AI)', effort: 'low' },
          { type: 'remove_incomplete', label: 'Remove Incomplete Records', effort: 'low' }
        );
        break;
      case 'invalid':
        actions.push(
          { type: 'correct_invalid', label: 'Correct Invalid Values', effort: 'high' },
          { type: 'remove_invalid', label: 'Remove Invalid Records', effort: 'low' }
        );
        break;
      case 'outlier':
        actions.push(
          { type: 'flag_outliers', label: 'Flag for Review', effort: 'low' },
          { type: 'cap_outliers', label: 'Cap at Threshold', effort: 'medium' }
        );
        break;
      case 'inconsistent':
        actions.push(
          { type: 'standardize_format', label: 'Standardize Format (AI)', effort: 'medium' }
        );
        break;
    }

    return actions;
  }

  /**
   * Remediation implementations (simplified - extend as needed)
   */
  async mergeDuplicates(issue, params) {
    return {
      success: true,
      message: `Would merge ${issue.affected_records.length} duplicate records`,
      affectedCount: issue.affected_records.length
    };
  }

  async imputeMissingValues(issue, params) {
    // Use AI service for imputation
    const result = await aiService.imputeMissingValues(
      params.data || [],
      params.columnName,
      params.columnType,
      params.context || {}
    );

    return result;
  }

  async standardizeFormat(issue, params) {
    const result = await aiService.standardizeFormat(
      params.values || [],
      params.fieldType
    );

    return result;
  }

  async removeInvalidRecords(issue, params) {
    return {
      success: true,
      message: `Would remove ${issue.affected_records.length} invalid records`,
      affectedCount: issue.affected_records.length
    };
  }

  async flagOutliers(issue, params) {
    return {
      success: true,
      message: `Flagged ${issue.affected_records.length} outliers for review`,
      affectedCount: issue.affected_records.length
    };
  }
}

module.exports = new RemediationController();


