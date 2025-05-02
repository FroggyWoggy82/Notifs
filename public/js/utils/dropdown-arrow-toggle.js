/**
 * Dropdown Arrow Toggle
 * Changes the dropdown arrow direction based on open/closed state
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the task filter dropdown
    const taskFilter = document.getElementById('taskFilter');
    
    if (!taskFilter) return;
    
    // Function to update arrow direction
    function updateArrowDirection() {
        const container = taskFilter.closest('.task-filter-container');
        if (!container) return;
        
        // Add a class to the container to indicate dropdown state
        if (taskFilter.matches(':focus')) {
            container.classList.add('dropdown-open');
        } else {
            container.classList.remove('dropdown-open');
        }
    }
    
    // Add event listeners for focus, blur, and change events
    taskFilter.addEventListener('focus', updateArrowDirection);
    taskFilter.addEventListener('blur', updateArrowDirection);
    taskFilter.addEventListener('change', updateArrowDirection);
    
    // Initialize arrow direction
    updateArrowDirection();
    
    // For click events on the dropdown
    taskFilter.addEventListener('click', function() {
        const container = this.closest('.task-filter-container');
        if (container) {
            container.classList.toggle('dropdown-open');
        }
    });
    
    // Handle click outside to close dropdown
    document.addEventListener('click', function(event) {
        if (!taskFilter.contains(event.target)) {
            const container = taskFilter.closest('.task-filter-container');
            if (container) {
                container.classList.remove('dropdown-open');
            }
        }
    });
});
