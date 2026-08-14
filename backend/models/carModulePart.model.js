const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const CarModule = require("./CarModule.model");

const CarModulePart = sequelize.define(
  "CarModulePart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    carModuleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: CarModule, key: "id" },
    },
    side: {
      type: DataTypes.ENUM("side1", "side2"),
      allowNull: false,
    },
    partName: { type: DataTypes.STRING, allowNull: false },
    partNumber: { type: DataTypes.STRING, allowNull: true },
    partValue: { type: DataTypes.STRING, allowNull: true },
    x: { type: DataTypes.FLOAT, allowNull: false },
    y: { type: DataTypes.FLOAT, allowNull: false },
    width: { type: DataTypes.FLOAT, allowNull: false },
    height: { type: DataTypes.FLOAT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM("pending", "verified", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    addedBy: {
      type: DataTypes.STRING, 
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.STRING, 
      allowNull: true,
    },
  },
  {
    tableName: "car_module_parts",
    timestamps: true,
  },
);

CarModule.hasMany(CarModulePart, {
  foreignKey: "carModuleId",
  onDelete: "CASCADE",
});
CarModulePart.belongsTo(CarModule, { foreignKey: "carModuleId" });

module.exports = CarModulePart;
