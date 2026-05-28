import express from 'express';
import dotenv from 'dotenv';
import { setupMiddleware } from './middleware';
import healthRouter from './routes/health';
import employeeRouter from './routes/employees';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
setupMiddleware(app);

// Routes
app.use(healthRouter);
app.use('/api/employees', employeeRouter);

// Start server
const main = async () => {
  try {
    app.listen(PORT, () => {
      console.log('Starting Salary Manager Backend...');
      console.log(`Backend is running on http://localhost:${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

main();
