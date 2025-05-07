


document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar overflow detection fix loaded');

    function checkCalendarDaysOverflow() {
        console.log('Checking calendar days for overflow');

        const taskContainers = document.querySelectorAll('.calendar-tasks');
        const habitContainers = document.querySelectorAll('.calendar-habits');

        taskContainers.forEach(container => {
            if (container.scrollHeight > container.clientHeight) {
                console.log('Task container has overflow');
                container.classList.add('has-overflow');
            } else {
                container.classList.remove('has-overflow');
            }
        });

        habitContainers.forEach(container => {
            if (container.scrollHeight > container.clientHeight) {
                console.log('Habit container has overflow');
                container.classList.add('has-overflow');
            } else {
                container.classList.remove('has-overflow');
            }
        });
    }


    setTimeout(checkCalendarDaysOverflow, 500);

    window.addEventListener('resize', checkCalendarDaysOverflow);

    const originalRenderCalendar = window.renderCalendar;
    if (originalRenderCalendar) {
        window.renderCalendar = async function(...args) {
            await originalRenderCalendar.apply(this, args);

            setTimeout(checkCalendarDaysOverflow, 500);
        };
    }
});
