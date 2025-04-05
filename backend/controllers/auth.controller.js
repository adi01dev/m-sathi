
const User = require('../models/user.model');
const { asyncHandler, AppError } = require('../middleware/error.middleware');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, occupation, healthStatus, goals } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('User already exists with that email', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    occupation,
    healthStatus,
    goals: goals || []
  });

  // Create token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      occupation: user.occupation,
      healthStatus: user.healthStatus,
      goals: user.goals,
      streak: user.streak,
      plantLevel: user.plantLevel,
      createdAt: user.createdAt,
      tokens: user.tokens
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      occupation: user.occupation,
      healthStatus: user.healthStatus,
      goals: user.goals,
      streak: user.streak,
      plantLevel: user.plantLevel,
      createdAt: user.createdAt,
      tokens: user.tokens
    }
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  // User is already added to req by auth middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      occupation: user.occupation,
      healthStatus: user.healthStatus,
      goals: user.goals,
      streak: user.streak,
      plantLevel: user.plantLevel,
      createdAt: user.createdAt,
      tokens: user.tokens
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, healthStatus, goals } = req.body;
  const userId = req.user._id;

  // Build update object with only allowed fields
  const updateData = {};
  if (name) updateData.name = name;
  if (healthStatus) updateData.healthStatus = healthStatus;
  if (goals) updateData.goals = goals;

  // Update user
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      occupation: user.occupation,
      healthStatus: user.healthStatus,
      goals: user.goals,
      streak: user.streak,
      plantLevel: user.plantLevel,
      createdAt: user.createdAt,
      tokens: user.tokens
    }
  });
});
