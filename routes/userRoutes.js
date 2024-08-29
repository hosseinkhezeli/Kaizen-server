const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Define your routes
router.post('/sign-up', userController.signUpUser);
router.post('/sign-in', userController.signInUser);
router.get('/profile', userController.getUserProfile);
router.get('/send-otp', userController.sendOTP);
module.exports = router;
