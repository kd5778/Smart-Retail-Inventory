const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

router.use(authenticate);

// GET all users (admin only)
router.get(
  '/',
  authorize('admin:users'),
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
     GROUP_CONCAT(r.role_name) AS roles
     FROM users u
     LEFT JOIN user_roles ur ON u.user_id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.role_id
     GROUP BY u.user_id ORDER BY u.created_at DESC`
    );
    ApiResponse.success(res, 200, 'Users retrieved', rows);
  })
);

// GET all roles
router.get(
  '/roles',
  authorize('admin:users'),
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM roles ORDER BY role_id');
    ApiResponse.success(res, 200, 'Roles retrieved', rows);
  })
);

// POST create new user
router.post(
  '/',
  authorize('admin:users'),
  asyncHandler(async (req, res) => {
    const { username, email, password, first_name, last_name, phone, role_id } = req.body;
    if (!username || !email || !password) throw ApiError.badRequest('Username, email and password are required');
    if (password.length < 6) throw ApiError.badRequest('Password must be at least 6 characters');

    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) throw ApiError.conflict('A user with this email or username already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.execute(
        'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
        [username, email, passwordHash, first_name || '', last_name || '', phone || null]
      );
      const newUserId = result.insertId;
      await conn.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [newUserId, role_id || 3]);
      await conn.commit();
      ApiResponse.created(res, 'User created successfully', { user_id: newUserId, username, email });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  })
);

// PUT update user
router.put(
  '/:id',
  authorize('admin:users'),
  asyncHandler(async (req, res) => {
    const { first_name, last_name, phone, is_active, role_id, password } = req.body;
    const userId = req.params.id;

    const [existing] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
    if (!existing.length) throw ApiError.notFound('User not found');

    const fields = [];
    const params = [];
    if (first_name !== undefined) {
      fields.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name !== undefined) {
      fields.push('last_name = ?');
      params.push(last_name);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      params.push(phone);
    }
    if (is_active !== undefined) {
      fields.push('is_active = ?');
      params.push(is_active);
    }
    if (password && password.length >= 6) {
      fields.push('password_hash = ?');
      params.push(await bcrypt.hash(password, 12));
    }

    if (fields.length > 0) {
      params.push(userId);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, params);
    }

    if (role_id) {
      await pool.query('DELETE FROM user_roles WHERE user_id = ?', [userId]);
      await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, role_id]);
    }

    ApiResponse.success(res, 200, 'User updated successfully');
  })
);

// DELETE user
router.delete(
  '/:id',
  authorize('admin:users'),
  asyncHandler(async (req, res) => {
    if (parseInt(req.params.id) === req.user.userId) throw ApiError.badRequest('You cannot delete your own account');
    await pool.query('UPDATE users SET is_active = FALSE WHERE user_id = ?', [req.params.id]);
    ApiResponse.success(res, 200, 'User deactivated');
  })
);

module.exports = router;
