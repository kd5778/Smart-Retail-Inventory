const router = require('express').Router();
const brandController = require('../controllers/brand.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { create: createValidator, update: updateValidator } = require('../validators/brand.validator');

router.use(authenticate);
router.get('/', authorize('products:read'), brandController.getAll);
router.get('/:id', authorize('products:read'), brandController.getById);
router.post('/', authorize('products:create'), createValidator, validate, brandController.create);
router.put('/:id', authorize('products:update'), updateValidator, validate, brandController.update);
router.delete('/:id', authorize('products:delete'), brandController.delete);

module.exports = router;
