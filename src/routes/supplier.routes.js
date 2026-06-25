const router = require('express').Router();
const supplierController = require('../controllers/supplier.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { create: createValidator, update: updateValidator } = require('../validators/supplier.validator');

router.use(authenticate);
router.get('/', authorize('suppliers:read'), supplierController.getAll);
router.get('/:id', authorize('suppliers:read'), supplierController.getById);
router.post('/', authorize('suppliers:create'), createValidator, validate, supplierController.create);
router.put('/:id', authorize('suppliers:update'), updateValidator, validate, supplierController.update);
router.delete('/:id', authorize('suppliers:delete'), supplierController.delete);

module.exports = router;
