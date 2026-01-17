import 'dotenv/config';

import express from "express";
import cors from "cors";
import ConnectDb from "./Config/DB.js";
import { testEmailConnection } from "./Services/emailService.js";

import authRouter from "./Routers/auth.js";
import applicationRouter from "./Routers/application.js";
import jobRouter from "./Routers/job.js";
import resumeRouter from "./Routers/resume.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
ConnectDb();

// Test email connection on startup
testEmailConnection();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/resume', resumeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
