const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');

// Load environment variables from .env file
dotenv.config();

// Import routes
const userRoutes = require('../routes/userRoutes');
const boardRoutes = require('../routes/boardRoutes');

const app = express();
const PORT = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI; // Use environment variable for MongoDB URI
const allowedOrigins = ['http://localhost:3000', 'https://kaizzen.vercel.app'];

// Middleware setup
app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(express.json()); // Use express built-in body parser
app.use(helmet()); // Enhance security with Helmet

// User and Board routes
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack
  res.status(500).json({ message: 'Something went wrong!' }); // Send a generic error response
});

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});