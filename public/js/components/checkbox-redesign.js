/**
 * Checkbox Redesign
 * Ensures task checkboxes are properly styled and initialized
 */

document.addEventListener('DOMContentLoaded', function() {

    function updateTaskCheckboxes() {

        const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');

        checkboxes.forEach(checkbox => {

            checkbox.style.width = '24px';
            checkbox.style.height = '24px';

            checkbox.style.border = '2px solid rgba(255, 255, 255, 0.4)';

            checkbox.style.borderRadius = '50%';

            checkbox.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';

            checkbox.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';

            checkbox.style.transition = 'all 0.2s ease';

            checkbox.style.cursor = 'pointer';

            checkbox.style.appearance = 'none';
            checkbox.style.webkitAppearance = 'none';

            checkbox.style.position = 'relative';

            checkbox.style.margin = '0';
            checkbox.style.padding = '0';

            checkbox.style.transform = 'none';

            if (checkbox.checked) {
                checkbox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                checkbox.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                checkbox.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
            }

            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    this.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
                } else {
                    this.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    this.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';
                }
            });

            checkbox.addEventListener('mouseenter', function() {
                if (!this.checked) {
                    this.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                    this.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.2)';
                }
            });

            checkbox.addEventListener('mouseleave', function() {
                if (!this.checked) {
                    this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    this.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';
                }
            });
        });
    }

    function updateHabitCheckboxes() {

        const checkboxes = document.querySelectorAll('.habit-item .habit-checkbox');

        checkboxes.forEach(checkbox => {

            checkbox.style.width = '32px';
            checkbox.style.height = '32px';

            checkbox.style.border = '2px solid rgba(255, 255, 255, 0.4)';

            checkbox.style.borderRadius = '50%';

            checkbox.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';

            checkbox.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';

            checkbox.style.transition = 'all 0.2s ease';

            checkbox.style.cursor = 'pointer';

            checkbox.style.appearance = 'none';
            checkbox.style.webkitAppearance = 'none';

            checkbox.style.position = 'relative';

            checkbox.style.margin = '0';
            checkbox.style.padding = '0';

            if (checkbox.checked) {
                checkbox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                checkbox.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                checkbox.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
            }

            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    this.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
                } else {
                    this.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    this.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';
                }
            });

            checkbox.addEventListener('mouseenter', function() {
                if (!this.checked) {
                    this.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                    this.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.2)';
                }
            });

            checkbox.addEventListener('mouseleave', function() {
                if (!this.checked) {
                    this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    this.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';
                }
            });
        });
    }

    updateTaskCheckboxes();
    updateHabitCheckboxes();

    document.addEventListener('tasksLoaded', function() {
        updateTaskCheckboxes();
    });

    document.addEventListener('taskUpdated', function() {
        updateTaskCheckboxes();
    });

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {

                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node

                        if (node.classList && node.classList.contains('task-item') ||
                            node.querySelector && node.querySelector('.task-item')) {
                            updateTaskCheckboxes();
                        }

                        if (node.classList && node.classList.contains('habit-item') ||
                            node.querySelector && node.querySelector('.habit-item')) {
                            updateHabitCheckboxes();
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.dispatchEvent(new CustomEvent('checkboxesUpdated'));
});
