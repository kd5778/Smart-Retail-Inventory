const { body } = require('express-validator');

// category_id and brand_id are optional — products can exist without them
const create = [
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ max: 50 })
    .withMessage('SKU must not exceed 50 characters'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),

  body('category_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),

  body('brand_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Brand ID must be a positive integer'),

  body('unit_price')
    .notEmpty()
    .withMessage('Unit price is required')
    .isDecimal({ decimal_digits: '0,4' })
    .withMessage('Unit price must be a valid number')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Unit price must be 0 or greater'),

  body('cost_price')
    .notEmpty()
    .withMessage('Cost price is required')
    .isDecimal({ decimal_digits: '0,4' })
    .withMessage('Cost price must be a valid number')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Cost price must be 0 or greater'),

  body('reorder_level')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),

  body('reorder_qty')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Reorder quantity must be at least 1'),

  body('unit_of_measure')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Unit of measure must not exceed 50 characters'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
];


const update = [
  body('sku')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('SKU must not exceed 50 characters'),

  body('name')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),

  body('category_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),

  body('brand_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Brand ID must be a positive integer'),

  body('unit_price')
    .optional({ nullable: true, checkFalsy: true })
    .isDecimal({ decimal_digits: '0,4' })
    .withMessage('Unit price must be a valid number')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Unit price must be 0 or greater'),

  body('cost_price')
    .optional({ nullable: true, checkFalsy: true })
    .isDecimal({ decimal_digits: '0,4' })
    .withMessage('Cost price must be a valid number')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Cost price must be 0 or greater'),

  body('reorder_level')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),

  body('reorder_qty')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Reorder quantity must be at least 1'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
];

module.exports = { create, update };
