const db = require('../utils/db');

async function fixRobertDueYesterday() {
    try {
        console.log('Fixing Robert task to be due yesterday (6/5/2025)...\n');
        
        // The task should be due on 6/5/2025, which was yesterday
        // Since 2025-06-06T00:00:00.000Z displays as 6/5/2025, 
        // we need 2025-06-05T05:00:00.000Z to display as 6/5/2025 but be actually due on 6/5
        
        const correctDueDate = '2025-06-05T05:00:00.000Z'; // This should display as 6/5/2025
        
        console.log('🔧 Setting due date to:', correctDueDate);
        console.log('This should make the task due on 6/5/2025 (yesterday)');
        
        try {
            await db.query(
                'UPDATE tasks SET due_date = $1 WHERE title ILIKE $2',
                [correctDueDate, '%Robert%']
            );
            
            console.log('✅ UPDATED: Robert task due date');
            
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
                const today = new Date();
                
                console.log('Due date (display):', dueDate.toLocaleDateString());
                console.log('Next occurrence (display):', nextOccurrenceDate.toLocaleDateString());
                console.log('Today:', today.toLocaleDateString());
                
                // Check if due date is yesterday
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                console.log('Yesterday:', yesterday.toLocaleDateString());
                
                if (dueDate.toLocaleDateString() === yesterday.toLocaleDateString()) {
                    console.log('✅ SUCCESS: Due date is correctly set to yesterday (6/5/2025)');
                } else if (dueDate.toLocaleDateString() === today.toLocaleDateString()) {
                    console.log('❌ ISSUE: Due date is still showing as today instead of yesterday');
                } else {
                    console.log('❌ ISSUE: Due date is not yesterday or today');
                    console.log(`   Due date displays as: ${dueDate.toLocaleDateString()}`);
                }
                
                if (nextOccurrenceDate.toLocaleDateString().includes('6/5/2026')) {
                    console.log('✅ SUCCESS: Next occurrence is correctly 6/5/2026');
                } else {
                    console.log('❌ Next occurrence issue');
                    console.log(`   Next occurrence displays as: ${nextOccurrenceDate.toLocaleDateString()}`);
                }
            }
            
        } catch (updateError) {
            console.error('❌ ERROR updating task:', updateError);
        }

        console.log('\n='.repeat(60));
        console.log('RESULT:');
        console.log('Robert Herrerahs Bday should now show as:');
        console.log('- Overdue: 6/5/2025 (yesterday)');
        console.log('- Next: 6/5/2026');
        console.log('');
        console.log('Please hard refresh your browser to see the changes!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error fixing Robert task due date:', err);
    } finally {
        process.exit();
    }
}

fixRobertDueYesterday();
