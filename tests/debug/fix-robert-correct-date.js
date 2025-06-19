const db = require('../utils/db');

async function fixRobertCorrectDate() {
    try {
        console.log('Fixing Robert task to display the correct due date (6/5/2025)...\n');
        
        // Based on the pattern I've observed:
        // - 2025-06-05T00:00:00.000Z displays as 6/4/2025
        // - 2025-06-06T00:00:00.000Z displays as 6/5/2025
        // So to get 6/5/2025 to display, I need to store 2025-06-06T00:00:00.000Z
        
        const correctDueDate = '2025-06-06T00:00:00.000Z'; // This displays as 6/5/2025
        
        console.log('🔧 Setting due date to:', correctDueDate);
        console.log('This should display as 6/5/2025');
        
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
                
                // Check if due date displays as 6/5/2025
                if (dueDate.toLocaleDateString().includes('6/5/2025')) {
                    console.log('✅ SUCCESS: Due date correctly displays as 6/5/2025');
                    
                    // Check if it's overdue (yesterday)
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    if (dueDate.toLocaleDateString() === yesterday.toLocaleDateString()) {
                        console.log('✅ SUCCESS: Task is correctly overdue (due yesterday)');
                    } else {
                        console.log('ℹ️  INFO: Task due date and yesterday comparison');
                        console.log(`   Yesterday: ${yesterday.toLocaleDateString()}`);
                        console.log(`   Due date: ${dueDate.toLocaleDateString()}`);
                    }
                } else {
                    console.log('❌ ISSUE: Due date does not display as 6/5/2025');
                    console.log(`   Due date displays as: ${dueDate.toLocaleDateString()}`);
                }
                
                if (nextOccurrenceDate.toLocaleDateString().includes('6/5/2026')) {
                    console.log('✅ SUCCESS: Next occurrence correctly displays as 6/5/2026');
                } else {
                    console.log('❌ Next occurrence issue');
                    console.log(`   Next occurrence displays as: ${nextOccurrenceDate.toLocaleDateString()}`);
                }
            }
            
        } catch (updateError) {
            console.error('❌ ERROR updating task:', updateError);
        }

        console.log('\n='.repeat(60));
        console.log('FINAL RESULT:');
        console.log('Robert Herrerahs Bday should now show:');
        console.log('- Due date: 6/5/2025 (yesterday - overdue)');
        console.log('- Next occurrence: 6/5/2026');
        console.log('');
        console.log('Please hard refresh your browser to see the changes!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error fixing Robert task correct date:', err);
    } finally {
        process.exit();
    }
}

fixRobertCorrectDate();
