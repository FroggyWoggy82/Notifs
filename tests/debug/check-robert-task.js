const db = require('../utils/db');

async function checkRobertTask() {
    try {
        console.log('Checking Robert Herreras Bday task specifically...\n');
        
        // Get the specific task
        const result = await db.query(`
            SELECT id, title, due_date, recurrence_type, recurrence_interval, next_occurrence_date
            FROM tasks 
            WHERE title LIKE '%Robert%Herreras%' OR title LIKE '%Robert Herreras%'
            ORDER BY id
        `);

        console.log(`Found ${result.rowCount} tasks matching "Robert Herreras":\n`);

        // Process each task
        for (const task of result.rows) {
            console.log('='.repeat(50));
            console.log(`Task: ${task.title} (ID: ${task.id})`);
            console.log('='.repeat(50));
            console.log('Due date (raw):', task.due_date);
            console.log('Next occurrence (raw):', task.next_occurrence_date);
            console.log('Recurrence type:', task.recurrence_type);
            console.log('Recurrence interval:', task.recurrence_interval);
            
            // Parse the due date
            let dueDate;
            if (task.due_date instanceof Date) {
                dueDate = task.due_date;
            } else {
                dueDate = new Date(task.due_date);
            }
            
            console.log('Due date (parsed):', dueDate.toISOString());
            console.log('Due date (local string):', dueDate.toLocaleDateString());
            
            // Calculate what the next occurrence should be using our fixed logic
            const year = dueDate.getFullYear();
            const month = dueDate.getMonth();
            const day = dueDate.getDate();
            const interval = task.recurrence_interval || 1;
            
            console.log(`Due date components: Year=${year}, Month=${month+1}, Day=${day}`);
            
            const expectedNextDate = new Date(year + interval, month, day);
            const expectedYear = expectedNextDate.getFullYear();
            const expectedMonth = String(expectedNextDate.getMonth() + 1).padStart(2, '0');
            const expectedDay = String(expectedNextDate.getDate()).padStart(2, '0');
            const expectedFormatted = `${expectedYear}-${expectedMonth}-${expectedDay}`;
            
            console.log('Expected next occurrence (calculated):', expectedFormatted);
            console.log('Expected next occurrence (date object):', expectedNextDate.toISOString());
            console.log('Expected next occurrence (local string):', expectedNextDate.toLocaleDateString());
            
            // Parse the stored next occurrence date
            if (task.next_occurrence_date) {
                let storedNextDate;
                if (task.next_occurrence_date instanceof Date) {
                    storedNextDate = task.next_occurrence_date;
                } else {
                    storedNextDate = new Date(task.next_occurrence_date);
                }
                
                console.log('Stored next occurrence (parsed):', storedNextDate.toISOString());
                console.log('Stored next occurrence (local string):', storedNextDate.toLocaleDateString());
                
                const storedYear = storedNextDate.getFullYear();
                const storedMonth = String(storedNextDate.getMonth() + 1).padStart(2, '0');
                const storedDay = String(storedNextDate.getDate()).padStart(2, '0');
                const storedFormatted = `${storedYear}-${storedMonth}-${storedDay}`;
                
                console.log('Stored next occurrence (formatted):', storedFormatted);
                
                if (expectedFormatted === storedFormatted) {
                    console.log('✅ CORRECT: Next occurrence date matches expected calculation');
                } else {
                    console.log('❌ INCORRECT: Next occurrence date does not match expected calculation');
                    console.log(`   Expected: ${expectedFormatted}`);
                    console.log(`   Stored: ${storedFormatted}`);
                    
                    // Fix this specific task
                    console.log('\n🔧 Fixing this task...');
                    try {
                        await db.query(
                            'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2',
                            [expectedFormatted, task.id]
                        );
                        console.log(`✅ FIXED: Updated task ${task.id} next occurrence to ${expectedFormatted}`);
                    } catch (updateError) {
                        console.error('❌ ERROR updating task:', updateError);
                    }
                }
            } else {
                console.log('❌ No next occurrence date stored');
                
                // Set the next occurrence date
                console.log('\n🔧 Setting next occurrence date...');
                try {
                    await db.query(
                        'UPDATE tasks SET next_occurrence_date = $1 WHERE id = $2',
                        [expectedFormatted, task.id]
                    );
                    console.log(`✅ FIXED: Set task ${task.id} next occurrence to ${expectedFormatted}`);
                } catch (updateError) {
                    console.error('❌ ERROR updating task:', updateError);
                }
            }
            
            console.log('\n');
        }

        console.log('='.repeat(60));
        console.log('Robert Herreras task check complete!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error checking Robert task:', err);
    } finally {
        process.exit();
    }
}

checkRobertTask();
