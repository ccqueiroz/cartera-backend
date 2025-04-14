import { createLogger, format, transports, addColors, config } from 'winston';

addColors({
  error: 'bold red',
  info: 'cyan',
  debug: 'gray',
});

const consoleWinston = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message }) => {
    return `[[${level}] - ${timestamp}]: ${message}`;
  }),
);

const transportsWinston = [
  new transports.Console({
    format: consoleWinston,
  }),
  new transports.File({
    filename: 'logs/erros.log',
    level: 'error',
    format: format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => {
        return `[[${level}] - ${timestamp}]: ${message}`;
      }),
    ),
  }),
];

const clientWinston = createLogger({
  level: 'info',
  levels: config.npm.levels,
  transports: transportsWinston,
});

export { clientWinston };
