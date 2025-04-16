// Script to test creating a recurring task
const db = require('../utils/db');

async function testRecurringTaskCreation() {
    try {
        console.log('Testing recurring task creation...');
        
        // Create a new recurring task
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedTomorrow = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        // Create a task with only due_date set (no assigned_date)
        const result = await db.query(
            `INSERT INTO tasks (title, description, due_date, recurrence_type, recurrence_interval, is_complete)
             VALUES ($1, $2, $3, $4, $5, false) RETURNING *`,
            [
                'Test Recurring Task ' + new Date().toISOString(),
                'This is a test recurring task created to test the assigned_date trigger',
                formattedTomorrow,
                'weekly',
                1
            ]
        );
        
        const task = result.rows[0];
        console.log('Created task:', task);
        
        // Verify that assigned_date was automatically set equal to due_date
        if (task.assigned_date && task.assigned_date.toString() === task.due_date.toString()) {
            console.log('SUCCESS: assigned_date was automatically set equal to due_date!');
        } else {
            console.log('FAILURE: assigned_date was not set correctly!');
            console.log('assigned_date:', task.assigned_date);
            console.log('due_date:', task.due_date);
        }
        
    } catch (err) {
        console.error('Error testing recurring task creation:', err);
    } finally {
        process.exit();
    }
}

testRecurringTaskCreation();
