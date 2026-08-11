const { Car, CarModule } = require("../models");
const logger = require("../config/logger");

async function create(req, res) {
  try {
    res.status(201).json(await CarModule.create(req.body));
  } catch (err) {
    res.status(500).json({ message: "Failed to create module" });
  }
}

async function listByCar(req, res) {
  try {
    res.json(await CarModule.findAll({ where: { car_id: req.params.carId } }));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch modules" });
  }
}

async function getOne(req, res) {
  try {
    const mod = await CarModule.findByPk(req.params.id,{
      attributes: { exclude: ["circuit_board_photo"] },
    }
    );
    if (!mod) return res.status(404).json({ message: "Module not found" });
    res.json(mod);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch module" });
  }
}

async function update(req, res) {
  try {
    const mod = await CarModule.findByPk(req.params.id);
    if (!mod) return res.status(404).json({ message: "Module not found" });
    await mod.update(req.body);
    res.json(mod);
  } catch (err) {
    res.status(500).json({ message: "Failed to update module" });
  }
}

async function remove(req, res) {
  try {
    const mod = await CarModule.findByPk(req.params.id);
    if (!mod) return res.status(404).json({ message: "Module not found" });
    await mod.destroy();
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete module" });
  }
}

async function resolve(req, res) {
  try {
    const { company, model, moduler, side } = req.body;
    if (!company || !model || !moduler || !side) {
      return res
        .status(400)
        .json({ message: "company, model, moduler, side are required" });
    }

    const sideValue = side === "Side 1" ? "side1" : "side2";

    const car = await Car.findByPk(model);
    if (!car) {
      return res.status(404).json({ message: "Selected car model not found" });
    }

    const [mod] = await CarModule.findOrCreate({
      where: { car_id: car.id, module_type: moduler, side: sideValue },
      attributes: { exclude: ["circuit_board_photo"] },
    });

    res.json({ car_id: car.id, module_id: mod.id, module: mod });
  } catch (err) {
    logger.error("Failed to resolve module", {
      message: err.message,
      stack: err.stack,
    });
    res
      .status(500)
      .json({ message: "Failed to resolve module", error: err.message });
  }
}

async function uploadPhoto(req, res) {
  try {
    const mod = await CarModule.findByPk(req.params.id);
    if (!mod) return res.status(404).json({ message: "Module not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    await mod.update({
      circuit_board_photo: req.file.buffer,
      circuit_board_photo_mimetype: req.file.mimetype,
    });
    res.json({ message: "Photo uploaded", module_id: mod.id });
  } catch (err) {
    logger.error("Failed to upload photo", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: "Failed to upload photo" });
  }
}

async function getPhoto(req, res) {
  try {
    const mod = await CarModule.findByPk(req.params.id);
    if (!mod || !mod.circuit_board_photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    res.set("Content-Type", mod.circuit_board_photo_mimetype || "image/jpeg");
    res.send(mod.circuit_board_photo);
  } catch (err) {
    logger.error("Failed to fetch photo", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: "Failed to fetch photo" });
  }
}

module.exports = { create, listByCar, getOne, update, remove, resolve, uploadPhoto, getPhoto };
