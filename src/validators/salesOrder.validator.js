const { body } = require('express-validator');


const create = [
  body('customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),

  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),

  body('items.*.product_id')
    .notEmpty()
    .withMessage('Each item must have a product ID')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Each item must have a quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.unit_price')
    .notEmpty()
    .withMessage('Each item must have a unit price')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Unit price must be a valid decimal number')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Unit price must be 0 or greater'),

  body('discount_amount')
    .optional({ values: 'falsy' })
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Discount amount must be a valid decimal number')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Discount amount must be 0 or greater'),

  body('tax_amount')
    .optional({ values: 'falsy' })
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Tax amount must be a valid decimal number')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Tax amount must be 0 or greater'),

  body('shipping_address')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Shipping address must not exceed 500 characters'),

  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];


const updateStatus = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled, returned')
];

module.exports = {
  create,
  updateStatus
};
