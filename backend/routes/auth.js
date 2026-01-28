const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
router.post('/signup', authController.signup);
router.post('/login', authController.signup);

router.post('/logout', auth, authController.logout);
module.exports = router;