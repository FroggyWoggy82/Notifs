// Script to check the due date of the Clean Airpods task
const db = require('../utils/db');

async function checkTaskDate() {
    try {
        console.log('Checking Clean Airpods task date...');
        
        // Get the Clean Airpods task
        const result = await db.query(`
            SELECT * FROM tasks
            WHERE title = 'Clean Airpods'
        `);
        
        if (result.rows.length === 0) {
            console.log('Clean Airpods task not found');
            return;
        }
        
        const task = result.rows[0];
        console.log('Task:', task);
        
        // Parse the due date
        const dueDate = new Date(task.due_date);
        console.log('Due date as Date object:', dueDate);
        console.log('Due date ISO string:', dueDate.toISOString());
        console.log('Due date components:', {
            year: dueDate.getFullYear(),
            month: dueDate.getMonth() + 1, // 0-based, so add 1
            day: dueDate.getDate(),
            hours: dueDate.getHours(),
            minutes: dueDate.getMinutes()
        });
        
        // Get today's date
        const today = new Date();
        console.log('Today as Date object:', today);
        console.log('Today ISO string:', today.toISOString());
        console.log('Today components:', {
            year: today.getFullYear(),
            month: today.getMonth() + 1, // 0-based, so add 1
            day: today.getDate(),
            hours: today.getHours(),
            minutes: today.getMinutes()
        });
        
        // Check if due date is today
        const isDueToday = dueDate.getFullYear() === today.getFullYear() &&
                          dueDate.getMonth() === today.getMonth() &&
                          dueDate.getDate() === today.getDate();
        console.log('Is due today?', isDueToday);
        
        // Get tomorrow's date
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        console.log('Tomorrow as Date object:', tomorrow);
        console.log('Tomorrow ISO string:', tomorrow.toISOString());
        console.log('Tomorrow components:', {
            year: tomorrow.getFullYear(),
            month: tomorrow.getMonth() + 1, // 0-based, so add 1
            day: tomorrow.getDate(),
            hours: tomorrow.getHours(),
            minutes: tomorrow.getMinutes()
        });
        
        // Check if due date is tomorrow
        const isDueTomorrow = dueDate.getFullYear() === tomorrow.getFullYear() &&
                             dueDate.getMonth() === tomorrow.getMonth() &&
                             dueDate.getDate() === tomorrow.getDate();
        console.log('Is due tomorrow?', isDueTomorrow);
        
    } catch (err) {
        console.error('Error checking task date:', err);
    } finally {
        process.exit();
    }
}

checkTaskDate();
