const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// All user routes require authentication
router.get('/', auth, userController.getAllUsers);

// New Routes for Search and Contacts (Must be before /:id)
router.get('/search', auth, userController.searchUser);
router.get('/contacts', auth, userController.getContacts);
router.post('/add-contact/:id', auth, userController.addContact);

// Get user by ID
router.get('/:id', auth, userController.getUserById);

module.exports = router;