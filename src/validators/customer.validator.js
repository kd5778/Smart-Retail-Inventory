const { body } = require('express-validator');

const create = [
  body('customer_name').trim().notEmpty().withMessage('Customer name is required').isLength({ min: 2, max: 200 }),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim(),
  body('customer_type')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['retail', 'wholesale'])
    .withMessage('Type must be retail or wholesale'),
  body('credit_limit')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Credit limit must be 0 or greater')
];

const update = [
  body('customer_name').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 2, max: 200 }),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email')
    .normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim(),
  body('customer_type')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['retail', 'wholesale'])
    .withMessage('Type must be retail or wholesale'),
  body('credit_limit')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Credit limit must be 0 or greater')
];

module.exports = { create, update };
