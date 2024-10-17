// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  otpCode: { type: String, default: null },
  fullName: { type: String, required: true },
  profilePictureUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  boards: { type: [String], default: [] },
  role: { type: String, default: 'member' },
  lastLogin: { type: Date, default: null },
  notificationsSettings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;