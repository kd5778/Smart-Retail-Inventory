const router = require('express').Router();

// Mount all route modules under API prefix
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/products', require('./product.routes'));
router.use('/categories', require('./category.routes'));
router.use('/brands', require('./brand.routes'));
router.use('/suppliers', require('./supplier.routes'));
router.use('/customers', require('./customer.routes'));
router.use('/warehouses', require('./warehouse.routes'));
router.use('/inventory', require('./inventory.routes'));
router.use('/purchase-orders', require('./purchaseOrder.routes'));
router.use('/sales-orders', require('./salesOrder.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/reports', require('./report.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/audit-logs', require('./auditLog.routes'));

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
