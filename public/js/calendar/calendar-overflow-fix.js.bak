// Calendar overflow detection fix
// Adds overflow detection to calendar days with too many tasks or habits

document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar overflow detection fix loaded');

    // Function to check for overflow in calendar days
    function checkCalendarDaysOverflow() {
        console.log('Checking calendar days for overflow');
        
        // Find all calendar-tasks and calendar-habits elements
        const taskContainers = document.querySelectorAll('.calendar-tasks');
        const habitContainers = document.querySelectorAll('.calendar-habits');
        
        // Check tasks containers for overflow
        taskContainers.forEach(container => {
            if (container.scrollHeight > container.clientHeight) {
                console.log('Task container has overflow');
                container.classList.add('has-overflow');
            } else {
                container.classList.remove('has-overflow');
            }
        });
        
        // Check habits containers for overflow
        habitContainers.forEach(container => {
            if (container.scrollHeight > container.clientHeight) {
                console.log('Habit container has overflow');
                container.classList.add('has-overflow');
            } else {
                container.classList.remove('has-overflow');
            }
        });
    }
    
    // Run the overflow check after calendar is rendered
    // We need to wait a bit for the calendar to fully render
    setTimeout(checkCalendarDaysOverflow, 500);
    
    // Also run when window is resized
    window.addEventListener('resize', checkCalendarDaysOverflow);
    
    // Hook into the calendar's render function to check for overflow after rendering
    const originalRenderCalendar = window.renderCalendar;
    if (originalRenderCalendar) {
        window.renderCalendar = async function(...args) {
            await originalRenderCalendar.apply(this, args);
            // Wait a bit for the DOM to update
            setTimeout(checkCalendarDaysOverflow, 500);
        };
    }
});
