
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const userRoutes = require('../routes/userRoutes'); // Adjusted path to be relative to app.js
const boardRoutes = require('../routes/boardRoutes'); // Adjusted path to be relative to app.js
const helmet = require('helmet');
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware setup
app.use(cors({
  origin: 'https://kaizen-server-9wz3cb831-hosseinkhezelis-projects.vercel.app', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // If you need to support credentials
}));
app.use(bodyParser.json()); // Parse JSON bodies
// app.use(helmet());
// User and Board routes
app.use('/api/users', userRoutes); // Prefixed with /api for better API structure
app.use('/api/boards', boardRoutes); // Prefixed with /api for consistency

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack); // Log the error stack
//   res.status(500).json({ message: 'Something went wrong!' }); // Send a generic error response
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
