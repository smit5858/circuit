const { sequelize, Car, CarModel } = require("./models");

const seed = async () => {
  try {
    await sequelize.sync();

    const honda = await Car.create({ name: "Honda" });
    const maruti = await Car.create({ name: "Maruti Suzuki" });
    const hyundai = await Car.create({ name: "Hyundai" });
    const tata = await Car.create({ name: "Tata" });

    await CarModel.bulkCreate([
      { name: "City", carId: honda.id },
      { name: "Amaze", carId: honda.id },
      { name: "Civic", carId: honda.id },
      { name: "Swift", carId: maruti.id },
      { name: "Baleno", carId: maruti.id },
      { name: "Creta", carId: hyundai.id },
      { name: "Venue", carId: hyundai.id },
      { name: "Nexon", carId: tata.id },
      { name: "Harrier", carId: tata.id },
    ]);

    console.log("✔ Seed data inserted");
    process.exit(0);
  } catch (err) {
    console.error("✘ Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();