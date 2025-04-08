/**
 * Goal Model
 * Handles data operations for goals
 */

const db = require('../db');

/**
 * Build a hierarchical goal tree from flat database results
 * @param {Array} goals - Array of goal objects from database
 * @returns {Array} - Hierarchical tree of goals
 */
function buildGoalTree(goals) {
    console.log('--- buildGoalTree START ---');
    const map = {}; // Use object for faster lookups by id

    // 1. Create nodes in the map, adding a children array
    goals.forEach(goal => {
        map[goal.id] = {
            ...goal, // Copy all properties from the goal row
            children: [] // Add an empty children array
        };
    });

    // 2. Build the tree by adding children to their parents
    const tree = [];
    goals.forEach(goal => {
        // Current goal with its children array
        const node = map[goal.id];
        
        if (goal.parent_id === null) {
            // This is a root node, add to the tree
            tree.push(node);
        } else {
            // This is a child node, add to its parent's children array
            const parent = map[goal.parent_id];
            if (parent) {
                parent.children.push(node);
            } else {
                console.error(`Parent ID ${goal.parent_id} not found for goal ${goal.id}`);
                // Orphaned node, add to root level
                tree.push(node);
            }
        }
    });

    console.log(`--- buildGoalTree END: ${tree.length} root nodes ---`);
    return tree;
}

/**
 * Get all goals as a hierarchical tree
 * @returns {Promise<Array>} - Promise resolving to a hierarchical tree of goals
 */
async function getAllGoals() {
    const result = await db.query('SELECT * FROM goals ORDER BY parent_id ASC NULLS FIRST, id ASC');
    return buildGoalTree(result.rows);
}

/**
 * Create a new goal
 * @param {string} text - The goal text
 * @param {number|null} parentId - The parent goal ID, or null for root goals
 * @returns {Promise<Object>} - Promise resolving to the created goal
 */
async function createGoal(text, parentId) {
    if (!text || text.trim() === '') {
        throw new Error('Goal text cannot be empty');
    }
    
    const result = await db.query(
        'INSERT INTO goals (text, parent_id) VALUES ($1, $2) RETURNING *',
        [text.trim(), parentId === "" || parentId === undefined ? null : parentId]
    );
    
    return result.rows[0];
}

/**
 * Insert a new goal between a goal and its parent
 * @param {string} newGoalText - The text for the new goal
 * @param {number} currentGoalId - The ID of the goal below the insertion point
 * @returns {Promise<Object>} - Promise resolving to the created goal
 */
async function insertGoalBetween(newGoalText, currentGoalId) {
    if (!newGoalText || newGoalText.trim() === '') {
        throw new Error('New goal text cannot be empty');
    }
    
    if (!currentGoalId || !Number.isInteger(currentGoalId) || currentGoalId <= 0) {
        throw new Error('Valid currentGoalId (node below insertion) is required');
    }
    
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // 1. Get the current goal to find its parent
        const currentGoalResult = await client.query(
            'SELECT parent_id FROM goals WHERE id = $1',
            [currentGoalId]
        );
        
        if (currentGoalResult.rows.length === 0) {
            throw new Error(`Goal with ID ${currentGoalId} not found`);
        }
        
        const originalParentId = currentGoalResult.rows[0].parent_id;
        
        // 2. Check if trying to insert above a root node
        if (originalParentId === null) {
            throw new Error('Cannot insert parent above a root goal');
        }
        
        // 3. Insert the NEW goal, linking it to the original parent
        const insertResult = await client.query(
            'INSERT INTO goals (text, parent_id) VALUES ($1, $2) RETURNING id',
            [newGoalText.trim(), originalParentId]
        );
        
        const newGoalId = insertResult.rows[0].id;
        
        // 4. Update the CURRENT goal to point to the NEW goal as its parent
        await client.query(
            'UPDATE goals SET parent_id = $1 WHERE id = $2',
            [newGoalId, currentGoalId]
        );
        
        // 5. Get the complete new goal data
        const newGoalResult = await client.query(
            'SELECT * FROM goals WHERE id = $1',
            [newGoalId]
        );
        
        await client.query('COMMIT');
        return newGoalResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Delete a goal and promote its children to its parent
 * @param {number} goalId - The ID of the goal to delete
 * @returns {Promise<Object>} - Promise resolving to the deleted goal ID
 */
async function deleteGoalAndPromoteChildren(goalId) {
    if (!/^[1-9]\d*$/.test(goalId)) {
        throw new Error('Invalid goal ID format');
    }
    
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // 1. Get the goal to be deleted and its parent ID
        const goalResult = await client.query(
            'SELECT parent_id FROM goals WHERE id = $1',
            [goalId]
        );
        
        if (goalResult.rows.length === 0) {
            throw new Error(`Goal with ID ${goalId} not found`);
        }
        
        const parentId = goalResult.rows[0].parent_id;
        
        // 2. Update all children to point to the grandparent
        await client.query(
            'UPDATE goals SET parent_id = $1 WHERE parent_id = $2',
            [parentId, goalId]
        );
        
        // 3. Delete the goal
        const deleteResult = await client.query(
            'DELETE FROM goals WHERE id = $1 RETURNING id',
            [goalId]
        );
        
        await client.query('COMMIT');
        return { id: parseInt(goalId) };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Delete a goal and all its descendants
 * @param {number} goalId - The ID of the goal to delete
 * @returns {Promise<Object>} - Promise resolving to the deleted goal ID
 */
async function deleteGoalCascade(goalId) {
    if (!/^[1-9]\d*$/.test(goalId)) {
        throw new Error('Invalid goal ID format');
    }
    
    const result = await db.query(
        'DELETE FROM goals WHERE id = $1 RETURNING id',
        [goalId]
    );
    
    if (result.rowCount === 0) {
        throw new Error(`Goal with ID ${goalId} not found`);
    }
    
    return { id: parseInt(goalId) };
}

/**
 * Update a goal's text
 * @param {number} goalId - The ID of the goal to update
 * @param {string} text - The new text for the goal
 * @returns {Promise<Object>} - Promise resolving to the updated goal
 */
async function updateGoal(goalId, text) {
    if (!/^[1-9]\d*$/.test(goalId)) {
        throw new Error('Invalid goal ID format');
    }
    
    if (!text || text.trim() === '') {
        throw new Error('Goal text cannot be empty');
    }
    
    const result = await db.query(
        'UPDATE goals SET text = $1 WHERE id = $2 RETURNING *',
        [text.trim(), goalId]
    );
    
    if (result.rowCount === 0) {
        throw new Error(`Goal with ID ${goalId} not found`);
    }
    
    return result.rows[0];
}

module.exports = {
    getAllGoals,
    createGoal,
    insertGoalBetween,
    deleteGoalAndPromoteChildren,
    deleteGoalCascade,
    updateGoal
};
