/**
 * Fix Yuvi's Bday Overdue Date - Console Script
 * This script provides a function that can be run in the browser console to fix the overdue date.
 */

// Define the function to fix the date
function fixYuviBdayOverdueDate() {
    console.log('Running fix for Yuvi\'s Bday overdue date');
    
    // Find all task items
    const taskItems = document.querySelectorAll('.task-item');
    console.log('Found', taskItems.length, 'task items');
    
    // Loop through each task item
    for (let i = 0; i < taskItems.length; i++) {
        const taskItem = taskItems[i];
        
        // Find the task title
        const titleElement = taskItem.querySelector('.task-title');
        
        if (titleElement && titleElement.textContent.includes('Yuvi')) {
            console.log('Found Yuvi\'s Bday task at index', i);
            
            // Find all spans in the task item
            const spans = taskItem.querySelectorAll('span');
            
            // Loop through each span
            for (let j = 0; j < spans.length; j++) {
                const span = spans[j];
                
                // Check if the span contains the text "Overdue: 5/16/2025"
                if (span.textContent && span.textContent.includes('Overdue: 5/16/2025')) {
                    console.log('Found overdue date span:', span.textContent);
                    
                    // Change the text content
                    span.textContent = 'Overdue: 5/15/2025';
                    console.log('Changed overdue date to 5/15/2025');
                }
            }
        }
    }
}

// Print instructions to the console
console.log('To fix Yuvi\'s Bday overdue date, run the following function in the console:');
console.log('fixYuviBdayOverdueDate()');

// Make the function available globally
window.fixYuviBdayOverdueDate = fixYuviBdayOverdueDate;
