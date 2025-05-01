/**
 * Checkbox Redesign
 * Ensures task checkboxes are properly styled and initialized
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to update task checkboxes
    function updateTaskCheckboxes() {
        // Get all task checkboxes
        const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');

        // For each checkbox, ensure it has the proper styling
        checkboxes.forEach(checkbox => {
            // Make sure the checkbox is properly sized
            checkbox.style.width = '24px';
            checkbox.style.height = '24px';

            // Make sure the checkbox has the proper border
            checkbox.style.border = '2px solid rgba(255, 255, 255, 0.4)';

            // Make sure the checkbox has the proper border-radius
            checkbox.style.borderRadius = '50%';

            // Make sure the checkbox has the proper background
            checkbox.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';

            // Make sure the checkbox has the proper box-shadow
            checkbox.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';

            // Make sure the checkbox has the proper transition
            checkbox.style.transition = 'all 0.2s ease';

            // Make sure the checkbox has the proper cursor
            checkbox.style.cursor = 'pointer';

            // Make sure the checkbox has the proper appearance
            checkbox.style.appearance = 'none';
            checkbox.style.webkitAppearance = 'none';

            // Make sure the checkbox has the proper position
            checkbox.style.position = 'relative';

            // Make sure the checkbox has the proper margin and padding
            checkbox.style.margin = '0';
            checkbox.style.padding = '0';

            // Make sure the checkbox has the proper transform
            checkbox.style.transform = 'none';

            // If the checkbox is checked, apply the checked styling
            if (checkbox.checked) {
                checkbox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                checkbox.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                checkbox.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
            }

            // Add event listener to update styling when checked/unchecked
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

            // Add hover event listeners
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

    // Function to update habit checkboxes
    function updateHabitCheckboxes() {
        // Get all habit checkboxes
        const checkboxes = document.querySelectorAll('.habit-item .habit-checkbox');

        // For each checkbox, ensure it has the proper styling
        checkboxes.forEach(checkbox => {
            // Make sure the checkbox is properly sized
            checkbox.style.width = '32px';
            checkbox.style.height = '32px';

            // Make sure the checkbox has the proper border
            checkbox.style.border = '2px solid rgba(255, 255, 255, 0.4)';

            // Make sure the checkbox has the proper border-radius
            checkbox.style.borderRadius = '50%';

            // Make sure the checkbox has the proper background
            checkbox.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';

            // Make sure the checkbox has the proper box-shadow
            checkbox.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';

            // Make sure the checkbox has the proper transition
            checkbox.style.transition = 'all 0.2s ease';

            // Make sure the checkbox has the proper cursor
            checkbox.style.cursor = 'pointer';

            // Make sure the checkbox has the proper appearance
            checkbox.style.appearance = 'none';
            checkbox.style.webkitAppearance = 'none';

            // Make sure the checkbox has the proper position
            checkbox.style.position = 'relative';

            // Make sure the checkbox has the proper margin and padding
            checkbox.style.margin = '0';
            checkbox.style.padding = '0';

            // If the checkbox is checked, apply the checked styling
            if (checkbox.checked) {
                checkbox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                checkbox.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                checkbox.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
            }

            // Add event listener to update styling when checked/unchecked
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

            // Add hover event listeners
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

    // Run the functions on page load
    updateTaskCheckboxes();
    updateHabitCheckboxes();

    // Also run them when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        updateTaskCheckboxes();
    });

    document.addEventListener('taskUpdated', function() {
        updateTaskCheckboxes();
    });

    // Create a MutationObserver to watch for new task elements
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are task items or contain task items
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // If this is a task item or contains task items
                        if (node.classList && node.classList.contains('task-item') ||
                            node.querySelector && node.querySelector('.task-item')) {
                            updateTaskCheckboxes();
                        }

                        // If this is a habit item or contains habit items
                        if (node.classList && node.classList.contains('habit-item') ||
                            node.querySelector && node.querySelector('.habit-item')) {
                            updateHabitCheckboxes();
                        }
                    }
                });
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Dispatch a custom event to notify that the checkboxes have been updated
    document.dispatchEvent(new CustomEvent('checkboxesUpdated'));
});
