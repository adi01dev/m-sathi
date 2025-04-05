
const express = require('express');
const router = express.Router();
const { getTokenBalance, redeemTokens } = require('../controllers/reward.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest, redeemSchema } = require('../middleware/validation.middleware');

// Get token balance
router.get('/tokens', protect, getTokenBalance);

// Redeem tokens
router.post('/redeem', protect, validateRequest(redeemSchema), redeemTokens);

module.exports = router;
