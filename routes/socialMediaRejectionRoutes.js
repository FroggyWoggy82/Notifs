/**
 * Social Media Rejection Habit Routes
 * 
 * These routes provide special handling for the Social Media Rejection habit
 * to ensure its level is properly saved and retrieved.
 */

const express = require('express');
const router = express.Router();
const socialMediaRejectionController = require('../controllers/socialMediaRejectionController');

// Get the Social Media Rejection habit data
router.get('/social-media-rejection', socialMediaRejectionController.getSocialMediaRejectionHabit);

// Record a completion for the Social Media Rejection habit
router.post('/social-media-rejection/complete', socialMediaRejectionController.recordSocialMediaRejectionCompletion);

module.exports = router;
