import express from 'express';
import * as userController from '../controllers/userController.js'; // Use ES Module syntax

const userRoutes = express.Router();

// Define your routes
userRoutes.post('/sign-up', userController.signUpUser);
userRoutes.post('/sign-in', userController.signInUser);
userRoutes.get('/profile', userController.getUserProfile);
userRoutes.post('/send-otp', userController.sendOTP);

export default userRoutes; // Use ES Module export
