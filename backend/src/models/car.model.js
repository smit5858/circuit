const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Car",
    {
      name: { type: DataTypes.STRING(150), allowNull: false },
      model: { type: DataTypes.STRING(150), allowNull: false },
    },
    {
      tableName: "cars",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};