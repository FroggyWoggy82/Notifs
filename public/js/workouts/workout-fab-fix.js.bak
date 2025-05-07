/**
 * Workout FAB Fix
 * Ensures the FAB is properly displayed in the active workout page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the FAB element
    const fab = document.getElementById('add-exercise-fab');
    
    if (!fab) return;
    
    // Function to show/hide the FAB based on the current page
    function updateFabVisibility() {
        // Check if we're on the active workout page
        const activeWorkoutPage = document.getElementById('active-workout-page');
        if (!activeWorkoutPage) return;
        
        // Show the FAB if the active workout page is visible
        if (activeWorkoutPage.classList.contains('active')) {
            fab.style.display = 'flex';
        } else {
            fab.style.display = 'none';
        }
    }
    
    // Update FAB visibility initially
    updateFabVisibility();
    
    // Set up a MutationObserver to detect when the page changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' &&
                (mutation.target.id === 'active-workout-page' || 
                 mutation.target.id === 'workout-landing-page' ||
                 mutation.target.id === 'template-editor-page')) {
                updateFabVisibility();
            }
        });
    });
    
    // Observe all page elements for class changes
    const pages = document.querySelectorAll('.page');
    pages.forEach(function(page) {
        observer.observe(page, { attributes: true });
    });
    
    // Also listen for the switchPage function if it exists
    if (window.switchPage) {
        const originalSwitchPage = window.switchPage;
        window.switchPage = function(pageToShow) {
            // Call the original function
            originalSwitchPage(pageToShow);
            
            // Update FAB visibility
            setTimeout(updateFabVisibility, 100);
        };
    }
});
