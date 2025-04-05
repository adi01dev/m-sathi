
const Report = require('../models/report.model');
const User = require('../models/user.model');
const Mood = require('../models/mood.model');
const Recommendation = require('../models/recommendation.model');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const { generatePDF } = require('../utils/pdfGenerator');

/**
 * @desc    Generate a weekly wellness report
 * @route   POST /api/reports/generate
 * @access  Private
 */
exports.generateWeeklyReport = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Calculate current week and year
  const now = new Date();
  const weekNumber = Math.ceil(now.getDate() / 7);
  const year = now.getFullYear();
  
  // Check if report already exists for this week
  let report = await Report.findOne({
    userId,
    weekNumber,
    year
  });
  
  if (!report) {
    // Generate new report
    report = await Report.generateReport(userId, weekNumber, year);
    
    // Get mood entries for the report period
    const moodEntries = await Mood.find({
      userId,
      date: { $gte: report.startDate, $lte: report.endDate }
    });
    
    // Get completed recommendations
    const recommendations = await Recommendation.findCompletedByUser(userId);
    
    // Generate PDF
    try {
      const pdfBuffer = await generatePDF({
        userName: req.user.name,
        report,
        moodEntries,
        recommendations
      });
      
      // Save PDF URL (in a real app, you'd upload to cloud storage)
      // For now, we'll just set a placeholder
      report.url = `/reports/${report._id}.pdf`;
      await report.save();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Continue without PDF if generation fails
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      userId: report.userId,
      weekNumber: report.weekNumber,
      year: report.year,
      startDate: report.startDate,
      endDate: report.endDate,
      averageMood: report.averageMood,
      streakMaintained: report.streakMaintained,
      plantProgress: report.plantProgress,
      completedRecommendations: report.completedRecommendations,
      url: report.url,
      generatedAt: report.generatedAt
    }
  });
});

/**
 * @desc    Get user's reports
 * @route   GET /api/reports
 * @access  Private
 */
exports.getReports = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 10;
  
  const reports = await Report.find({ userId })
    .sort({ year: -1, weekNumber: -1 })
    .limit(limit);
  
  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports
  });
});
