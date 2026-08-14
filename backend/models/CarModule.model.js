const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const CarModel = require("./carModel.model");

const CarModule = sequelize.define(
  "CarModule",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    carModelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: CarModel, key: "id" },
    },
    side1Image: { type: DataTypes.BLOB("long"), allowNull: true },
    side1ImageMime: { type: DataTypes.STRING, allowNull: true },
    side2Image: { type: DataTypes.BLOB("long"), allowNull: true },
    side2ImageMime: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "car_modules",
    timestamps: true,
  }
);

CarModel.hasMany(CarModule, { foreignKey: "carModelId", onDelete: "CASCADE" });
CarModule.belongsTo(CarModel, { foreignKey: "carModelId" });

module.exports = CarModule;