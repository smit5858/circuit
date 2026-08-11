const { Sequelize } = require("sequelize");
const config = require("../config/database")[process.env.NODE_ENV || "development"];
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Car = require("./car.model")(sequelize);
db.CarModule = require("./carModule.model")(sequelize);
db.BcmPart = require("./part.model")(sequelize);

db.Car.hasMany(db.CarModule, { foreignKey: "car_id", onDelete: "CASCADE" });
db.CarModule.belongsTo(db.Car, { foreignKey: "car_id" });

db.CarModule.hasMany(db.BcmPart, { foreignKey: "module_id", onDelete: "CASCADE" });
db.BcmPart.belongsTo(db.CarModule, { foreignKey: "module_id" });

module.exports = db;