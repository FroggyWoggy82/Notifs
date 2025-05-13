/**
 * Subtask Checkbox Fix
 * Enables subtask checkboxes in the edit task modal and adds functionality to update completion status
 */

(function() {
    console.log('[Subtask Checkbox Fix] Initializing...');

    // Function to handle subtask checkbox changes
    async function handleSubtaskCheckboxChange(event, subtaskId, parentTaskId) {
        const checkbox = event.target;
        const subtaskItem = checkbox.closest('.modal-subtask-item');
        const isComplete = checkbox.checked;

        console.log(`[Subtask Checkbox Fix] Toggling subtask ${subtaskId} to complete=${isComplete}`);

        try {
            // Update the UI optimistically
            subtaskItem.classList.toggle('complete', isComplete);

            // Send the update to the server
            const response = await fetch(`/api/tasks/${subtaskId}/toggle-completion`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_complete: isComplete })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedSubtask = await response.json();
            console.log("[Subtask Checkbox Fix] Subtask updated:", updatedSubtask);

            // Update the subtask in the editSubtasks array if it exists
            if (window.editSubtasks && Array.isArray(window.editSubtasks)) {
                const subtaskIndex = window.editSubtasks.findIndex(s => s.id === subtaskId);
                if (subtaskIndex !== -1) {
                    window.editSubtasks[subtaskIndex].is_complete = isComplete;
                    console.log(`[Subtask Checkbox Fix] Updated subtask in editSubtasks array:`, window.editSubtasks[subtaskIndex]);
                }
            }

            // Check if all subtasks are complete to update parent task
            if (typeof window.checkAllSubtasksComplete === 'function') {
                const allComplete = await window.checkAllSubtasksComplete(parentTaskId);
                console.log(`[Subtask Checkbox Fix] All subtasks complete for parent ${parentTaskId}: ${allComplete}`);
            }
        } catch (error) {
            console.error('[Subtask Checkbox Fix] Error updating subtask:', error);

            // Revert the UI change if there was an error
            checkbox.checked = !isComplete;
            subtaskItem.classList.toggle('complete', !isComplete);

            // Show an error message
            alert('Failed to update subtask. Please try again.');
        }
    }

    // Function to enable subtask checkboxes in the edit task modal
    function enableSubtaskCheckboxes() {
        // Get the edit task modal
        const editTaskModal = document.getElementById('editTaskModal');
        if (!editTaskModal) {
            console.error('[Subtask Checkbox Fix] Edit task modal not found');
            return;
        }

        // Create a MutationObserver to watch for changes to the modal
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Check if the modal is visible
                    if (editTaskModal.style.display !== 'none') {
                        console.log('[Subtask Checkbox Fix] Edit task modal is now visible, enabling subtask checkboxes...');

                        // Wait a bit for the subtasks to be loaded
                        setTimeout(function() {
                            // Get all subtask checkboxes in the modal
                            const subtaskCheckboxes = editTaskModal.querySelectorAll('.modal-subtask-item .subtask-checkbox');

                            console.log(`[Subtask Checkbox Fix] Found ${subtaskCheckboxes.length} subtask checkboxes`);

                            // Enable each checkbox and add event listener
                            subtaskCheckboxes.forEach(function(checkbox) {
                                // Remove the disabled attribute
                                checkbox.disabled = false;

                                // Get the subtask ID and parent task ID
                                const subtaskItem = checkbox.closest('.modal-subtask-item');
                                const subtaskId = subtaskItem.getAttribute('data-task-id');
                                const parentTaskId = subtaskItem.getAttribute('data-parent-id');

                                console.log(`[Subtask Checkbox Fix] Enabling checkbox for subtask ${subtaskId}`);

                                // Add event listener for checkbox changes
                                checkbox.addEventListener('change', function(event) {
                                    handleSubtaskCheckboxChange(event, subtaskId, parentTaskId);
                                });
                            });
                        }, 500); // Wait 500ms for the subtasks to be loaded
                    }
                }
            });
        });

        // Start observing the modal
        observer.observe(editTaskModal, { attributes: true });
        console.log('[Subtask Checkbox Fix] Now observing the edit task modal for visibility changes');
    }

    // Initialize when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[Subtask Checkbox Fix] DOM content loaded, enabling subtask checkboxes...');
            enableSubtaskCheckboxes();
        });
    } else {
        console.log('[Subtask Checkbox Fix] DOM already loaded, enabling subtask checkboxes...');
        enableSubtaskCheckboxes();
    }

    console.log('[Subtask Checkbox Fix] Initialized');
})();
