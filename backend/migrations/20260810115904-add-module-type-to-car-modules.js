"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("car_modules", "module_type", {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: "Airbag Control Module",
    });
    await queryInterface.removeConstraint("car_modules", "unique_car_side");
    await queryInterface.addConstraint("car_modules", {
      fields: ["car_id", "module_type", "side"],
      type: "unique",
      name: "unique_car_module_side",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("car_modules", "module_type");
  },
};
