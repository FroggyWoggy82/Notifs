/**
 * Fix Workouts Icon
 * This script specifically fixes the workouts icon in the bottom navigation
 */

window.addEventListener('load', function() {

    function fixWorkoutsIcon() {
        console.log('Fixing workouts icon...');

        const workoutsNavItem = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
        if (workoutsNavItem) {

            const iconElement = workoutsNavItem.querySelector('.nav-icon i');
            if (iconElement) {

                iconElement.className = '';
                iconElement.className = 'fas fa-dumbbell';

                iconElement.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
                iconElement.style.fontWeight = '900';
                iconElement.style.fontStyle = 'normal';
            }
        }
    }

    fixWorkoutsIcon();

    setTimeout(fixWorkoutsIcon, 100);
    setTimeout(fixWorkoutsIcon, 500);
    setTimeout(fixWorkoutsIcon, 1000);
});

document.addEventListener('DOMContentLoaded', function() {

    function fixWorkoutsIcon() {
        console.log('Fixing workouts icon (DOMContentLoaded)...');

        const workoutsNavItem = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
        if (workoutsNavItem) {

            const iconElement = workoutsNavItem.querySelector('.nav-icon i');
            if (iconElement) {

                iconElement.className = '';
                iconElement.className = 'fas fa-dumbbell';

                iconElement.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
                iconElement.style.fontWeight = '900';
                iconElement.style.fontStyle = 'normal';
            }
        }
    }

    fixWorkoutsIcon();

    setTimeout(fixWorkoutsIcon, 100);
    setTimeout(fixWorkoutsIcon, 500);
    setTimeout(fixWorkoutsIcon, 1000);
});
