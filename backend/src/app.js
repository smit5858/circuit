const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./config/logger');

const carRoutes = require("./routes/car.routes");
const carModuleRoutes = require("./routes/carModule.routes");
const partRoutes = require("./routes/part.routes");

const app = express();

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors());
app.use(express.json());

// Pipe morgan HTTP logs into winston
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Example: app.use('/api/users', require('./routes/userRoutes'));
app.use("/api/cars", carRoutes);
app.use("/api/car-modules", carModuleRoutes);
app.use("/api/parts", partRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;