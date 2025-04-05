
const Mood = require('../models/mood.model');
const User = require('../models/user.model');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const { analyzeSentimentWithAI } = require('../utils/sentimentAnalysis');

/**
 * @desc    Record a new mood entry
 * @route   POST /api/moods
 * @access  Private
 */
exports.recordMood = asyncHandler(async (req, res) => {
  const { moodScore, moodLabel, transcription, sentimentAnalysis } = req.body;
  const userId = req.user._id;

  // Create mood entry
  const moodEntry = await Mood.create({
    userId,
    moodScore,
    moodLabel,
    transcription,
    sentimentAnalysis
  });

  // Update user streak
  const user = await User.findById(userId);
  await user.updateStreak();
  
  // Award tokens for daily check-in
  user.tokens += 5;
  await user.save();

  res.status(201).json({
    success: true,
    data: moodEntry,
    streak: {
      current: user.streak,
      plantLevel: user.plantLevel
    },
    tokens: user.tokens
  });
});

/**
 * @desc    Get mood history
 * @route   GET /api/moods/history
 * @access  Private
 */
exports.getMoodHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const days = req.query.days ? parseInt(req.query.days) : 7;

  const moodHistory = await Mood.getMoodHistory(userId, days);

  res.status(200).json({
    success: true,
    count: moodHistory.length,
    data: moodHistory
  });
});

/**
 * @desc    Analyze sentiment from voice recording
 * @route   POST /api/moods/analyze
 * @access  Private
 */
exports.analyzeSentiment = asyncHandler(async (req, res) => {
  // Check if audio file was uploaded
  if (!req.file) {
    throw new AppError('No audio file uploaded', 400);
  }

  // Process the audio file and perform sentiment analysis
  const audioBuffer = req.file.buffer;
  
  try {
    const result = await analyzeSentimentWithAI(audioBuffer);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new AppError('Failed to analyze sentiment', 500);
  }
});
