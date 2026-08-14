const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../logs/app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '30d',
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [fileRotateTransport, errorFileTransport],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)
    ),
  }));
}

module.exports = logger;