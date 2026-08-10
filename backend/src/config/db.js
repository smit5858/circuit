const { Pool } = require('pg');
const logger = require('./logger');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.connect()
  .then((client) => {
    logger.info('PostgreSQL connected successfully');
    client.release();
  })
  .catch((err) => {
    logger.error(`PostgreSQL connection error: ${err.message}`);
  });

module.exports = pool;