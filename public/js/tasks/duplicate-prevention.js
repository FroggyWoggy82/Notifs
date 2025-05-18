/**
 * Duplicate Task Prevention
 * Direct approach to prevent duplicate task creation
 */

(function() {
    console.log('Duplicate prevention script loaded');
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded - Initializing duplicate task prevention');
        
        // Get the add task form
        const addTaskForm = document.getElementById('addTaskForm');
        if (!addTaskForm) {
            console.error('Add task form not found');
            return;
        }
        
        // Get the add task button
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (!addTaskBtn) {
            console.error('Add task button not found');
            return;
        }
        
        console.log('Found add task form and button, applying prevention');
        
        // Store the last submission time
        let lastSubmissionTime = 0;
        
        // Flag to track if a submission is in progress
        let isSubmitting = false;
        
        // Store the original click handler
        const originalClickHandler = addTaskBtn.onclick;
        
        // Replace the click handler
        addTaskBtn.onclick = function(event) {
            // Prevent the default action
            event.preventDefault();
            event.stopPropagation();
            
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
                return false;
            }
            
            // Update the submission timestamp
            lastSubmissionTime = now;
            
            // Set the flag to indicate a submission is in progress
            isSubmitting = true;
            
            // Disable the button
            addTaskBtn.disabled = true;
            addTaskBtn.textContent = 'Adding...';
            
            // Submit the form
            console.log('Submitting form...');
            
            // Get form data
            const taskTitleInput = document.getElementById('taskTitle');
            const taskDescriptionInput = document.getElementById('taskDescription');
            const taskDueDateInput = document.getElementById('taskDueDate');
            const taskDurationInput = document.getElementById('taskDuration');
            const taskRecurrenceTypeInput = document.getElementById('taskRecurrenceType');
            const taskRecurrenceIntervalInput = document.getElementById('taskRecurrenceInterval');
            
            // Validate required fields
            if (!taskTitleInput || !taskTitleInput.value.trim()) {
                alert('Task title cannot be empty');
                addTaskBtn.disabled = false;
                addTaskBtn.textContent = 'Add Task';
                isSubmitting = false;
                return false;
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
            
            // Create a unique request ID
            const requestId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            
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
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
                
                // Close the modal
                const addTaskModal = document.getElementById('addTaskModal');
                if (addTaskModal) {
                    addTaskModal.style.display = 'none';
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
                addTaskBtn.textContent = 'Add Task';
                isSubmitting = false;
            });
            
            return false;
        };
        
        // Also prevent the form from submitting directly
        addTaskForm.onsubmit = function(event) {
            event.preventDefault();
            return false;
        };
        
        console.log('Duplicate task prevention applied successfully');
    });
})();
