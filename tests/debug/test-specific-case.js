// Test the specific case mentioned in the issue

function calculateNextOccurrence(task) {
    if (!task.recurrence_type || task.recurrence_type === 'none' || !task.due_date) {
        return null;
    }

    // Parse the due date as a local date to avoid timezone issues
    const dueDateStr = task.due_date;
    let dueDate;
    
    if (dueDateStr.includes('T')) {
        // If it's a full datetime string, parse it normally
        dueDate = new Date(dueDateStr);
    } else {
        // If it's just a date string (YYYY-MM-DD), parse it as local date
        const [year, month, day] = dueDateStr.split('-').map(Number);
        dueDate = new Date(year, month - 1, day); // month is 0-indexed
    }
    
    if (isNaN(dueDate.getTime())) {
        console.warn(`Invalid due_date for task ${task.id}: ${task.due_date}`);
        return null;
    }

    const interval = task.recurrence_interval || 1;

    // Create next date using Date methods to avoid timezone issues and off-by-one errors
    let nextDate = new Date(dueDate);

    switch (task.recurrence_type) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + interval);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + (interval * 7));
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + interval);
            break;
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + interval);
            break;
        default:
            return null;
    }

    return nextDate;
}

console.log("Testing the specific case from the issue...\n");

// Test the exact case mentioned in the issue
const testTask = {
    id: 999,
    title: "Robert Herreras Bday",
    due_date: "2025-06-05", // Due on 6/5/25
    recurrence_type: "yearly",
    recurrence_interval: 1
};

console.log("Task details:");
console.log(`- Title: ${testTask.title}`);
console.log(`- Due date: ${testTask.due_date} (should display as 6/5/2025)`);
console.log(`- Recurrence: ${testTask.recurrence_type} (every ${testTask.recurrence_interval} year)`);

const result = calculateNextOccurrence(testTask);

if (result) {
    // Format result as YYYY-MM-DD
    const year = result.getFullYear();
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const day = String(result.getDate()).padStart(2, '0');
    const formattedResult = `${year}-${month}-${day}`;
    
    console.log(`\nCalculated next occurrence: ${formattedResult} (should display as 6/5/2026)`);
    
    if (formattedResult === "2026-06-05") {
        console.log("✅ SUCCESS: Next occurrence is correctly calculated as 6/5/2026");
        console.log("✅ The off-by-one day issue has been FIXED!");
    } else {
        console.log("❌ FAILED: Next occurrence is NOT 6/5/2026");
        console.log("❌ The issue still exists!");
    }
} else {
    console.log("❌ FAILED: No result returned from calculation");
}

console.log("\n" + "=".repeat(60));
console.log("The fix ensures that:");
console.log("- A task due on 6/5/2025 will have its next occurrence on 6/5/2026");
console.log("- NOT on 6/4/2026 (which was the previous buggy behavior)");
console.log("=".repeat(60));
