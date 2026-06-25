const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { register: registerValidator, login: loginValidator } = require('../validators/auth.validator');

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
