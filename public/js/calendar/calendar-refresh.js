
document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar refresh script loaded');


    window.refreshCalendarForHabits = async function() {
        console.log('Refreshing calendar for habits...');

        if (window.location.pathname.includes('calendar.html') ||
            document.querySelector('.calendar-grid')) {

            console.log('On calendar page, refreshing calendar data for habits');

            if (typeof window.renderCalendar === 'function' && typeof window.currentDate !== 'undefined') {
                try {

                    if (typeof window.fetchHabits === 'function') {
                        await window.fetchHabits(window.currentDate.getFullYear(), window.currentDate.getMonth());
                    }

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

    document.addEventListener('habitCompleted', function(event) {
        console.log('Habit completed event detected, refreshing calendar');
        if (typeof window.refreshCalendarForHabits === 'function') {
            window.refreshCalendarForHabits();
        }
    });

    document.addEventListener('habitUncompleted', function(event) {
        console.log('Habit uncompleted event detected, refreshing calendar');
        if (typeof window.refreshCalendarForHabits === 'function') {
            window.refreshCalendarForHabits();
        }
    });

});
