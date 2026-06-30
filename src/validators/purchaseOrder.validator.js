const { body } = require('express-validator');


const create = [
  body('supplier_id')
    .notEmpty()
    .withMessage('Supplier ID is required')
    .isInt({ min: 1 })
    .withMessage('Supplier ID must be a positive integer'),

  body('warehouse_id')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isInt({ min: 1 })
    .withMessage('Warehouse ID must be a positive integer'),

  body('expected_delivery_date')
    .notEmpty()
    .withMessage('Expected delivery date is required')
    .isDate()
    .withMessage('Expected delivery date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const deliveryDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deliveryDate < today) {
        throw new Error('Expected delivery date cannot be in the past');
      }
      return true;
    }),

  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),

  body('items.*.product_id')
    .notEmpty()
    .withMessage('Each item must have a product ID')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('items.*.quantity_ordered')
    .notEmpty()
    .withMessage('Each item must have a quantity ordered')
    .isInt({ min: 1 })
    .withMessage('Quantity ordered must be at least 1'),

  body('items.*.unit_cost')
    .notEmpty()
    .withMessage('Each item must have a unit cost')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Unit cost must be a valid decimal number')
    .custom((value) => parseFloat(value) >= 0)
    .withMessage('Unit cost must be 0 or greater'),

  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];


const receive = [
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),

  body('items.*.purchase_order_item_id')
    .notEmpty()
    .withMessage('Each item must have a purchase order item ID')
    .isInt({ min: 1 })
    .withMessage('Purchase order item ID must be a positive integer'),

  body('items.*.quantity_received')
    .notEmpty()
    .withMessage('Each item must have a quantity received')
    .isInt({ min: 0 })
    .withMessage('Quantity received must be 0 or greater'),

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
    .isIn(['pending', 'approved', 'ordered', 'shipped', 'partially_received', 'received', 'cancelled'])
    .withMessage('Status must be one of: pending, approved, ordered, shipped, partially_received, received, cancelled')
];

module.exports = {
  create,
  receive,
  updateStatus
};
