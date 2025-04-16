// Script to debug why the Clean Airpods task is showing up in the unassigned_today filter with a Due Tomorrow label
const db = require('../utils/db');

async function debugTaskFilter() {
    try {
        console.log('Checking Clean Airpods task...');

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
        console.log('Clean Airpods task:', task);

        // Check if the task is completed
        console.log('Is task completed?', task.is_complete);

        // Check assigned date and due date
        console.log('Assigned date:', task.assigned_date);
        console.log('Due date:', task.due_date);

        // Check if the task is recurring
        console.log('Recurrence type:', task.recurrence_type);
        console.log('Recurrence interval:', task.recurrence_interval);

        // Check if the task should be in the unassigned_today filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if task is unassigned
        const isUnassigned = !task.due_date || (typeof task.due_date === 'string' && task.due_date.trim() === '');
        console.log('Is task unassigned?', isUnassigned);

        // Check if task is due today
        let isDueToday = false;
        if (task.due_date) {
            // Convert date object to string if needed
            let datePart;
            if (typeof task.due_date === 'string') {
                datePart = task.due_date.includes('T') ? task.due_date.split('T')[0] : task.due_date;
            } else {
                // It's a Date object
                const dueDate = new Date(task.due_date);
                datePart = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
            }
            const [year, month, day] = datePart.split('-').map(Number);
            isDueToday = year === today.getFullYear() &&
                         (month - 1) === today.getMonth() &&
                         day === today.getDate();
        }
        console.log('Is task due today?', isDueToday);

        // Check if task is overdue
        let isOverdue = false;
        if (task.due_date) {
            const dueDate = new Date(task.due_date);
            isOverdue = dueDate < today;
        }
        console.log('Is task overdue?', isOverdue);

        // Check if task is due tomorrow
        let isDueTomorrow = false;
        if (task.due_date) {
            const dueDate = new Date(task.due_date);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            isDueTomorrow = dueDate.getFullYear() === tomorrow.getFullYear() &&
                           dueDate.getMonth() === tomorrow.getMonth() &&
                           dueDate.getDate() === tomorrow.getDate();

            console.log('Due date:', dueDate);
            console.log('Tomorrow:', tomorrow);
            console.log('Due date components:', dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            console.log('Tomorrow components:', tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        }
        console.log('Is task due tomorrow?', isDueTomorrow);

        // Should the task be in the unassigned_today filter?
        const shouldBeInFilter = !task.is_complete && (isUnassigned || isDueToday || isOverdue);
        console.log('Should task be in unassigned_today filter?', shouldBeInFilter);

    } catch (err) {
        console.error('Error debugging task filter:', err);
    } finally {
        process.exit();
    }
}

debugTaskFilter();
