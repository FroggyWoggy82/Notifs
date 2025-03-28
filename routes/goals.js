// routes/goals.js
const express = require('express');
const db = require('../db'); // Adjust path if needed
const router = express.Router();

// --- Helper function to build the tree ---
function buildGoalTree(goals) {
    const map = {};
    const roots = [];

    // First pass: Create a map of nodes
    goals.forEach(goal => {
        map[goal.id] = { ...goal, children: [] }; // Copy goal and add children array
    });

    // Second pass: Build the tree structure
    goals.forEach(goal => {
        const node = map[goal.id];
        if (goal.parent_id !== null && map[goal.parent_id]) {
            // It's a child, add it to the parent's children array
            map[goal.parent_id].children.push(node);
        } else {
            // It's a root node
            roots.push(node);
        }
    });
    return roots; // Return only the root nodes
}
// --- ---

// GET /api/goals - Fetch the entire goal tree
router.get('/', async (req, res) => {
    try {
        // Fetch all goals, ordered to potentially help tree building
        const result = await db.query('SELECT * FROM goals ORDER BY parent_id ASC NULLS FIRST, id ASC');
        const tree = buildGoalTree(result.rows);
        res.json(tree);
    } catch (err) {
        console.error('Error fetching goals:', err);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// POST /api/goals - Create a new goal
router.post('/', async (req, res) => {
    const { text, parentId } = req.body; // parentId might be null for root goals

    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Goal text cannot be empty' });
    }

    try {
        const result = await db.query(
            'INSERT INTO goals (text, parent_id) VALUES ($1, $2) RETURNING *',
            [text.trim(), parentId] // Use null if parentId is undefined/null
        );
        // Return the newly created goal object (including its ID)
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating goal:', err);
        // Add more specific error handling if needed (e.g., foreign key constraint)
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// DELETE /api/goals/:id - Delete a goal (and its children via CASCADE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) { // Basic validation for integer ID
         return res.status(400).json({ error: 'Invalid goal ID format' });
    }

    try {
        const result = await db.query('DELETE FROM goals WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.status(200).json({ message: `Goal ${id} deleted successfully`, id: parseInt(id) }); // Send back ID for client confirmation
    } catch (err) {
        console.error(`Error deleting goal ${id}:`, err);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

module.exports = router;