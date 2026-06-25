const router = require('express').Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.get('/sales', authorize('reports:view'), reportController.getSalesReport);
router.get('/inventory', authorize('reports:view'), reportController.getInventoryReport);
router.get('/suppliers', authorize('reports:view'), reportController.getSupplierReport);
router.get('/profitability', authorize('reports:view'), reportController.getProfitabilityReport);

module.exports = router;
