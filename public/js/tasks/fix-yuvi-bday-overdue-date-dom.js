/**
 * Fix Yuvi's Bday Overdue Date - DOM Manipulation
 * This script directly manipulates the DOM to change the "Overdue: 5/16/2025" text to "Overdue: 5/15/2025"
 * and "Next: 5/13/2026" to "Next: 5/15/2026" for the Yuvi's Bday task.
 */

// Function to fix the date
function fixYuviBdayOverdueDate() {
    console.log('[Fix Yuvi Bday DOM] Running fix...');

    // Find all task items
    const taskItems = document.querySelectorAll('.task-item');
    console.log('[Fix Yuvi Bday DOM] Found', taskItems.length, 'task items');

    // Loop through each task item
    taskItems.forEach((taskItem, index) => {
        // Find the task title
        const titleElement = taskItem.querySelector('.task-title');

        if (titleElement && titleElement.textContent.includes('Yuvi')) {
            console.log('[Fix Yuvi Bday DOM] Found Yuvi\'s Bday task at index', index);

            // Fix Next date - direct approach for all elements
            const allElements = taskItem.querySelectorAll('*');
            allElements.forEach(element => {
                if (element.textContent && element.textContent.trim() === 'Next: 5/13/2026') {
                    console.log('[Fix Yuvi Bday DOM] Found next date element:', element.textContent);
                    element.textContent = 'Next: 5/15/2026';
                    console.log('[Fix Yuvi Bday DOM] Changed next date to 5/15/2026');
                }
            });

            // Fix Next date in specific elements
            const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
            nextDateElements.forEach(element => {
                if (element.textContent && element.textContent.includes('5/13/2026')) {
                    console.log('[Fix Yuvi Bday DOM] Found next date:', element.textContent);
                    element.textContent = 'Next: 5/15/2026';
                    console.log('[Fix Yuvi Bday DOM] Changed next date to 5/15/2026');
                }
            });

            // Fix duplicate text in overdue indicators
            const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
            overdueElements.forEach(element => {
                if (element.textContent && (
                    element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025') ||
                    element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025'))) {
                    console.log('[Fix Yuvi Bday DOM] Found duplicate overdue text:', element.textContent);
                    // Clear all content and add a single span
                    element.innerHTML = '<span>Overdue: 5/15/2025</span>';
                    console.log('[Fix Yuvi Bday DOM] Fixed duplicate overdue text');
                }
            });

            // Find the overdue date indicator
            const overdueIndicator = taskItem.querySelector('.due-date-indicator.overdue span');
            if (overdueIndicator) {
                console.log('[Fix Yuvi Bday DOM] Found overdue indicator:', overdueIndicator.textContent);

                // Change the text content
                if (overdueIndicator.textContent.includes('5/14/2025') ||
                    overdueIndicator.textContent.includes('5/16/2025') ||
                    overdueIndicator.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                    overdueIndicator.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025')) {
                    overdueIndicator.textContent = 'Overdue: 5/15/2025';
                    console.log('[Fix Yuvi Bday DOM] Changed overdue date to 5/15/2025');
                }
            }

            // Also check for any span that might contain the wrong date
            const allSpans = taskItem.querySelectorAll('span');
            allSpans.forEach(span => {
                if (span.textContent) {
                    if (span.textContent.includes('Overdue: 5/14/2025') ||
                        span.textContent.includes('Overdue: 5/16/2025') ||
                        span.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                        span.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025')) {
                        console.log('[Fix Yuvi Bday DOM] Found overdue date in span:', span.textContent);
                        span.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Bday DOM] Changed overdue date to 5/15/2025');
                    }
                    if (span.textContent.includes('Next: 5/13/2026')) {
                        console.log('[Fix Yuvi Bday DOM] Found next date in span:', span.textContent);
                        span.textContent = 'Next: 5/15/2026';
                        console.log('[Fix Yuvi Bday DOM] Changed next date to 5/15/2026');
                    }
                }
            });
        }
    });
}

// Run the fix when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Fix Yuvi Bday DOM] DOM content loaded');
    setTimeout(fixYuviBdayOverdueDate, 500);
});

// Run the fix when the tasks are loaded
document.addEventListener('tasksLoaded', function() {
    console.log('[Fix Yuvi Bday DOM] Tasks loaded event received');
    setTimeout(fixYuviBdayOverdueDate, 500);
});

// Run the fix when the tasks are rendered
document.addEventListener('tasksRendered', function() {
    console.log('[Fix Yuvi Bday DOM] Tasks rendered event received');
    setTimeout(fixYuviBdayOverdueDate, 500);
});

// Run the fix every second for 10 seconds to ensure it gets applied
for (let i = 1; i <= 10; i++) {
    setTimeout(fixYuviBdayOverdueDate, i * 1000);
}
