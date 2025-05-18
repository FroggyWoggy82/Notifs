/**
 * Duplicate Task Fix
 * Prevents duplicate tasks from being created when submitting the add task form
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the add task form
    const addTaskForm = document.getElementById('addTaskForm');

    if (addTaskForm) {
        console.log('Applying duplicate task prevention fix');

        // Flag to track if a submission is in progress
        let isSubmitting = false;

        // First, try to directly override the existing event handler from script.js
        if (addTaskForm.onsubmit) {
            console.log('Found existing onsubmit handler, overriding it');
            addTaskForm.onsubmit = null;
        }

        // Remove any existing event listeners by cloning the form
        const newForm = addTaskForm.cloneNode(true);
        addTaskForm.parentNode.replaceChild(newForm, addTaskForm);

        // Get the new form reference
        const fixedAddTaskForm = document.getElementById('addTaskForm');

        // Add our single event listener
        fixedAddTaskForm.addEventListener('submit', async function(event) {
            // Prevent the default form submission
            event.preventDefault();

            // If a submission is already in progress, ignore this submission
            if (isSubmitting) {
                console.log('Task submission already in progress, ignoring duplicate submission');
                return false;
            }

            // Set the flag to indicate a submission is in progress
            isSubmitting = true;

            // Get the add task button
            const addTaskBtn = document.getElementById('addTaskBtn');
            if (addTaskBtn) {
                addTaskBtn.disabled = true;
                addTaskBtn.textContent = 'Adding...';
            }

            // Create a function to reset the submission state
            const resetSubmitState = () => {
                isSubmitting = false;
                if (addTaskBtn) {
                    addTaskBtn.disabled = false;
                    addTaskBtn.textContent = 'Add Task';
                }
            };

            try {
                // Get form data
                const taskTitleInput = document.getElementById('taskTitle');
                const taskDescriptionInput = document.getElementById('taskDescription');
                const taskDueDateInput = document.getElementById('taskDueDate');
                const taskDurationInput = document.getElementById('taskDuration');
                const taskRecurrenceTypeInput = document.getElementById('taskRecurrenceType');
                const taskRecurrenceIntervalInput = document.getElementById('taskRecurrenceInterval');

                // Validate required fields
                if (!taskTitleInput || !taskTitleInput.value.trim()) {
                    throw new Error('Task title cannot be empty');
                }

                // Build the task data object
                const data = {
                    title: taskTitleInput.value.trim(),
                    description: taskDescriptionInput ? taskDescriptionInput.value.trim() : '',
                    dueDate: taskDueDateInput ? taskDueDateInput.value : null,
                    duration: taskDurationInput ? parseInt(taskDurationInput.value, 10) : 1,
                    recurrenceType: taskRecurrenceTypeInput ? taskRecurrenceTypeInput.value : 'none',
                    recurrenceInterval: taskRecurrenceTypeInput && taskRecurrenceTypeInput.value !== 'none' ?
                        (taskRecurrenceIntervalInput ? parseInt(taskRecurrenceIntervalInput.value, 10) : 1) : null
                };

                // Add reminder information if available
                const reminderTypes = [];
                document.querySelectorAll('.reminder-checkbox:checked').forEach(checkbox => {
                    reminderTypes.push(checkbox.value);
                });

                if (reminderTypes.length > 0) {
                    data.reminderType = reminderTypes.join(',');

                    // Handle custom reminder time
                    if (reminderTypes.includes('custom')) {
                        const taskReminderTimeInput = document.getElementById('taskReminderTime');
                        if (taskReminderTimeInput && taskReminderTimeInput.value) {
                            data.reminderTime = taskReminderTimeInput.value;
                        }
                    }
                }

                // Create a unique request ID to prevent duplicate API calls
                const requestId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

                // Store the request ID in sessionStorage to prevent duplicate submissions
                const existingRequests = JSON.parse(sessionStorage.getItem('taskRequests') || '[]');

                // Check if we've already made this exact request in the last 5 seconds
                const now = Date.now();
                const recentRequests = existingRequests.filter(req => {
                    return now - req.timestamp < 5000 &&
                           req.title === data.title &&
                           req.description === data.description;
                });

                if (recentRequests.length > 0) {
                    console.warn('Detected duplicate task request within 5 seconds, aborting:', data);
                    throw new Error('Duplicate task request detected and prevented');
                }

                // Add this request to the list
                existingRequests.push({
                    id: requestId,
                    timestamp: now,
                    title: data.title,
                    description: data.description
                });

                // Keep only the last 10 requests
                while (existingRequests.length > 10) {
                    existingRequests.shift();
                }

                // Save the updated list
                sessionStorage.setItem('taskRequests', JSON.stringify(existingRequests));

                // Send the request to create the task
                const timestamp = Date.now();
                const response = await fetch(`/api/tasks?_=${timestamp}&requestId=${requestId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                        'X-Request-ID': requestId
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const newTask = await response.json();
                console.log("Task added successfully:", newTask);

                // Reload tasks to show the new task
                if (typeof loadTasks === 'function') {
                    loadTasks(true);
                }

                // Reset the form
                fixedAddTaskForm.reset();

                // Show success message
                const addTaskStatusDiv = document.getElementById('addTaskStatus');
                if (addTaskStatusDiv) {
                    addTaskStatusDiv.textContent = "Task added successfully!";
                    addTaskStatusDiv.className = "status success";
                    addTaskStatusDiv.style.display = 'block';
                    setTimeout(() => { addTaskStatusDiv.style.display = 'none'; }, 4000);
                }

                // Close the modal
                const addTaskModal = document.getElementById('addTaskModal');
                if (addTaskModal) {
                    addTaskModal.style.display = 'none';
                }

            } catch (error) {
                console.error('Error adding task:', error);

                // Show error message
                const addTaskStatusDiv = document.getElementById('addTaskStatus');
                if (addTaskStatusDiv) {
                    addTaskStatusDiv.textContent = `Error adding task: ${error.message}`;
                    addTaskStatusDiv.className = "status error";
                    addTaskStatusDiv.style.display = 'block';
                    setTimeout(() => { addTaskStatusDiv.style.display = 'none'; }, 4000);
                }
            } finally {
                // Reset submission state
                resetSubmitState();
            }

            return false;
        });

        console.log('Duplicate task prevention fix applied successfully');
    }
});
