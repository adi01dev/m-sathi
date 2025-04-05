
const express = require('express');
const router = express.Router();
const { getRecommendations, markCompleted } = require('../controllers/recommendation.controller');
const { protect } = require('../middleware/auth.middleware');

// Get recommendations based on mood
router.get('/', protect, getRecommendations);

// Mark a recommendation as completed
router.post('/:id/complete', protect, markCompleted);

module.exports = router;
