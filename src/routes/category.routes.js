const router = require('express').Router();
const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { create: createValidator, update: updateValidator } = require('../validators/category.validator');

router.use(authenticate);
router.get('/', authorize('products:read'), categoryController.getAll);
router.get('/:id', authorize('products:read'), categoryController.getById);
router.post('/', authorize('products:create'), createValidator, validate, categoryController.create);
router.put('/:id', authorize('products:update'), updateValidator, validate, categoryController.update);
router.delete('/:id', authorize('products:delete'), categoryController.delete);

module.exports = router;
