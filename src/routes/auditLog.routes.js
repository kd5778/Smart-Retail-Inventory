const router = require('express').Router();
const auditLogController = require('../controllers/auditLog.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(authenticate);
router.get('/', authorize('admin:audit'), auditLogController.getLogs);

module.exports = router;
