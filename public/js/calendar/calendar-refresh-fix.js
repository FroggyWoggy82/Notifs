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

    function refreshCalendar() {
        console.log('Refreshing calendar...');

        if (window.location.pathname.includes('calendar.html')) {
            console.log('Already on calendar page, refreshing data...');
            if (typeof window.fetchTasks === 'function') {

                window.forceRender = true;

                window.fetchTasks(true).then(() => {

                    if (typeof window.renderCalendar === 'function' && typeof window.currentDate !== 'undefined') {
                        console.log('Re-rendering calendar with current date');

                        window.renderCalendar(window.currentDate.getFullYear(), window.currentDate.getMonth());
                    }
                    console.log('Calendar data refreshed');
                });
            }
            return;
        }

        localStorage.setItem('refreshCalendar', 'true');
        console.log('Set refreshCalendar flag in localStorage');
    }

    document.addEventListener('taskCompleted', function(event) {
        console.log('Task completed event detected, will refresh calendar');
        refreshCalendar();
    });

    document.addEventListener('taskUpdated', function(event) {
        console.log('Task updated event detected, will refresh calendar');
        refreshCalendar();
    });

    if (window.location.pathname.includes('calendar.html')) {
        const shouldRefresh = localStorage.getItem('refreshCalendar');
        if (shouldRefresh === 'true') {
            console.log('Calendar refresh flag detected, refreshing calendar...');
            localStorage.removeItem('refreshCalendar');

            window.addEventListener('load', function() {
                console.log('Calendar loaded, refreshing data...');
                if (typeof window.fetchTasks === 'function') {

                    window.forceRender = true;

                    window.fetchTasks(true).then(() => {
                        console.log('Calendar data refreshed');
                    });
                }
            });
        }
    }
})();
