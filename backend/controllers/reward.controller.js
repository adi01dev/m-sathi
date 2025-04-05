
const User = require('../models/user.model');
const { asyncHandler, AppError } = require('../middleware/error.middleware');

/**
 * @desc    Get user's token balance
 * @route   GET /api/rewards/tokens
 * @access  Private
 */
exports.getTokenBalance = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.status(200).json({
    success: true,
    tokens: user.tokens
  });
});

/**
 * @desc    Redeem tokens for rewards
 * @route   POST /api/rewards/redeem
 * @access  Private
 */
exports.redeemTokens = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { amount, reward } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Check if user has enough tokens
  if (user.tokens < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient token balance',
      newBalance: user.tokens
    });
  }
  
  // Deduct tokens
  user.tokens -= amount;
  await user.save();
  
  // In a real application, this would trigger a reward fulfillment process
  
  res.status(200).json({
    success: true,
    message: `Successfully redeemed ${amount} tokens for ${reward}`,
    newBalance: user.tokens
  });
});
