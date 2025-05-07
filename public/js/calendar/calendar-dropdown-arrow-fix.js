/**
 * Calendar Dropdown Arrow Fix
 * Changes the dropdown arrow direction based on open/closed state for all dropdowns in the calendar page
 */

document.addEventListener('DOMContentLoaded', function() {

    const calendarFilter = document.getElementById('calendarFilter');

    if (calendarFilter) {
        setupDropdownArrow(calendarFilter, '.calendar-filter');
    }

    const editTaskModal = document.getElementById('edit-task-modal');
    if (editTaskModal) {
        const modalSelects = editTaskModal.querySelectorAll('select');
        modalSelects.forEach(select => {
            const formGroup = select.closest('.form-group');
            if (formGroup) {

                formGroup.classList.add('form-group-select');
                setupDropdownArrow(select, '.form-group');
            }

            const formGroupHalf = select.closest('.form-group-half');
            if (formGroupHalf) {

                formGroupHalf.classList.add('form-group-half-select');
                setupDropdownArrow(select, '.form-group-half');
            }
        });
    }

    function setupDropdownArrow(selectElement, containerSelector) {

        function updateArrowDirection() {
            const container = selectElement.closest(containerSelector);
            if (!container) return;

            if (selectElement.matches(':focus')) {
                container.classList.add('dropdown-open');
            } else {
                container.classList.remove('dropdown-open');
            }
        }

        selectElement.addEventListener('focus', updateArrowDirection);
        selectElement.addEventListener('blur', updateArrowDirection);
        selectElement.addEventListener('change', updateArrowDirection);

        updateArrowDirection();

        selectElement.addEventListener('click', function() {
            const container = this.closest(containerSelector);
            if (container) {
                container.classList.toggle('dropdown-open');
            }
        });

        document.addEventListener('click', function(event) {
            if (!selectElement.contains(event.target)) {
                const container = selectElement.closest(containerSelector);
                if (container) {
                    container.classList.remove('dropdown-open');
                }
            }
        });
    }

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

                                    formGroup.classList.add('form-group-select');
                                    setupDropdownArrow(select, '.form-group');
                                }

                                const formGroupHalf = select.closest('.form-group-half');
                                if (formGroupHalf) {

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

    observer.observe(document.body, { childList: true, subtree: true });
});
