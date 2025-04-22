/**
 * Mobile Layout Adjustments for Workout Page
 * This script adds mobile-specific classes and attributes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run on mobile devices
    if (window.innerWidth < 600) {
        // Add a class to the body to indicate mobile view
        document.body.classList.add('mobile-workout-view');

        // Set up a MutationObserver to watch for new set rows
        const exerciseList = document.getElementById('current-exercise-list');
        if (exerciseList) {
            const observer = new MutationObserver(function(mutations) {
                // When new content is added, ensure mobile styles are applied
                if (document.body.classList.contains('mobile-workout-view')) {
                    // Force a small layout shift to trigger CSS recalculation
                    exerciseList.style.opacity = '0.99';
                    setTimeout(() => {
                        exerciseList.style.opacity = '1';
                    }, 10);
                }
            });

            observer.observe(exerciseList, {
                childList: true,
                subtree: true
            });
        }
    }

    // Handle orientation changes
    window.addEventListener('resize', function() {
        if (window.innerWidth < 600) {
            document.body.classList.add('mobile-workout-view');
        } else {
            document.body.classList.remove('mobile-workout-view');
        }
    });
});
