// Test script to verify the fix is working in the browser
// This script can be run in the browser console to test the date calculation

console.log("=== Testing Yearly Recurrence Date Calculation Fix ===");

// Test the calculateNextOccurrence function that should be available in the browser
if (typeof calculateNextOccurrence === 'function') {
    console.log("✅ calculateNextOccurrence function found");
    
    // Test cases
    const testCases = [
        {
            name: "Christmas 2024 -> 2025",
            task: {
                id: 1,
                title: "Christmas",
                due_date: "2024-12-25",
                recurrence_type: "yearly",
                recurrence_interval: 1
            },
            expected: "2025-12-25"
        },
        {
            name: "Birthday June 5, 2025 -> 2026",
            task: {
                id: 2,
                title: "Birthday",
                due_date: "2025-06-05",
                recurrence_type: "yearly",
                recurrence_interval: 1
            },
            expected: "2026-06-05"
        },
        {
            name: "New Year 2024 -> 2025",
            task: {
                id: 3,
                title: "New Year",
                due_date: "2024-01-01",
                recurrence_type: "yearly",
                recurrence_interval: 1
            },
            expected: "2025-01-01"
        },
        {
            name: "Leap Year Feb 29, 2024 -> 2025",
            task: {
                id: 4,
                title: "Leap Year Test",
                due_date: "2024-02-29",
                recurrence_type: "yearly",
                recurrence_interval: 1
            },
            expected: "2025-03-01" // JavaScript adjusts Feb 29 to March 1 in non-leap years
        }
    ];
    
    let passCount = 0;
    let totalTests = testCases.length;
    
    testCases.forEach(testCase => {
        console.log(`\n--- ${testCase.name} ---`);
        console.log(`Input: ${testCase.task.due_date}`);
        
        const result = calculateNextOccurrence(testCase.task);
        
        if (result) {
            const year = result.getFullYear();
            const month = String(result.getMonth() + 1).padStart(2, '0');
            const day = String(result.getDate()).padStart(2, '0');
            const formattedResult = `${year}-${month}-${day}`;
            
            console.log(`Result: ${formattedResult}`);
            console.log(`Expected: ${testCase.expected}`);
            
            if (formattedResult === testCase.expected) {
                console.log("✅ PASS");
                passCount++;
            } else {
                console.log("❌ FAIL");
            }
        } else {
            console.log("❌ FAIL: No result returned");
        }
    });
    
    console.log(`\n=== Test Summary ===`);
    console.log(`Passed: ${passCount}/${totalTests}`);
    
    if (passCount === totalTests) {
        console.log("🎉 ALL TESTS PASSED! The yearly recurrence fix is working correctly.");
    } else {
        console.log("⚠️ Some tests failed. The fix may need additional work.");
    }
    
} else {
    console.log("❌ calculateNextOccurrence function not found. Make sure you're on the tasks page.");
}

console.log("\n=== Fix Details ===");
console.log("The fix changed the date calculation from:");
console.log("  OLD: nextDate = new Date(year + interval, month, day)");
console.log("  NEW: nextDate = new Date(dueDate); nextDate.setFullYear(nextDate.getFullYear() + interval)");
console.log("\nThis ensures:");
console.log("- Proper timezone handling");
console.log("- Correct leap year behavior");
console.log("- Exact 1-year intervals between occurrences");
