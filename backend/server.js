const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const chalk = require("chalk");
const logger = require("./config/logger");
require("dotenv").config();

const sequelize = require("./config/db");
const { Car, CarModel } = require("./models");
const carRoutes = require("./routes/car.routes");
const moduleRoutes = require("./routes/module.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.get("/", (req, res) => res.send("API running"));
app.use("/api/cars", carRoutes);
app.use("/api/modules", moduleRoutes);

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log(chalk.green("✔ DB connected"));
    logger.info("DB connected");
    return sequelize.sync();
  })
  .then(() => {
    logger.info("Models synced");
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(chalk.cyan(`🚀 Server running on port ${PORT}`));
    });
  })
  .catch((err) => {
    logger.error(`DB connection failed: ${err && err.stack ? err.stack : err}`);
    console.log(chalk.red("✘ DB connection failed:"), err && err.stack ? err.stack : err);
  });
