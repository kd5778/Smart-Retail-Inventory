// Helpers for sending JSON responses
class ApiResponse {
  /**
   * Send a success response.
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP status code (default 200)
   * @param {string} message - Success message
   * @param {*} data - Response data
   * @param {object} pagination - Pagination metadata (optional)
   * @returns {object} Express response
   */
  static success(res, statusCode = 200, message = 'Success', data = null, pagination = null) {
    const response = {
      success: true,
      message,
      data
    };

    if (pagination) {
      response.pagination = {
        page: pagination.page || pagination.currentPage || 1,
        totalPages: pagination.totalPages || 1,
        total: pagination.total || pagination.totalItems || 0,
        limit: pagination.limit || pagination.itemsPerPage || 20,
        hasNextPage: (pagination.page || 1) < (pagination.totalPages || 1),
        hasPrevPage: (pagination.page || 1) > 1
      };
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a 201 Created response.
   * @param {object} res - Express response object
   * @param {string} message - Success message
   * @param {*} data - Created resource data
   * @returns {object} Express response
   */
  static created(res, message = 'Resource created successfully', data = null) {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Send a 204 No Content response.
   * @param {object} res - Express response object
   * @returns {object} Express response
   */
  static noContent(res) {
    return res.status(200).json({ success: true, message: 'Deleted successfully', data: null });
  }
}

module.exports = ApiResponse;
