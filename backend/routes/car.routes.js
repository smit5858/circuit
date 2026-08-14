const express = require("express");
const router = express.Router();
const { getAllCars, getModelsByCarId } = require("../controllers/car.controller");

router.get("/", getAllCars);
router.get("/:carId/models", getModelsByCarId);

module.exports = router;