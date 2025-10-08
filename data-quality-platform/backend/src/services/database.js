const { sequelize } = require('../database/models');
const logger = require('../utils/logger');

let isConnected = false;

const initializeDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // Sync database models
    await sequelize.sync({ force: false }); // Set to true in development to recreate tables
    logger.info('Database models synchronized successfully.');
    
    isConnected = true;
    
    // Log database information
    logger.info('Using SQLite database (file-based, no installation required!)');
    
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    logger.warn('⚠️  Server will start without database. Some features may not work.');
    isConnected = false;
    // Don't exit - allow server to start
  }
};

const checkDatabaseConnection = async () => {
  if (!isConnected) {
    try {
      await sequelize.authenticate();
      isConnected = true;
      return true;
    } catch (error) {
      logger.error('Database connection check failed:', error);
      return false;
    }
  }
  return true;
};

const closeDatabaseConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed.');
    isConnected = false;
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

const getDatabaseStats = async () => {
  try {
    const [tables] = await sequelize.query(`
      SELECT 
        schemaname,
        tablename,
        attrelid::regclass AS table_name,
        n_tup_ins AS inserts,
        n_tup_upd AS updates,
        n_tup_del AS deletes,
        n_live_tup AS live_tuples,
        n_dead_tup AS dead_tuples,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      ORDER BY schemaname, tablename;
    `);
    
    const [databaseSize] = await sequelize.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `);
    
    return {
      tables,
      databaseSize: databaseSize[0].size,
      connected: isConnected
    };
  } catch (error) {
    logger.error('Error getting database stats:', error);
    return { error: error.message };
  }
};

const executeQuery = async (query, params = []) => {
  try {
    if (!await checkDatabaseConnection()) {
      throw new Error('Database not connected');
    }
    
    const [results] = await sequelize.query(query, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });
    
    return results;
  } catch (error) {
    logger.error('Query execution error:', error);
    throw error;
  }
};

const executeTransaction = async (callback) => {
  try {
    if (!await checkDatabaseConnection()) {
      throw new Error('Database not connected');
    }
    
    const transaction = await sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Transaction error:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  checkDatabaseConnection,
  closeDatabaseConnection,
  getDatabaseStats,
  executeQuery,
  executeTransaction,
  sequelize
};