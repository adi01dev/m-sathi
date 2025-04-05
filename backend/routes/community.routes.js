
const express = require('express');
const router = express.Router();
const { getGroups, joinGroup, getMessages, sendMessage } = require('../controllers/community.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest, messageSchema } = require('../middleware/validation.middleware');

// Get all community groups
router.get('/groups', protect, getGroups);

// Join a community group
router.post('/groups/:id/join', protect, joinGroup);

// Get messages for a group
router.get('/groups/:id/messages', protect, getMessages);

// Send a message to a group
router.post('/messages', protect, validateRequest(messageSchema), sendMessage);

module.exports = router;
