
document.addEventListener('DOMContentLoaded', function() {
    console.log("Edit modal fix script loaded");

    const editTaskModal = document.getElementById('editTaskModal');
    const editTaskForm = document.getElementById('editTaskForm');
    const editTaskIdInput = document.getElementById('editTaskId');
    const editTaskTitleInput = document.getElementById('editTaskTitle');
    const editTaskDescriptionInput = document.getElementById('editTaskDescription');
    const editTaskDueDateInput = document.getElementById('editTaskDueDate');
    const closeEditTaskModalBtn = editTaskModal.querySelector('.close-button');

    window.showEditTaskModal = function(task) {
        console.log("showEditTaskModal called with task:", task);

        if (editTaskIdInput) editTaskIdInput.value = task.id;
        if (editTaskTitleInput) editTaskTitleInput.value = task.title || '';
        if (editTaskDescriptionInput) editTaskDescriptionInput.value = task.description || '';
        if (editTaskDueDateInput) editTaskDueDateInput.value = task.due_date ? task.due_date.split('T')[0] : '';

        if (task.recurrence_type && document.getElementById('editTaskRecurrenceType')) {
            document.getElementById('editTaskRecurrenceType').value = task.recurrence_type;

            const intervalGroup = document.getElementById('editRecurrenceIntervalGroup');
            if (intervalGroup) {
                intervalGroup.style.display = task.recurrence_type !== 'none' ? 'block' : 'none';
            }

            if (task.recurrence_interval && document.getElementById('editTaskRecurrenceInterval')) {
                document.getElementById('editTaskRecurrenceInterval').value = task.recurrence_interval;
            }
        }

        if (task.duration && document.getElementById('editTaskDuration')) {
            document.getElementById('editTaskDuration').value = task.duration;
        }

        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        editTaskModal.style.removeProperty('display');
        editTaskModal.style.display = 'flex';
        editTaskModal.classList.add('modal-visible');

        const modalContent = editTaskModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = '#121212';
            modalContent.style.color = '#e0e0e0';
            modalContent.style.border = '1px solid #333';
        }

        const modalHeader = editTaskModal.querySelector('.modal-header h2');
        if (modalHeader) {
            modalHeader.style.color = '#00e676';
        }

        console.log("Modal should now be visible with dark theme");
    };

    document.addEventListener('click', function(event) {

        const editBtn = event.target.closest('.edit-task-btn');
        if (editBtn) {
            console.log("Edit button clicked via delegation");

            const taskItem = editBtn.closest('.task-item');
            if (taskItem) {
                const taskId = taskItem.getAttribute('data-task-id');
                console.log("Task ID:", taskId);

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

    if (closeEditTaskModalBtn) {
        closeEditTaskModalBtn.addEventListener('click', function() {
            editTaskModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === editTaskModal) {
            editTaskModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

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

                setTimeout(function() {
                    editTaskModal.style.display = 'none';
                    document.body.style.overflow = ''; // Restore scrolling

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
