
const express = require('express');
const router = express.Router();
const { recordMood, getMoodHistory, analyzeSentiment } = require('../controllers/mood.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest, moodSchema } = require('../middleware/validation.middleware');
const multer = require('multer');

// Set up multer for voice recording uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Record a new mood entry
router.post('/', protect, validateRequest(moodSchema), recordMood);

// Get mood history
router.get('/history', protect, getMoodHistory);

// Analyze sentiment from voice recording
router.post('/analyze', protect, upload.single('audio'), analyzeSentiment);

module.exports = router;
