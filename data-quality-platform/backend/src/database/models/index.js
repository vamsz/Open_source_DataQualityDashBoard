const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration - Using SQLite (file-based, no installation needed!)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Import models
const User = require('./User')(sequelize);
const Table = require('./Table')(sequelize);
const Column = require('./Column')(sequelize);
const DataRecord = require('./DataRecord')(sequelize);
const DataProfile = require('./DataProfile')(sequelize);
const DataQualityLog = require('./DataQualityLog')(sequelize);
const Issue = require('./Issue')(sequelize);
const RemediationAction = require('./RemediationAction')(sequelize);
const KPIDashboard = require('./KPIDashboard')(sequelize);
const Alert = require('./Alert')(sequelize);

// Define relationships
User.hasMany(DataProfile, { foreignKey: 'user_id' });
DataProfile.belongsTo(User, { foreignKey: 'user_id' });

Table.hasMany(Column, { foreignKey: 'table_id' });
Column.belongsTo(Table, { foreignKey: 'table_id' });

Table.hasMany(DataRecord, { foreignKey: 'table_id' });
DataRecord.belongsTo(Table, { foreignKey: 'table_id' });

Table.hasMany(DataProfile, { foreignKey: 'table_id' });
DataProfile.belongsTo(Table, { foreignKey: 'table_id' });

Table.hasMany(Issue, { foreignKey: 'table_id' });
Issue.belongsTo(Table, { foreignKey: 'table_id' });

Column.hasMany(Issue, { foreignKey: 'column_id' });
Issue.belongsTo(Column, { foreignKey: 'column_id' });

DataProfile.hasMany(DataQualityLog, { foreignKey: 'profile_id' });
DataQualityLog.belongsTo(DataProfile, { foreignKey: 'profile_id' });

Issue.hasMany(RemediationAction, { foreignKey: 'issue_id' });
RemediationAction.belongsTo(Issue, { foreignKey: 'issue_id' });

User.hasMany(RemediationAction, { foreignKey: 'user_id' });
RemediationAction.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Alert, { foreignKey: 'user_id' });
Alert.belongsTo(User, { foreignKey: 'user_id' });

Table.hasMany(KPIDashboard, { foreignKey: 'table_id' });
KPIDashboard.belongsTo(Table, { foreignKey: 'table_id' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Table,
  Column,
  DataRecord,
  DataProfile,
  DataQualityLog,
  Issue,
  RemediationAction,
  KPIDashboard,
  Alert
};