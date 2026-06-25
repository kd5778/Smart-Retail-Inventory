const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// Global error handler — must be the last middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Log the error
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`);
    if (err.stack) {
      logger.error(err.stack);
    }
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`);
  }

  // -----------------------------------------
  // Handle known ApiError (operational errors)
  // -----------------------------------------
  if (err instanceof ApiError) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined
    });
  }

  // -----------------------------------------
  // Handle MySQL / mysql2 errors
  // -----------------------------------------
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        statusCode = 409;
        message = 'Duplicate entry. A record with this value already exists.';
        // Extract the duplicate field info from the error message
        const dupMatch = err.message.match(/Duplicate entry '(.+)' for key '(.+)'/);
        if (dupMatch) {
          message = `Duplicate entry '${dupMatch[1]}' for field '${dupMatch[2]}'.`;
        }
        break;

      case 'ER_LOCK_DEADLOCK':
        statusCode = 503;
        message = 'Database deadlock detected. Please retry the operation.';
        break;

      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        statusCode = 400;
        message = 'Referenced record does not exist. Please check the provided IDs.';
        break;

      case 'ER_ROW_IS_REFERENCED':
      case 'ER_ROW_IS_REFERENCED_2':
        statusCode = 409;
        message = 'Cannot delete this record because it is referenced by other records.';
        break;

      case 'ER_DATA_TOO_LONG':
        statusCode = 400;
        message = 'Data too long for one or more fields.';
        break;

      case 'ER_TRUNCATED_WRONG_VALUE':
        statusCode = 400;
        message = 'Invalid data format provided.';
        break;

      default:
        // For unrecognized DB errors, don't leak details in production
        if (process.env.NODE_ENV === 'production') {
          statusCode = 500;
          message = 'A database error occurred. Please try again later.';
        }
        break;
    }

    return res.status(statusCode).json({
      success: false,
      message
    });
  }

  // -----------------------------------------
  // Handle JWT errors
  // -----------------------------------------
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired. Please log in again.'
    });
  }

  // -----------------------------------------
  // Handle validation errors (express-validator)
  // -----------------------------------------
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: err.errors || []
    });
  }

  // -----------------------------------------
  // Handle SyntaxError (e.g., invalid JSON body)
  // -----------------------------------------
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.'
    });
  }

  // -----------------------------------------
  // Unknown errors - hide details in production
  // -----------------------------------------
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }

  // In development, return full error details
  return res.status(statusCode).json({
    success: false,
    message,
    error: err.message,
    stack: err.stack
  });
};

module.exports = errorHandler;
