/**
 * Force Mobile Layout
 * This script applies CSS classes instead of inline styles to workout elements
 * to ensure they have the correct size on mobile devices.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    if (window.innerWidth <= 599) {
        console.log('Applying forced mobile layout styles');

        // Add a class to the body to indicate mobile view
        document.body.classList.add('mobile-workout-view');

        // Apply the mobile layout class to the exercise list
        const exerciseList = document.getElementById('current-exercise-list');
        if (exerciseList) {
            exerciseList.classList.add('mobile-layout');
        }

        // Apply the mobile layout class to column headers
        const columnHeaders = document.querySelectorAll('.column-headers');
        columnHeaders.forEach(header => {
            header.classList.add('mobile-layout');
        });

        // Simplify header text
        const headerSpans = document.querySelectorAll('.column-headers span');
        headerSpans.forEach((span, index) => {
            if (index === 1 && span.textContent === 'Previous') {
                span.textContent = 'Prev';
            } else if (index === 2 && span.textContent === 'Weight') {
                span.textContent = 'Wt';
            }
        });

        console.log('Forced mobile layout styles applied');
    }
});
