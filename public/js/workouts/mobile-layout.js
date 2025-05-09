/**
 * Mobile Layout Adjustments for Workout Page
 * This script adds mobile-specific classes to enable responsive design
 * without using inline styles which can cause performance issues.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a mobile device
    function isMobileDevice() {
        return window.innerWidth < 600;
    }

    // Apply mobile classes if needed
    function applyMobileClasses() {
        if (isMobileDevice()) {
            document.body.classList.add('mobile-workout-view');
        } else {
            document.body.classList.remove('mobile-workout-view');
        }
    }

    // Initial application
    applyMobileClasses();

    // Apply on resize
    window.addEventListener('resize', applyMobileClasses);
});
