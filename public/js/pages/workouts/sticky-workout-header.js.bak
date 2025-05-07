/**
 * Sticky Workout Header
 * This script adds functionality to make the workout header sticky when scrolling
 */

(function() {
    // Function to handle scroll events
    function handleScroll() {
        const workoutHeader = document.querySelector('.workout-header');
        if (!workoutHeader) return;
        
        // Add 'scrolled' class when scrolled down
        if (window.scrollY > 10) {
            workoutHeader.classList.add('scrolled');
        } else {
            workoutHeader.classList.remove('scrolled');
        }
    }
    
    // Initialize the sticky header functionality
    function initStickyHeader() {
        console.log('[Sticky Header] Initializing sticky workout header');
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);
        
        // Initial check
        handleScroll();
    }
    
    // Run when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Sticky Header] DOM loaded');
        initStickyHeader();
    });
    
    // Also run when the window is fully loaded
    window.addEventListener('load', function() {
        console.log('[Sticky Header] Window loaded');
        initStickyHeader();
    });
})();
