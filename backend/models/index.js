const sequelize = require("../config/db");
const Car = require("./Car.model");
const CarModel = require("./carModel.model");
const CarModule = require("./CarModule.model");
const CarModulePart = require("./carModulePart.model");

module.exports = {
  sequelize,
  Car,
  CarModel,
  CarModule,
  CarModulePart
};