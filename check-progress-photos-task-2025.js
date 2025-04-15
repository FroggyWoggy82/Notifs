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
        
        // Check for tasks on April 9th, 2025
        const aprilResult = await db.query(`
            SELECT * FROM tasks 
            WHERE assigned_date = '2025-04-09' 
            OR due_date = '2025-04-09'
        `);
        
        console.log('Tasks on April 9th, 2025:', aprilResult.rows);
        
        // Check for all tasks with due_date in April 2025
        const allAprilResult = await db.query(`
            SELECT * FROM tasks 
            WHERE due_date >= '2025-04-01' 
            AND due_date <= '2025-04-30'
        `);
        
        console.log('All tasks in April 2025:', allAprilResult.rows);
        
    } catch (err) {
        console.error('Error checking task:', err);
    } finally {
        process.exit();
    }
}

checkTask();
