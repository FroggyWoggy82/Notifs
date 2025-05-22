/**
 * Hide Sidebar Icon in Active Workout
 * This script adds a class to the body when the active workout page is visible
 * to hide the sidebar menu button
 */

(function() {
    // Function to update body class based on active page
    function updateBodyClass() {
        const activeWorkoutPage = document.getElementById('active-workout-page');
        
        if (activeWorkoutPage && activeWorkoutPage.classList.contains('active')) {
            // Active workout page is visible, add class to body
            document.body.classList.add('active-workout-visible');
        } else {
            // Active workout page is not visible, remove class from body
            document.body.classList.remove('active-workout-visible');
        }
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateBodyClass);
    } else {
        updateBodyClass();
    }
    
    // Monitor for page changes
    // This uses a MutationObserver to detect when the active class changes on pages
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                updateBodyClass();
            }
        });
    });
    
    // Start observing the workout pages for class changes
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        observer.observe(page, { attributes: true });
    });
    
    // Also hook into the switchPage function if it exists
    if (typeof window.switchPage === 'function') {
        const originalSwitchPage = window.switchPage;
        window.switchPage = function(pageId) {
            // Call the original function
            originalSwitchPage(pageId);
            // Update body class
            updateBodyClass();
        };
    }
})();
