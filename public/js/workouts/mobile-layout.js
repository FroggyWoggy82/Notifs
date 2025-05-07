/**
 * Mobile Layout Adjustments for Workout Page
 * This script adds mobile-specific classes and attributes
 */

document.addEventListener('DOMContentLoaded', function() {

    if (window.innerWidth < 600) {

        document.body.classList.add('mobile-workout-view');

        const exerciseList = document.getElementById('current-exercise-list');
        if (exerciseList) {
            const observer = new MutationObserver(function(mutations) {

                if (document.body.classList.contains('mobile-workout-view')) {

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

    window.addEventListener('resize', function() {
        if (window.innerWidth < 600) {
            document.body.classList.add('mobile-workout-view');
        } else {
            document.body.classList.remove('mobile-workout-view');
        }
    });
});
