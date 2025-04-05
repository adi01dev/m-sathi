
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['music', 'video', 'activity', 'breathing', 'meditation', 'affirmation', 'journaling']
  },
  link: {
    type: String
  },
  imageUrl: {
    type: String
  },
  forMoods: {
    type: [String],
    required: true,
    enum: ['joyful', 'happy', 'calm', 'relaxed', 'neutral', 'anxious', 'stressed', 'sad', 'depressed']
  },
  tags: {
    type: [String],
    default: []
  },
  duration: {
    type: String
  },
  // For user-specific recommendation tracking
  userCompletions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Index for efficient querying by mood
recommendationSchema.index({ forMoods: 1 });

// Mark a recommendation as completed by a user
recommendationSchema.methods.markCompleted = async function(userId) {
  // Check if already completed by this user
  const alreadyCompleted = this.userCompletions.some(completion => 
    completion.userId.toString() === userId.toString()
  );
  
  if (!alreadyCompleted) {
    this.userCompletions.push({ userId });
    return await this.save();
  }
  
  return this;
};

// Static method to find recommendations for a specific mood
recommendationSchema.statics.findForMood = async function(moodLabel, limit = 5) {
  return this.find({
    forMoods: moodLabel
  }).limit(limit);
};

// Static method to get completed recommendations for a user
recommendationSchema.statics.findCompletedByUser = async function(userId) {
  return this.find({
    'userCompletions.userId': userId
  });
};

module.exports = mongoose.model('Recommendation', recommendationSchema);
