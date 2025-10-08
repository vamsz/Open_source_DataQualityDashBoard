const cron = require('node-cron');
const { Table, Issue, KPIDashboard, Alert, User, sequelize } = require('../database/models');
const logger = require('../utils/logger');
const profilingService = require('./profilingService');
const qualityService = require('./qualityService');

/**
 * Monitoring and Alerting Service
 * Runs scheduled jobs for data quality monitoring
 */

class MonitoringService {
  constructor() {
    this.jobs = [];
    this.alertThresholds = {
      critical: { issueCount: 10, qualityScore: 50 },
      high: { issueCount: 5, qualityScore: 70 },
      medium: { issueCount: 3, qualityScore: 85 }
    };
  }

  /**
   * Start all monitoring jobs
   */
  startMonitoringJobs() {
    logger.info('Starting monitoring jobs...');

    // Job 1: Re-profile active tables (every 6 hours)
    const reprofilingJob = cron.schedule('0 */6 * * *', async () => {
      await this.runReprofilingJob();
    });
    this.jobs.push({ name: 'reprofiling', job: reprofilingJob });

    // Job 2: Check quality KPIs (every hour)
    const kpiJob = cron.schedule('0 * * * *', async () => {
      await this.runKPICheckJob();
    });
    this.jobs.push({ name: 'kpi-check', job: kpiJob });

    // Job 3: Check for data drifts (every 3 hours)
    const driftJob = cron.schedule('0 */3 * * *', async () => {
      await this.runDriftDetectionJob();
    });
    this.jobs.push({ name: 'drift-detection', job: driftJob });

    // Job 4: Generate alerts (every 30 minutes)
    const alertJob = cron.schedule('*/30 * * * *', async () => {
      await this.runAlertGenerationJob();
    });
    this.jobs.push({ name: 'alert-generation', job: alertJob });

    // Job 5: Clean up old data (daily at midnight)
    const cleanupJob = cron.schedule('0 0 * * *', async () => {
      await this.runCleanupJob();
    });
    this.jobs.push({ name: 'cleanup', job: cleanupJob });

    logger.info(`Started ${this.jobs.length} monitoring jobs`);
  }

  /**
   * Stop all monitoring jobs
   */
  stopMonitoringJobs() {
    logger.info('Stopping monitoring jobs...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
    this.jobs = [];
  }

  /**
   * Job 1: Re-profiling active tables
   */
  async runReprofilingJob() {
    try {
      logger.info('Running re-profiling job...');

      const tables = await Table.findAll({
        where: { status: 'active' },
        order: [['last_profiled', 'ASC']]
      });

      for (const table of tables) {
        try {
          // Check if table needs re-profiling (older than 24 hours)
          const lastProfiled = table.last_profiled;
          const hoursSinceProfile = lastProfiled 
            ? (Date.now() - new Date(lastProfiled).getTime()) / (1000 * 60 * 60)
            : Infinity;

          if (hoursSinceProfile >= 24) {
            logger.info(`Re-profiling table: ${table.name}`);
            
            // This would require loading the actual data
            // For now, just update the timestamp
            await table.update({ last_profiled: new Date() });
          }
        } catch (error) {
          logger.error(`Error re-profiling table ${table.id}:`, error);
        }
      }

      logger.info('Re-profiling job completed');
    } catch (error) {
      logger.error('Re-profiling job error:', error);
    }
  }

  /**
   * Job 2: Check and update quality KPIs
   */
  async runKPICheckJob() {
    try {
      logger.info('Running KPI check job...');

      const tables = await Table.findAll({
        where: { status: 'active' }
      });

      for (const table of tables) {
        try {
          const issues = await Issue.findAll({
            where: { 
              table_id: table.id,
              status: ['open', 'in_progress']
            }
          });

          // Get latest profile for column data
          const profile = await profilingService.getProfile(table.id);
          
          if (profile.success) {
            const kpis = await qualityService.calculateKPIs(
              table.id,
              profile.profile.column_profiles || {},
              issues
            );

            // Update or create KPI dashboard entry
            await KPIDashboard.upsert({
              table_id: table.id,
              accuracy: kpis.accuracy,
              completeness: kpis.completeness,
              consistency: kpis.consistency,
              uniqueness: kpis.uniqueness,
              validity: kpis.validity,
              timeliness: kpis.timeliness,
              integrity: kpis.integrity,
              overall_score: (
                kpis.accuracy * 0.2 +
                kpis.completeness * 0.2 +
                kpis.consistency * 0.15 +
                kpis.uniqueness * 0.1 +
                kpis.validity * 0.2 +
                kpis.timeliness * 0.05 +
                kpis.integrity * 0.1
              ),
              total_issues: kpis.issueCount,
              critical_issues: kpis.criticalIssues,
              open_issues: kpis.openIssues,
              resolved_issues: kpis.resolvedIssues,
              metadata: {
                lastUpdated: new Date(),
                issuesBySeverity: {
                  critical: kpis.criticalIssues,
                  high: kpis.highIssues,
                  medium: kpis.mediumIssues,
                  low: kpis.lowIssues
                }
              }
            });

            // Update table quality score
            const overallScore = (
              kpis.accuracy * 0.2 +
              kpis.completeness * 0.2 +
              kpis.consistency * 0.15 +
              kpis.uniqueness * 0.1 +
              kpis.validity * 0.2 +
              kpis.timeliness * 0.05 +
              kpis.integrity * 0.1
            );

            await table.update({ quality_score: overallScore.toFixed(2) });
          }
        } catch (error) {
          logger.error(`Error checking KPIs for table ${table.id}:`, error);
        }
      }

      logger.info('KPI check job completed');
    } catch (error) {
      logger.error('KPI check job error:', error);
    }
  }

  /**
   * Job 3: Detect data drifts
   */
  async runDriftDetectionJob() {
    try {
      logger.info('Running drift detection job...');

      const tables = await Table.findAll({
        where: { status: 'active' }
      });

      for (const table of tables) {
        try {
          // Compare current stats with historical baseline
          // This is a placeholder - would require historical profile comparison
          logger.debug(`Checking drift for table: ${table.name}`);
        } catch (error) {
          logger.error(`Error detecting drift for table ${table.id}:`, error);
        }
      }

      logger.info('Drift detection job completed');
    } catch (error) {
      logger.error('Drift detection job error:', error);
    }
  }

  /**
   * Job 4: Generate alerts based on thresholds
   */
  async runAlertGenerationJob() {
    try {
      logger.info('Running alert generation job...');

      const kpiDashboards = await KPIDashboard.findAll({
        include: [{ model: Table }]
      });

      for (const kpi of kpiDashboards) {
        try {
          // Check if any metrics breach thresholds
          const alerts = [];

          // Critical alert: quality score too low
          if (kpi.overall_score < this.alertThresholds.critical.qualityScore) {
            alerts.push({
              alert_type: 'quality_degradation',
              severity: 'critical',
              title: `Critical quality degradation in ${kpi.Table.display_name}`,
              message: `Overall quality score dropped to ${kpi.overall_score.toFixed(2)}%`,
              metadata: { tableId: kpi.table_id, qualityScore: kpi.overall_score }
            });
          }

          // High alert: too many critical issues
          if (kpi.critical_issues >= this.alertThresholds.critical.issueCount) {
            alerts.push({
              alert_type: 'critical_issues',
              severity: 'high',
              title: `Multiple critical issues in ${kpi.Table.display_name}`,
              message: `Found ${kpi.critical_issues} critical issues requiring immediate attention`,
              metadata: { tableId: kpi.table_id, criticalIssues: kpi.critical_issues }
            });
          }

          // Medium alert: completeness below threshold
          if (kpi.completeness < 80) {
            alerts.push({
              alert_type: 'low_completeness',
              severity: 'medium',
              title: `Low data completeness in ${kpi.Table.display_name}`,
              message: `Completeness is only ${kpi.completeness.toFixed(2)}%`,
              metadata: { tableId: kpi.table_id, completeness: kpi.completeness }
            });
          }

          // Create alerts (no user association needed)
          if (alerts.length > 0) {
            for (const alert of alerts) {
              await Alert.create({
                user_id: null, // No user tracking
                table_id: kpi.table_id,
                ...alert,
                status: 'unread',
                triggered_at: new Date()
              });
            }

            logger.info(`Generated ${alerts.length} alerts for table ${kpi.table_id}`);
          }
        } catch (error) {
          logger.error(`Error generating alerts for KPI ${kpi.id}:`, error);
        }
      }

      logger.info('Alert generation job completed');
    } catch (error) {
      logger.error('Alert generation job error:', error);
    }
  }

  /**
   * Job 5: Clean up old data
   */
  async runCleanupJob() {
    try {
      logger.info('Running cleanup job...');

      // Delete resolved issues older than 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const deletedIssues = await Issue.destroy({
        where: {
          status: 'resolved',
          // SQLite uses different operator syntax
          resolved_at: { [sequelize.Op.lt]: ninetyDaysAgo }
        }
      });

      logger.info(`Deleted ${deletedIssues} old resolved issues`);

      // Mark old alerts as archived
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const archivedAlerts = await Alert.update(
        { status: 'archived' },
        {
          where: {
            status: 'read',
            triggered_at: { [sequelize.Op.lt]: thirtyDaysAgo }
          }
        }
      );

      logger.info(`Archived ${archivedAlerts[0]} old alerts`);

      logger.info('Cleanup job completed');
    } catch (error) {
      logger.error('Cleanup job error:', error);
    }
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus() {
    return {
      running: this.jobs.length > 0,
      jobs: this.jobs.map(({ name, job }) => ({
        name,
        running: job.running || false
      })),
      alertThresholds: this.alertThresholds
    };
  }

  /**
   * Update alert thresholds
   */
  updateAlertThresholds(thresholds) {
    this.alertThresholds = {
      ...this.alertThresholds,
      ...thresholds
    };
    logger.info('Alert thresholds updated:', this.alertThresholds);
  }

  /**
   * Trigger immediate quality check
   */
  async triggerImmediateCheck(tableId) {
    try {
      logger.info(`Triggering immediate quality check for table ${tableId}`);
      
      const table = await Table.findByPk(tableId);
      if (!table) {
        throw new Error('Table not found');
      }

      // Run quality checks
      const issues = await Issue.findAll({
        where: { table_id: tableId, status: ['open', 'in_progress'] }
      });

      const profile = await profilingService.getProfile(tableId);
      
      if (profile.success) {
        const kpis = await qualityService.calculateKPIs(
          tableId,
          profile.profile.column_profiles || {},
          issues
        );

        return { success: true, kpis };
      }

      return { success: false, error: 'Profile not found' };
    } catch (error) {
      logger.error('Immediate check error:', error);
      return { success: false, error: error.message };
    }
  }
}

const monitoringService = new MonitoringService();

// Export singleton instance and function for server.js
module.exports = monitoringService;
module.exports.startMonitoringJobs = () => monitoringService.startMonitoringJobs();


