// Custom error class with HTTP status codes
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Additional error details
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    this.name = 'ApiError';

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 400 Bad Request
   * @param {string} message
   * @param {Array} errors
   * @returns {ApiError}
   */
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * 401 Unauthorized
   * @param {string} message
   * @returns {ApiError}
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * 403 Forbidden
   * @param {string} message
   * @returns {ApiError}
   */
  static forbidden(message = 'Forbidden - You do not have permission to perform this action') {
    return new ApiError(403, message);
  }

  /**
   * 404 Not Found
   * @param {string} message
   * @returns {ApiError}
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /**
   * 409 Conflict
   * @param {string} message
   * @returns {ApiError}
   */
  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  /**
   * 500 Internal Server Error
   * @param {string} message
   * @returns {ApiError}
   */
  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
