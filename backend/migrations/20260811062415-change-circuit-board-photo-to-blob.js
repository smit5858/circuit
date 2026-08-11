"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TABLE car_modules DROP COLUMN circuit_board_photo;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE car_modules ADD COLUMN circuit_board_photo bytea;`,
    );
    await queryInterface.addColumn(
      "car_modules",
      "circuit_board_photo_mimetype",
      {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TABLE car_modules DROP COLUMN circuit_board_photo;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE car_modules ADD COLUMN circuit_board_photo varchar(100);`,
    );
  },
};
