const { Issue, DataQualityLog, Table, Column, RemediationAction } = require('../database/models');
const logger = require('../utils/logger');
const aiService = require('./aiService');
const _ = require('lodash');

/**
 * Data Quality Service
 * Detects and manages data quality issues
 */

class QualityService {
  /**
   * Run comprehensive quality checks on data
   */
  async runQualityChecks(tableId, data, columnProfiles) {
    try {
      const issues = [];

      // Check for duplicates
      const duplicateIssues = await this.detectDuplicates(tableId, data);
      issues.push(...duplicateIssues);

      // Check for missing values
      const missingIssues = await this.detectMissingValues(tableId, data, columnProfiles);
      issues.push(...missingIssues);

      // Check for invalid values
      const invalidIssues = await this.detectInvalidValues(tableId, data, columnProfiles);
      issues.push(...invalidIssues);

      // Check for outliers
      const outlierIssues = await this.detectOutliers(tableId, data, columnProfiles);
      issues.push(...outlierIssues);

      // Check for inconsistencies
      const inconsistentIssues = await this.detectInconsistencies(tableId, data, columnProfiles);
      issues.push(...inconsistentIssues);

      // Save all issues
      const savedIssues = await Issue.bulkCreate(issues);

      logger.info(`Quality checks completed for table ${tableId}: ${savedIssues.length} issues found`);
      return { success: true, issues: savedIssues };

    } catch (error) {
      logger.error('Quality check error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect duplicate records
   */
  async detectDuplicates(tableId, data) {
    const issues = [];
    const seen = new Map();

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const key = JSON.stringify(record);
      
      if (seen.has(key)) {
        const originalIndex = seen.get(key);
        issues.push({
          table_id: tableId,
          issue_type: 'duplicate',
          severity: 'medium',
          status: 'open',
          title: `Duplicate record found`,
          description: `Record at index ${i} is a duplicate of record at index ${originalIndex}`,
          affected_records: [originalIndex, i],
          record_count: 2,
          impact_score: 50,
          suggested_action: 'Merge or remove duplicate records',
          detected_at: new Date()
        });
      } else {
        seen.set(key, i);
      }
    }

    // Check for partial duplicates (same key fields)
    const keyFields = this.identifyKeyFields(data);
    if (keyFields.length > 0) {
      const partialDuplicates = this.findPartialDuplicates(data, keyFields);
      
      for (const group of partialDuplicates) {
        issues.push({
          table_id: tableId,
          issue_type: 'duplicate',
          severity: 'low',
          status: 'open',
          title: `Potential duplicate records (matching key fields)`,
          description: `Records ${group.join(', ')} have matching key fields: ${keyFields.join(', ')}`,
          affected_records: group,
          record_count: group.length,
          impact_score: 30,
          suggested_action: 'Review and merge if appropriate',
          detected_at: new Date()
        });
      }
    }

    return issues;
  }

  /**
   * Detect missing values
   */
  async detectMissingValues(tableId, data, columnProfiles) {
    const issues = [];

    for (const [columnName, profile] of Object.entries(columnProfiles)) {
      if (profile.nullCount > 0) {
        const missingPercentage = (profile.nullCount / profile.count) * 100;
        let severity = 'low';
        
        if (missingPercentage > 50) severity = 'critical';
        else if (missingPercentage > 25) severity = 'high';
        else if (missingPercentage > 10) severity = 'medium';

        issues.push({
          table_id: tableId,
          issue_type: 'missing',
          severity: severity,
          status: 'open',
          title: `Missing values in column ${columnName}`,
          description: `Column ${columnName} has ${profile.nullCount} missing values (${missingPercentage.toFixed(2)}%)`,
          record_count: profile.nullCount,
          impact_score: missingPercentage,
          suggested_action: `Impute missing values or remove affected records`,
          metadata: {
            columnName,
            dataType: profile.dataType,
            missingPercentage
          },
          detected_at: new Date()
        });
      }
    }

    return issues;
  }

  /**
   * Detect invalid values
   */
  async detectInvalidValues(tableId, data, columnProfiles) {
    const issues = [];

    for (const [columnName, profile] of Object.entries(columnProfiles)) {
      const values = data.map(row => row[columnName]);
      const invalidIndices = [];

      // Type-based validation
      if (profile.dataType === 'numeric') {
        values.forEach((value, index) => {
          if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
            invalidIndices.push(index);
          }
        });
      } else if (profile.dataType === 'date') {
        values.forEach((value, index) => {
          if (value !== null && value !== undefined && value !== '') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              invalidIndices.push(index);
            }
          }
        });
      }

      // Pattern-based validation
      if (profile.patterns && profile.patterns.commonPatterns) {
        if (profile.patterns.commonPatterns.includes('email')) {
          values.forEach((value, index) => {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
              invalidIndices.push(index);
            }
          });
        }
      }

      if (invalidIndices.length > 0) {
        const invalidPercentage = (invalidIndices.length / data.length) * 100;
        
        issues.push({
          table_id: tableId,
          issue_type: 'invalid',
          severity: invalidPercentage > 10 ? 'high' : 'medium',
          status: 'open',
          title: `Invalid values in column ${columnName}`,
          description: `Column ${columnName} has ${invalidIndices.length} invalid values that don't match expected type ${profile.dataType}`,
          affected_records: invalidIndices.slice(0, 100),
          record_count: invalidIndices.length,
          impact_score: invalidPercentage,
          suggested_action: `Correct or remove invalid values`,
          metadata: {
            columnName,
            expectedType: profile.dataType,
            invalidPercentage
          },
          detected_at: new Date()
        });
      }
    }

    return issues;
  }

  /**
   * Detect outliers
   */
  async detectOutliers(tableId, data, columnProfiles) {
    const issues = [];

    for (const [columnName, profile] of Object.entries(columnProfiles)) {
      if (profile.dataType === 'numeric' && profile.std) {
        const values = data.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '');
        const numbers = values.map(v => Number(v));
        const mean = profile.mean;
        const std = profile.std;
        
        const outlierIndices = [];
        const outlierValues = [];
        
        data.forEach((row, index) => {
          const value = Number(row[columnName]);
          if (!isNaN(value) && Math.abs(value - mean) > 3 * std) {
            outlierIndices.push(index);
            outlierValues.push(value);
          }
        });

        if (outlierIndices.length > 0) {
          const outlierPercentage = (outlierIndices.length / data.length) * 100;
          
          issues.push({
            table_id: tableId,
            issue_type: 'outlier',
            severity: outlierPercentage > 5 ? 'medium' : 'low',
            status: 'open',
            title: `Outliers detected in column ${columnName}`,
            description: `Column ${columnName} has ${outlierIndices.length} statistical outliers (>3 standard deviations from mean)`,
            affected_records: outlierIndices.slice(0, 100),
            record_count: outlierIndices.length,
            impact_score: outlierPercentage,
            suggested_action: `Review outliers for data entry errors or genuine extreme values`,
            metadata: {
              columnName,
              mean,
              std,
              outlierValues: outlierValues.slice(0, 10)
            },
            detected_at: new Date()
          });
        }
      }
    }

    return issues;
  }

  /**
   * Detect inconsistencies
   */
  async detectInconsistencies(tableId, data, columnProfiles) {
    const issues = [];

    for (const [columnName, profile] of Object.entries(columnProfiles)) {
      // Check format inconsistencies
      if (profile.dataType === 'string') {
        const values = data.map(row => row[columnName]).filter(v => v);
        const formats = new Set();
        
        values.forEach(value => {
          const format = this.detectFormat(String(value));
          formats.add(format);
        });

        if (formats.size > 1) {
          issues.push({
            table_id: tableId,
            issue_type: 'inconsistent',
            severity: 'low',
            status: 'open',
            title: `Format inconsistency in column ${columnName}`,
            description: `Column ${columnName} has values in ${formats.size} different formats`,
            record_count: data.length,
            impact_score: 25,
            suggested_action: `Standardize format across all values`,
            metadata: {
              columnName,
              formats: Array.from(formats)
            },
            detected_at: new Date()
          });
        }
      }

      // Check case inconsistencies
      if (profile.dataType === 'string') {
        const values = data.map(row => row[columnName]).filter(v => v);
        const hasMixedCase = values.some(v => {
          const str = String(v);
          return str.toLowerCase() !== str && str.toUpperCase() !== str;
        });
        
        const hasAllLower = values.some(v => String(v).toLowerCase() === String(v));
        const hasAllUpper = values.some(v => String(v).toUpperCase() === String(v));

        if (hasMixedCase && (hasAllLower || hasAllUpper)) {
          issues.push({
            table_id: tableId,
            issue_type: 'inconsistent',
            severity: 'low',
            status: 'open',
            title: `Case inconsistency in column ${columnName}`,
            description: `Column ${columnName} has mixed case conventions`,
            record_count: data.length,
            impact_score: 15,
            suggested_action: `Standardize to single case convention`,
            metadata: {
              columnName
            },
            detected_at: new Date()
          });
        }
      }
    }

    return issues;
  }

  /**
   * Calculate comprehensive KPI dashboard metrics with 7-dimension DQI
   */
  async calculateKPIs(tableId, columnProfiles, issues, data = []) {
    const issuesByType = _.groupBy(issues, 'issue_type');
    const issuesBySeverity = _.groupBy(issues, 'severity');

    // Calculate all 7 data quality dimensions
    const accuracy = this.calculateAccuracy(data, columnProfiles, issues);
    const completeness = this.calculateCompleteness(data, columnProfiles);
    const consistency = this.calculateConsistency(data, columnProfiles, issuesByType);
    const timeliness = this.calculateTimeliness(data, columnProfiles);
    const validity = this.calculateValidity(data, columnProfiles, issuesByType);
    const uniqueness = this.calculateUniqueness(data, columnProfiles, issuesByType);
    const integrity = this.calculateIntegrity(data, columnProfiles, issues);

    // Calculate weighted composite DQI
    // Default weights (can be customized)
    const weights = {
      accuracy: 0.20,
      completeness: 0.15,
      consistency: 0.15,
      timeliness: 0.10,
      validity: 0.20,
      uniqueness: 0.10,
      integrity: 0.10
    };

    const compositeScore = (
      weights.accuracy * accuracy +
      weights.completeness * completeness +
      weights.consistency * consistency +
      weights.timeliness * timeliness +
      weights.validity * validity +
      weights.uniqueness * uniqueness +
      weights.integrity * integrity
    );

    return {
      // 7 Data Quality Dimensions
      accuracy: parseFloat(accuracy.toFixed(2)),
      completeness: parseFloat(completeness.toFixed(2)),
      consistency: parseFloat(consistency.toFixed(2)),
      timeliness: parseFloat(timeliness.toFixed(2)),
      validity: parseFloat(validity.toFixed(2)),
      uniqueness: parseFloat(uniqueness.toFixed(2)),
      integrity: parseFloat(integrity.toFixed(2)),
      
      // Composite DQI Score
      overallScore: parseFloat(compositeScore.toFixed(2)),
      
      // Issue counts
      issueCount: issues.length,
      criticalIssues: (issuesBySeverity.critical || []).length,
      highIssues: (issuesBySeverity.high || []).length,
      mediumIssues: (issuesBySeverity.medium || []).length,
      lowIssues: (issuesBySeverity.low || []).length,
      
      openIssues: issues.filter(i => i.status === 'open').length,
      resolvedIssues: issues.filter(i => i.status === 'resolved').length,
      
      // Dimension details for reporting
      dimensions: {
        accuracy: {
          score: parseFloat(accuracy.toFixed(2)),
          weight: weights.accuracy,
          description: 'Measures how closely data values match the true or accepted values'
        },
        completeness: {
          score: parseFloat(completeness.toFixed(2)),
          weight: weights.completeness,
          description: 'Measures the extent to which all required data is present'
        },
        consistency: {
          score: parseFloat(consistency.toFixed(2)),
          weight: weights.consistency,
          description: 'Measures if data is the same across different datasets'
        },
        timeliness: {
          score: parseFloat(timeliness.toFixed(2)),
          weight: weights.timeliness,
          description: 'Measures if data is up-to-date and available within useful timeframe'
        },
        validity: {
          score: parseFloat(validity.toFixed(2)),
          weight: weights.validity,
          description: 'Measures if data conforms to the syntax (format, type, range)'
        },
        uniqueness: {
          score: parseFloat(uniqueness.toFixed(2)),
          weight: weights.uniqueness,
          description: 'Measures the extent to which records are free from duplicates'
        },
        integrity: {
          score: parseFloat(integrity.toFixed(2)),
          weight: weights.integrity,
          description: 'Measures correctness of relationships between data elements'
        }
      }
    };
  }

  /**
   * Accuracy: (Number of Correct Values / Total Number of Values) × 100
   * Measures how closely data values match the true or accepted values
   */
  calculateAccuracy(data, columnProfiles, issues) {
    if (!data || data.length === 0) return 100;

    const invalidIssues = issues.filter(i => i.issue_type === 'invalid');
    const outlierIssues = issues.filter(i => i.issue_type === 'outlier');
    
    let totalValues = 0;
    let correctValues = 0;

    Object.entries(columnProfiles).forEach(([colName, profile]) => {
      totalValues += profile.count;
      // Subtract incorrect values (invalid + outliers for this column)
      const colInvalidCount = invalidIssues
        .filter(i => i.metadata?.columnName === colName)
        .reduce((sum, i) => sum + i.record_count, 0);
      const colOutlierCount = outlierIssues
        .filter(i => i.metadata?.columnName === colName)
        .reduce((sum, i) => sum + i.record_count, 0);
      
      correctValues += (profile.count - colInvalidCount - colOutlierCount);
    });

    return totalValues > 0 ? (correctValues / totalValues) * 100 : 100;
  }

  /**
   * Completeness: (Number of Non-Missing Values / Total Number of Expected Values) × 100
   * Measures the extent to which all required data is present
   */
  calculateCompleteness(data, columnProfiles) {
    if (!data || data.length === 0) return 100;

    let totalExpected = 0;
    let nonMissing = 0;

    Object.values(columnProfiles).forEach(profile => {
      totalExpected += profile.count;
      nonMissing += profile.notNullCount;
    });

    return totalExpected > 0 ? (nonMissing / totalExpected) * 100 : 100;
  }

  /**
   * Consistency: (Number of Consistent Records / Total Number of Records) × 100
   * Measures if data is the same across different datasets
   */
  calculateConsistency(data, columnProfiles, issuesByType) {
    if (!data || data.length === 0) return 100;

    const inconsistentIssues = issuesByType.inconsistent || [];
    
    // Count records affected by inconsistency issues
    const inconsistentRecordCount = inconsistentIssues.reduce((sum, issue) => {
      return sum + (issue.record_count || 0);
    }, 0);

    const totalRecords = data.length;
    const consistentRecords = totalRecords - inconsistentRecordCount;

    return totalRecords > 0 ? (consistentRecords / totalRecords) * 100 : 100;
  }

  /**
   * Timeliness: (Number of Timely Records / Total Number of Records) × 100
   * Measures if data is up-to-date and available within useful timeframe
   */
  calculateTimeliness(data, columnProfiles) {
    if (!data || data.length === 0) return 100;

    // Look for date/timestamp columns
    const dateColumns = Object.entries(columnProfiles)
      .filter(([, profile]) => profile.dataType === 'date');

    if (dateColumns.length === 0) {
      // No date columns, assume timeliness is high
      return 95;
    }

    let totalRecords = data.length;
    let timelyRecords = 0;
    const currentDate = new Date();
    const oneYearAgo = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Check if dates are within reasonable timeframe (e.g., last year)
    dateColumns.forEach(([colName, profile]) => {
      data.forEach(row => {
        const value = row[colName];
        if (value) {
          const date = new Date(value);
          if (!isNaN(date.getTime()) && date >= oneYearAgo && date <= currentDate) {
            timelyRecords++;
          }
        }
      });
    });

    // If we have date columns, calculate based on them
    const totalDateValues = dateColumns.length * data.length;
    return totalDateValues > 0 ? (timelyRecords / totalDateValues) * 100 : 95;
  }

  /**
   * Validity: (Number of Valid Records / Total Number of Records) × 100
   * Measures if data conforms to the syntax (format, type, range)
   */
  calculateValidity(data, columnProfiles, issuesByType) {
    if (!data || data.length === 0) return 100;

    const invalidIssues = issuesByType.invalid || [];
    
    // Count total invalid records across all columns
    const invalidRecordCount = invalidIssues.reduce((sum, issue) => {
      return sum + (issue.record_count || 0);
    }, 0);

    // Total validatable records (rows × columns)
    const totalRecords = data.length * Object.keys(columnProfiles).length;
    const validRecords = totalRecords - invalidRecordCount;

    return totalRecords > 0 ? (validRecords / totalRecords) * 100 : 100;
  }

  /**
   * Uniqueness: (Number of Unique Records / Total Number of Records) × 100
   * Measures the extent to which records are free from duplicates
   */
  calculateUniqueness(data, columnProfiles, issuesByType) {
    if (!data || data.length === 0) return 100;

    const duplicateIssues = issuesByType.duplicate || [];
    
    // Count duplicate records
    const duplicateRecordCount = duplicateIssues.reduce((sum, issue) => {
      return sum + (issue.record_count || 0);
    }, 0);

    const totalRecords = data.length;
    const uniqueRecords = totalRecords - duplicateRecordCount;

    return totalRecords > 0 ? (uniqueRecords / totalRecords) * 100 : 100;
  }

  /**
   * Integrity: (Number of Records with Valid Relationships / Total Number of Records) × 100
   * Measures correctness of relationships between data elements
   */
  calculateIntegrity(data, columnProfiles, issues) {
    if (!data || data.length === 0) return 100;

    // Calculate based on referential integrity and constraint violations
    // For now, use overall data quality as a proxy
    const totalImpact = issues.reduce((sum, issue) => sum + (issue.impact_score || 0), 0);
    const avgImpact = issues.length > 0 ? totalImpact / issues.length : 0;

    // High integrity if few issues with low impact
    return Math.max(0, 100 - (avgImpact * 0.5));
  }

  /**
   * Helper: Identify key fields in data
   */
  identifyKeyFields(data) {
    if (data.length === 0) return [];
    
    const columns = Object.keys(data[0]);
    const keyFields = [];

    for (const col of columns) {
      const uniqueValues = new Set(data.map(row => row[col]));
      if (uniqueValues.size === data.length) {
        keyFields.push(col);
      }
    }

    return keyFields;
  }

  /**
   * Helper: Find partial duplicates
   */
  findPartialDuplicates(data, keyFields) {
    const groups = new Map();

    data.forEach((record, index) => {
      const key = keyFields.map(field => record[field]).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(index);
    });

    return Array.from(groups.values()).filter(group => group.length > 1);
  }

  /**
   * Helper: Detect format
   */
  detectFormat(value) {
    if (/^\d+$/.test(value)) return 'numeric';
    if (/^[A-Z]+$/.test(value)) return 'uppercase';
    if (/^[a-z]+$/.test(value)) return 'lowercase';
    if (/^[A-Z][a-z]+$/.test(value)) return 'titlecase';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date-iso';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return 'date-us';
    return 'mixed';
  }

  /**
   * Log quality action
   */
  async logQualityAction(profileId, action, details, userId) {
    try {
      await DataQualityLog.create({
        profile_id: profileId,
        user_id: userId,
        action_type: action,
        action_details: details,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to log quality action:', error);
    }
  }
}

module.exports = new QualityService();


