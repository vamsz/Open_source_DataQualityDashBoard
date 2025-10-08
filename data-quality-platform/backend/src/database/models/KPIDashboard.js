const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const KPIDashboard = sequelize.define('KPIDashboard', {
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
    accuracy: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    completeness: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    consistency: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    uniqueness: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    validity: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    timeliness: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    integrity: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    overall_score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    total_issues: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    critical_issues: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    open_issues: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    resolved_issues: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'kpidadshboard',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['table_id', 'kpi_type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['last_updated']
      }
    ]
  });

  return KPIDashboard;
};