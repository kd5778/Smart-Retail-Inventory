const router = require('express').Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { adjust: adjustValidator, reorder: reorderValidator } = require('../validators/inventory.validator');

router.use(authenticate);
router.get('/stock', authorize('inventory:read'), inventoryController.getStockLevels);
router.get('/movements', authorize('inventory:read'), inventoryController.getMovements);
router.get('/reorder-suggestions', authorize('inventory:read'), inventoryController.getReorderSuggestions);
router.post('/adjust', authorize('inventory:adjust'), adjustValidator, validate, inventoryController.adjustStock);
router.post(
  '/reorder',
  authorize('inventory:reorder'),
  reorderValidator,
  validate,
  inventoryController.createReorderRequest
);

module.exports = router;
