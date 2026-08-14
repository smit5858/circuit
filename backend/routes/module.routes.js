const express = require("express");
const router = express.Router();
const {
  getModuleImage,
  getModuleParts,
  getApprovedModuleParts,
  addModulePart,
  updateModulePart,
  reviewModulePart,
  getPendingParts,
} = require("../controllers/module.controller");

router.get("/image", getModuleImage);
router.get("/parts", getApprovedModuleParts);
router.post("/parts", getModuleParts);
router.post("/parts/add", addModulePart);
router.patch("/parts/:id", updateModulePart);
router.patch("/parts/:id/review", reviewModulePart);
router.get("/parts/pending", getPendingParts);

module.exports = router;
