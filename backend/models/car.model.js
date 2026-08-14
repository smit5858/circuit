const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Car = sequelize.define(
  "Car",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    logo: {
      type: DataTypes.STRING, // store path/URL, or switch to BLOB if you want it inline like module photos
      allowNull: true,
    },
  },
  {
    tableName: "cars",
    timestamps: true,
  }
);

module.exports = Car;