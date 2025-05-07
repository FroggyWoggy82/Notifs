/**
 * Dropdown Arrow Toggle
 * Changes the dropdown arrow direction based on open/closed state
 */

document.addEventListener('DOMContentLoaded', function() {

    const taskFilter = document.getElementById('taskFilter');
    
    if (!taskFilter) return;

    function updateArrowDirection() {
        const container = taskFilter.closest('.task-filter-container');
        if (!container) return;

        if (taskFilter.matches(':focus')) {
            container.classList.add('dropdown-open');
        } else {
            container.classList.remove('dropdown-open');
        }
    }

    taskFilter.addEventListener('focus', updateArrowDirection);
    taskFilter.addEventListener('blur', updateArrowDirection);
    taskFilter.addEventListener('change', updateArrowDirection);

    updateArrowDirection();

    taskFilter.addEventListener('click', function() {
        const container = this.closest('.task-filter-container');
        if (container) {
            container.classList.toggle('dropdown-open');
        }
    });

    document.addEventListener('click', function(event) {
        if (!taskFilter.contains(event.target)) {
            const container = taskFilter.closest('.task-filter-container');
            if (container) {
                container.classList.remove('dropdown-open');
            }
        }
    });
});
