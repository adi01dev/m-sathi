
const express = require('express');
const router = express.Router();
const { getStreak, updateStreak } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Get user streak
router.get('/streak', protect, getStreak);

// Update user streak
router.post('/streak', protect, updateStreak);

module.exports = router;
