const express = require("express");
const router = express.Router();
const { getAllCars, getModelsByCarId } = require("../controllers/");

router.get("/", getAllCars);
router.get("/:carId/models", getModelsByCarId);

module.exports = router;