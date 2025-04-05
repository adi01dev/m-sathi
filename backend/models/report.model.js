
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  averageMood: {
    type: Number,
    default: 0
  },
  streakMaintained: {
    type: Boolean,
    default: false
  },
  plantProgress: {
    type: Number, // Percentage
    default: 0
  },
  completedRecommendations: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  url: {
    type: String
  }
});

// Index for efficient querying by user, week, and year
reportSchema.index({ userId: 1, year: 1, weekNumber: 1 }, { unique: true });

// Static method to generate a weekly report for a user
reportSchema.statics.generateReport = async function(userId, weekNumber, year) {
  const User = mongoose.model('User');
  const Mood = mongoose.model('Mood');
  const Recommendation = mongoose.model('Recommendation');
  
  // Get date range for the given week
  const startDate = getFirstDayOfWeek(weekNumber, year);
  const endDate = getLastDayOfWeek(weekNumber, year);
  
  // Get user data
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Get mood data for the week
  const { averageMood } = await Mood.getAverageMood(
    userId,
    startDate,
    endDate
  );
  
  // Get completed recommendations for the week
  const completedRecommendations = await Recommendation.countDocuments({
    'userCompletions.userId': userId,
    'userCompletions.completedAt': { $gte: startDate, $lte: endDate }
  });
  
  // Calculate plant progress as percentage
  let plantProgress = 0;
  switch (user.plantLevel) {
    case 'seed': plantProgress = 0; break;
    case 'sprout': plantProgress = 25; break;
    case 'leaf': plantProgress = 50; break;
    case 'flower': plantProgress = 75; break;
    case 'tree': plantProgress = 100; break;
  }
  
  // Create report
  const report = await this.create({
    userId,
    weekNumber,
    year,
    startDate,
    endDate,
    averageMood,
    streakMaintained: user.streak > 0,
    plantProgress,
    completedRecommendations
  });
  
  return report;
};

// Helper functions for date calculations
function getFirstDayOfWeek(weekNumber, year) {
  const date = new Date(year, 0, 1);
  const daysOffset = (weekNumber - 1) * 7;
  date.setDate(date.getDate() + daysOffset);
  return date;
}

function getLastDayOfWeek(weekNumber, year) {
  const firstDay = getFirstDayOfWeek(weekNumber, year);
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  return lastDay;
}

module.exports = mongoose.model('Report', reportSchema);
