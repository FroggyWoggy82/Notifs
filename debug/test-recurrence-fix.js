// Test script to verify the recurrence calculation fix

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

    // Create next date using the same approach to avoid timezone issues
    let nextDate;
    const year = dueDate.getFullYear();
    const month = dueDate.getMonth();
    const day = dueDate.getDate();

    switch (task.recurrence_type) {
        case 'daily':
            nextDate = new Date(year, month, day + interval);
            break;
        case 'weekly':
            nextDate = new Date(year, month, day + (interval * 7));
            break;
        case 'monthly':
            nextDate = new Date(year, month + interval, day);
            break;
        case 'yearly':
            nextDate = new Date(year + interval, month, day);
            break;
        default:
            return null;
    }

    return nextDate;
}

// Test cases
const testCases = [
    {
        name: "Yearly task due 6/5/25 should have next occurrence 6/5/26",
        task: {
            id: 1,
            title: "Test Birthday",
            due_date: "2025-06-05",
            recurrence_type: "yearly",
            recurrence_interval: 1
        },
        expected: "2026-06-05"
    },
    {
        name: "Monthly task due 5/15/25 should have next occurrence 6/15/25",
        task: {
            id: 2,
            title: "Monthly Task",
            due_date: "2025-05-15",
            recurrence_type: "monthly",
            recurrence_interval: 1
        },
        expected: "2025-06-15"
    },
    {
        name: "Weekly task due 5/20/25 should have next occurrence 5/27/25",
        task: {
            id: 3,
            title: "Weekly Task",
            due_date: "2025-05-20",
            recurrence_type: "weekly",
            recurrence_interval: 1
        },
        expected: "2025-05-27"
    },
    {
        name: "Daily task due 5/20/25 should have next occurrence 5/21/25",
        task: {
            id: 4,
            title: "Daily Task",
            due_date: "2025-05-20",
            recurrence_type: "daily",
            recurrence_interval: 1
        },
        expected: "2025-05-21"
    }
];

console.log("Testing recurrence calculation fix...\n");

let allPassed = true;

testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    
    const result = calculateNextOccurrence(testCase.task);
    
    if (!result) {
        console.log("❌ FAILED: No result returned");
        allPassed = false;
        return;
    }
    
    // Format result as YYYY-MM-DD
    const year = result.getFullYear();
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const day = String(result.getDate()).padStart(2, '0');
    const formattedResult = `${year}-${month}-${day}`;
    
    console.log(`   Input due date: ${testCase.task.due_date}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got: ${formattedResult}`);
    
    if (formattedResult === testCase.expected) {
        console.log("✅ PASSED\n");
    } else {
        console.log("❌ FAILED\n");
        allPassed = false;
    }
});

console.log("=".repeat(50));
if (allPassed) {
    console.log("🎉 All tests PASSED! The recurrence fix is working correctly.");
} else {
    console.log("❌ Some tests FAILED. Please check the implementation.");
}
console.log("=".repeat(50));
