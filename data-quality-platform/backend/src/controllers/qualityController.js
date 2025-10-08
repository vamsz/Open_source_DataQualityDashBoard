const { KPIDashboard, Table, Issue } = require('../database/models');
const qualityService = require('../services/qualityService');
const logger = require('../utils/logger');

/**
 * Quality Controller
 */

class QualityController {
  /**
   * Get KPI dashboard for a table
   */
  async getKPIDashboard(req, res) {
    try {
      const { tableId } = req.params;

      const kpi = await KPIDashboard.findOne({
        where: { table_id: tableId },
        include: [{ model: Table }],
        order: [['updated_at', 'DESC']]
      });

      if (!kpi) {
        return res.status(404).json({
          error: 'KPI dashboard not found'
        });
      }

      res.json({ kpi });
    } catch (error) {
      logger.error('Get KPI dashboard error:', error);
      res.status(500).json({
        error: 'Failed to get KPI dashboard',
        message: error.message
      });
    }
  }

  /**
   * Get all KPI dashboards
   */
  async getAllKPIs(req, res) {
    try {
      const kpis = await KPIDashboard.findAll({
        include: [{ model: Table }],
        order: [['updated_at', 'DESC']]
      });

      res.json({
        kpis,
        count: kpis.length
      });
    } catch (error) {
      logger.error('Get all KPIs error:', error);
      res.status(500).json({
        error: 'Failed to get KPIs',
        message: error.message
      });
    }
  }

  /**
   * Get quality trends
   */
  async getQualityTrends(req, res) {
    try {
      const { tableId } = req.params;
      const days = parseInt(req.query.days) || 30;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get historical KPI data (simplified - in production, store historical snapshots)
      const { Op } = require('sequelize');
      const issues = await Issue.findAll({
        where: {
          table_id: tableId,
          created_at: { [Op.gte]: startDate }
        },
        order: [['created_at', 'ASC']]
      });

      // Group by date
      const trendsByDate = {};
      issues.forEach(issue => {
        const date = issue.created_at.toISOString().split('T')[0];
        if (!trendsByDate[date]) {
          trendsByDate[date] = {
            date,
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          };
        }
        trendsByDate[date].total++;
        trendsByDate[date][issue.severity]++;
      });

      const trends = Object.values(trendsByDate);

      res.json({
        trends,
        period: { start: startDate, end: new Date(), days }
      });
    } catch (error) {
      logger.error('Get quality trends error:', error);
      res.status(500).json({
        error: 'Failed to get quality trends',
        message: error.message
      });
    }
  }

  /**
   * Get quality summary
   */
  async getQualitySummary(req, res) {
    try {
      const tables = await Table.findAll({
        where: { status: 'active' }
      });

      const summary = {
        totalTables: tables.length,
        avgQualityScore: 0,
        totalIssues: 0,
        criticalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0,
        tableScores: []
      };

      for (const table of tables) {
        const kpi = await KPIDashboard.findOne({
          where: { table_id: table.id }
        });

        if (kpi) {
          summary.avgQualityScore += parseFloat(kpi.overall_score || 0);
          summary.totalIssues += kpi.total_issues || 0;
          summary.criticalIssues += kpi.critical_issues || 0;
          summary.openIssues += kpi.open_issues || 0;
          summary.resolvedIssues += kpi.resolved_issues || 0;

          summary.tableScores.push({
            tableId: table.id,
            tableName: table.display_name,
            score: kpi.overall_score,
            issues: kpi.total_issues
          });
        }
      }

      summary.avgQualityScore = tables.length > 0 
        ? (summary.avgQualityScore / tables.length).toFixed(2)
        : 0;

      summary.tableScores.sort((a, b) => a.score - b.score);

      res.json(summary);
    } catch (error) {
      logger.error('Get quality summary error:', error);
      res.status(500).json({
        error: 'Failed to get quality summary',
        message: error.message
      });
    }
  }

  /**
   * Get comprehensive Data Quality Index (DQI) for a table
   */
  async getDQI(req, res) {
    try {
      const { tableId } = req.params;

      const table = await Table.findByPk(tableId);

      if (!table) {
        return res.status(404).json({
          error: 'Table not found'
        });
      }

      // Get DQI from table metadata
      const dqi = table.metadata?.dqi || null;
      const issues = table.metadata?.issues || null;

      if (!dqi) {
        return res.status(404).json({
          error: 'DQI not calculated yet',
          message: 'Please wait for data quality analysis to complete'
        });
      }

      res.json({
        tableId: table.id,
        tableName: table.display_name,
        qualityScore: table.quality_score,
        dqi: dqi,
        issues: issues,
        lastAnalyzed: table.metadata?.lastAnalyzed || table.last_profiled
      });
    } catch (error) {
      logger.error('Get DQI error:', error);
      res.status(500).json({
        error: 'Failed to get DQI',
        message: error.message
      });
    }
  }
}

module.exports = new QualityController();


