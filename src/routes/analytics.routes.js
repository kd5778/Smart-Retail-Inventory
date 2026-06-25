const router = require('express').Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.get('/dashboard', authorize('reports:view'), analyticsController.getDashboard);

module.exports = router;
