const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Issue = sequelize.define('Issue', {
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
    column_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'columns',
        key: 'id'
      }
    },
    issue_type: {
      type: DataTypes.ENUM('duplicate', 'missing', 'invalid', 'outlier', 'inconsistent', 'obsolete'),
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'dismissed'),
      defaultValue: 'open'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    affected_records: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    record_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    impact_score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    suggested_action: {
      type: DataTypes.TEXT
    },
    ai_suggestion: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    detected_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    resolved_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'issues',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['table_id', 'issue_type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['severity']
      },
      {
        fields: ['detected_at']
      }
    ]
  });

  return Issue;
};