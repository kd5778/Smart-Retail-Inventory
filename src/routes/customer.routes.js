const router = require('express').Router();
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { create: createValidator, update: updateValidator } = require('../validators/customer.validator');

router.use(authenticate);
router.get('/', authorize('customers:read'), customerController.getAll);
router.get('/:id', authorize('customers:read'), customerController.getById);
router.post('/', authorize('customers:create'), createValidator, validate, customerController.create);
router.put('/:id', authorize('customers:update'), updateValidator, validate, customerController.update);
router.delete('/:id', authorize('customers:delete'), customerController.delete);

module.exports = router;
