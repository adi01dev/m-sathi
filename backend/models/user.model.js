
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't include password in query results by default
  },
  occupation: {
    type: String,
    required: true,
    enum: ['student', 'professional', 'other']
  },
  healthStatus: {
    type: String,
    maxlength: 200
  },
  goals: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  streak: {
    type: Number,
    default: 0
  },
  plantLevel: {
    type: String,
    enum: ['seed', 'sprout', 'leaf', 'flower', 'tree'],
    default: 'seed'
  },
  lastCheckIn: {
    type: Date
  },
  tokens: {
    type: Number,
    default: 0
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup'
  }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT token for auth
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Match entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update streak and plant level based on check-ins
userSchema.methods.updateStreak = function(checkInDate) {
  const today = new Date();
  const lastCheckIn = this.lastCheckIn ? new Date(this.lastCheckIn) : null;
  
  // If this is the first check-in or it's been more than 2 days since last check-in
  if (!lastCheckIn || (today - lastCheckIn) / (1000 * 60 * 60 * 24) > 2) {
    this.streak = 1;
  } 
  // If last check-in was yesterday or earlier today
  else if ((today - lastCheckIn) / (1000 * 60 * 60 * 24) < 2) {
    // Only increment if it's a different day
    if (today.getDate() !== lastCheckIn.getDate() || 
        today.getMonth() !== lastCheckIn.getMonth() || 
        today.getFullYear() !== lastCheckIn.getFullYear()) {
      this.streak += 1;
    }
  }
  
  // Update plant level based on streak
  if (this.streak >= 14) {
    this.plantLevel = 'tree';
  } else if (this.streak >= 7) {
    this.plantLevel = 'flower';
  } else if (this.streak >= 3) {
    this.plantLevel = 'leaf';
  } else if (this.streak >= 1) {
    this.plantLevel = 'sprout';
  } else {
    this.plantLevel = 'seed';
  }
  
  // Update last check-in date
  this.lastCheckIn = checkInDate || today;
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
