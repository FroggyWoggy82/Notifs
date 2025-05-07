/**
 * Calendar Refresh Fix
 *
 * This script adds event listeners to refresh the calendar when tasks are completed or updated.
 * It specifically addresses the issue where recurring tasks don't appear on the calendar
 * after being checked off.
 *
 * Updated to prevent multiple renderings of the same month.
 */

(function() {
    console.log('Calendar refresh fix loaded');

    // Function to navigate to the calendar page and refresh it
    function refreshCalendar() {
        console.log('Refreshing calendar...');

        // If we're already on the calendar page, use the fetchTasks function instead of reloading
        if (window.location.pathname.includes('calendar.html')) {
            console.log('Already on calendar page, refreshing data...');
            if (typeof window.fetchTasks === 'function') {
                // Set force render flag to true to bypass the duplicate render check
                window.forceRender = true;

                window.fetchTasks(true).then(() => {
                    // After fetching tasks, re-render the calendar
                    if (typeof window.renderCalendar === 'function' && typeof window.currentDate !== 'undefined') {
                        console.log('Re-rendering calendar with current date');
                        // Only render once with the force flag set
                        window.renderCalendar(window.currentDate.getFullYear(), window.currentDate.getMonth());
                    }
                    console.log('Calendar data refreshed');
                });
            }
            return;
        }

        // Otherwise, store a flag in localStorage to indicate that the calendar should be refreshed
        localStorage.setItem('refreshCalendar', 'true');
        console.log('Set refreshCalendar flag in localStorage');
    }

    // Add event listeners for task completion and update events
    document.addEventListener('taskCompleted', function(event) {
        console.log('Task completed event detected, will refresh calendar');
        refreshCalendar();
    });

    document.addEventListener('taskUpdated', function(event) {
        console.log('Task updated event detected, will refresh calendar');
        refreshCalendar();
    });

    // Check if we need to refresh the calendar when the page loads
    if (window.location.pathname.includes('calendar.html')) {
        const shouldRefresh = localStorage.getItem('refreshCalendar');
        if (shouldRefresh === 'true') {
            console.log('Calendar refresh flag detected, refreshing calendar...');
            localStorage.removeItem('refreshCalendar');

            // Wait for the calendar to load before refreshing
            window.addEventListener('load', function() {
                console.log('Calendar loaded, refreshing data...');
                if (typeof window.fetchTasks === 'function') {
                    // Set force render flag to true to bypass the duplicate render check
                    window.forceRender = true;

                    window.fetchTasks(true).then(() => {
                        console.log('Calendar data refreshed');
                    });
                }
            });
        }
    }
})();
