const { body } = require('express-validator');

const create = [
  body('category_name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parent_category_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Parent category ID must be a positive integer')
];

const update = [
  body('category_name')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parent_category_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Parent category ID must be a positive integer')
];

module.exports = { create, update };
