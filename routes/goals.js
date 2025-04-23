// routes/goals.js
const express = require('express');
const db = require('../utils/db');
const router = express.Router();

// --- Helper function to build the tree (REVISED VERSION) ---
function buildGoalTree(goals) {
    console.log('--- buildGoalTree START ---');
    // console.log('Raw goals received from DB:', goals); // Can be verbose

    const map = {}; // Use object for faster lookups by id

    // 1. Create nodes in the map, adding a children array
    goals.forEach(goal => {
        // console.log(`Mapping goal ${goal.id} ('${goal.text}')`);
        map[goal.id] = {
            ...goal, // Copy all properties from the goal row
            children: [] // Add an empty children array
        };
    });
     // console.log('Map created:', Object.keys(map)); // Log keys only for brevity

    // 2. Link children to parents using the map
    // console.log('Linking children to parents...');
    goals.forEach(goal => {
        // Check if this goal has a parent AND if that parent exists in our map
        if (goal.parent_id !== null && map[goal.parent_id]) {
            // console.log(`  -> Linking child ${goal.id} to parent ${goal.parent_id}`);
            map[goal.parent_id].children.push(map[goal.id]);
        } else if (goal.parent_id !== null && !map[goal.parent_id]) {
             console.warn(`  -> WARNING: Parent ID ${goal.parent_id} specified for node ${goal.id}, but parent not found in map!`);
        }
    });

    // 3. Find the root nodes (those whose parent_id is null) by filtering the map's values
    const roots = Object.values(map).filter(node => {
        const isRoot = node.parent_id === null;
        // if (isRoot) console.log(`Identified root node: ${node.id}`);
        return isRoot;
    });

    // console.log('Tree build complete. Roots:', JSON.stringify(roots, null, 2)); // Can be verbose
    console.log(`Tree build complete. Found ${roots.length} root nodes.`);
    console.log('--- buildGoalTree END ---');
    return roots;
}
// --- ---

// GET /api/goals - Fetch the entire goal tree (With cache control)
router.get('/', async (req, res) => {
    console.log("Received GET /api/goals request"); // Log request
    try {
        const result = await db.query('SELECT * FROM goals ORDER BY parent_id ASC NULLS FIRST, id ASC');
        const tree = buildGoalTree(result.rows);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.json(tree);
    } catch (err) {
        console.error('Error fetching goals:', err);
        res.setHeader('Cache-Control', 'no-store');
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// POST /api/goals - Create a new goal (child or root)
router.post('/', async (req, res) => {
    const { text, parentId } = req.body;
    console.log(`Received POST /api/goals request: text='${text}', parentId=${parentId}`); // Log request
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Goal text cannot be empty' });
    }
    try {
        const result = await db.query(
            'INSERT INTO goals (text, parent_id) VALUES ($1, $2) RETURNING *',
            [text.trim(), parentId === "" || parentId === undefined ? null : parentId] // Handle null/empty parentId
        );
        console.log(`Goal created successfully with ID: ${result.rows[0].id}`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating goal:', err);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// POST /api/goals/insert-between - Insert parent between nodes
router.post('/insert-between', async (req, res) => {
    const { newGoalText, currentGoalId } = req.body;
    console.log(`Received POST /api/goals/insert-between: new text='${newGoalText}', currentGoalId=${currentGoalId}`); // Log request

    // --- Validation ---
    if (!newGoalText || newGoalText.trim() === '') { return res.status(400).json({ error: 'New goal text cannot be empty' }); }
    if (!currentGoalId || !Number.isInteger(currentGoalId) || currentGoalId <= 0) { return res.status(400).json({ error: 'Valid currentGoalId (node below insertion) is required' }); }

    // --- Database Transaction ---
    const client = await db.pool.connect();
    console.log('Insert-between: DB client acquired');
    try {
        await client.query('BEGIN');
        console.log('Insert-between: BEGIN transaction');

        // 1. Get original parent ID of the current node
        console.log(`Insert-between: Fetching parent_id for currentGoalId=${currentGoalId}`);
        const currentGoalResult = await client.query('SELECT parent_id FROM goals WHERE id = $1', [currentGoalId]);
        if (currentGoalResult.rows.length === 0) {
            console.error(`Insert-between: Current goal ${currentGoalId} not found.`);
            await client.query('ROLLBACK'); return res.status(404).json({ error: 'The goal you selected to insert above was not found.' });
        }
        const originalParentId = currentGoalResult.rows[0].parent_id;
        console.log(`Insert-between: Original parent ID is: ${originalParentId}`);

        // 2. Check if trying to insert above a root node
        if (originalParentId === null) {
            console.error(`Insert-between: Attempted to insert above root node ${currentGoalId}.`);
            await client.query('ROLLBACK'); return res.status(400).json({ error: 'Cannot insert parent above a root goal' });
        }

        // 3. Insert the NEW goal, linking it to the original parent
        console.log(`Insert-between: Inserting new goal text='${newGoalText}', parent_id=${originalParentId}`);
        const insertResult = await client.query(
            'INSERT INTO goals (text, parent_id) VALUES ($1, $2) RETURNING id', [newGoalText.trim(), originalParentId]
        );
        const newNodeId = insertResult.rows[0].id;
        console.log(`Insert-between: New goal inserted ID: ${newNodeId}`);

        // 4. Update the CURRENT goal to link it to the NEW node
        console.log(`Insert-between: Updating current goal ${currentGoalId} -> parent_id=${newNodeId}`);
        const updateResult = await client.query(
            'UPDATE goals SET parent_id = $1 WHERE id = $2', [newNodeId, currentGoalId]
        );
         if (updateResult.rowCount === 0) {
             console.error(`Insert-between: Failed update current goal ${currentGoalId}. Rollback.`);
             await client.query('ROLLBACK'); return res.status(500).json({ error: 'Failed to update existing goal link.' });
         }
         console.log(`Insert-between: Current goal ${currentGoalId} updated.`);

        // 5. Commit Transaction
        await client.query('COMMIT');
        console.log('Insert-between: COMMIT transaction');
        res.status(201).json({ message: 'Goal inserted successfully', newNodeId: newNodeId });

    } catch (err) {
        // 6. Rollback on any error
        console.error('Error during insert-between transaction, rolling back:', err);
        await client.query('ROLLBACK'); console.log('Insert-between: ROLLBACK transaction');
        res.status(500).json({ error: 'Failed to insert goal due to server error' });
    } finally {
        // 7. ALWAYS release the client
        client.release(); console.log('Insert-between: DB client released');
    }
});


// DELETE /api/goals/promote/:id - Delete node and promote children
router.delete('/promote/:id', async (req, res) => {
    const { id: targetId } = req.params; // ID of the goal to delete
    console.log(`Received DELETE /api/goals/promote/${targetId} request`); // Log request

    // Validate ID
     if (!/^[1-9]\d*$/.test(targetId)) { return res.status(400).json({ error: 'Invalid goal ID format' }); }

    const client = await db.pool.connect();
    console.log('Delete/Promote: DB client acquired');
    try {
        await client.query('BEGIN');
        console.log('Delete/Promote: BEGIN transaction');

        // 1. Get the target node's parent_id
        console.log(`Delete/Promote: Fetching parent_id for targetId=${targetId}`);
        const targetGoalResult = await client.query('SELECT parent_id FROM goals WHERE id = $1', [targetId]);
        if (targetGoalResult.rows.length === 0) {
            console.log(`Delete/Promote: Target goal ${targetId} not found.`);
            await client.query('ROLLBACK'); return res.status(404).json({ error: 'Goal to delete not found.' });
        }
        const targetParentId = targetGoalResult.rows[0].parent_id;
        console.log(`Delete/Promote: Target node's parent ID is: ${targetParentId}`);

        // 2. Check if target is a root node
        if (targetParentId === null) {
            console.log(`Delete/Promote: Attempted on root node ${targetId}. Disallowed.`);
            await client.query('ROLLBACK'); return res.status(400).json({ error: 'Cannot promote children of a root goal' });
        }

        // 3. Update the direct children of the target node
        console.log(`Delete/Promote: Updating children of ${targetId} -> new parent_id=${targetParentId}`);
        const updateChildrenResult = await client.query(
            'UPDATE goals SET parent_id = $1 WHERE parent_id = $2', [targetParentId, targetId]
        );
        console.log(`Delete/Promote: Updated ${updateChildrenResult.rowCount} child nodes.`);

        // 4. Delete the target node itself
        console.log(`Delete/Promote: Deleting target node ${targetId}`);
        const deleteResult = await client.query('DELETE FROM goals WHERE id = $1', [targetId]);
        if (deleteResult.rowCount === 0) {
             console.error(`Delete/Promote: Failed to delete target node ${targetId}. Rollback.`);
             await client.query('ROLLBACK'); return res.status(500).json({ error: 'Failed to delete target goal after updating children.' });
         }
        console.log(`Delete/Promote: Target node ${targetId} deleted.`);

        // 5. Commit Transaction
        await client.query('COMMIT');
        console.log('Delete/Promote: COMMIT transaction');
        res.status(200).json({ message: `Goal ${targetId} deleted and children promoted successfully` });

    } catch (err) {
        // 6. Rollback on any error
        console.error(`Error during delete/promote transaction for ID ${targetId}, rolling back:`, err);
        await client.query('ROLLBACK'); console.log('Delete/Promote: ROLLBACK transaction');
        res.status(500).json({ error: 'Failed to delete/promote goal due to server error' });
    } finally {
        // 7. ALWAYS release the client
        client.release(); console.log('Delete/Promote: DB client released');
    }
});


// DELETE /api/goals/:id - Cascade Delete (Deletes goal AND its children via DB constraint)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE /api/goals/${id} request (Cascade)`); // Log request
    if (!/^[1-9]\d*$/.test(id)) { return res.status(400).json({ error: 'Invalid goal ID format' }); }
    try {
        const result = await db.query('DELETE FROM goals WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            console.log(`Cascade Delete: Goal ${id} not found.`);
            return res.status(404).json({ error: 'Goal not found' });
        }
        console.log(`Cascade Delete: Goal ${id} deleted successfully.`);
        res.status(200).json({ message: `Goal ${id} and descendants deleted successfully`, id: parseInt(id) });
    } catch (err) {
        console.error(`Error during cascade delete for goal ${id}:`, err);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// PUT /api/goals/:id - Update goal text
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    console.log(`Received PUT /api/goals/${id} request: text='${text}'`); // Log request

    // Validate ID
    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ error: 'Invalid goal ID format' });
    }
    // Validate Text
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Goal text cannot be empty' });
    }

    try {
        const result = await db.query(
            'UPDATE goals SET text = $1 WHERE id = $2 RETURNING *',
            [text.trim(), id]
        );

        if (result.rowCount === 0) {
            console.log(`Update: Goal ${id} not found.`);
            return res.status(404).json({ error: 'Goal not found' });
        }

        console.log(`Goal ${id} updated successfully.`);
        res.status(200).json(result.rows[0]); // Return the updated goal object

    } catch (err) {
        console.error(`Error updating goal ${id}:`, err);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

module.exports = router; // Make sure router is exported