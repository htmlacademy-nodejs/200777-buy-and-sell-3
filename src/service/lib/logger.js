'use strict';

const pino = require(`pino`);
const {ENV} = require(`../../constants`);

const LOG_FILE = `./logs/api.log`;

// Првоеряем, в каком режиме находится приложение:
// Если переменная NODE_ENV === разработке,
// то: isDevMode === true, т.е. в разработке,
// иначе: isDevMode === false => в продакшене
const isDevMode = process.env.NODE_ENV === ENV.DEVELOPMENT;

// Следовательно, если isDevMode === true,
// уровень логов будет "info", в продакшене же - error
const defaultLogLevel = isDevMode ? `info` : `error`;

const logger = pino({
  name: `base-logger`,
  level: process.env.LOG_LEVEL || defaultLogLevel,
  prettyPrint: isDevMode
}, isDevMode ? process.stdout : pino.destination(LOG_FILE));

module.exports = {
  logger,
  getLogger(options = {}) {
    return logger.child(options);
  }
};
