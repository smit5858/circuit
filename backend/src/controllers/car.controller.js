const { Car, CarModule } = require("../models");

async function create(req, res) {
  try {
    res.status(201).json(await Car.create(req.body));
  } catch (err) {
    res.status(500).json({ message: "Failed to create car" });
  }
}

async function list(req, res) {
  try {
    res.json(await Car.findAll());
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cars" });
  }
}

async function getOne(req, res) {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch car" });
  }
}

async function update(req, res) {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    await car.update(req.body);
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Failed to update car" });
  }
}

async function remove(req, res) {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    await car.destroy();
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete car" });
  }
}

async function getModelsByCompany(req, res) {
  try {
    const { company } = req.query;
    if (!company) return res.status(400).json({ message: "company is required" });

    const cars = await Car.findAll({ where: { name: company } });
    const result = cars.map((c) => ({ Model_ID: c.id, Model_Name: c.model }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch models" });
  }
}

async function getCompanies(req, res) {
  try {
    const cars = await Car.findAll({
      attributes: ["name"],
      group: ["name"],
      order: [["name", "ASC"]],
    });

    const companies = cars.map((c) => c.name);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch car companies" });
  }
}

module.exports = { create, list, getOne, update, remove, getModelsByCompany, getCompanies };