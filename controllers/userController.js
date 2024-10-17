// Use ES Module syntax consistently
import EdgeConfig from '@vercel/edge-config'; // Import EdgeConfig as a default export
import { generateOTP, generateToken } from '../utility/method';

// Initialize EdgeConfig with your Edge Config ID
const edgeConfig = new EdgeConfig(process.env.EDGE_CONFIG_ID);
console.log('Edge Config ID:', process.env.EDGE_CONFIG_ID);

// Example function to read users from Edge Config
const readUsersFromConfig = async () => {
  const usersData = await edgeConfig.get('users');
  return usersData ? JSON.parse(usersData) : [];
};

// Function to write users to Edge Config
const writeUsersToConfig = async (users) => {
  await edgeConfig.set('users', JSON.stringify(users));
};

export const signUpUser = async (req, res) => {
  const { phoneNumber } = req.body;
  const users = await readUsersFromConfig();

  // Check if user already exists
  if (users.some(user => user.phoneNumber === phoneNumber)) {
    return res.status(409).json({ message: 'User already exists!' });
  }

  const userId = Date.now().toString();
  const username = Date.now().toString(); // Consider using a more meaningful username
  const newUser = {
    userId,
    username,
    phoneNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(newUser);
  await writeUsersToConfig(users);
  res.status(201).json({ message: 'User registered successfully!', userId });
};

export const signInUser = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  const users = await readUsersFromConfig();
  const user = users.find(u => u.phoneNumber === phoneNumber);

  if (!user || user.otpCode !== otp) {
    return res.status(401).json({ message: 'Invalid OTP or user not found!' });
  }

  // Clear OTP and update last login
  user.otpCode = undefined;
  user.lastLogin = new Date();

  // Generate a JWT token for the user
  const token = generateToken(user.userId);

  await writeUsersToConfig(users);
  res.status(200).json({
    message: 'Login successful!',
    userId: user.userId,
    username: user.username,
    phoneNumber: user.phoneNumber,
    token,
  });
};

export const sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  const users = await readUsersFromConfig();
  const user = users.find(u => u.phoneNumber === phoneNumber);

  if (!user) {
    return res.status(404).json({ message: 'User not found!' });
  }

  const otpCode = generateOTP();
  user.otpCode = otpCode;

  console.log(`Sending OTP ${otpCode} to ${phoneNumber}`);

  await writeUsersToConfig(users);
  res.status(200).json({ message: 'OTP sent successfully!', otpCode, phoneNumber });
};

export const getUserProfile = async (req, res) => {
  const username = req?.body?.user?.username;
  const users = await readUsersFromConfig();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(404).json({ message: 'User not found!' });
  }

  res.status(200).json(user);
};
