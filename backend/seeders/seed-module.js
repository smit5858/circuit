const fs = require("fs");
const path = require("path");
const { sequelize, CarModule, CarModulePart } = require("../models");

const seedModule = async () => {
  try {
    await sequelize.sync();

    const imgPath = path.join(__dirname, "assets", "sample-board.png");
    const imgBuffer = fs.readFileSync(imgPath);

    // carModelId: 1 => City (Honda), adjust to match your actual car_models table
    const carModule = await CarModule.create({
      name: "Engine ECU",
      carModelId: 1,
      side1Image: imgBuffer,
      side1ImageMime: "image/png",
    });

    await CarModulePart.bulkCreate([
      {
        carModuleId: carModule.id,
        side: "side1",
        partName: "Infineon SAK-XC2361E Microcontroller",
        x: 18,
        y: 18,
        width: 32,
        height: 38,
        description: "Main automotive microcontroller handling ECU logic",
      },
    ]);

    console.log("✔ Module + parts seeded");
    process.exit(0);
  } catch (err) {
    console.error("✘ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedModule();