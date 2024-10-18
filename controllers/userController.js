import axios from 'axios'; // Import axios for making HTTP requests
import { generateOTP, generateToken } from '../utility/method.js';
import { createClient } from '@vercel/edge-config'; // Import Edge Config client

const EDGE_CONFIG_ID = 'ecfg_1e7ncqy61tzmxkz9fiwwbktab1bm'; // Replace with your actual Edge Config ID
const API_TOKEN = 'b5d60a6e-62ca-4ffb-b49d-0d00899ad934'; // Replace with your Vercel API token
const edgeConfigClient = createClient("https://edge-config.vercel.com/ecfg_1e7ncqy61tzmxkz9fiwwbktab1bm?token=b5d60a6e-62ca-4ffb-b49d-0d00899ad934");

// Function to read users from Edge Config
const readUsersFromConfig = async () => {
  try{
    const usersData = await edgeConfigClient.get('users');

      return typeof usersData === 'string' ? JSON.parse(usersData) : usersData;

  } catch (error) {
    console.error('Error reading users from Edge Config:', error);
    return { users: [] };
  }
};


// Function to write users to Edge Config
const writeUsersToConfig = async (users) => {
  try {
    await axios.post(`https://edge-config.vercel.com/${EDGE_CONFIG_ID}/item`, {
      key: 'users',
      value: JSON.stringify(users),
    }, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error writing users to Edge Config:', error);
  }
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
