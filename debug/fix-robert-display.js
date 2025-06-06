const db = require('../utils/db');

async function fixRobertDisplay() {
    try {
        console.log('Fixing Robert task display issue...\n');
        
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
            
            // The issue is that the due date is stored as 2025-06-05T00:00:00.000Z
            // But when displayed in Central Time, it shows as 6/4/2025
            // We need to fix the due date to be 2025-06-05 (without time component)
            
            if (task.due_date) {
                const currentDueDate = new Date(task.due_date);
                console.log('Current due date (raw):', task.due_date);
                console.log('Current due date (local display):', currentDueDate.toLocaleDateString());
                
                // If the local display shows 6/4/2025, we need to fix it to show 6/5/2025
                if (currentDueDate.toLocaleDateString().includes('6/4/2025')) {
                    console.log('❌ ISSUE FOUND: Due date displays as 6/4/2025 instead of 6/5/2025');
                    
                    // Set the correct due date as 2025-06-05 (date only, no time)
                    const correctDueDate = '2025-06-05';
                    
                    console.log('🔧 Fixing due date to:', correctDueDate);
                    
                    try {
                        await db.query(
                            'UPDATE tasks SET due_date = $1 WHERE id = $2',
                            [correctDueDate, task.id]
                        );
                        console.log(`✅ FIXED: Updated due date to ${correctDueDate}`);
                        
                        // Now recalculate the next occurrence
                        const nextYear = 2025 + (task.recurrence_interval || 1);
                        const correctNextOccurrence = `${nextYear}-06-05`;
                        
                        await db.query(
                            'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2',
                            [correctNextOccurrence, task.id]
                        );
                        console.log(`✅ FIXED: Updated next occurrence to ${correctNextOccurrence}`);
                        
                    } catch (updateError) {
                        console.error('❌ ERROR updating task:', updateError);
                    }
                } else {
                    console.log('✅ Due date display looks correct');
                }
            }
            
            console.log('\n');
        }

        console.log('='.repeat(60));
        console.log('Robert task display fix complete!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error fixing Robert task display:', err);
    } finally {
        process.exit();
    }
}

fixRobertDisplay();
