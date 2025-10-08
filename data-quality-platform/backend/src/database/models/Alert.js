const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define('Alert', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    table_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tables',
        key: 'id'
      }
    },
    alert_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    triggered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    details: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('unread', 'read', 'dismissed'),
      defaultValue: 'unread'
    },
    acknowledged_at: {
      type: DataTypes.DATE
    },
    dismissed_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'alerts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'status']
      },
      {
        fields: ['alert_type']
      },
      {
        fields: ['severity']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Alert;
};