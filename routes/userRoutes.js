const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Define your routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUserProfile);

module.exports = router;
