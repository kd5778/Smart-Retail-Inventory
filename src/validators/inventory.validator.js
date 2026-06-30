const { body } = require('express-validator');

// manual stock adjustment
const adjust = [
  body('product_id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('warehouse_id')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isInt({ min: 1 })
    .withMessage('Warehouse ID must be a positive integer'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt()
    .withMessage('Quantity must be an integer (positive to add, negative to subtract)'),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason for adjustment is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be between 3 and 500 characters')
];


const reorder = [
  body('product_id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('warehouse_id')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isInt({ min: 1 })
    .withMessage('Warehouse ID must be a positive integer'),

  body('suggested_quantity')
    .notEmpty()
    .withMessage('Suggested quantity is required')
    .isInt({ min: 1 })
    .withMessage('Suggested quantity must be at least 1')
];

// warehouse-to-warehouse transfer
const transfer = [
  body('product_id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('source_warehouse_id')
    .notEmpty()
    .withMessage('Source warehouse ID is required')
    .isInt({ min: 1 })
    .withMessage('Source warehouse ID must be a positive integer'),

  body('destination_warehouse_id')
    .notEmpty()
    .withMessage('Destination warehouse ID is required')
    .isInt({ min: 1 })
    .withMessage('Destination warehouse ID must be a positive integer')
    .custom((value, { req }) => {
      if (parseInt(value) === parseInt(req.body.source_warehouse_id)) {
        throw new Error('Destination warehouse must be different from source warehouse');
      }
      return true;
    }),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Transfer quantity must be at least 1')
];

module.exports = {
  adjust,
  reorder,
  transfer
};
