const User = require('../models/User'); // Import the User model
const { generateOTP, generateToken } = require("../utility/method");

exports.signUpUser = async (req, res) => {
  const { phoneNumber, username, email, fullName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists!' });
  }

  const userId = Date.now().toString();
  const newUser = new User({
    userId,
    username,
    email,
    phoneNumber,
    fullName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!', userId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

exports.signInUser = async (req, res) => {
  const { phoneNumber, otp } = req.body; // Assuming OTP is still used for login

  const user = await User.findOne({ phoneNumber });

  if (!user || user.otpCode !== otp) {
    return res.status(401).json({ message: 'Invalid OTP or user not found!' });
  }

  // Clear OTP and update last login
  user.otpCode = undefined;
  user.lastLogin = new Date();

  // Generate a JWT token for the user
  const token = generateToken(user.userId);

  try {
    await user.save(); // Save updated user data
    res.status(200).json({
      message: 'Login successful!',
      userId: user.userId,
      username: user.username,
      phoneNumber: user.phoneNumber,
      token, // Send the token back to the client
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

exports.sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return res.status(404).json({ message: 'User not found!' });
  }

  const otpCode = generateOTP();
  user.otpCode = otpCode;

  console.log(`Sending OTP ${otpCode} to ${phoneNumber}`);

  try {
    await user.save(); // Save updated OTP
    res.status(200).json({ message: 'OTP sent successfully!', otpCode, phoneNumber });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error });
  }
};

exports.getUserProfile = async (req, res) => {
  const userId = req?.body?.user?.userId; // Get userId from the request object set by the middleware

  const user = await User.findOne({ userId });

  if (!user) {
    return res.status(404).json({ message: 'User not found!' });
  }

  res.status(200).json(user);
};