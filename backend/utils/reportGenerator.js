
const Report = require('../models/report.model');
const User = require('../models/user.model');

/**
 * Generate reports for all users who are due for one
 */
exports.generateAllDueReports = async () => {
  try {
    // Get all active users
    const users = await User.find();
    
    // Calculate current week and year
    const now = new Date();
    const weekNumber = Math.ceil(now.getDate() / 7);
    const year = now.getFullYear();
    
    // Generate reports for each user
    for (const user of users) {
      // Check if report for this week already exists
      const existingReport = await Report.findOne({
        userId: user._id,
        weekNumber,
        year
      });
      
      if (!existingReport) {
        console.log(`Generating report for user ${user._id}`);
        await Report.generateReport(user._id, weekNumber, year);
      }
    }
    
    console.log('Weekly report generation completed');
  } catch (error) {
    console.error('Error in report generation:', error);
    throw error;
  }
};
