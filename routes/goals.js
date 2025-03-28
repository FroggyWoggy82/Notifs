// routes/goals.js
const express = require('express');
const db = require('../db'); // Adjust path if needed
const router = express.Router();

// --- Helper function to build the tree (REVISED VERSION) ---
function buildGoalTree(goals) {
    console.log('--- buildGoalTree START ---');
    console.log('Raw goals received from DB:', goals);

    const map = {}; // Use object for faster lookups by id

    // 1. Create nodes in the map, adding a children array
    goals.forEach(goal => {
        console.log(`Mapping goal ${goal.id} ('${goal.text}')`);
        map[goal.id] = {
            ...goal, // Copy all properties from the goal row
            children: [] // Add an empty children array
        };
    });
     console.log('Map created:', map);

    // 2. Link children to parents using the map
    console.log('Linking children to parents...');
    goals.forEach(goal => {
        // Check if this goal has a parent AND if that parent exists in our map
        if (goal.parent_id !== null && map[goal.parent_id]) {
            console.log(`  -> Linking child ${goal.id} to parent ${goal.parent_id}`);
            // Push the child node (retrieved from map) onto parent's children array
            map[goal.parent_id].children.push(map[goal.id]);
        } else if (goal.parent_id !== null && !map[goal.parent_id]) {
             // This case should be rare if all goals are fetched, but good to log
             console.warn(`  -> WARNING: Parent ID ${goal.parent_id} specified for node ${goal.id}, but parent not found in map!`);
        }
    });

    // 3. Find the root nodes (those whose parent_id is null) by filtering the map's values
    const roots = Object.values(map).filter(node => {
        const isRoot = node.parent_id === null;
        if (isRoot) {
            console.log(`Identified root node: ${node.id}`);
        }
        return isRoot;
    });

    console.log('Tree build complete. Roots:', JSON.stringify(roots, null, 2)); // Log final roots
    console.log('--- buildGoalTree END ---');
    return roots;
}
// --- ---

// GET /api/goals - Fetch the entire goal tree
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM goals ORDER BY parent_id ASC NULLS FIRST, id ASC');
        const tree = buildGoalTree(result.rows);

        // --- ADD CACHE-CONTROL HEADERS ---
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache'); // For older HTTP/1.0 caches
        res.setHeader('Expires', '0'); // Proxies
        // --- ---

        res.json(tree); // Send the data AFTER setting headers

    } catch (err) {
        console.error('Error fetching goals:', err);
        // Add cache control even on error? Maybe not necessary but doesn't hurt.
        res.setHeader('Cache-Control', 'no-store');
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
            [text.trim(), parentId === "" ? null : parentId] // Ensure empty string parentId becomes null
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

    // Basic validation: check if id is a positive integer string
    if (!/^[1-9]\d*$/.test(id)) {
         return res.status(400).json({ error: 'Invalid goal ID format' });
    }

    try {
        const result = await db.query('DELETE FROM goals WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            // If no rows were deleted, the goal wasn't found
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Send back the ID of the deleted goal for confirmation
        res.status(200).json({ message: `Goal ${id} deleted successfully`, id: parseInt(id) });
    } catch (err) {
        console.error(`Error deleting goal ${id}:`, err);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

module.exports = router;