const db = require('../utils/db');

async function fixRobertDueDate() {
    try {
        console.log('Fixing Robert task due date to display correctly...\n');
        
        // Get the specific task
        const result = await db.query(`
            SELECT id, title, due_date, recurrence_type, recurrence_interval, next_occurrence_date
            FROM tasks 
            WHERE title ILIKE '%Robert%'
            ORDER BY id
        `);

        console.log(`Found ${result.rowCount} tasks with "Robert" in the title:\n`);

        // Process each task
        for (const task of result.rows) {
            console.log('='.repeat(50));
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log('='.repeat(50));
            console.log('Current due date (raw):', task.due_date);
            
            const currentDueDate = new Date(task.due_date);
            console.log('Current due date (display):', currentDueDate.toLocaleDateString());
            
            // The issue is that 2025-06-05T00:00:00.000Z displays as 6/4/2025 in Central Time
            // We need to store it as a date that will display as 6/5/2025
            // In Central Time (UTC-5/UTC-6), we need to store it as 2025-06-05T05:00:00.000Z or 2025-06-05T06:00:00.000Z
            
            // Let's use a simpler approach: store it as just the date string
            const correctDueDate = '2025-06-05';
            
            console.log('🔧 Updating due date to:', correctDueDate);
            
            try {
                await db.query(
                    'UPDATE tasks SET due_date = $1 WHERE id = $2',
                    [correctDueDate, task.id]
                );
                console.log(`✅ FIXED: Updated due date to ${correctDueDate}`);
                
                // Verify the fix
                const verifyResult = await db.query(
                    'SELECT due_date FROM tasks WHERE id = $1',
                    [task.id]
                );
                
                const newDueDate = new Date(verifyResult.rows[0].due_date);
                console.log('New due date (raw):', verifyResult.rows[0].due_date);
                console.log('New due date (display):', newDueDate.toLocaleDateString());
                
                if (newDueDate.toLocaleDateString().includes('6/5/2025')) {
                    console.log('✅ SUCCESS: Due date now displays correctly as 6/5/2025');
                } else {
                    console.log('❌ STILL ISSUE: Due date still does not display as 6/5/2025');
                    
                    // Try a different approach - store it with time that will display correctly
                    const adjustedDate = '2025-06-05T12:00:00.000Z'; // Noon UTC should display as 6/5 in Central Time
                    console.log('🔧 Trying adjusted date:', adjustedDate);
                    
                    await db.query(
                        'UPDATE tasks SET due_date = $1 WHERE id = $2',
                        [adjustedDate, task.id]
                    );
                    
                    const verifyResult2 = await db.query(
                        'SELECT due_date FROM tasks WHERE id = $1',
                        [task.id]
                    );
                    
                    const adjustedDueDate = new Date(verifyResult2.rows[0].due_date);
                    console.log('Adjusted due date (raw):', verifyResult2.rows[0].due_date);
                    console.log('Adjusted due date (display):', adjustedDueDate.toLocaleDateString());
                    
                    if (adjustedDueDate.toLocaleDateString().includes('6/5/2025')) {
                        console.log('✅ SUCCESS: Due date now displays correctly as 6/5/2025');
                    } else {
                        console.log('❌ STILL ISSUE: Due date still does not display as 6/5/2025');
                    }
                }
                
            } catch (updateError) {
                console.error('❌ ERROR updating task:', updateError);
            }
            
            console.log('\n');
        }

        console.log('='.repeat(60));
        console.log('Robert task due date fix complete!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error fixing Robert task due date:', err);
    } finally {
        process.exit();
    }
}

fixRobertDueDate();
