
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const moodRoutes = require('./routes/mood.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const communityRoutes = require('./routes/community.routes');
const reportRoutes = require('./routes/report.routes');
const rewardRoutes = require('./routes/reward.routes');

const { errorHandler } = require('./middleware/error.middleware');
const { setupCronJobs } = require('./utils/cron');

// Initialize express app
const app = express();

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Setup API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/rewards', rewardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start scheduled jobs
  setupCronJobs();
});

module.exports = app; // For testing purposes
