// Script to refresh the calendar when habits are completed
document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar refresh script loaded');

    // Function to refresh the calendar for habit events only
    // Note: Task events are handled by calendar-refresh-fix.js
    window.refreshCalendarForHabits = async function() {
        console.log('Refreshing calendar for habits...');

        // Check if we're on the calendar page
        if (window.location.pathname.includes('calendar.html') ||
            document.querySelector('.calendar-grid')) {

            console.log('On calendar page, refreshing calendar data for habits');

            // If the calendar has already been initialized and has the renderCalendar function
            if (typeof window.renderCalendar === 'function' && typeof window.currentDate !== 'undefined') {
                try {
                    // Re-fetch habits only (tasks are handled by calendar-refresh-fix.js)
                    if (typeof window.fetchHabits === 'function') {
                        await window.fetchHabits(window.currentDate.getFullYear(), window.currentDate.getMonth());
                    }

                    // Render the calendar with the updated data
                    await window.renderCalendar(window.currentDate.getFullYear(), window.currentDate.getMonth());
                    console.log('Calendar refreshed successfully for habits');
                } catch (error) {
                    console.error('Error refreshing calendar for habits:', error);
                }
            } else {
                console.log('Calendar not fully initialized yet, cannot refresh for habits');
            }
        } else {
            console.log('Not on calendar page, no need to refresh for habits');
        }
    };

    // Listen for custom event that signals a habit was completed
    document.addEventListener('habitCompleted', function(event) {
        console.log('Habit completed event detected, refreshing calendar');
        if (typeof window.refreshCalendarForHabits === 'function') {
            window.refreshCalendarForHabits();
        }
    });

    // Also listen for habit uncompleted events
    document.addEventListener('habitUncompleted', function(event) {
        console.log('Habit uncompleted event detected, refreshing calendar');
        if (typeof window.refreshCalendarForHabits === 'function') {
            window.refreshCalendarForHabits();
        }
    });

    // Note: Task events are now handled by calendar-refresh-fix.js
});
