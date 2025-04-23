/**
 * Goal Controller
 * Handles HTTP requests and responses for goals
 */

const GoalModel = require('../models/goalModel');

/**
 * Get all goals as a hierarchical tree
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllGoals(req, res) {
    console.log("Received GET /api/goals request");
    try {
        const tree = await GoalModel.getAllGoals();
        
        // Set cache control headers to prevent stale data
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        res.json(tree);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.setHeader('Cache-Control', 'no-store');
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
}

/**
 * Create a new goal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createGoal(req, res) {
    const { text, parentId } = req.body;
    console.log(`Received POST /api/goals request: text='${text}', parentId=${parentId}`);
    
    try {
        const goal = await GoalModel.createGoal(text, parentId);
        console.log(`Goal created successfully with ID: ${goal.id}`);
        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating goal:', error);
        
        if (error.message === 'Goal text cannot be empty') {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to create goal' });
    }
}

/**
 * Insert a new goal between a goal and its parent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function insertGoalBetween(req, res) {
    const { newGoalText, currentGoalId } = req.body;
    console.log(`Received POST /api/goals/insert-between: new text='${newGoalText}', currentGoalId=${currentGoalId}`);
    
    try {
        const goal = await GoalModel.insertGoalBetween(newGoalText, currentGoalId);
        console.log(`Goal inserted successfully with ID: ${goal.id}`);
        res.status(201).json(goal);
    } catch (error) {
        console.error('Error inserting goal between:', error);
        
        if (error.message.includes('cannot be empty') || 
            error.message.includes('required') ||
            error.message.includes('not found') ||
            error.message.includes('Cannot insert parent above a root goal')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to insert goal' });
    }
}

/**
 * Delete a goal and promote its children to its parent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteGoalAndPromoteChildren(req, res) {
    const { id: targetId } = req.params;
    console.log(`Received DELETE /api/goals/promote/${targetId} request`);
    
    try {
        const result = await GoalModel.deleteGoalAndPromoteChildren(targetId);
        console.log(`Goal ${targetId} deleted and children promoted successfully.`);
        res.status(200).json({ 
            message: `Goal ${targetId} deleted and children promoted successfully`, 
            id: result.id 
        });
    } catch (error) {
        console.error(`Error deleting goal ${targetId} with promotion:`, error);
        
        if (error.message.includes('Invalid goal ID format') || 
            error.message.includes('not found')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to delete goal' });
    }
}

/**
 * Delete a goal and all its descendants
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteGoalCascade(req, res) {
    const { id } = req.params;
    console.log(`Received DELETE /api/goals/${id} request (Cascade)`);
    
    try {
        const result = await GoalModel.deleteGoalCascade(id);
        console.log(`Cascade Delete: Goal ${id} deleted successfully.`);
        res.status(200).json({ 
            message: `Goal ${id} and descendants deleted successfully`, 
            id: result.id 
        });
    } catch (error) {
        console.error(`Error during cascade delete for goal ${id}:`, error);
        
        if (error.message.includes('Invalid goal ID format')) {
            return res.status(400).json({ error: error.message });
        }
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to delete goal' });
    }
}

/**
 * Update a goal's text
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateGoal(req, res) {
    const { id } = req.params;
    const { text } = req.body;
    console.log(`Received PUT /api/goals/${id} request: text='${text}'`);
    
    try {
        const goal = await GoalModel.updateGoal(id, text);
        console.log(`Goal ${id} updated successfully.`);
        res.status(200).json(goal);
    } catch (error) {
        console.error(`Error updating goal ${id}:`, error);
        
        if (error.message.includes('Invalid goal ID format') || 
            error.message.includes('cannot be empty')) {
            return res.status(400).json({ error: error.message });
        }
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to update goal' });
    }
}

module.exports = {
    getAllGoals,
    createGoal,
    insertGoalBetween,
    deleteGoalAndPromoteChildren,
    deleteGoalCascade,
    updateGoal
};
