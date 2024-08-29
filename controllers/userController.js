const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const userFilePath = path.join(__dirname, '../database/user_database.json');
const JWT_SECRET = 'your_jwt_secret'; // Use an environment variable in production

const readUsersFromFile = () => {
  const data = fs.readFileSync(userFilePath, 'utf8');
  return JSON.parse(data);
};

const writeUsersToFile = (users) => {
  fs.writeFileSync(userFilePath, JSON.stringify({ users }, null, 2));
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day
};

exports.registerUser = (req, res) => {
  const { username, email, phoneNumber, fullName } = req.body;
  const users = readUsersFromFile().users;

  // Check if user already exists
  if (users.some(user => user.phoneNumber === phoneNumber)) {
    return res.status(409).json({ message: 'User already exists!' });
  }

  const userId = Date.now().toString();
  const newUser = {
    userId,
    username,
    email,
    phoneNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(newUser);
  writeUsersToFile(users);
  res.status(201).json({ message: 'User registered successfully!', userId });
};

exports.loginUser = (req, res) => {
  const { phoneNumber, otp } = req.body; // Assuming OTP is still used for login
  const users = readUsersFromFile().users;
  const user = users.find(u => u.phoneNumber === phoneNumber);

  if (!user || user.otpCode !== otp) {
    return res.status(401).json({ message: 'Invalid OTP or user not found!' });
  }

  // Clear OTP and update last login
  user.otpCode = undefined;
  user.lastLogin = new Date();

  // Generate a JWT token for the user
  const token = generateToken(user.userId);

  writeUsersToFile(users);
  res.status(200).json({
    message: 'Login successful!',
    userId: user.userId,
    username: user.username,
    phoneNumber: user.phoneNumber,
    token, // Send the token back to the client
  });
};

exports.sendOTP = (req, res) => {
  const { phoneNumber } = req.body;
  const users = readUsersFromFile().users;
  const user = users.find(u => u.phoneNumber === phoneNumber);

  if (!user) {
    return res.status(404).json({ message: 'User not found!' });
  }

  const otpCode = generateOTP();
  user.otpCode = otpCode;

  console.log(`Sending OTP ${otpCode} to ${phoneNumber}`);

  writeUsersToFile(users);
  res.status(200).json({ message: 'OTP sent successfully!', otpCode, phoneNumber });
};

exports.getUserProfile = (req, res) => {
  const userId = req.user.userId; // Get userId from the request object set by the middleware
  const users = readUsersFromFile().users;
  const user = users.find(u => u.userId === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found!' });
  }

  res.status(200).json({
    userId: user.userId,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
};

// Utility function to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
