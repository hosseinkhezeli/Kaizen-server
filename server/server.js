import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { createClient } from '@vercel/edge-config'; // Import Edge Config client
import userRoutes from '../routes/userRoutes.js'; // Ensure this is an ES Module
import boardRoutes from '../routes/boardRoutes.js'; // Ensure this is an ES Module

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = ['http://localhost:3000', 'https://kaizzen.vercel.app'];

// Middleware setup
app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(bodyParser.json());
app.use(helmet());

// Import routes
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
});
const EDGE_CONFIG_ID = 'ecfg_1e7ncqy61tzmxkz9fiwwbktab1bm'; // Replace with your actual Edge Config ID
const API_TOKEN = 'b5d60a6e-62ca-4ffb-b49d-0d00899ad934'; // Replace with your Vercel API token
// Start the server
const startServer = async () => {
  try {
    // Create an Edge Config client
    const edgeConfigClient = createClient("https://edge-config.vercel.com/ecfg_1e7ncqy61tzmxkz9fiwwbktab1bm?token=b5d60a6e-62ca-4ffb-b49d-0d00899ad934");
    console.log('Edge Config Client created:', edgeConfigClient);

    // Example usage of the Edge Config client
    const usersData = await edgeConfigClient.get('users');
    console.log('Users Data:', usersData);

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();
