// Script to refresh the calendar when habits are completed
document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar refresh script loaded');
    
    // Function to refresh the calendar
    window.refreshCalendar = async function() {
        console.log('Refreshing calendar...');
        
        // Check if we're on the calendar page
        if (window.location.pathname.includes('calendar.html') || 
            document.querySelector('.calendar-grid')) {
            
            console.log('On calendar page, refreshing calendar data');
            
            // If the calendar has already been initialized and has the renderCalendar function
            if (typeof renderCalendar === 'function' && typeof currentDate !== 'undefined') {
                try {
                    // Re-fetch habits and render the calendar
                    await fetchHabits(currentDate.getFullYear(), currentDate.getMonth());
                    await renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
                    console.log('Calendar refreshed successfully');
                } catch (error) {
                    console.error('Error refreshing calendar:', error);
                }
            } else {
                console.log('Calendar not fully initialized yet, cannot refresh');
            }
        } else {
            console.log('Not on calendar page, no need to refresh');
        }
    };
    
    // Listen for custom event that signals a habit was completed
    document.addEventListener('habitCompleted', function(event) {
        console.log('Habit completed event detected, refreshing calendar');
        if (typeof window.refreshCalendar === 'function') {
            window.refreshCalendar();
        }
    });
    
    // Also listen for habit uncompleted events
    document.addEventListener('habitUncompleted', function(event) {
        console.log('Habit uncompleted event detected, refreshing calendar');
        if (typeof window.refreshCalendar === 'function') {
            window.refreshCalendar();
        }
    });
});
