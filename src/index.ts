// This is the main entry point for our backend API
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactions';
import authRoutes from './routes/auth';

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// The port our server will listen on (default to 3001)
const PORT = process.env.PORT || 3001;

// Middleware - these run on every request BEFORE our routes
app.use(cors()); // Allow requests from different origins (like your frontend)
app.use(express.json()); // Parse JSON request bodies

// Routes - these define what happens when someone visits different URLs

// Test route to make sure the server is working
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Personal Finance Tracker API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions'
    }
  });
});

// Health check endpoint - useful for deployment platforms
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Start the server and listen for requests
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Finance Tracker API v1.0.0`);
});
