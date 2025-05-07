const express = require('express');
const router = express.Router();
const CustomGoalWeightController = require('../controllers/customGoalWeightController');

// Get all custom goal weights for a user
router.get('/', CustomGoalWeightController.getAll);

// Save a single custom goal weight
router.post('/', CustomGoalWeightController.save);

// Save multiple custom goal weights
router.post('/multiple', CustomGoalWeightController.saveMultiple);

// Delete a custom goal weight
router.delete('/:weekNumber', CustomGoalWeightController.delete);

// Delete all custom goal weights for a user
router.delete('/', CustomGoalWeightController.deleteAll);

module.exports = router;
