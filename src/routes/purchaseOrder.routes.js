const router = require('express').Router();
const poController = require('../controllers/purchaseOrder.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { create: createValidator } = require('../validators/purchaseOrder.validator');

router.use(authenticate);
router.get('/', authorize('orders:read'), poController.getAll);
router.get('/:id', authorize('orders:read'), poController.getById);
router.post('/', authorize('orders:create'), createValidator, validate, poController.create);
router.patch('/:id/approve', authorize('orders:approve'), poController.approve);
router.patch('/:id/receive', authorize('inventory:receive'), poController.receiveInventory);

module.exports = router;
