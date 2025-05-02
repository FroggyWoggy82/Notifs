// Edit Modal Fix - Direct approach to showing the edit task modal
document.addEventListener('DOMContentLoaded', function() {
    console.log("Edit modal fix script loaded");

    // Get the modal element
    const editTaskModal = document.getElementById('editTaskModal');
    const editTaskForm = document.getElementById('editTaskForm');
    const editTaskIdInput = document.getElementById('editTaskId');
    const editTaskTitleInput = document.getElementById('editTaskTitle');
    const editTaskDescriptionInput = document.getElementById('editTaskDescription');
    const editTaskDueDateInput = document.getElementById('editTaskDueDate');
    const closeEditTaskModalBtn = editTaskModal.querySelector('.close-button');

    // Create a global function to show the modal
    window.showEditTaskModal = function(task) {
        console.log("showEditTaskModal called with task:", task);

        // Populate the form fields
        if (editTaskIdInput) editTaskIdInput.value = task.id;
        if (editTaskTitleInput) editTaskTitleInput.value = task.title || '';
        if (editTaskDescriptionInput) editTaskDescriptionInput.value = task.description || '';
        if (editTaskDueDateInput) editTaskDueDateInput.value = task.due_date ? task.due_date.split('T')[0] : '';

        // Set recurrence type and interval if available
        if (task.recurrence_type && document.getElementById('editTaskRecurrenceType')) {
            document.getElementById('editTaskRecurrenceType').value = task.recurrence_type;

            // Show/hide interval input based on recurrence type
            const intervalGroup = document.getElementById('editRecurrenceIntervalGroup');
            if (intervalGroup) {
                intervalGroup.style.display = task.recurrence_type !== 'none' ? 'block' : 'none';
            }

            // Set interval value if available
            if (task.recurrence_interval && document.getElementById('editTaskRecurrenceInterval')) {
                document.getElementById('editTaskRecurrenceInterval').value = task.recurrence_interval;
            }
        }

        // Set duration if available
        if (task.duration && document.getElementById('editTaskDuration')) {
            document.getElementById('editTaskDuration').value = task.duration;
        }

        // Show the modal with dark theme styling
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        editTaskModal.style.removeProperty('display');
        editTaskModal.style.display = 'flex';
        editTaskModal.classList.add('modal-visible');

        // Apply dark theme styling
        const modalContent = editTaskModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = '#121212';
            modalContent.style.color = '#e0e0e0';
            modalContent.style.border = '1px solid #333';
        }

        // Style the header
        const modalHeader = editTaskModal.querySelector('.modal-header h2');
        if (modalHeader) {
            modalHeader.style.color = '#00e676';
        }

        console.log("Modal should now be visible with dark theme");
    };

    // Add event listener to all edit buttons
    document.addEventListener('click', function(event) {
        // Check if the clicked element is an edit button or its child
        const editBtn = event.target.closest('.edit-task-btn');
        if (editBtn) {
            console.log("Edit button clicked via delegation");

            // Get the task ID from the button's parent task item
            const taskItem = editBtn.closest('.task-item');
            if (taskItem) {
                const taskId = taskItem.getAttribute('data-task-id');
                console.log("Task ID:", taskId);

                // Fetch the task data
                fetch(`/api/tasks/${taskId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(task => {
                        console.log("Task data fetched:", task);
                        window.showEditTaskModal(task);
                    })
                    .catch(error => {
                        console.error("Error fetching task:", error);
                    });
            }
        }
    });

    // Close button event listener
    if (closeEditTaskModalBtn) {
        closeEditTaskModalBtn.addEventListener('click', function() {
            editTaskModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        });
    }

    // Close when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === editTaskModal) {
            editTaskModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

    // Handle form submission
    if (editTaskForm) {
        editTaskForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log("Edit task form submitted");

            const taskId = editTaskIdInput.value;
            if (!taskId) {
                console.error("No task ID found in edit form");
                return;
            }

            const saveButton = editTaskForm.querySelector('button[type="submit"]');
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent = 'Saving...';
            }

            // Gather form data
            const updatedData = {
                title: editTaskTitleInput.value.trim(),
                description: editTaskDescriptionInput.value.trim() || null,
                dueDate: editTaskDueDateInput.value || null
            };

            console.log("Updating task with data:", updatedData);

            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log("Task updated successfully:", result);

                // Close the modal
                setTimeout(function() {
                    editTaskModal.style.display = 'none';
                    document.body.style.overflow = ''; // Restore scrolling

                    // Reload the page to show updated task
                    window.location.reload();
                }, 1000);

            } catch (error) {
                console.error("Error updating task:", error);

                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent = 'Save Changes';
                }
            }
        });
    }
});
