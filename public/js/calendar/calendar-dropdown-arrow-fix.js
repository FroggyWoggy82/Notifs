/**
 * Calendar Dropdown Arrow Fix
 * Changes the dropdown arrow direction based on open/closed state for all dropdowns in the calendar page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the calendar filter dropdown
    const calendarFilter = document.getElementById('calendarFilter');

    if (calendarFilter) {
        setupDropdownArrow(calendarFilter, '.calendar-filter');
    }

    // Set up dropdown arrows for all select elements in the edit task modal
    const editTaskModal = document.getElementById('edit-task-modal');
    if (editTaskModal) {
        const modalSelects = editTaskModal.querySelectorAll('select');
        modalSelects.forEach(select => {
            const formGroup = select.closest('.form-group');
            if (formGroup) {
                // Add a class for browsers that don't support :has()
                formGroup.classList.add('form-group-select');
                setupDropdownArrow(select, '.form-group');
            }

            const formGroupHalf = select.closest('.form-group-half');
            if (formGroupHalf) {
                // Add a class for browsers that don't support :has()
                formGroupHalf.classList.add('form-group-half-select');
                setupDropdownArrow(select, '.form-group-half');
            }
        });
    }

    // Function to set up dropdown arrow behavior for a select element
    function setupDropdownArrow(selectElement, containerSelector) {
        // Function to update arrow direction
        function updateArrowDirection() {
            const container = selectElement.closest(containerSelector);
            if (!container) return;

            // Add a class to the container to indicate dropdown state
            if (selectElement.matches(':focus')) {
                container.classList.add('dropdown-open');
            } else {
                container.classList.remove('dropdown-open');
            }
        }

        // Add event listeners for focus, blur, and change events
        selectElement.addEventListener('focus', updateArrowDirection);
        selectElement.addEventListener('blur', updateArrowDirection);
        selectElement.addEventListener('change', updateArrowDirection);

        // Initialize arrow direction
        updateArrowDirection();

        // For click events on the dropdown
        selectElement.addEventListener('click', function() {
            const container = this.closest(containerSelector);
            if (container) {
                container.classList.toggle('dropdown-open');
            }
        });

        // Handle click outside to close dropdown
        document.addEventListener('click', function(event) {
            if (!selectElement.contains(event.target)) {
                const container = selectElement.closest(containerSelector);
                if (container) {
                    container.classList.remove('dropdown-open');
                }
            }
        });
    }

    // Handle dynamically added select elements (for modals that might be loaded later)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1) { // Only process Element nodes
                        const newSelects = node.querySelectorAll('select');
                        if (newSelects.length > 0) {
                            newSelects.forEach(select => {
                                const formGroup = select.closest('.form-group');
                                if (formGroup) {
                                    // Add a class for browsers that don't support :has()
                                    formGroup.classList.add('form-group-select');
                                    setupDropdownArrow(select, '.form-group');
                                }

                                const formGroupHalf = select.closest('.form-group-half');
                                if (formGroupHalf) {
                                    // Add a class for browsers that don't support :has()
                                    formGroupHalf.classList.add('form-group-half-select');
                                    setupDropdownArrow(select, '.form-group-half');
                                }
                            });
                        }
                    }
                }
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
});
