const { body } = require('express-validator');


const create = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Warehouse name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Warehouse name must be between 2 and 150 characters'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Warehouse location is required')
    .isLength({ min: 2, max: 300 })
    .withMessage('Location must be between 2 and 300 characters'),

  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer (minimum 1)'),

  body('manager_name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Manager name must not exceed 150 characters'),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Phone number must be between 5 and 20 characters'),

  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];


const update = [
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Warehouse name must be between 2 and 150 characters'),

  body('location')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 300 })
    .withMessage('Location must be between 2 and 300 characters'),

  body('capacity')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer (minimum 1)'),

  body('manager_name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Manager name must not exceed 150 characters'),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Phone number must be between 5 and 20 characters'),

  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

module.exports = {
  create,
  update
};
