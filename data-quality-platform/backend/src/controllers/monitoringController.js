const { Alert, Table } = require('../database/models');
const monitoringService = require('../services/monitoring');
const logger = require('../utils/logger');

/**
 * Monitoring Controller
 */

class MonitoringController {
  /**
   * Get monitoring status
   */
  async getStatus(req, res) {
    try {
      const status = monitoringService.getMonitoringStatus();

      res.json(status);
    } catch (error) {
      logger.error('Get monitoring status error:', error);
      res.status(500).json({
        error: 'Failed to get monitoring status',
        message: error.message
      });
    }
  }

  /**
   * Get all alerts
   */
  async getAlerts(req, res) {
    try {
      const {
        userId,
        status,
        severity,
        limit = 50,
        offset = 0
      } = req.query;

      const where = {};
      
      // Filter by userId if provided
      if (userId) {
        where.user_id = userId;
      }

      if (status) where.status = status;
      if (severity) where.severity = severity;

      const alerts = await Alert.findAndCountAll({
        where,
        include: [{ model: Table }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['triggered_at', 'DESC']]
      });

      res.json({
        alerts: alerts.rows,
        total: alerts.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      logger.error('Get alerts error:', error);
      res.status(500).json({
        error: 'Failed to get alerts',
        message: error.message
      });
    }
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(req, res) {
    try {
      const { alertId } = req.params;

      const alert = await Alert.findByPk(alertId);

      if (!alert) {
        return res.status(404).json({
          error: 'Alert not found'
        });
      }

      // No permission check needed (no auth)

      await alert.update({
        status: 'read',
        acknowledged_at: new Date()
      });

      res.json({
        message: 'Alert marked as read',
        alert
      });
    } catch (error) {
      logger.error('Mark alert as read error:', error);
      res.status(500).json({
        error: 'Failed to mark alert as read',
        message: error.message
      });
    }
  }

  /**
   * Dismiss alert
   */
  async dismissAlert(req, res) {
    try {
      const { alertId } = req.params;

      const alert = await Alert.findByPk(alertId);

      if (!alert) {
        return res.status(404).json({
          error: 'Alert not found'
        });
      }

      // No permission check needed (no auth)

      await alert.update({
        status: 'dismissed',
        acknowledged_at: new Date()
      });

      res.json({
        message: 'Alert dismissed',
        alert
      });
    } catch (error) {
      logger.error('Dismiss alert error:', error);
      res.status(500).json({
        error: 'Failed to dismiss alert',
        message: error.message
      });
    }
  }

  /**
   * Update alert thresholds
   */
  async updateThresholds(req, res) {
    try {
      const { thresholds } = req.body;

      // Anyone can update thresholds (no auth)
      monitoringService.updateAlertThresholds(thresholds);

      res.json({
        message: 'Alert thresholds updated',
        thresholds: monitoringService.alertThresholds
      });
    } catch (error) {
      logger.error('Update thresholds error:', error);
      res.status(500).json({
        error: 'Failed to update thresholds',
        message: error.message
      });
    }
  }

  /**
   * Trigger immediate quality check
   */
  async triggerCheck(req, res) {
    try {
      const { tableId } = req.params;

      const result = await monitoringService.triggerImmediateCheck(tableId);

      if (!result.success) {
        return res.status(400).json({
          error: 'Check failed',
          message: result.error
        });
      }

      res.json({
        message: 'Quality check completed',
        kpis: result.kpis
      });
    } catch (error) {
      logger.error('Trigger check error:', error);
      res.status(500).json({
        error: 'Failed to trigger check',
        message: error.message
      });
    }
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics(req, res) {
    try {
      const where = {};

      const alerts = await Alert.findAll({ where });

      const stats = {
        total: alerts.length,
        unread: alerts.filter(a => a.status === 'unread').length,
        read: alerts.filter(a => a.status === 'read').length,
        dismissed: alerts.filter(a => a.status === 'dismissed').length,
        bySeverity: {
          critical: alerts.filter(a => a.severity === 'critical').length,
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length
        },
        byType: this.groupBy(alerts, 'alert_type')
      };

      res.json(stats);
    } catch (error) {
      logger.error('Get alert statistics error:', error);
      res.status(500).json({
        error: 'Failed to get alert statistics',
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

module.exports = new MonitoringController();


