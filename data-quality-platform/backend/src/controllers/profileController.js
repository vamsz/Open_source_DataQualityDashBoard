const { DataProfile, Table } = require('../database/models');
const profilingService = require('../services/profilingService');
const logger = require('../utils/logger');

/**
 * Profile Controller
 */

class ProfileController {
  /**
   * Get profile for a table
   */
  async getTableProfile(req, res) {
    try {
      const { tableId } = req.params;

      const result = await profilingService.getProfile(tableId);

      if (!result.success) {
        return res.status(404).json({
          error: 'Profile not found',
          message: result.error
        });
      }

      res.json({
        profile: result.profile,
        cached: result.cached
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        message: error.message
      });
    }
  }

  /**
   * Get all profiles
   */
  async getAllProfiles(req, res) {
    try {
      const profiles = await DataProfile.findAll({
        include: [{ model: Table }],
        order: [['created_at', 'DESC']],
        limit: parseInt(req.query.limit) || 50
      });

      res.json({
        profiles,
        count: profiles.length
      });
    } catch (error) {
      logger.error('Get profiles error:', error);
      res.status(500).json({
        error: 'Failed to get profiles',
        message: error.message
      });
    }
  }

  /**
   * Get column profile details
   */
  async getColumnProfile(req, res) {
    try {
      const { tableId, columnName } = req.params;

      const result = await profilingService.getProfile(tableId);

      if (!result.success) {
        return res.status(404).json({
          error: 'Profile not found'
        });
      }

      const columnProfile = result.profile.column_profiles?.[columnName];

      if (!columnProfile) {
        return res.status(404).json({
          error: 'Column profile not found'
        });
      }

      res.json({
        column: columnName,
        profile: columnProfile
      });
    } catch (error) {
      logger.error('Get column profile error:', error);
      res.status(500).json({
        error: 'Failed to get column profile',
        message: error.message
      });
    }
  }

  /**
   * Compare profiles over time
   */
  async compareProfiles(req, res) {
    try {
      const { tableId } = req.params;
      const limit = parseInt(req.query.limit) || 5;

      const profiles = await DataProfile.findAll({
        where: { table_id: tableId, status: 'completed' },
        order: [['created_at', 'DESC']],
        limit
      });

      if (profiles.length < 2) {
        return res.status(400).json({
          error: 'Insufficient data',
          message: 'Need at least 2 profiles to compare'
        });
      }

      const comparison = {
        profiles: profiles.map(p => ({
          id: p.id,
          created_at: p.created_at,
          quality_score: p.quality_metrics?.overallScore,
          row_count: p.profile_data?.rowCount
        })),
        trends: this.calculateTrends(profiles)
      };

      res.json(comparison);
    } catch (error) {
      logger.error('Compare profiles error:', error);
      res.status(500).json({
        error: 'Failed to compare profiles',
        message: error.message
      });
    }
  }

  /**
   * Calculate trends from profiles
   */
  calculateTrends(profiles) {
    if (profiles.length < 2) return null;

    const latest = profiles[0];
    const previous = profiles[1];

    return {
      qualityScore: {
        current: latest.quality_metrics?.overallScore,
        previous: previous.quality_metrics?.overallScore,
        change: (latest.quality_metrics?.overallScore || 0) - (previous.quality_metrics?.overallScore || 0)
      },
      rowCount: {
        current: latest.profile_data?.rowCount,
        previous: previous.profile_data?.rowCount,
        change: (latest.profile_data?.rowCount || 0) - (previous.profile_data?.rowCount || 0)
      },
      completeness: {
        current: latest.quality_metrics?.completeness,
        previous: previous.quality_metrics?.completeness,
        change: (latest.quality_metrics?.completeness || 0) - (previous.quality_metrics?.completeness || 0)
      }
    };
  }
}

module.exports = new ProfileController();


