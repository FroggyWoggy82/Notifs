const express = require('express');
const router = express.Router();
const db = require('../utils/db');

/**
 * @swagger
 * /api/calorie-targets/calorie:
 *   post:
 *     summary: Save calorie target only
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               daily_target:
 *                 type: integer
 *               protein_target:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Calorie target saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/calorie', async (req, res) => {
    try {
        const { user_id, daily_target, protein_target } = req.body;
        console.log(`Received POST /api/calorie-targets/calorie: user_id=${user_id}, daily_target=${daily_target}, protein_target=${protein_target}`);

        // Validate inputs
        if (!user_id || !daily_target) {
            return res.status(400).json({ error: 'User ID and daily target are required' });
        }

        const userIdNum = parseInt(user_id, 10);
        const dailyTargetNum = parseInt(daily_target, 10);
        const proteinTargetNum = protein_target ? parseInt(protein_target, 10) : null;

        if (isNaN(userIdNum) || isNaN(dailyTargetNum) || dailyTargetNum < 500 || dailyTargetNum > 10000) {
            return res.status(400).json({ error: 'Invalid user ID or daily target' });
        }

        if (proteinTargetNum !== null && (isNaN(proteinTargetNum) || proteinTargetNum < 20 || proteinTargetNum > 500)) {
            return res.status(400).json({ error: 'Invalid protein target' });
        }

        // Insert the new calorie target
        const result = await db.query(
            'INSERT INTO calorie_targets (user_id, daily_target, protein_target, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [userIdNum, dailyTargetNum, proteinTargetNum]
        );

        res.status(201).json({
            id: result.rows[0].id,
            user_id: result.rows[0].user_id,
            daily_target: result.rows[0].daily_target,
            protein_target: result.rows[0].protein_target,
            updated_at: result.rows[0].updated_at
        });
    } catch (error) {
        console.error('Error saving calorie target:', error);
        res.status(500).json({ error: 'Server error saving calorie target' });
    }
});

/**
 * @swagger
 * /api/calorie-targets/protein:
 *   post:
 *     summary: Save protein target only
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               daily_target:
 *                 type: integer
 *               protein_target:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Protein target saved
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/protein', async (req, res) => {
    try {
        const { user_id, daily_target, protein_target } = req.body;
        console.log(`Received POST /api/calorie-targets/protein: user_id=${user_id}, daily_target=${daily_target}, protein_target=${protein_target}`);

        // Validate inputs
        if (!user_id || !protein_target) {
            return res.status(400).json({ error: 'User ID and protein target are required' });
        }

        const userIdNum = parseInt(user_id, 10);
        const dailyTargetNum = daily_target ? parseInt(daily_target, 10) : 2000; // Default to 2000 if not provided
        const proteinTargetNum = parseInt(protein_target, 10);

        if (isNaN(userIdNum) || isNaN(proteinTargetNum) || proteinTargetNum < 20 || proteinTargetNum > 500) {
            return res.status(400).json({ error: 'Invalid user ID or protein target' });
        }

        if (isNaN(dailyTargetNum) || dailyTargetNum < 500 || dailyTargetNum > 10000) {
            return res.status(400).json({ error: 'Invalid daily target' });
        }

        // Insert the new protein target
        const result = await db.query(
            'INSERT INTO calorie_targets (user_id, daily_target, protein_target, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [userIdNum, dailyTargetNum, proteinTargetNum]
        );

        res.status(201).json({
            id: result.rows[0].id,
            user_id: result.rows[0].user_id,
            daily_target: result.rows[0].daily_target,
            protein_target: result.rows[0].protein_target,
            updated_at: result.rows[0].updated_at
        });
    } catch (error) {
        console.error('Error saving protein target:', error);
        res.status(500).json({ error: 'Server error saving protein target' });
    }
});

module.exports = router;
