
const express = require('express');
const router = express.Router();
const { generateWeeklyReport, getReports } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

// Generate a weekly report
router.post('/generate', protect, generateWeeklyReport);

// Get user's reports
router.get('/', protect, getReports);

module.exports = router;
