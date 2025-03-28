// routes/goals.js
const express = require('express');
const db = require('../db'); // Adjust path if needed
const router = express.Router();

// --- Helper function to build the tree ---
function buildGoalTree(goals) {
    console.log('--- buildGoalTree START ---'); // Log start
    console.log('Raw goals received from DB:', goals); // Log raw data

    const map = {};
    const roots = [];

    // First pass: Create a map of nodes
    goals.forEach(goal => {
        // Log each goal being added to map
        console.log(`Mapping goal ${goal.id} ('${goal.text}')`);
        map[goal.id] = { ...goal, children: [] };
    });
    console.log('Map created:', map); // Log the map after first pass

    // Second pass: Build the tree structure
    console.log('Starting tree build (second pass)...');
    goals.forEach(goal => {
        const node = map[goal.id];
        // Log which node is being processed for parenting
        console.log(`Processing node ${node.id} for parenting. Parent ID: ${goal.parent_id}`);

        if (goal.parent_id !== null && map[goal.parent_id]) {
            // Log when a child IS being added
            console.log(`  -> Found parent ${goal.parent_id} in map. Adding node ${node.id} to parent's children.`);
            map[goal.parent_id].children.push(node);
        } else if (goal.parent_id !== null && !map[goal.parent_id]) {
            // Log if the parent ID exists but WASN'T in the map (shouldn't happen with current query)
             console.warn(`  -> WARNING: Parent ID ${goal.parent_id} specified for node ${node.id}, but parent not found in map!`);
        }
         else {
            // Log when a root node is identified
            console.log(`  -> Node ${node.id} is a root node (parent_id is null). Adding to roots.`);
            roots.push(node);
        }
    });

    console.log('Tree build complete. Roots:', JSON.stringify(roots, null, 2)); // Log the final structure
    console.log('--- buildGoalTree END ---'); // Log end
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