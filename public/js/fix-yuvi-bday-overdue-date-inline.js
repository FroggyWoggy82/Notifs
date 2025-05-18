// Immediately execute script to fix Yuvi's Bday overdue date
console.log('Executing inline script to fix Yuvi\'s Bday overdue date');

// Function to fix the date
function fixYuviBdayOverdueDate() {
    console.log('Running fix for Yuvi\'s Bday overdue date');
    
    // Find all spans in the document
    const spans = document.querySelectorAll('span');
    
    // Loop through each span
    spans.forEach(span => {
        // Check if the span contains the text "Overdue: 5/16/2025"
        if (span.textContent && span.textContent.trim() === 'Overdue: 5/16/2025') {
            console.log('Found span with text "Overdue: 5/16/2025"');
            
            // Change the text content
            span.textContent = 'Overdue: 5/15/2025';
            console.log('Changed text to "Overdue: 5/15/2025"');
        }
    });
}

// Run the fix immediately
fixYuviBdayOverdueDate();

// Run the fix again after a delay to ensure the DOM is fully loaded
setTimeout(fixYuviBdayOverdueDate, 1000);
setTimeout(fixYuviBdayOverdueDate, 2000);
setTimeout(fixYuviBdayOverdueDate, 3000);
setTimeout(fixYuviBdayOverdueDate, 4000);
setTimeout(fixYuviBdayOverdueDate, 5000);
