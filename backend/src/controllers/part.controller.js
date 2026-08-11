const { BcmPart } = require("../models");

async function create(req, res) {
  try {
    res.status(201).json(await BcmPart.create(req.body));
  } catch (err) {
    res.status(500).json({ message: "Failed to create part" });
  }
}

async function listByModule(req, res) {
  try {
    const parts = await BcmPart.findAll({
      where: { module_id: req.params.moduleId },
      order: [["id", "ASC"]],
    });
    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch parts" });
  }
}

async function getOne(req, res) {
  try {
    const part = await BcmPart.findByPk(req.params.id);
    if (!part) return res.status(404).json({ message: "Part not found" });
    res.json(part);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch part" });
  }
}

async function update(req, res) {
  try {
    const part = await BcmPart.findByPk(req.params.id);
    if (!part) return res.status(404).json({ message: "Part not found" });
    await part.update(req.body);
    res.json(part);
  } catch (err) {
    res.status(500).json({ message: "Failed to update part" });
  }
}

async function remove(req, res) {
  try {
    const part = await BcmPart.findByPk(req.params.id);
    if (!part) return res.status(404).json({ message: "Part not found" });
    await part.destroy();
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete part" });
  }
}

module.exports = { create, listByModule, getOne, update, remove };