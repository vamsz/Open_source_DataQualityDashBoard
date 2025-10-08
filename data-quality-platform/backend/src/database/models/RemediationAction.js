const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RemediationAction = sequelize.define('RemediationAction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    issue_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'issues',
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
    action_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    action_details: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    result: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    affected_records: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    record_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'rolled_back'),
      defaultValue: 'pending'
    },
    execution_time: {
      type: DataTypes.INTEGER
    },
    success_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    before_metrics: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    after_metrics: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    rollback_data: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    rollback_at: {
      type: DataTypes.DATE
    },
    rollback_details: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    completed_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'remediation_actions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['issue_id', 'status']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['action_type']
      }
    ]
  });

  return RemediationAction;
};