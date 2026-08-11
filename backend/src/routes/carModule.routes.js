const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/carModule.controller");
const upload = require("../middlewares/upload.middleware");

router.post("/", moduleController.create);
router.post("/resolve", moduleController.resolve);
router.get("/car/:carId", moduleController.listByCar);
router.get("/:id", moduleController.getOne);
router.put("/:id", moduleController.update);
router.delete("/:id", moduleController.remove);
router.post("/:id/photo", upload.single("circuit_board_photo"), moduleController.uploadPhoto);
router.get("/:id/photo", moduleController.getPhoto);

module.exports = router;