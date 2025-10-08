const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Table = sequelize.define('Table', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    schema: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    row_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    column_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    data_source: {
      type: DataTypes.ENUM('upload', 'database', 'api', 'synthetic'),
      defaultValue: 'upload'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      defaultValue: 'active'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    last_profiled: {
      type: DataTypes.DATE
    },
    quality_score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    }
  }, {
    tableName: 'tables',
    timestamps: true,
    underscored: true
  });

  return Table;
};