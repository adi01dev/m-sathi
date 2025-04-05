
const Joi = require('joi');
const { AppError } = require('./error.middleware');

/**
 * Validate request body against a Joi schema
 */
exports.validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(errorMessage, 400));
    }
    
    next();
  };
};

// User registration validation schema
exports.registerSchema = Joi.object({
  name: Joi.string().required().min(3).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  occupation: Joi.string().valid('student', 'professional', 'other').required(),
  healthStatus: Joi.string().max(200),
  goals: Joi.array().items(Joi.string())
});

// User login validation schema
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Mood entry validation schema
exports.moodSchema = Joi.object({
  moodScore: Joi.number().integer().min(1).max(10).required(),
  moodLabel: Joi.string().valid('joyful', 'happy', 'calm', 'relaxed', 'neutral', 'anxious', 'stressed', 'sad', 'depressed').required(),
  transcription: Joi.string(),
  sentimentAnalysis: Joi.object({
    score: Joi.number(),
    label: Joi.string(),
    emotions: Joi.object()
  })
});

// Community message validation schema
exports.messageSchema = Joi.object({
  content: Joi.string().required().max(500),
  groupId: Joi.string().required()
});

// Token redemption validation schema
exports.redeemSchema = Joi.object({
  amount: Joi.number().integer().required().min(1),
  reward: Joi.string().required()
});
