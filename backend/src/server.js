require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
require('./config/db'); // initializes PostgreSQL connection

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});