const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// All user routes require authentication
router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);

module.exports = router;