const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "BcmPart",
    {
      module_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: false },
      value: { type: DataTypes.STRING(100) },
      voltage: { type: DataTypes.STRING(50) },
      description: { type: DataTypes.TEXT, defaultValue: "" },
      x: { type: DataTypes.DECIMAL(10, 6), allowNull: false },
      y: { type: DataTypes.DECIMAL(10, 6), allowNull: false },
      width: { type: DataTypes.DECIMAL(10, 6), allowNull: false },
      height: { type: DataTypes.DECIMAL(10, 6), allowNull: false },
      published: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "bcm_parts",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["module_id"] }],
    }
  );
};