
const mongoose = require('mongoose');

// Community Group Schema
const communityGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Add virtual for member count
communityGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Ensure virtuals are included in JSON
communityGroupSchema.set('toJSON', { virtuals: true });
communityGroupSchema.set('toObject', { virtuals: true });

// Message Schema
const messageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to get user info for message
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.userId);
      this._userName = user.name;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Add virtual for userName
messageSchema.virtual('userName').get(function() {
  return this._userName;
});

// Ensure virtuals are included in JSON
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

// Create models
const CommunityGroup = mongoose.model('CommunityGroup', communityGroupSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = {
  CommunityGroup,
  Message
};
