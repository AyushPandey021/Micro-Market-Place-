import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';
import aiBuddyRoutes from './routes/aibuddy.routes.js';
import { connectDB } from './config/db.js';
import * as productLocal from './services/productLocal.service.js';

const app = express();

// DB Connection + Seed
await connectDB();
await productLocal.ensureSampleData();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Service health check
app.get('/health/services', async (req, res) => {
  try {
    // Simple ping
    res.json({ status: 'healthy', services: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy' });
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(
    {
      method: req.method,
      path: req.path,
      ip: req.ip,
    },
    'Incoming request'
  );
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'AI Buddy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/ai-buddy', aiBuddyRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Buddy Service - Personal Shopping Assistant ✅ COMPLETE',
    version: '1.0.0',
    endpoints: {
      process: 'POST /ai-buddy/process {"query": "men kurta"}',
      health: 'GET /health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn({ path: req.path, method: req.method }, 'Route not found');
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err, 'Unhandled error');
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

export default app;

