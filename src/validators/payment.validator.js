const { body } = require('express-validator');


const create = [
  body('reference_type')
    .trim()
    .notEmpty()
    .withMessage('Reference type is required')
    .isIn(['purchase_order', 'sales_order'])
    .withMessage('Reference type must be either "purchase_order" or "sales_order"'),

  body('reference_id')
    .notEmpty()
    .withMessage('Reference ID is required')
    .isInt({ min: 1 })
    .withMessage('Reference ID must be a positive integer'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Amount must be a valid decimal number')
    .custom((value) => parseFloat(value) >= 0.01)
    .withMessage('Amount must be at least 0.01'),

  body('payment_method')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'credit_card', 'bank_transfer', 'cheque'])
    .withMessage('Payment method must be one of: cash, credit_card, bank_transfer, cheque'),

  body('transaction_reference')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Transaction reference must not exceed 200 characters'),

  body('payment_date')
    .optional({ values: 'falsy' })
    .isDate()
    .withMessage('Payment date must be a valid date (YYYY-MM-DD)'),

  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];


const updateStatus = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Status must be one of: pending, completed, failed, refunded')
];

module.exports = {
  create,
  updateStatus
};
