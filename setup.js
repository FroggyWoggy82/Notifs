/**
 * Setup script to ensure all required files exist
 * This script runs before the server starts and creates any missing files
 */

const fs = require('fs');
const path = require('path');

console.log('Running setup script to check for missing files...');

// Define the files that should exist
const requiredFiles = [
    {
        path: 'routes/weight.js',
        content: `const express = require('express');
const WeightController = require('../controllers/weightController');

const router = express.Router();

/**
 * @swagger
 * /api/weight/goal:
 *   get:
 *     summary: Get weight goal for a user
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: User ID (defaults to 1)
 *     responses:
 *       200:
 *         description: Weight goal data
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/goal', WeightController.getGoal);

/**
 * @swagger
 * /api/weight/goal:
 *   post:
 *     summary: Save weight goal for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetWeight:
 *                 type: number
 *               weeklyGain:
 *                 type: number
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Weight goal saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/goal', WeightController.saveGoal);

/**
 * @swagger
 * /api/weight/logs:
 *   get:
 *     summary: Get weight logs for a user
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: User ID (defaults to 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs to return (defaults to 30)
 *     responses:
 *       200:
 *         description: Weight logs data
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/logs', WeightController.getLogs);

/**
 * @swagger
 * /api/weight/log:
 *   post:
 *     summary: Save a weight log entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Weight log saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/log', WeightController.saveLog);

module.exports = router;`
    },
    {
        path: 'routes/weightRoutes.js',
        content: `const express = require('express');
const WeightController = require('../controllers/weightController');

const router = express.Router();

/**
 * @swagger
 * /api/weight/goal:
 *   get:
 *     summary: Get weight goal for a user
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: User ID (defaults to 1)
 *     responses:
 *       200:
 *         description: Weight goal data
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/goal', WeightController.getGoal);

/**
 * @swagger
 * /api/weight/goal:
 *   post:
 *     summary: Save weight goal for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetWeight:
 *                 type: number
 *               weeklyGain:
 *                 type: number
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Weight goal saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/goal', WeightController.saveGoal);

/**
 * @swagger
 * /api/weight/logs:
 *   get:
 *     summary: Get weight logs for a user
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: User ID (defaults to 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs to return (defaults to 30)
 *     responses:
 *       200:
 *         description: Weight logs data
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/logs', WeightController.getLogs);

/**
 * @swagger
 * /api/weight/log:
 *   post:
 *     summary: Save a weight log entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Weight log saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/log', WeightController.saveLog);

module.exports = router;`
    }
];

// Check each required file and create it if it doesn't exist
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file.path);
    const dirPath = path.dirname(filePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
        console.log(`Creating directory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Create file if it doesn't exist
    if (!fs.existsSync(filePath)) {
        console.log(`Creating file: ${filePath}`);
        fs.writeFileSync(filePath, file.content);
    } else {
        console.log(`File already exists: ${filePath}`);
    }
});

console.log('Setup script completed.');
