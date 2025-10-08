const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DataRecord = sequelize.define('DataRecord', {
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
    data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    row_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    record_hash: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('active', 'deleted', 'archived'),
      defaultValue: 'active'
    },
    quality_flags: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'data_records',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['table_id', 'record_hash']
      }
    ]
  });

  return DataRecord;
};