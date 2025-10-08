const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { Table, Column, DataRecord } = require('../database/models');
const profilingService = require('../services/profilingService');
const qualityService = require('../services/qualityService');
const logger = require('../utils/logger');

/**
 * Data Controller
 */

class DataController {
  /**
   * Upload and process file
   */
  async uploadFile(req, res) {
    try {
  if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please provide a CSV or Excel file'
        });
      }

      const { tableName, description } = req.body;
      const file = req.file;

      logger.info(`Processing uploaded file: ${file.filename}`);

      // Parse file based on extension
      const ext = path.extname(file.originalname).toLowerCase();
      let data = [];

      if (ext === '.csv') {
        data = await this.parseCSV(file.path);
      } else if (ext === '.xlsx' || ext === '.xls') {
        data = await this.parseExcel(file.path);
      } else {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Only CSV and Excel files are supported'
        });
      }

      if (!data || data.length === 0) {
        return res.status(400).json({
          error: 'Empty file',
          message: 'The uploaded file contains no data'
        });
      }

      // Create table record
      const table = await Table.create({
        name: tableName || file.filename.replace(/\.[^/.]+$/, ''),
        display_name: tableName || file.originalname,
        description: description || '',
        row_count: data.length,
        column_count: Object.keys(data[0]).length,
        data_source: 'upload',
        status: 'active',
        metadata: {
          originalFilename: file.originalname,
          uploadedAt: new Date(),
          fileSize: file.size
        }
      });

      // Create column records
      const columns = Object.keys(data[0]);
      const columnRecords = await Promise.all(
        columns.map((colName, index) => 
          Column.create({
            table_id: table.id,
            name: colName,
            display_name: colName,
            data_type: 'unknown', // Will be determined during profiling
            position: index,
            is_nullable: true
          })
        )
      );

      // Store data records (limit to prevent huge storage)
      const recordsToStore = data.slice(0, 10000); // Store max 10k records
      const dataRecords = recordsToStore.map(row => ({
        table_id: table.id,
        data: row,
        row_number: data.indexOf(row) + 1
      }));

      await DataRecord.bulkCreate(dataRecords);

      // Trigger profiling in background
      logger.info(`Starting profiling for table: ${table.id}`);
      
      profilingService.profileTable(table.id, null, data)
        .then(async (profileResult) => {
          if (profileResult.success) {
            logger.info(`Profiling completed for table: ${table.id}`);
            
            // Update column data types from profile
            const columnProfiles = profileResult.profile.column_profiles;
            for (const [colName, profile] of Object.entries(columnProfiles)) {
              const column = columnRecords.find(c => c.name === colName);
              if (column) {
                await column.update({ data_type: profile.dataType });
              }
            }

            // Run quality checks
            logger.info(`Starting quality checks for table: ${table.id}`);
            const qualityResult = await qualityService.runQualityChecks(table.id, data, columnProfiles);
            
            if (qualityResult.success && qualityResult.issues) {
              // Calculate comprehensive KPIs with detected issues
              const kpis = await qualityService.calculateKPIs(
                table.id, 
                columnProfiles, 
                qualityResult.issues,
                data
              );
              
              // Update table with comprehensive DQI scores
              await table.update({
                quality_score: kpis.overallScore,
                metadata: {
                  ...table.metadata,
                  dqi: {
                    accuracy: kpis.accuracy,
                    completeness: kpis.completeness,
                    consistency: kpis.consistency,
                    timeliness: kpis.timeliness,
                    validity: kpis.validity,
                    uniqueness: kpis.uniqueness,
                    integrity: kpis.integrity,
                    overallScore: kpis.overallScore,
                    dimensions: kpis.dimensions
                  },
                  issues: {
                    total: kpis.issueCount,
                    critical: kpis.criticalIssues,
                    high: kpis.highIssues,
                    medium: kpis.mediumIssues,
                    low: kpis.lowIssues
                  },
                  lastAnalyzed: new Date()
                }
              });
              
              logger.info(`Quality analysis completed for table ${table.id}: DQI Score = ${kpis.overallScore}%, ${kpis.issueCount} issues found`);
            }
          }
        })
        .catch(error => {
          logger.error(`Background processing error for table ${table.id}:`, error);
        });

      // Clean up uploaded file
      fs.unlinkSync(file.path);

  res.status(201).json({
        message: 'File uploaded and processing started',
        table: {
          id: table.id,
          name: table.name,
          displayName: table.display_name,
          rowCount: table.row_count,
          columnCount: table.column_count
        },
        columns: columnRecords.map(c => ({
          id: c.id,
          name: c.name,
          position: c.position
        })),
        processing: true
      });

    } catch (error) {
      logger.error('Upload file error:', error);
      
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        error: 'Upload failed',
        message: error.message
      });
    }
  }

  /**
   * Parse CSV file
   */
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Parse Excel file
   */
  async parseExcel(filePath) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      return data;
    } catch (error) {
      logger.error('Excel parse error:', error);
      throw new Error('Failed to parse Excel file');
    }
  }

  /**
   * Get all tables
   */
  async getTables(req, res) {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      const where = {};
      if (status) where.status = status;

      const tables = await Table.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        tables: tables.rows,
        total: tables.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      logger.error('Get tables error:', error);
      res.status(500).json({
        error: 'Failed to get tables',
        message: error.message
      });
    }
  }

  /**
   * Get single table
   */
  async getTable(req, res) {
    try {
      const { tableId } = req.params;

      const table = await Table.findByPk(tableId, {
        include: [{ model: Column }]
      });

      if (!table) {
        return res.status(404).json({
          error: 'Table not found'
        });
      }

      res.json({ table });
    } catch (error) {
      logger.error('Get table error:', error);
      res.status(500).json({
        error: 'Failed to get table',
        message: error.message
      });
    }
  }

  /**
   * Get table data with pagination
   */
  async getTableData(req, res) {
    try {
      const { tableId } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const table = await Table.findByPk(tableId);

      if (!table) {
        return res.status(404).json({
          error: 'Table not found'
        });
      }

      const records = await DataRecord.findAndCountAll({
        where: { table_id: tableId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['row_number', 'ASC']]
      });

      res.json({
        tableId,
        tableName: table.display_name,
        data: records.rows.map(r => r.data),
        total: records.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      logger.error('Get table data error:', error);
      res.status(500).json({
        error: 'Failed to get table data',
        message: error.message
      });
    }
  }

  /**
   * Delete table
   */
  async deleteTable(req, res) {
    try {
      const { tableId } = req.params;

      const table = await Table.findByPk(tableId);

      if (!table) {
        return res.status(404).json({
          error: 'Table not found'
        });
      }

      // Delete all related records (cascading should handle this, but explicit is better)
      await DataRecord.destroy({ where: { table_id: tableId } });
      await Column.destroy({ where: { table_id: tableId } });
      await table.destroy();

      logger.info(`Table ${tableId} deleted`);

      res.json({
        message: 'Table deleted successfully'
      });
    } catch (error) {
      logger.error('Delete table error:', error);
      res.status(500).json({
        error: 'Failed to delete table',
        message: error.message
      });
    }
  }

  /**
   * Export table data
   */
  async exportTableData(req, res) {
    try {
      const { tableId } = req.params;
      const { format = 'csv' } = req.query;

      const table = await Table.findByPk(tableId);

      if (!table) {
        return res.status(404).json({
          error: 'Table not found'
        });
      }

      const records = await DataRecord.findAll({
        where: { table_id: tableId },
        order: [['row_number', 'ASC']]
      });

      const data = records.map(r => r.data);

      if (format === 'csv') {
        const csvData = this.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${table.name}.csv"`);
        res.send(csvData);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${table.name}.json"`);
        res.json(data);
      } else {
        res.status(400).json({
          error: 'Invalid format',
          message: 'Supported formats: csv, json'
        });
      }
    } catch (error) {
      logger.error('Export table data error:', error);
      res.status(500).json({
        error: 'Failed to export data',
        message: error.message
      });
    }
  }

  /**
   * Helper: Convert data to CSV
   */
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

module.exports = new DataController();
