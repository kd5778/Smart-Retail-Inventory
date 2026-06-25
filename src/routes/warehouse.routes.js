const router = require('express').Router();
const warehouseController = require('../controllers/warehouse.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { create: createValidator, update: updateValidator } = require('../validators/warehouse.validator');

router.use(authenticate);
router.get('/', authorize('inventory:read'), warehouseController.getAll);
router.get('/:id', authorize('inventory:read'), warehouseController.getById);
router.post('/', authorize('admin:users'), createValidator, validate, warehouseController.create);
router.put('/:id', authorize('admin:users'), updateValidator, validate, warehouseController.update);
router.delete('/:id', authorize('admin:users'), warehouseController.delete);

module.exports = router;
