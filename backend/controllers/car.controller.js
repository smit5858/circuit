const { Car, CarModel } = require("../models");

// GET /api/cars -> all cars
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.findAll();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/cars/:carId/models -> models for a specific car
exports.getModelsByCarId = async (req, res) => {
  try {
    const { carId } = req.params;

    const models = await CarModel.findAll({
      where: { carId },
      attributes: ["id", "name"], // only return name (and id for selection)
    });

    res.json(models);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};