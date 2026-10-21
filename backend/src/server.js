import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db/database.js';
import { seedDatabase } from './db/seed.js';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & Auto-seed if first run
initDB();
seedDatabase(false);

// CORS configuration: allow frontend dev server and all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'StoryFlow Blog Platform API',
    version: '1.0.0',
    database: 'SQLite (Native node:sqlite)'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'StoryFlow Blogging Platform API is active and ready.',
    endpoints: {
      health: '/api/health',
      posts: '/api/posts',
      categories: '/api/categories',
      stats: '/api/categories/stats',
      auth: '/api/auth'
    }
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Blog Platform REST API Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`📝 Posts: http://localhost:${PORT}/api/posts`);
  console.log(`====================================================`);
});

export default app;
