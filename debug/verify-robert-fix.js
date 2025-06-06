const db = require('../utils/db');

async function verifyRobertFix() {
    try {
        console.log('Verifying Robert task fix...\n');
        
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
            console.log('Due date (raw):', task.due_date);
            console.log('Next occurrence (raw):', task.next_occurrence_date);
            
            // Test how the dates will be displayed
            const dueDate = new Date(task.due_date);
            const nextOccurrenceDate = new Date(task.next_occurrence_date);
            
            console.log('Due date (display):', dueDate.toLocaleDateString());
            console.log('Next occurrence (display):', nextOccurrenceDate.toLocaleDateString());
            
            // Check if the display is correct
            if (dueDate.toLocaleDateString().includes('6/5/2025')) {
                console.log('✅ Due date displays correctly as 6/5/2025');
            } else {
                console.log('❌ Due date does not display as 6/5/2025');
            }
            
            if (nextOccurrenceDate.toLocaleDateString().includes('6/5/2026')) {
                console.log('✅ Next occurrence displays correctly as 6/5/2026');
            } else {
                console.log('❌ Next occurrence does not display as 6/5/2026');
            }
            
            console.log('\n');
        }

        console.log('='.repeat(60));
        console.log('Robert task verification complete!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error verifying Robert task fix:', err);
    } finally {
        process.exit();
    }
}

verifyRobertFix();
