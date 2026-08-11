const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CarModule",
    {
      car_id: { type: DataTypes.INTEGER, allowNull: false },
      module_type: { type: DataTypes.STRING(100), allowNull: false },
      side: { type: DataTypes.ENUM("side1", "side2"), allowNull: false },
      circuit_board_photo: { type: DataTypes.BLOB("long"), allowNull: true },
      circuit_board_photo_mimetype: { type: DataTypes.STRING(50), allowNull: true },
    },
    {
      tableName: "car_modules",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ unique: true, fields: ["car_id", "side", "module_type"] }],
    }
  );
}; 