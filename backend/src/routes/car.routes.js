const express = require("express");
const router = express.Router();
const carController = require("../controllers/car.controller");

router.post("/", carController.create);
router.get("/", carController.list);
router.get("/companies", carController.getCompanies);
router.get("/models", carController.getModelsByCompany);
router.get("/:id", carController.getOne);
router.put("/:id", carController.update);
router.delete("/:id", carController.remove);

module.exports = router;