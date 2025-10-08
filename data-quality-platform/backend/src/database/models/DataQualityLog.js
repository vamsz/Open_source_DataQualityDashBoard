const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DataQualityLog = sequelize.define('DataQualityLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    table_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tables',
        key: 'id'
      }
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'data_profiles',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    action_details: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'data_quality_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['table_id', 'log_type']
      },
      {
        fields: ['resolved']
      },
      {
        fields: ['severity']
      }
    ]
  });

  return DataQualityLog;
};