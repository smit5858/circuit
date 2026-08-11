const express = require("express");
const router = express.Router();
const partController = require("../controllers/part.controller");

router.post("/", partController.create);
router.get("/module/:moduleId", partController.listByModule);
router.get("/:id", partController.getOne);
router.put("/:id", partController.update);
router.delete("/:id", partController.remove);

module.exports = router;