// fix-duplicate-tasks.js
// Script to identify and fix duplicate recurring tasks

const db = require('../utils/db');

async function fixDuplicateTasks() {
    try {
        console.log('Connecting to database...');
        
        // Find duplicate tasks (same title and recurrence_type)
        const duplicatesQuery = `
            SELECT 
                title, 
                recurrence_type, 
                COUNT(*) as count,
                ARRAY_AGG(id) as task_ids,
                ARRAY_AGG(due_date) as due_dates,
                ARRAY_AGG(created_at) as created_ats
            FROM tasks 
            WHERE recurrence_type IS NOT NULL 
            AND recurrence_type != 'none'
            GROUP BY title, recurrence_type
            HAVING COUNT(*) > 1
            ORDER BY count DESC
        `;
        
        console.log('Searching for duplicate recurring tasks...');
        const duplicatesResult = await db.query(duplicatesQuery);
        
        if (duplicatesResult.rows.length === 0) {
            console.log('No duplicate recurring tasks found.');
            return;
        }
        
        console.log(`Found ${duplicatesResult.rows.length} sets of duplicate recurring tasks:`);
        
        // Process each set of duplicates
        for (const duplicate of duplicatesResult.rows) {
            console.log(`\n- "${duplicate.title}" (${duplicate.recurrence_type}): ${duplicate.count} instances`);
            console.log(`  Task IDs: ${duplicate.task_ids.join(', ')}`);
            console.log(`  Due dates: ${duplicate.due_dates.map(d => d ? new Date(d).toISOString().split('T')[0] : 'NULL').join(', ')}`);
            
            // Get full details of each duplicate task
            const taskDetailsQuery = `
                SELECT * FROM tasks 
                WHERE id = ANY($1::int[])
                ORDER BY created_at ASC
            `;
            
            const taskDetailsResult = await db.query(taskDetailsQuery, [duplicate.task_ids]);
            
            // Analyze the duplicates
            console.log('  Detailed analysis:');
            for (const task of taskDetailsResult.rows) {
                console.log(`  - Task ID ${task.id}:`);
                console.log(`    Created: ${new Date(task.created_at).toISOString()}`);
                console.log(`    Due date: ${task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : 'NULL'}`);
                console.log(`    Assigned date: ${task.assigned_date ? new Date(task.assigned_date).toISOString().split('T')[0] : 'NULL'}`);
                console.log(`    Is complete: ${task.is_complete}`);
            }
            
            // Determine which task to keep (usually the oldest one with a due date)
            let taskToKeep = taskDetailsResult.rows[0]; // Default to oldest
            
            // Prefer tasks with due dates
            const tasksWithDueDates = taskDetailsResult.rows.filter(t => t.due_date);
            if (tasksWithDueDates.length > 0) {
                taskToKeep = tasksWithDueDates[0]; // Keep the oldest task with a due date
            }
            
            console.log(`  Decision: Keeping task ID ${taskToKeep.id} and removing others`);
            
            // Remove the duplicate tasks
            const tasksToRemove = taskDetailsResult.rows
                .filter(t => t.id !== taskToKeep.id)
                .map(t => t.id);
            
            if (tasksToRemove.length > 0) {
                console.log(`  Removing task IDs: ${tasksToRemove.join(', ')}`);
                
                const deleteQuery = `
                    DELETE FROM tasks 
                    WHERE id = ANY($1::int[])
                    RETURNING id
                `;
                
                const deleteResult = await db.query(deleteQuery, [tasksToRemove]);
                console.log(`  Removed ${deleteResult.rowCount} duplicate tasks.`);
            }
        }
        
        console.log('\nDuplicate task cleanup completed successfully.');
    } catch (err) {
        console.error('Error fixing duplicate tasks:', err);
    } finally {
        process.exit();
    }
}

// Run the function
fixDuplicateTasks();
