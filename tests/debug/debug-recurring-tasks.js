// Script to debug recurring tasks
const db = require('../utils/db');

async function debugRecurringTasks() {
    try {
        console.log('Debugging recurring tasks...');
        
        // Get all recurring tasks
        const result = await db.query(`
            SELECT id, title, assigned_date, due_date, recurrence_type, recurrence_interval, is_complete
            FROM tasks
            WHERE recurrence_type IS NOT NULL AND recurrence_type != 'none'
            ORDER BY id DESC
            LIMIT 20
        `);
        
        console.log(`Found ${result.rows.length} recurring tasks:`);
        
        // Process each task
        for (const task of result.rows) {
            console.log('\n=============================');
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log('=============================');
            console.log('Is complete?', task.is_complete);
            console.log('Assigned date:', task.assigned_date);
            console.log('Due date:', task.due_date);
            console.log('Recurrence type:', task.recurrence_type);
            console.log('Recurrence interval:', task.recurrence_interval);
            
            // Check if this task has both assigned_date and due_date
            if (!task.assigned_date && task.due_date) {
                console.log('ISSUE DETECTED: Task has due_date but no assigned_date!');
                
                // Fix the issue by setting assigned_date equal to due_date
                try {
                    await db.query(
                        'UPDATE tasks SET assigned_date = due_date WHERE id = $1 RETURNING *',
                        [task.id]
                    );
                    console.log('Fixed: Set assigned_date equal to due_date');
                } catch (fixError) {
                    console.error('Error fixing task:', fixError);
                }
            } else if (task.assigned_date && !task.due_date) {
                console.log('ISSUE DETECTED: Task has assigned_date but no due_date!');
                
                // Fix the issue by setting due_date equal to assigned_date
                try {
                    await db.query(
                        'UPDATE tasks SET due_date = assigned_date WHERE id = $1 RETURNING *',
                        [task.id]
                    );
                    console.log('Fixed: Set due_date equal to assigned_date');
                } catch (fixError) {
                    console.error('Error fixing task:', fixError);
                }
            } else if (!task.assigned_date && !task.due_date) {
                console.log('ISSUE DETECTED: Task has neither assigned_date nor due_date!');
            }
        }
        
    } catch (err) {
        console.error('Error debugging recurring tasks:', err);
    } finally {
        process.exit();
    }
}

debugRecurringTasks();
