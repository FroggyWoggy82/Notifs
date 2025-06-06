const db = require('../utils/db');

async function verifyDatabaseFix() {
    try {
        console.log('Verifying that the database has been properly updated...\n');
        
        // Get a few specific tasks to verify the fix
        const result = await db.query(`
            SELECT id, title, due_date, recurrence_type, recurrence_interval, next_occurrence_date
            FROM tasks 
            WHERE title LIKE '%Bday%' 
            AND recurrence_type = 'yearly'
            AND due_date IS NOT NULL
            ORDER BY due_date
            LIMIT 5
        `);

        console.log(`Found ${result.rowCount} birthday tasks to verify:\n`);

        // Process each task
        for (const task of result.rows) {
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log(`Due date: ${task.due_date}`);
            console.log(`Next occurrence: ${task.next_occurrence_date}`);
            
            // Parse the due date
            let dueDate;
            if (task.due_date instanceof Date) {
                dueDate = task.due_date;
            } else {
                dueDate = new Date(task.due_date);
            }
            
            // Calculate what the next occurrence should be
            const year = dueDate.getFullYear();
            const month = dueDate.getMonth();
            const day = dueDate.getDate();
            const interval = task.recurrence_interval || 1;
            
            const expectedNextDate = new Date(year + interval, month, day);
            const expectedYear = expectedNextDate.getFullYear();
            const expectedMonth = String(expectedNextDate.getMonth() + 1).padStart(2, '0');
            const expectedDay = String(expectedNextDate.getDate()).padStart(2, '0');
            const expectedFormatted = `${expectedYear}-${expectedMonth}-${expectedDay}`;
            
            // Parse the stored next occurrence date
            let storedNextDate;
            if (task.next_occurrence_date instanceof Date) {
                storedNextDate = task.next_occurrence_date;
            } else {
                storedNextDate = new Date(task.next_occurrence_date);
            }
            
            const storedYear = storedNextDate.getFullYear();
            const storedMonth = String(storedNextDate.getMonth() + 1).padStart(2, '0');
            const storedDay = String(storedNextDate.getDate()).padStart(2, '0');
            const storedFormatted = `${storedYear}-${storedMonth}-${storedDay}`;
            
            console.log(`Expected next occurrence: ${expectedFormatted}`);
            console.log(`Stored next occurrence: ${storedFormatted}`);
            
            if (expectedFormatted === storedFormatted) {
                console.log('✅ CORRECT: Next occurrence date matches expected calculation\n');
            } else {
                console.log('❌ INCORRECT: Next occurrence date does not match expected calculation\n');
            }
        }

        console.log('='.repeat(60));
        console.log('Database verification complete!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error verifying database fix:', err);
    } finally {
        process.exit();
    }
}

verifyDatabaseFix();
