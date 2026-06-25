const pool = require('../config/database');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// Check if the user has all required permissions
// Usage: router.get('/products', authenticate, authorize('products.read'), ctrl.getAll)
const authorize = (...requiredPermissions) => {
  return asyncHandler(async (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user || !req.user.userId) {
      throw ApiError.unauthorized('Authentication required before authorization check.');
    }

    // If no permissions required, allow access
    if (requiredPermissions.length === 0) {
      return next();
    }

    // Check if permissions are already cached on this request
    if (!req.userPermissions) {
      // Query user permissions through the role chain:
      // users → user_roles → roles → role_permissions → permissions
      const [rows] = await pool.execute(
        `SELECT DISTINCT p.permission_name
         FROM permissions p
         INNER JOIN role_permissions rp ON rp.permission_id = p.permission_id
         INNER JOIN roles r ON r.role_id = rp.role_id
         INNER JOIN user_roles ur ON ur.role_id = r.role_id
         WHERE ur.user_id = ?`,
        [req.user.userId]
      );

      // Cache permissions as a Set for O(1) lookups
      req.userPermissions = new Set(rows.map((row) => row.permission_name));
    }

    // Check if user has ALL required permissions
    const missingPermissions = requiredPermissions.filter((permission) => !req.userPermissions.has(permission));

    if (missingPermissions.length > 0) {
      logger.warn(
        `Authorization failed for user ${req.user.userId} (${req.user.email}). ` +
          `Missing permissions: ${missingPermissions.join(', ')}`
      );
      throw ApiError.forbidden(`Insufficient permissions. Missing: ${missingPermissions.join(', ')}`);
    }

    next();
  });
};

module.exports = { authorize };
