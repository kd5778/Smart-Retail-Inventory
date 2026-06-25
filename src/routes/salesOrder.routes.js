const router = require('express').Router();
const soController = require('../controllers/salesOrder.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { create: createValidator } = require('../validators/salesOrder.validator');

router.use(authenticate);
router.get('/', authorize('orders:read'), soController.getAll);
router.get('/:id', authorize('orders:read'), soController.getById);
router.post('/', authorize('orders:create'), createValidator, validate, soController.create);
router.patch('/:id/status', authorize('orders:update'), soController.updateStatus);
router.post('/:id/invoice', authorize('orders:read'), soController.generateInvoice);

module.exports = router;
