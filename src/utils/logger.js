// Console logger with timestamps

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, ...args) => {
  const message = args
    .map((arg) => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');

  return `[${getTimestamp()}] [${level}] ${message}`;
};

const logger = {

  info(...args) {
    console.log(formatMessage('INFO', ...args));
  },


  warn(...args) {
    console.warn(formatMessage('WARN', ...args));
  },


  error(...args) {
    console.error(formatMessage('ERROR', ...args));
  },

  // only logs in development
  debug(...args) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('DEBUG', ...args));
    }
  }
};

module.exports = logger;
