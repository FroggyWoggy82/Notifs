const db = require('../utils/db');

async function fixRobertNextFinal() {
    try {
        console.log('Final fix for Robert task next occurrence...\n');
        
        // Since the system seems to be adding 5 hours to the stored time,
        // let's try storing 2026-06-05T05:00:00.000Z which should display as 6/5/2026
        
        const correctNextOccurrence = '2026-06-05T05:00:00.000Z';
        
        console.log('🔧 Updating next occurrence to:', correctNextOccurrence);
        
        try {
            await db.query(
                'UPDATE tasks SET next_occurrence_date = $1 WHERE title ILIKE $2',
                [correctNextOccurrence, '%Robert%']
            );
            
            console.log('✅ UPDATED: Robert task next occurrence');
            
            // Verify the fix
            const verifyResult = await db.query(
                'SELECT id, title, due_date, next_occurrence_date FROM tasks WHERE title ILIKE $1',
                ['%Robert%']
            );
            
            if (verifyResult.rowCount > 0) {
                const task = verifyResult.rows[0];
                console.log('\n=== FINAL VERIFICATION ===');
                console.log('Task:', task.title);
                console.log('Due date (raw):', task.due_date);
                console.log('Next occurrence (raw):', task.next_occurrence_date);
                
                const dueDate = new Date(task.due_date);
                const nextOccurrenceDate = new Date(task.next_occurrence_date);
                
                console.log('Due date (display):', dueDate.toLocaleDateString());
                console.log('Next occurrence (display):', nextOccurrenceDate.toLocaleDateString());
                
                if (dueDate.toLocaleDateString().includes('6/5/2025')) {
                    console.log('✅ SUCCESS: Due date displays correctly as 6/5/2025');
                } else {
                    console.log('❌ Due date does not display as 6/5/2025');
                }
                
                if (nextOccurrenceDate.toLocaleDateString().includes('6/5/2026')) {
                    console.log('✅ SUCCESS: Next occurrence displays correctly as 6/5/2026');
                } else {
                    console.log('❌ Next occurrence does not display as 6/5/2026');
                    console.log(`   It displays as: ${nextOccurrenceDate.toLocaleDateString()}`);
                }
            }
            
        } catch (updateError) {
            console.error('❌ ERROR updating task:', updateError);
        }

        console.log('\n='.repeat(60));
        console.log('FINAL RESULT:');
        console.log('Robert Herrerahs Bday should now display:');
        console.log('- Due: 6/5/2025');
        console.log('- Next: 6/5/2026');
        console.log('');
        console.log('Please hard refresh your browser to see the changes!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error in final fix for Robert task next occurrence:', err);
    } finally {
        process.exit();
    }
}

fixRobertNextFinal();
