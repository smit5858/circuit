'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("car_modules", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      car_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "cars", key: "id" },
        onDelete: "CASCADE",
      },
      side: { type: Sequelize.ENUM("side1", "side2"), allowNull: false },
      circuit_board_photo: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex("car_modules", ["car_id"]);
    await queryInterface.addConstraint("car_modules", {
      fields: ["car_id", "side"],
      type: "unique",
      name: "unique_car_side",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("car_modules");
  }
};
