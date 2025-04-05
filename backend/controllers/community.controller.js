
const { CommunityGroup, Message } = require('../models/community.model');
const User = require('../models/user.model');
const { asyncHandler, AppError } = require('../middleware/error.middleware');

/**
 * @desc    Get all community groups
 * @route   GET /api/community/groups
 * @access  Private
 */
exports.getGroups = asyncHandler(async (req, res) => {
  const groups = await CommunityGroup.find().sort({ memberCount: -1 });
  
  // Format response
  const formattedGroups = groups.map(group => ({
    id: group._id,
    name: group.name,
    description: group.description,
    category: group.category,
    memberCount: group.memberCount,
    imageUrl: group.imageUrl,
    latestActivity: group.latestActivity || group.createdAt
  }));
  
  res.status(200).json({
    success: true,
    count: formattedGroups.length,
    data: formattedGroups
  });
});

/**
 * @desc    Join a community group
 * @route   POST /api/community/groups/:id/join
 * @access  Private
 */
exports.joinGroup = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user._id;
  
  const group = await CommunityGroup.findById(groupId);
  
  if (!group) {
    throw new AppError('Community group not found', 404);
  }
  
  // Check if user is already a member
  if (group.members.includes(userId)) {
    return res.status(200).json({
      success: true,
      message: 'Already a member of this group'
    });
  }
  
  // Add user to group
  group.members.push(userId);
  await group.save();
  
  // Add group to user's groups
  const user = await User.findById(userId);
  if (!user.groups.includes(groupId)) {
    user.groups.push(groupId);
    await user.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Successfully joined group',
    group: {
      id: group._id,
      name: group.name,
      memberCount: group.members.length
    }
  });
});

/**
 * @desc    Get messages for a group
 * @route   GET /api/community/groups/:id/messages
 * @access  Private
 */
exports.getMessages = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user._id;
  
  // Check if group exists
  const group = await CommunityGroup.findById(groupId);
  if (!group) {
    throw new AppError('Community group not found', 404);
  }
  
  // Get messages
  const messages = await Message.find({ groupId })
    .sort({ timestamp: -1 })
    .limit(50)
    .populate('userId', 'name')
    .lean();
  
  // Format messages
  const formattedMessages = messages.map(message => ({
    id: message._id,
    groupId: message.groupId,
    userId: message.userId._id,
    userName: message.userId.name,
    content: message.content,
    timestamp: message.timestamp
  }));
  
  res.status(200).json({
    success: true,
    count: formattedMessages.length,
    data: formattedMessages
  });
});

/**
 * @desc    Send a message to a group
 * @route   POST /api/community/messages
 * @access  Private
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, groupId } = req.body;
  const userId = req.user._id;
  
  // Check if group exists
  const group = await CommunityGroup.findById(groupId);
  if (!group) {
    throw new AppError('Community group not found', 404);
  }
  
  // Check if user is a member
  if (!group.members.includes(userId)) {
    throw new AppError('You must be a member of the group to send messages', 403);
  }
  
  // Create message
  const message = await Message.create({
    groupId,
    userId,
    content
  });
  
  // Update group's latest activity
  group.latestActivity = new Date();
  await group.save();
  
  // Award tokens for community participation
  const user = await User.findById(userId);
  user.tokens += 2;
  await user.save();
  
  // Format response
  const formattedMessage = {
    id: message._id,
    groupId: message.groupId,
    userId: message.userId,
    userName: req.user.name,
    content: message.content,
    timestamp: message.timestamp
  };
  
  res.status(201).json({
    success: true,
    data: formattedMessage,
    tokens: user.tokens
  });
});
