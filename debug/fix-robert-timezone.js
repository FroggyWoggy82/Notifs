const db = require('../utils/db');

async function fixRobertTimezone() {
    try {
        console.log('Fixing Robert task timezone issue...\n');
        
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
            
            // In Central Time (UTC-5 in winter, UTC-6 in summer), to display 6/5/2025,
            // we need to store a UTC time that when converted to Central Time shows 6/5/2025
            // Since 6/5/2025 is in summer (CDT = UTC-5), we need to store 2025-06-05T05:00:00.000Z
            
            const correctDueDate = '2025-06-05T05:00:00.000Z';
            
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
                    
                    // Try with UTC-6 (standard time)
                    const winterDate = '2025-06-05T06:00:00.000Z';
                    console.log('🔧 Trying winter time adjustment:', winterDate);
                    
                    await db.query(
                        'UPDATE tasks SET due_date = $1 WHERE id = $2',
                        [winterDate, task.id]
                    );
                    
                    const verifyResult2 = await db.query(
                        'SELECT due_date FROM tasks WHERE id = $1',
                        [task.id]
                    );
                    
                    const winterDueDate = new Date(verifyResult2.rows[0].due_date);
                    console.log('Winter adjusted due date (raw):', verifyResult2.rows[0].due_date);
                    console.log('Winter adjusted due date (display):', winterDueDate.toLocaleDateString());
                    
                    if (winterDueDate.toLocaleDateString().includes('6/5/2025')) {
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
        console.log('Robert task timezone fix complete!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error fixing Robert task timezone:', err);
    } finally {
        process.exit();
    }
}

fixRobertTimezone();
