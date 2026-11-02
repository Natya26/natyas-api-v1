const winston = require('winston');

// Winston log customizations
const custom = {
  levels: {
    error: 0,
    warn: 1,
    help: 2,
    data: 3,
    info: 4,
    debug: 5,
    prompt: 6,
    verbose: 7,
    input: 8,
    trace: 9,
  },
  colors: {
    trace: 'red',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    debug: 'blue',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    error: 'red',
  },
  consoleOpts: {
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true,
  },
  fileOpts: {
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true,
  },
};

// Node system log
const syslog = new winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  levels: custom.levels,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});
winston.addColors(custom.colors);


module.exports = syslog;
