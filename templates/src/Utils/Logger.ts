import winston from 'winston'
import 'winston-daily-rotate-file'

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: process.env.NODE_ENV === 'production'
    ? [
      new winston.transports.DailyRotateFile({
        filename: 'logs/api-service-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d'
      })
    ]
    : [
      new winston.transports.Console()
    ]
})

export default logger
