const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Car = require("./car.model");

const CarModel = sequelize.define(
  "CarModel",
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
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Car,
        key: "id",
      },
    },
  },
  {
    tableName: "car_models",
    timestamps: true,
  }
);

// Associations
Car.hasMany(CarModel, { foreignKey: "carId", onDelete: "CASCADE" });
CarModel.belongsTo(Car, { foreignKey: "carId" });

module.exports = CarModel;