
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser, updateProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest, registerSchema, loginSchema } = require('../middleware/validation.middleware');

// Register new user
router.post('/register', validateRequest(registerSchema), registerUser);

// Login user
router.post('/login', validateRequest(loginSchema), loginUser);

// Get current logged-in user
router.get('/me', protect, getCurrentUser);

// Update user profile
router.put('/profile', protect, updateProfile);

module.exports = router;
