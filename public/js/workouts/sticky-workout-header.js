/**
 * Sticky Workout Header
 * This script adds functionality to make the workout header sticky when scrolling
 */

(function() {

    function handleScroll() {
        const workoutHeader = document.querySelector('.workout-header');
        if (!workoutHeader) return;

        if (window.scrollY > 10) {
            workoutHeader.classList.add('scrolled');
        } else {
            workoutHeader.classList.remove('scrolled');
        }
    }

    function initStickyHeader() {
        console.log('[Sticky Header] Initializing sticky workout header');

        window.addEventListener('scroll', handleScroll);

        handleScroll();
    }

    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Sticky Header] DOM loaded');
        initStickyHeader();
    });

    window.addEventListener('load', function() {
        console.log('[Sticky Header] Window loaded');
        initStickyHeader();
    });
})();
