const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Column = sequelize.define('Column', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data_type: {
      type: DataTypes.STRING,
      defaultValue: 'unknown'
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_nullable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_primary_key: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_unique: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    default_value: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.TEXT
    },
    validation_rules: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'columns',
    timestamps: true,
    underscored: true
  });

  return Column;
};