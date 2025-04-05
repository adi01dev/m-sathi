
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  moodLabel: {
    type: String,
    required: true,
    enum: ['joyful', 'happy', 'calm', 'relaxed', 'neutral', 'anxious', 'stressed', 'sad', 'depressed']
  },
  audioUrl: {
    type: String
  },
  transcription: {
    type: String
  },
  sentimentAnalysis: {
    score: Number,
    label: String,
    emotions: {
      type: Map,
      of: Number
    }
  }
});

// Index for efficient querying by user and date
moodSchema.index({ userId: 1, date: -1 });

// Static method to get mood history for a user
moodSchema.statics.getMoodHistory = async function(userId, days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    userId,
    date: { $gte: date }
  }).sort({ date: -1 });
};

// Static method to get average mood for a time period
moodSchema.statics.getAverageMood = async function(userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        averageMood: { $avg: '$moodScore' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return result.length ? result[0] : { averageMood: 0, count: 0 };
};

module.exports = mongoose.model('Mood', moodSchema);
