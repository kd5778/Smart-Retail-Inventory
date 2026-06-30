const { body } = require('express-validator');

const create = [
  body('brand_name')
    .trim()
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand name must be between 1 and 100 characters'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

const update = [
  body('brand_name')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand name must be between 1 and 100 characters'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

module.exports = { create, update };
