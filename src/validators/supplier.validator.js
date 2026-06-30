const { body } = require('express-validator');

const create = [
  body('supplier_name').trim().notEmpty().withMessage('Supplier name is required').isLength({ min: 2, max: 200 }),
  body('contact_person').trim().notEmpty().withMessage('Contact person is required').isLength({ min: 2, max: 150 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim(),
  body('payment_terms').optional({ nullable: true, checkFalsy: true }).trim()
];

const update = [
  body('supplier_name').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 2, max: 200 }),
  body('contact_person').optional({ nullable: true, checkFalsy: true }).trim().isLength({ min: 2, max: 150 }),
  body('email').optional({ nullable: true, checkFalsy: true }).trim().isEmail().withMessage('Invalid email'),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim(),
  body('payment_terms').optional({ nullable: true, checkFalsy: true }).trim()
];

module.exports = { create, update };
