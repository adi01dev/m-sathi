
const cron = require('node-cron');
const { generateAllDueReports } = require('./reportGenerator');

/**
 * Setup all scheduled jobs
 */
exports.setupCronJobs = () => {
  // Generate weekly reports every Sunday at 1 AM
  cron.schedule('0 1 * * 0', async () => {
    console.log('Running weekly report generation job');
    try {
      await generateAllDueReports();
    } catch (error) {
      console.error('Error generating reports:', error);
    }
  });
  
  // Reset streaks for users who haven't checked in for 2+ days (run daily at 2 AM)
  cron.schedule('0 2 * * *', async () => {
    console.log('Running streak reset job');
    try {
      const User = require('../models/user.model');
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      await User.updateMany(
        { lastCheckIn: { $lt: twoDaysAgo } },
        { streak: 0, plantLevel: 'seed' }
      );
    } catch (error) {
      console.error('Error resetting streaks:', error);
    }
  });
};
