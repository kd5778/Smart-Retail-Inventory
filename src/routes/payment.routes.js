const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { create: createValidator } = require('../validators/payment.validator');

router.use(authenticate);
router.get('/', authorize('payments:read'), paymentController.getAll);
router.get('/:id', authorize('payments:read'), paymentController.getById);
router.post('/', authorize('payments:create'), createValidator, validate, paymentController.create);

module.exports = router;
