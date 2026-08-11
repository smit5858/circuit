'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert("cars", [
      { name: "Honda", model: "City", created_at: new Date(), updated_at: new Date() },
      { name: "Honda", model: "Amaze", created_at: new Date(), updated_at: new Date() },
      { name: "Honda", model: "Civic", created_at: new Date(), updated_at: new Date() },
      { name: "Toyota", model: "Innova", created_at: new Date(), updated_at: new Date() },
      { name: "Toyota", model: "Fortuner", created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("cars", null, {});
  }
};
