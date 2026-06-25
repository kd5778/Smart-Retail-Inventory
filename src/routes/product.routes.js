const router = require('express').Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { create: createValidator, update: updateValidator } = require('../validators/product.validator');

router.use(authenticate);
router.get('/', authorize('products:read'), productController.getAll);
router.get('/:id', authorize('products:read'), productController.getById);
router.post('/', authorize('products:create'), createValidator, validate, productController.create);
router.put('/:id', authorize('products:update'), updateValidator, validate, productController.update);
router.delete('/:id', authorize('products:delete'), productController.delete);

module.exports = router;
