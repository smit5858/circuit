'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("bcm_parts", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "car_modules", key: "id" },
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      value: { type: Sequelize.STRING(100) },
      voltage: { type: Sequelize.STRING(50) },
      description: { type: Sequelize.TEXT, defaultValue: "" },
      x: { type: Sequelize.DECIMAL(10, 6), allowNull: false },
      y: { type: Sequelize.DECIMAL(10, 6), allowNull: false },
      width: { type: Sequelize.DECIMAL(10, 6), allowNull: false },
      height: { type: Sequelize.DECIMAL(10, 6), allowNull: false },
      published: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex("bcm_parts", ["module_id"]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("bcm_parts");
  }
};
