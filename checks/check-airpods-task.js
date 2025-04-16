// Script to check for Clean Airpods task
const db = require('../utils/db');

async function checkTask() {
    try {
        console.log('Checking for Clean Airpods task...');
        
        // Check for tasks with "Clean Airpods" in the title
        const result = await db.query(`
            SELECT * FROM tasks 
            WHERE title LIKE '%Clean Airpods%'
        `);
        
        console.log('Found tasks:', result.rows);
        
    } catch (err) {
        console.error('Error checking task:', err);
    } finally {
        process.exit();
    }
}

checkTask();
