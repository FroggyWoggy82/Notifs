// Script to check for progress photos task
const db = require('./db');

async function checkTask() {
    try {
        console.log('Checking for progress photos task...');
        
        // Check for tasks with "progress photo" in the title
        const result = await db.query(`
            SELECT * FROM tasks 
            WHERE title LIKE '%progress photo%' 
            OR title LIKE '%Progress Photo%'
        `);
        
        console.log('Found tasks:', result.rows);
        
        // Check for tasks on April 9th
        const aprilResult = await db.query(`
            SELECT * FROM tasks 
            WHERE assigned_date = '2024-04-09' 
            OR due_date = '2024-04-09'
        `);
        
        console.log('Tasks on April 9th:', aprilResult.rows);
        
    } catch (err) {
        console.error('Error checking task:', err);
    } finally {
        process.exit();
    }
}

checkTask();
