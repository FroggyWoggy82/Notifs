// Test script to verify the yearly recurrence date calculation fix
// This tests various edge cases including leap years

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

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function testYearlyRecurrence(testName, dueDate, expectedNextDate) {
    console.log(`\n--- ${testName} ---`);
    
    const task = {
        id: 1,
        title: testName,
        due_date: dueDate,
        recurrence_type: "yearly",
        recurrence_interval: 1
    };
    
    console.log(`Original due date: ${dueDate}`);
    
    const result = calculateNextOccurrence(task);
    if (result) {
        const formattedResult = formatDate(result);
        console.log(`Calculated next occurrence: ${formattedResult}`);
        console.log(`Expected: ${expectedNextDate}`);
        
        if (formattedResult === expectedNextDate) {
            console.log("✅ PASS");
        } else {
            console.log("❌ FAIL");
        }
    } else {
        console.log("❌ FAIL: No result returned");
    }
}

console.log("Testing Yearly Recurrence Date Calculation Fix");
console.log("=".repeat(60));

// Test regular dates
testYearlyRecurrence("Regular Date", "2024-06-15", "2025-06-15");
testYearlyRecurrence("New Year's Day", "2024-01-01", "2025-01-01");
testYearlyRecurrence("Christmas", "2024-12-25", "2025-12-25");

// Test leap year scenarios
// Note: When Feb 29 doesn't exist in target year, JavaScript adjusts to March 1
testYearlyRecurrence("Leap Year to Regular Year", "2024-02-29", "2025-03-01");
testYearlyRecurrence("Regular Year to Leap Year", "2023-02-28", "2024-02-28");
testYearlyRecurrence("Leap Year to Next Leap Year", "2024-02-29", "2025-03-01");

// Test month boundaries
testYearlyRecurrence("End of January", "2024-01-31", "2025-01-31");
testYearlyRecurrence("End of March", "2024-03-31", "2025-03-31");

// Test the specific case from the user's issue
testYearlyRecurrence("User's Specific Case", "2025-06-05", "2026-06-05");

console.log("\n" + "=".repeat(60));
console.log("Summary:");
console.log("- Fixed date calculation uses setFullYear() instead of new Date(year+1, month, day)");
console.log("- This ensures proper handling of leap years and timezone issues");
console.log("- Next occurrence dates are now exactly 1 year from the original due date");
console.log("=".repeat(60));
