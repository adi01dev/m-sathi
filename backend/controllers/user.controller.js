
const User = require('../models/user.model');
const { asyncHandler, AppError } = require('../middleware/error.middleware');

/**
 * @desc    Get user streak
 * @route   GET /api/users/streak
 * @access  Private
 */
exports.getStreak = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    streak: user.streak,
    plantLevel: user.plantLevel
  });
});

/**
 * @desc    Update user streak
 * @route   POST /api/users/streak
 * @access  Private
 */
exports.updateStreak = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { increment = true, checkInDate } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If increment is false, reset streak
  if (!increment) {
    user.streak = 0;
    user.plantLevel = 'seed';
    await user.save();
  } else {
    await user.updateStreak(checkInDate);

    // Award bonus tokens for milestone streaks
    const oldStreak = user.streak - 1;
    if (oldStreak < 7 && user.streak >= 7) {
      // Award bonus for 7-day streak
      user.tokens += 15;
      await user.save();
    } else if (oldStreak < 14 && user.streak >= 14) {
      // Award bonus for 14-day streak
      user.tokens += 25;
      await user.save();
    } else if (oldStreak < 30 && user.streak >= 30) {
      // Award bonus for 30-day streak
      user.tokens += 50;
      await user.save();
    }
  }

  res.status(200).json({
    success: true,
    streak: user.streak,
    plantLevel: user.plantLevel,
    tokens: user.tokens
  });
});
