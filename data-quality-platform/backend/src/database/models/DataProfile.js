const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DataProfile = sequelize.define('DataProfile', {
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    profile_type: {
      type: DataTypes.ENUM('full', 'column', 'sample'),
      defaultValue: 'full'
    },
    profile_data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    summary_stats: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    column_profiles: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    quality_metrics: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    execution_time: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('completed', 'failed', 'pending'),
      defaultValue: 'pending'
    },
    error_message: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'data_profiles',
    timestamps: true,
    underscored: true
  });

  return DataProfile;
};