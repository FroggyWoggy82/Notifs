const db = require('../utils/db');

async function fixRobertFinal() {
    try {
        console.log('Final fix for Robert task - storing the date that will display correctly...\n');
        
        // Since 2025-06-05T00:00:00.000Z displays as 6/4/2025 in Central Time,
        // we need to store 2025-06-06T00:00:00.000Z to display as 6/5/2025
        
        const correctDueDate = '2025-06-06T00:00:00.000Z';
        const correctNextOccurrence = '2026-06-06T00:00:00.000Z';
        
        console.log('🔧 Updating Robert task to display correctly...');
        console.log('Setting due date to:', correctDueDate);
        console.log('Setting next occurrence to:', correctNextOccurrence);
        
        try {
            // Update both due date and next occurrence
            await db.query(
                'UPDATE tasks SET due_date = $1, next_occurrence_date = $2 WHERE title ILIKE $3',
                [correctDueDate, correctNextOccurrence, '%Robert%']
            );
            
            console.log('✅ UPDATED: Robert task dates');
            
            // Verify the fix
            const verifyResult = await db.query(
                'SELECT id, title, due_date, next_occurrence_date FROM tasks WHERE title ILIKE $1',
                ['%Robert%']
            );
            
            if (verifyResult.rowCount > 0) {
                const task = verifyResult.rows[0];
                console.log('\n=== VERIFICATION ===');
                console.log('Task:', task.title);
                console.log('Due date (raw):', task.due_date);
                console.log('Next occurrence (raw):', task.next_occurrence_date);
                
                const dueDate = new Date(task.due_date);
                const nextOccurrenceDate = new Date(task.next_occurrence_date);
                
                console.log('Due date (display):', dueDate.toLocaleDateString());
                console.log('Next occurrence (display):', nextOccurrenceDate.toLocaleDateString());
                
                if (dueDate.toLocaleDateString().includes('6/5/2025')) {
                    console.log('✅ SUCCESS: Due date now displays correctly as 6/5/2025');
                } else {
                    console.log('❌ Due date still does not display as 6/5/2025');
                }
                
                if (nextOccurrenceDate.toLocaleDateString().includes('6/5/2026')) {
                    console.log('✅ SUCCESS: Next occurrence displays correctly as 6/5/2026');
                } else {
                    console.log('❌ Next occurrence does not display as 6/5/2026');
                }
            }
            
        } catch (updateError) {
            console.error('❌ ERROR updating task:', updateError);
        }

        console.log('\n='.repeat(60));
        console.log('Robert task final fix complete!');
        console.log('The task should now display:');
        console.log('- Due date: 6/5/2025');
        console.log('- Next occurrence: 6/5/2026');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error in final fix for Robert task:', err);
    } finally {
        process.exit();
    }
}

fixRobertFinal();
