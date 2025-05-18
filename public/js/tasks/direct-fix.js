/**
 * Direct Fix for Duplicate Task Creation
 * This script directly overrides the Add Task button click handler
 */

(function() {
    console.log('Direct duplicate task prevention loaded');

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded - Applying direct fix');

        // Get the add task button
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (!addTaskBtn) {
            console.error('Add task button not found');
            return;
        }

        console.log('Found add task button, applying direct fix');

        // Store the last submission time
        let lastSubmissionTime = 0;

        // Flag to track if a submission is in progress
        let isSubmitting = false;

        // Store the original click handler
        const originalClick = addTaskBtn.onclick;

        // Replace the click handler
        addTaskBtn.onclick = function(event) {
            // Prevent the default action
            event.preventDefault();

            console.log('Add task button clicked');

            // Check if a submission is already in progress
            if (isSubmitting) {
                console.log('Submission already in progress, ignoring click');
                return false;
            }

            // Check if this is a duplicate submission (within 3 seconds)
            const now = Date.now();
            if (now - lastSubmissionTime < 3000) {
                console.log('Duplicate submission detected (too soon after previous submission)');
                alert('Please wait a moment before submitting again.');
                return false;
            }

            // Update the submission timestamp
            lastSubmissionTime = now;

            // Set the flag to indicate a submission is in progress
            isSubmitting = true;

            // Disable the button
            addTaskBtn.disabled = true;
            const originalText = addTaskBtn.textContent;
            addTaskBtn.textContent = 'Adding...';

            // Get the form
            const addTaskForm = document.getElementById('addTaskForm');
            if (!addTaskForm) {
                console.error('Add task form not found');
                addTaskBtn.disabled = false;
                addTaskBtn.textContent = originalText;
                isSubmitting = false;
                return false;
            }

            // Get form data
            const taskTitleInput = document.getElementById('taskTitle');
            const taskDescriptionInput = document.getElementById('taskDescription');
            const taskDueDateInput = document.getElementById('taskDueDate');

            // Validate required fields
            if (!taskTitleInput || !taskTitleInput.value.trim()) {
                alert('Task title cannot be empty');
                addTaskBtn.disabled = false;
                addTaskBtn.textContent = originalText;
                isSubmitting = false;
                return false;
            }

            // Create a unique request ID
            const requestId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            // Build the task data object properly
            const taskData = {
                title: taskTitleInput.value.trim(),
                description: taskDescriptionInput ? taskDescriptionInput.value.trim() : '',
                dueDate: taskDueDateInput ? taskDueDateInput.value : null
            };

            // Get additional fields
            const taskDurationInput = document.getElementById('taskDuration');
            const taskRecurrenceTypeInput = document.getElementById('taskRecurrenceType');
            const taskRecurrenceIntervalInput = document.getElementById('taskRecurrenceInterval');

            // Add additional fields to the task data
            if (taskDurationInput) {
                taskData.duration = parseInt(taskDurationInput.value, 10) || 1;
            }

            if (taskRecurrenceTypeInput) {
                taskData.recurrenceType = taskRecurrenceTypeInput.value || 'none';

                if (taskRecurrenceTypeInput.value !== 'none' && taskRecurrenceIntervalInput) {
                    taskData.recurrenceInterval = parseInt(taskRecurrenceIntervalInput.value, 10) || 1;
                }
            }

            // Add reminder information if available
            const reminderTypes = [];
            document.querySelectorAll('.reminder-checkbox:checked').forEach(checkbox => {
                reminderTypes.push(checkbox.value);
            });

            if (reminderTypes.length > 0) {
                taskData.reminderType = reminderTypes.join(',');

                // Handle custom reminder time
                if (reminderTypes.includes('custom')) {
                    const taskReminderTimeInput = document.getElementById('taskReminderTime');
                    if (taskReminderTimeInput && taskReminderTimeInput.value) {
                        taskData.reminderTime = taskReminderTimeInput.value;
                    }
                }
            }

            console.log('Sending task data:', taskData);

            // Send the request to create the task
            fetch(`/api/tasks?_=${Date.now()}&requestId=${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-Request-ID': requestId
                },
                body: JSON.stringify(taskData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json()
                        .then(errorData => {
                            console.error('Server error details:', errorData);
                            throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
                        })
                        .catch(parseError => {
                            // If we can't parse the error as JSON, just throw a generic error
                            console.error('Error parsing error response:', parseError);
                            throw new Error(`Server error: ${response.status} ${response.statusText}`);
                        });
                }
                return response.json();
            })
            .then(newTask => {
                console.log("Task added successfully:", newTask);

                // Reload tasks to show the new task
                if (typeof loadTasks === 'function') {
                    loadTasks(true);
                }

                // Reset the form
                addTaskForm.reset();

                // Show success message
                const addTaskStatusDiv = document.getElementById('addTaskStatus');
                if (addTaskStatusDiv) {
                    addTaskStatusDiv.textContent = "Task added successfully!";
                    addTaskStatusDiv.className = "status success";
                    addTaskStatusDiv.style.display = 'block';
                    setTimeout(() => { addTaskStatusDiv.style.display = 'none'; }, 4000);
                }

                // Close the modal properly
                const addTaskModal = document.getElementById('addTaskModal');
                if (addTaskModal) {
                    // First remove any modal-specific styles that might be affecting scrolling
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.width = '';
                    document.body.style.height = '';
                    document.body.style.top = '';

                    // Then hide the modal
                    addTaskModal.style.display = 'none';

                    // Ensure scrolling is enabled
                    setTimeout(() => {
                        document.body.style.overflow = 'auto';
                        window.scrollTo(0, window.scrollY); // Force a small scroll to "wake up" the scrolling
                    }, 100);
                }
            })
            .catch(error => {
                console.error('Error adding task:', error);

                // Show error message
                const addTaskStatusDiv = document.getElementById('addTaskStatus');
                if (addTaskStatusDiv) {
                    addTaskStatusDiv.textContent = `Error adding task: ${error.message}`;
                    addTaskStatusDiv.className = "status error";
                    addTaskStatusDiv.style.display = 'block';
                    setTimeout(() => { addTaskStatusDiv.style.display = 'none'; }, 4000);
                }
            })
            .finally(() => {
                // Reset submission state
                addTaskBtn.disabled = false;
                addTaskBtn.textContent = originalText;

                // Ensure scrolling is enabled even if there was an error
                document.body.style.overflow = 'auto';

                // Reset the submission flag after a delay
                setTimeout(() => {
                    isSubmitting = false;
                }, 1000);
            });

            return false;
        };

        // Also prevent the form from submitting directly
        const addTaskForm = document.getElementById('addTaskForm');
        if (addTaskForm) {
            addTaskForm.onsubmit = function(event) {
                event.preventDefault();
                return false;
            };
        }

        console.log('Direct duplicate task prevention applied successfully');
    });
})();
