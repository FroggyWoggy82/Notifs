/**
 * Workout FAB Fix
 * Ensures the FAB is properly displayed in the active workout page
 */

document.addEventListener('DOMContentLoaded', function() {

    const fab = document.getElementById('add-exercise-fab');
    
    if (!fab) return;

    function updateFabVisibility() {

        const activeWorkoutPage = document.getElementById('active-workout-page');
        if (!activeWorkoutPage) return;

        if (activeWorkoutPage.classList.contains('active')) {
            fab.style.display = 'flex';
        } else {
            fab.style.display = 'none';
        }
    }

    updateFabVisibility();

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

    const pages = document.querySelectorAll('.page');
    pages.forEach(function(page) {
        observer.observe(page, { attributes: true });
    });

    if (window.switchPage) {
        const originalSwitchPage = window.switchPage;
        window.switchPage = function(pageToShow) {

            originalSwitchPage(pageToShow);

            setTimeout(updateFabVisibility, 100);
        };
    }
});
