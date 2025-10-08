const { DataProfile, Table, Column, DataRecord } = require('../database/models');
const logger = require('../utils/logger');
const { getCache, setCache } = require('./redis');
const _ = require('lodash');

/**
 * Data Profiling Service
 * Generates comprehensive statistics and quality metrics for datasets
 */

class ProfilingService {
  /**
   * Profile entire table
   */
  async profileTable(tableId, userId, data) {
    const startTime = Date.now();
    
    try {
      // Get table info
      const table = await Table.findByPk(tableId);
      if (!table) {
        throw new Error('Table not found');
      }

      // Generate profile
      const profileData = this.generateTableProfile(data);
      const columnProfiles = this.generateColumnProfiles(data);
      const qualityMetrics = this.calculateQualityMetrics(data, columnProfiles);

      // Create profile record
      const profile = await DataProfile.create({
        table_id: tableId,
        user_id: userId,
        profile_type: 'full',
        profile_data: profileData,
        column_profiles: columnProfiles,
        quality_metrics: qualityMetrics,
        summary_stats: this.generateSummaryStats(data, columnProfiles),
        execution_time: Date.now() - startTime,
        status: 'completed'
      });

      // Update table
      await table.update({
        row_count: data.length,
        column_count: Object.keys(data[0] || {}).length,
        last_profiled: new Date(),
        quality_score: qualityMetrics.overallScore
      });

      // Cache profile
      await setCache(`profile:${tableId}`, profile.toJSON(), 3600);

      logger.info(`Table ${tableId} profiled successfully`);
      return { success: true, profile };

    } catch (error) {
      logger.error('Profiling error:', error);
      
      // Create failed profile record
      await DataProfile.create({
        table_id: tableId,
        user_id: userId,
        profile_type: 'full',
        profile_data: {},
        execution_time: Date.now() - startTime,
        status: 'failed',
        error_message: error.message
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Generate table-level profile
   */
  generateTableProfile(data) {
    if (!data || data.length === 0) {
      return { rowCount: 0, columnCount: 0 };
    }

    const columns = Object.keys(data[0]);
    
    return {
      rowCount: data.length,
      columnCount: columns.length,
      columns: columns,
      memorySize: JSON.stringify(data).length,
      isEmpty: data.length === 0,
      sampleData: data.slice(0, 5)
    };
  }

  /**
   * Generate column-level profiles
   */
  generateColumnProfiles(data) {
    if (!data || data.length === 0) return {};

    const columns = Object.keys(data[0]);
    const profiles = {};

    for (const column of columns) {
      const values = data.map(row => row[column]);
      profiles[column] = this.profileColumn(column, values);
    }

    return profiles;
  }

  /**
   * Profile individual column
   */
  profileColumn(columnName, values) {
    const totalCount = values.length;
    const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = [...new Set(nonNullValues)];
    const distinctCount = uniqueValues.length;

    // Detect data type
    const dataType = this.detectDataType(nonNullValues);
    
    // Base profile
    const profile = {
      name: columnName,
      dataType: dataType,
      count: totalCount,
      nullCount: nullCount,
      notNullCount: totalCount - nullCount,
      distinctCount: distinctCount,
      uniqueness: totalCount > 0 ? (distinctCount / totalCount) : 0,
      completeness: totalCount > 0 ? ((totalCount - nullCount) / totalCount) : 0,
      sparsity: totalCount > 0 ? (nullCount / totalCount) : 0
    };

    // Type-specific statistics
    if (dataType === 'numeric') {
      Object.assign(profile, this.calculateNumericStats(nonNullValues));
    } else if (dataType === 'string') {
      Object.assign(profile, this.calculateStringStats(nonNullValues));
    } else if (dataType === 'date') {
      Object.assign(profile, this.calculateDateStats(nonNullValues));
    } else if (dataType === 'boolean') {
      Object.assign(profile, this.calculateBooleanStats(nonNullValues));
    }

    // Value distribution
    profile.valueDistribution = this.calculateValueDistribution(nonNullValues, 10);
    
    // Pattern analysis
    profile.patterns = this.analyzePatterns(nonNullValues);

    return profile;
  }

  /**
   * Detect data type of column
   */
  detectDataType(values) {
    if (values.length === 0) return 'unknown';

    const sample = values.slice(0, 100);
    let numericCount = 0;
    let dateCount = 0;
    let booleanCount = 0;

    for (const value of sample) {
      if (typeof value === 'number' || !isNaN(Number(value))) {
        numericCount++;
      }
      if (this.isDate(value)) {
        dateCount++;
      }
      if (typeof value === 'boolean' || value === 'true' || value === 'false') {
        booleanCount++;
      }
    }

    const total = sample.length;
    if (numericCount / total > 0.8) return 'numeric';
    if (dateCount / total > 0.8) return 'date';
    if (booleanCount / total > 0.8) return 'boolean';
    return 'string';
  }

  /**
   * Calculate numeric statistics
   */
  calculateNumericStats(values) {
    const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
    
    if (numbers.length === 0) {
      return { min: null, max: null, mean: null, median: null, std: null };
    }

    const sorted = numbers.slice().sort((a, b) => a - b);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    
    const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
    const std = Math.sqrt(variance);
    
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: mean,
      median: median,
      std: std,
      variance: variance,
      q1: q1,
      q3: q3,
      iqr: q3 - q1,
      sum: sum
    };
  }

  /**
   * Calculate string statistics
   */
  calculateStringStats(values) {
    const strings = values.filter(v => typeof v === 'string');
    
    if (strings.length === 0) {
      return { minLength: null, maxLength: null, avgLength: null };
    }

    const lengths = strings.map(s => s.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    return {
      minLength: Math.min(...lengths),
      maxLength: Math.max(...lengths),
      avgLength: avgLength,
      totalLength: lengths.reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Calculate date statistics
   */
  calculateDateStats(values) {
    const dates = values.map(v => new Date(v)).filter(d => !isNaN(d.getTime()));
    
    if (dates.length === 0) {
      return { minDate: null, maxDate: null };
    }

    const timestamps = dates.map(d => d.getTime());
    
    return {
      minDate: new Date(Math.min(...timestamps)),
      maxDate: new Date(Math.max(...timestamps)),
      range: Math.max(...timestamps) - Math.min(...timestamps)
    };
  }

  /**
   * Calculate boolean statistics
   */
  calculateBooleanStats(values) {
    const booleans = values.map(v => {
      if (typeof v === 'boolean') return v;
      if (v === 'true' || v === '1' || v === 1) return true;
      if (v === 'false' || v === '0' || v === 0) return false;
      return null;
    }).filter(v => v !== null);

    const trueCount = booleans.filter(v => v === true).length;
    const falseCount = booleans.filter(v => v === false).length;

    return {
      trueCount,
      falseCount,
      trueRatio: booleans.length > 0 ? trueCount / booleans.length : 0
    };
  }

  /**
   * Calculate value distribution
   */
  calculateValueDistribution(values, topN = 10) {
    const frequency = {};
    
    for (const value of values) {
      const key = String(value);
      frequency[key] = (frequency[key] || 0) + 1;
    }

    const sorted = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN);

    return sorted.map(([value, count]) => ({
      value,
      count,
      percentage: (count / values.length) * 100
    }));
  }

  /**
   * Analyze patterns in data
   */
  analyzePatterns(values) {
    const patterns = {
      hasNumbers: values.some(v => /\d/.test(String(v))),
      hasLetters: values.some(v => /[a-zA-Z]/.test(String(v))),
      hasSpecialChars: values.some(v => /[^a-zA-Z0-9\s]/.test(String(v))),
      commonPatterns: []
    };

    // Email pattern
    if (values.some(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)))) {
      patterns.commonPatterns.push('email');
    }

    // Phone pattern
    if (values.some(v => /^\+?\d{10,}$/.test(String(v).replace(/[-\s()]/g, '')))) {
      patterns.commonPatterns.push('phone');
    }

    // URL pattern
    if (values.some(v => /^https?:\/\/.+/.test(String(v)))) {
      patterns.commonPatterns.push('url');
    }

    return patterns;
  }

  /**
   * Calculate preliminary quality metrics
   * (Will be enhanced with full DQI calculation after issue detection)
   */
  calculateQualityMetrics(data, columnProfiles) {
    const columns = Object.values(columnProfiles);
    
    // Completeness: % of non-null values
    const completeness = columns.reduce((sum, col) => sum + col.completeness, 0) / columns.length;
    
    // Uniqueness: Average uniqueness across columns
    const uniqueness = columns.reduce((sum, col) => sum + col.uniqueness, 0) / columns.length;
    
    // Initial estimates (will be updated after quality checks)
    const validity = 0.98;
    const consistency = this.calculateConsistency(columnProfiles);
    const accuracy = 0.95;
    const integrity = 0.95;
    const timeliness = 0.90;
    
    // Calculate preliminary weighted composite DQI
    const weights = {
      accuracy: 0.20,
      completeness: 0.15,
      consistency: 0.15,
      timeliness: 0.10,
      validity: 0.20,
      uniqueness: 0.10,
      integrity: 0.10
    };

    const overallScore = (
      weights.accuracy * accuracy +
      weights.completeness * completeness +
      weights.consistency * consistency +
      weights.timeliness * timeliness +
      weights.validity * validity +
      weights.uniqueness * uniqueness +
      weights.integrity * integrity
    ) * 100;

    return {
      completeness: parseFloat((completeness * 100).toFixed(2)),
      uniqueness: parseFloat((uniqueness * 100).toFixed(2)),
      validity: parseFloat((validity * 100).toFixed(2)),
      consistency: parseFloat((consistency * 100).toFixed(2)),
      accuracy: parseFloat((accuracy * 100).toFixed(2)),
      integrity: parseFloat((integrity * 100).toFixed(2)),
      timeliness: parseFloat((timeliness * 100).toFixed(2)),
      overallScore: parseFloat(overallScore.toFixed(2))
    };
  }

  /**
   * Calculate consistency metric
   */
  calculateConsistency(columnProfiles) {
    // Check if data follows expected patterns
    let consistentColumns = 0;
    const columns = Object.values(columnProfiles);

    for (const col of columns) {
      // High consistency if most values follow similar patterns
      if (col.distinctCount / col.count < 0.5) {
        consistentColumns++;
      }
    }

    return columns.length > 0 ? consistentColumns / columns.length : 1;
  }

  /**
   * Generate summary statistics
   */
  generateSummaryStats(data, columnProfiles) {
    return {
      totalRows: data.length,
      totalColumns: Object.keys(columnProfiles).length,
      totalCells: data.length * Object.keys(columnProfiles).length,
      completeCells: Object.values(columnProfiles).reduce((sum, col) => sum + col.notNullCount, 0),
      missingCells: Object.values(columnProfiles).reduce((sum, col) => sum + col.nullCount, 0),
      numericColumns: Object.values(columnProfiles).filter(c => c.dataType === 'numeric').length,
      stringColumns: Object.values(columnProfiles).filter(c => c.dataType === 'string').length,
      dateColumns: Object.values(columnProfiles).filter(c => c.dataType === 'date').length,
      booleanColumns: Object.values(columnProfiles).filter(c => c.dataType === 'boolean').length
    };
  }

  /**
   * Check if value is a date
   */
  isDate(value) {
    const date = new Date(value);
    return !isNaN(date.getTime()) && /\d{4}/.test(String(value));
  }

  /**
   * Get cached profile or generate new one
   */
  async getProfile(tableId) {
    const cached = await getCache(`profile:${tableId}`);
    if (cached) {
      return { success: true, profile: cached, cached: true };
    }

    const profile = await DataProfile.findOne({
      where: { table_id: tableId },
      order: [['created_at', 'DESC']]
    });

    if (profile) {
      await setCache(`profile:${tableId}`, profile.toJSON(), 3600);
      return { success: true, profile, cached: false };
    }

    return { success: false, error: 'No profile found' };
  }
}

module.exports = new ProfilingService();


