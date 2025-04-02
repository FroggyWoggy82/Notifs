// Initialize variables at the top
let scheduledNotifications = [];
let deferredPrompt;

// Wrap all DOM operations in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const notifyBtn = document.getElementById('notifyBtn');
    const statusDiv = document.getElementById('status');
    const permissionStatusDiv = document.getElementById('permissionStatus');

    // --- NEW Task Elements ---
    const addTaskForm = document.getElementById('addTaskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskReminderTimeInput = document.getElementById('taskReminderTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskListDiv = document.getElementById('taskList');
    const addTaskStatusDiv = document.getElementById('addTaskStatus');
    const taskListStatusDiv = document.getElementById('taskListStatus');
    // New form fields
    const taskAssignedDateInput = document.getElementById('taskAssignedDate');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskRecurrenceTypeInput = document.getElementById('taskRecurrenceType');
    const taskRecurrenceIntervalInput = document.getElementById('taskRecurrenceInterval');
    const recurrenceIntervalGroup = document.getElementById('recurrenceIntervalGroup');
    const recurrenceIntervalUnit = document.getElementById('recurrenceIntervalUnit');
    // --- End Task Elements ---

    // --- Habit Elements ---
    const habitListDiv = document.getElementById('habitList');
    const habitListStatusDiv = document.getElementById('habitListStatus');
    const addHabitBtn = document.getElementById('addHabitBtn');
    // --- End Habit Elements ---

    // --- Add Task Modal Elements ---
    const addTaskModal = document.getElementById('addTaskModal');
    const addTaskFab = document.getElementById('addTaskFab');
    const closeTaskModalBtn = addTaskModal.querySelector('.close-button');
    // --- End Task Modal Elements ---

    // --- Add Habit Modal Elements ---
    const addHabitModal = document.getElementById('addHabitModal');
    const closeHabitModalBtn = addHabitModal.querySelector('.close-button');
    const addHabitForm = document.getElementById('addHabitForm');
    const habitRecurrenceTypeInput = document.getElementById('habitRecurrenceType');
    const habitCompletionsGroup = document.getElementById('habitCompletionsGroup');
    // --- End Habit Modal Elements ---

    // --- Edit Habit Modal Elements ---
    const editHabitModal = document.getElementById('editHabitModal');
    const closeEditModalBtn = editHabitModal.querySelector('.close-button');
    const editHabitForm = document.getElementById('editHabitForm');
    const editHabitIdInput = document.getElementById('editHabitId');
    const editHabitTitleInput = document.getElementById('editHabitTitle');
    const editHabitRecurrenceTypeInput = document.getElementById('editHabitRecurrenceType');
    const editHabitCompletionsGroup = document.getElementById('editHabitCompletionsGroup');
    const editHabitCompletionsPerDayInput = document.getElementById('editHabitCompletionsPerDay');
    const editHabitStatusDiv = document.getElementById('editHabitStatus');
    // --- End Edit Habit Modal Elements ---

    let swRegistration = null;
    let allHabitsData = []; // Store fetched habits locally for editing

    // --- PWA & Notification Permission Handling (Keep Existing) ---
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        navigator.serviceWorker.register('/service-worker.js')
            .then(swReg => {
                console.log('Service Worker is registered', swReg);
                swRegistration = swReg;
                // Setup push subscription if permission is already granted
                checkNotificationPermission(true); // Check permission silently first
                 // --- NEW: Load tasks after SW is ready ---
                loadTasks();
                loadHabits(); // Load habits too
            })
            .catch(error => {
                console.error('Service Worker Error', error);
                updateStatus('Service Worker registration failed', true);
            });
    } else {
        console.warn('Push messaging is not supported');
        notifyBtn.textContent = 'Push Not Supported';
        notifyBtn.disabled = true;
        permissionStatusDiv.textContent = 'Push messaging is not supported by this browser.';
        permissionStatusDiv.className = 'notifications-status permission-denied';
         // --- NEW: Still load tasks even if push is not supported ---
         loadTasks();
         loadHabits(); // Load habits too
    }

    notifyBtn.addEventListener('click', () => {
        if (Notification.permission === 'granted') {
             console.log('Permission already granted, checking subscription...');
             setupPushSubscription(); // Re-check/setup subscription
        } else if (Notification.permission === 'denied') {
             updateStatus('Notification permission was previously denied. Please enable it in browser settings.', true);
        } else {
            requestNotificationPermission();
        }
    });

    function checkNotificationPermission(silent = false) {
        if (!('Notification' in window)) {
            permissionStatusDiv.textContent = 'Notifications not supported.';
            permissionStatusDiv.className = 'notifications-status permission-denied';
            notifyBtn.disabled = true;
            return;
        }

        const permission = Notification.permission;
        permissionStatusDiv.textContent = `Notification Permission: ${permission.toUpperCase()}`;
        permissionStatusDiv.classList.remove('permission-granted', 'permission-denied', 'permission-default');

        if (permission === 'granted') {
            permissionStatusDiv.classList.add('permission-granted');
            notifyBtn.textContent = 'Background Reminders Enabled';
            notifyBtn.disabled = true; // Or change to 'Refresh Subscription'?
             // If granted, ensure subscription is set up
             if (!silent) setupPushSubscription();
        } else if (permission === 'denied') {
            permissionStatusDiv.classList.add('permission-denied');
            notifyBtn.textContent = 'Enable Background Reminders';
            notifyBtn.disabled = false;
            if (!silent) updateStatus('Enable notifications in browser settings to use reminders.', true);
        } else {
            permissionStatusDiv.classList.add('permission-default');
            notifyBtn.textContent = 'Enable Background Reminders';
            notifyBtn.disabled = false;
        }
    }

     async function requestNotificationPermission() {
         try {
             const permissionResult = await Notification.requestPermission();
             checkNotificationPermission(); // Update UI based on new permission
             if (permissionResult === 'granted') {
                 console.log('Notification permission granted.');
                 updateStatus('Permission granted! Setting up background sync...', false);
                 await setupPushSubscription();
                 updateStatus('Background reminders enabled!', false);
             } else {
                 console.log('Notification permission denied.');
                 updateStatus('Permission denied. Reminders will not work in the background.', true);
             }
         } catch (error) {
             console.error('Error requesting notification permission:', error);
             updateStatus('Error requesting permission.', true);
         }
     }

    async function setupPushSubscription() {
        if (!swRegistration) {
            console.error('Service worker registration not found.');
            updateStatus('Service Worker not ready.', true);
            return;
        }

        try {
            let subscription = await swRegistration.pushManager.getSubscription();
            if (subscription) {
                console.log('User IS already subscribed.');
                 // Optional: Update server with latest subscription info? Might be redundant.
                 // sendSubscriptionToServer(subscription);
                 updateStatus('Already subscribed for background reminders.', false);
                 notifyBtn.disabled = true;
                 notifyBtn.textContent = 'Reminders Enabled';
            } else {
                console.log('User is NOT subscribed. Subscribing...');
                const applicationServerKey = urlBase64ToUint8Array('BM29P5O99J9F-DUOyqNwGyurNl5a3ZSkBa0ZlOLR9AylchmgPwHbCeZaFGlEcKoAUOaZvNk5aXa0dHSDS_RT2v0'); // Your public VAPID key
                subscription = await swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });
                console.log('User subscribed:', subscription);
                await sendSubscriptionToServer(subscription);
                updateStatus('Successfully subscribed for background reminders!', false);
                notifyBtn.disabled = true;
                notifyBtn.textContent = 'Reminders Enabled';
            }
        } catch (err) {
            console.error('Failed to subscribe the user: ', err);
            if (Notification.permission === 'denied') {
                updateStatus('Subscription failed: Permission denied.', true);
            } else {
                 updateStatus('Failed to subscribe for background reminders.', true);
            }
            notifyBtn.disabled = false; // Allow retry
            notifyBtn.textContent = 'Enable Background Reminders';
        }
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
        return outputArray;
    }

    async function sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch('/api/save-subscription', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) { throw new Error(`Server error: ${response.status}`); }
            const data = await response.json();
            console.log('Subscription save response:', data);
        } catch (error) {
            console.error('Error sending subscription to server:', error);
             updateStatus('Failed to save subscription state.', true);
        }
    }

    // --- General Status Update Function ---
    function updateStatus(message, isError = false) {
        console.log(`Status Update: ${message} (Error: ${isError})`);
        statusDiv.textContent = message;
        statusDiv.className = `status ${isError ? 'error' : 'success'}`;
        statusDiv.style.display = 'block';
        setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
    }

    // --- Task Specific Status Update Functions ---
    function updateAddTaskStatus(message, isError = false) {
        console.log(`Add Task Status: ${message} (Error: ${isError})`);
        addTaskStatusDiv.textContent = message;
        addTaskStatusDiv.className = `status ${isError ? 'error' : 'success'}`;
        addTaskStatusDiv.style.display = 'block';
        setTimeout(() => { addTaskStatusDiv.style.display = 'none'; }, 4000);
    }

    function updateTaskListStatus(message, isError = false) {
        console.log(`Task List Status: ${message} (Error: ${isError})`);
        taskListStatusDiv.textContent = message;
        taskListStatusDiv.className = `status ${isError ? 'error' : 'success'}`;
        taskListStatusDiv.style.display = 'block';
         // Make list status messages less transient
         // setTimeout(() => { taskListStatusDiv.style.display = 'none'; }, 5000);
    }

    // --- Task Management Functions ---

    // Load tasks from the server
    async function loadTasks() {
        console.log("Loading tasks...");
        updateTaskListStatus("Loading tasks...", false);
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const tasks = await response.json();
            console.log("Tasks loaded:", tasks);
            renderTaskList(tasks);
            updateTaskListStatus("", false); // Clear loading message
            taskListStatusDiv.style.display = 'none'; // Hide if successful
        } catch (error) {
            console.error('Error loading tasks:', error);
            taskListDiv.innerHTML = '<p class="error">Failed to load tasks. Please try refreshing.</p>';
            updateTaskListStatus("Error loading tasks.", true);
        }
    }

    // Render the list of tasks
    function renderTaskList(tasks) {
        taskListDiv.innerHTML = ''; // Clear current list
        if (!tasks || tasks.length === 0) {
            taskListDiv.innerHTML = '<p>No tasks yet. Add one above!</p>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskListDiv.appendChild(taskElement);
        });
    }

    // Create DOM element for a single task
    function createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.is_complete ? 'complete' : ''}`;
        div.setAttribute('data-task-id', task.id);

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.is_complete;
        checkbox.addEventListener('change', handleToggleComplete);

        // Task Content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        const titleSpan = document.createElement('span'); // Changed from p to span
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;
        contentDiv.appendChild(titleSpan);

        if (task.description) {
            const descSpan = document.createElement('span'); // Changed from p to span
            descSpan.className = 'task-description';
            descSpan.textContent = task.description;
            contentDiv.appendChild(descSpan);
        }

        // Display Reminder Time if active and exists
        if (task.reminder_time) {
            try {
                const reminderDate = new Date(task.reminder_time);
                // Only show active reminders or completed task reminders
                if (task.is_reminder_active || task.is_complete) {
                    const reminderSpan = document.createElement('span'); // Changed from p to span
                    reminderSpan.className = 'task-reminder';
                    reminderSpan.textContent = ` ${reminderDate.toLocaleString()}`;
                    if (!task.is_reminder_active && task.is_complete) {
                        reminderSpan.style.textDecoration = 'line-through';
                        reminderSpan.style.opacity = '0.7';
                    }
                    contentDiv.appendChild(reminderSpan);
                }
            } catch (e) { console.error("Error parsing reminder date for display:", task.reminder_time, e); }
        }

        // Task Actions (Delete Button)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', handleDeleteTask);
        actionsDiv.appendChild(deleteBtn);

        // Assemble the task item in the correct order
        div.appendChild(checkbox);
        div.appendChild(contentDiv);
        div.appendChild(actionsDiv);

        return div;
    }

    // Handle form submission to add a new task
    addTaskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        addTaskBtn.disabled = true;
        addTaskBtn.textContent = 'Adding...';
        updateAddTaskStatus("Adding task...", false);

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const reminderTime = taskReminderTimeInput.value;
        // Get values from new fields
        const assignedDate = taskAssignedDateInput.value;
        const dueDate = taskDueDateInput.value;
        const recurrenceType = taskRecurrenceTypeInput.value;
        const recurrenceInterval = taskRecurrenceIntervalInput.value;

        if (!title) {
            updateAddTaskStatus("Task title cannot be empty.", true);
            addTaskBtn.disabled = false;
            addTaskBtn.textContent = 'Add Task';
            return;
        }

        const taskData = {
            title: title,
            description: description || null, // Send null if empty
            reminderTime: reminderTime || null, // Send null if empty
            // Add new fields to the payload
            assignedDate: assignedDate || null, // Send null if empty
            dueDate: dueDate || null,           // Send null if empty
            recurrenceType: recurrenceType,
            recurrenceInterval: recurrenceType !== 'none' ? parseInt(recurrenceInterval, 10) : null // Send interval only if recurrence is set
        };

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Server error adding task' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const newTask = await response.json();
            console.log("Task added:", newTask);

            // Add to top of UI optimistically (or reload all)
            // Option 1: Add directly
            const taskElement = createTaskElement(newTask);
            // Insert incomplete tasks before the first complete task, or at the end
            const firstCompleted = taskListDiv.querySelector('.task-item.complete');
            taskListDiv.insertBefore(taskElement, firstCompleted); // If firstCompleted is null, it appends to end

            if (taskListDiv.querySelector('p')) { // Remove 'No tasks yet' message if present
                 taskListDiv.querySelector('p').remove();
            }
            // Option 2: Reload all tasks (simpler but less smooth)
            // await loadTasks();

            // Clear form
            addTaskForm.reset();
            // Hide recurrence interval group after reset
            recurrenceIntervalGroup.style.display = 'none';
            updateAddTaskStatus("Task added successfully!", false);

        } catch (error) {
            console.error('Error adding task:', error);
            updateAddTaskStatus(`Error adding task: ${error.message}`, true);
        } finally {
            addTaskBtn.disabled = false;
            addTaskBtn.textContent = 'Add Task';
        }
    });

    // --- NEW: Add listener for recurrence type change ---
    taskRecurrenceTypeInput.addEventListener('change', function() {
        const type = this.value;
        if (type === 'none') {
            recurrenceIntervalGroup.style.display = 'none';
        } else {
            recurrenceIntervalGroup.style.display = 'flex'; // Or 'block' depending on your layout
            // Update unit text based on type
            switch(type) {
                case 'daily': recurrenceIntervalUnit.textContent = 'days'; break;
                case 'weekly': recurrenceIntervalUnit.textContent = 'weeks'; break;
                case 'monthly': recurrenceIntervalUnit.textContent = 'months'; break;
                case 'yearly': recurrenceIntervalUnit.textContent = 'years'; break;
                default: recurrenceIntervalUnit.textContent = 'interval';
            }
            taskRecurrenceIntervalInput.value = '1'; // Reset interval to 1 when type changes
        }
    });

    // Handle clicking the checkbox to toggle completion
    async function handleToggleComplete(event) {
        const checkbox = event.target;
        const taskItem = checkbox.closest('.task-item');
        const taskId = taskItem.getAttribute('data-task-id');
        const isComplete = checkbox.checked;

        console.log(`Toggling task ${taskId} to complete=${isComplete}`);
        taskItem.style.opacity = '0.7'; // Optimistic UI feedback

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_complete: isComplete })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedTask = await response.json();
            console.log("Task updated:", updatedTask);

            // Update UI definitively
            taskItem.classList.toggle('complete', updatedTask.is_complete);
             // Re-render reminder state if needed (e.g., line-through)
             const reminderP = taskItem.querySelector('.task-reminder');
             if (reminderP && updatedTask.is_complete && !updatedTask.is_reminder_active) {
                 reminderP.style.textDecoration = 'line-through';
                 reminderP.style.opacity = '0.7';
             } else if (reminderP) {
                 reminderP.style.textDecoration = 'none';
                 reminderP.style.opacity = '1';
             }

            // OPTIONAL: Move completed task to the bottom / re-sort list
            // This makes the UI jump a bit, but keeps lists ordered.
            // Uncomment if desired:
            /*
            if (updatedTask.is_complete) {
                taskListDiv.appendChild(taskItem); // Move to end
            } else {
                // Move back to top or before first complete item
                const firstCompleted = taskListDiv.querySelector('.task-item.complete');
                taskListDiv.insertBefore(taskItem, firstCompleted);
            }
            */

        } catch (error) {
            console.error('Error updating task completion:', error);
            updateTaskListStatus("Error updating task status.", true);
            // Revert UI on error
            checkbox.checked = !isComplete;
            taskItem.classList.toggle('complete', !isComplete);
        } finally {
             taskItem.style.opacity = '1';
        }
    }

    // Handle clicking the delete button
    async function handleDeleteTask(event) {
        const deleteBtn = event.target;
        const taskItem = deleteBtn.closest('.task-item');
        const taskId = taskItem.getAttribute('data-task-id');
        const taskTitle = taskItem.querySelector('.task-title').textContent;

        if (!taskId) { console.error("Could not find task ID to delete"); return; }

        if (confirm(`Are you sure you want to delete task "${taskTitle}"?`)) {
            console.log(`Deleting task ${taskId}`);
            taskItem.style.opacity = '0.5'; // Optimistic UI feedback
            deleteBtn.disabled = true;

            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                     const errorData = await response.json().catch(() => ({ error: 'Server error deleting task' }));
                     throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                console.log(`Task ${taskId} deleted successfully on server.`);
                taskItem.remove(); // Remove from UI
                updateTaskListStatus("Task deleted.", false);
                 if (taskListDiv.childElementCount === 0) {
                     taskListDiv.innerHTML = '<p>No tasks yet. Add one above!</p>';
                 }

            } catch (error) {
                console.error('Error deleting task:', error);
                updateTaskListStatus(`Error deleting task: ${error.message}`, true);
                taskItem.style.opacity = '1'; // Restore UI on error
                 deleteBtn.disabled = false;
            }
        }
    }

    // Initial check for notification permission on load
    checkNotificationPermission(true);

    // --- NEW: Add Task Modal Listeners ---
    addTaskFab.addEventListener('click', () => {
        addTaskModal.style.display = 'block';
        // Optionally clear form on open?
        // addTaskForm.reset();
        // handleRecurrenceChange(); // Reset recurrence display too
    });

    closeTaskModalBtn.addEventListener('click', () => {
        addTaskModal.style.display = 'none';
    });

    // Close modal if clicking outside the content
    addTaskModal.addEventListener('click', (event) => {
        if (event.target === addTaskModal) {
            addTaskModal.style.display = 'none';
        }
    });
    // --- END NEW ---

    // --- Habit Management Functions ---

    // Load habits from the server
    async function loadHabits() {
        habitListStatusDiv.textContent = 'Loading habits...';
        habitListStatusDiv.className = 'status';
        try {
            const response = await fetch('/api/habits'); // Assuming this endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const habits = await response.json();
            allHabitsData = habits; // Store habits locally
            displayHabits(habits);
            habitListStatusDiv.textContent = '';
        } catch (error) {
            console.error('Error loading habits:', error);
            habitListStatusDiv.textContent = 'Error loading habits.';
            habitListStatusDiv.className = 'status error';
            habitListDiv.innerHTML = ''; // Clear placeholder on error
        }
    }

    // Display habits in the list
    function displayHabits(habits) {
        habitListDiv.innerHTML = ''; // Clear previous list/placeholder
        if (habits.length === 0) {
            habitListDiv.innerHTML = '<p>No habits added yet.</p>';
            return;
        }

        habits.forEach(habit => {
            const habitElement = document.createElement('div');
            habitElement.classList.add('habit-item');
            habitElement.dataset.habitId = habit.id; // Store habit ID

            // --- Update structure for completions ---
            const completionsToday = habit.completions_today || 0;
            const completionsTarget = habit.completions_per_day || 1;
            const isComplete = completionsToday >= completionsTarget;
            let progressText = '';
            if (completionsTarget > 1) {
                progressText = ` (${completionsToday}/${completionsTarget})`;
            }

            habitElement.innerHTML = `
                <input type="checkbox" class="habit-checkbox" title="Mark as done" ${isComplete ? 'checked' : ''}>
                <div class="habit-content">
                    <span class="habit-title">${habit.title}${progressText}</span>
                    <span class="habit-frequency">Frequency: ${habit.frequency}</span> <!-- Display frequency -->
                </div>
                <div class="habit-actions">
                    <button class="edit-habit-btn small-btn">Edit</button>
                    <button class="delete-habit-btn small-btn delete-btn">Delete</button>
                </div>
            `;

            // Apply styling if complete
            if (isComplete) {
                habitElement.classList.add('complete'); // Add a CSS class for styling completed habits
            }

            // Add event listeners
            const checkbox = habitElement.querySelector('.habit-checkbox');
            const deleteBtn = habitElement.querySelector('.delete-habit-btn');
            const editBtn = habitElement.querySelector('.edit-habit-btn'); // Get edit button

            checkbox.addEventListener('click', (e) => handleHabitCheckboxClick(habit.id, checkbox.checked));
            deleteBtn.addEventListener('click', () => deleteHabit(habit.id));
            editBtn.addEventListener('click', () => openEditHabitModal(habit)); // Pass the full habit object

            habitListDiv.appendChild(habitElement);
        });
    }

    // Handle adding a new habit
    async function addHabit(event) {
        event.preventDefault(); // Prevent default form submission
        const statusDiv = document.getElementById('addHabitStatus');
        statusDiv.textContent = 'Adding habit...';
        statusDiv.className = 'status';

        const title = document.getElementById('habitTitle').value;
        const frequency = document.getElementById('habitRecurrenceType').value;
        const completionsPerDay = document.getElementById('habitCompletionsPerDay').value;

        const habitData = {
            title,
            frequency,
            // Only include completions_per_day if frequency is daily
            completions_per_day: frequency === 'daily' ? parseInt(completionsPerDay, 10) : 1,
            // Add other potential fields like description, goal, etc. later
        };

        try {
            const response = await fetch('/api/habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(habitData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to add habit. Server error.' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // const newHabit = await response.json(); // Use if needed

            statusDiv.textContent = 'Habit added successfully!';
            statusDiv.className = 'status success';
            addHabitForm.reset(); // Clear the form
            addHabitModal.style.display = 'none'; // Close modal
            loadHabits(); // Reload the habit list

            // Clear success message after a delay
            setTimeout(() => { statusDiv.textContent = ''; }, 3000);

        } catch (error) {
            console.error('Error adding habit:', error);
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.className = 'status error';
        }
    }

    // Handle deleting a habit
    async function deleteHabit(habitId) {
        // Optional: Confirm deletion
        if (!confirm('Are you sure you want to delete this habit?')) {
            return;
        }

        habitListStatusDiv.textContent = 'Deleting habit...';
        habitListStatusDiv.className = 'status';

        try {
            const response = await fetch(`/api/habits/${habitId}`, { // Assuming this endpoint
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to delete habit. Server error.' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            habitListStatusDiv.textContent = 'Habit deleted successfully.';
            habitListStatusDiv.className = 'status success';
            loadHabits(); // Reload the list

            // Clear message after delay
            setTimeout(() => { habitListStatusDiv.textContent = ''; }, 3000);

        } catch (error) {
            console.error('Error deleting habit:', error);
            habitListStatusDiv.textContent = `Error: ${error.message}`;
            habitListStatusDiv.className = 'status error';
        }
    }

    // Handle habit checkbox click (record completion)
    async function handleHabitCheckboxClick(habitId, isChecked) {
        // If isChecked is false, the user might be un-checking.
        // For simplicity now, let's assume clicking always attempts to record *one* completion.
        // The backend should handle logic like not exceeding the target, or decrementing if needed.

        console.log(`Checkbox clicked for habit ${habitId}, attempting to record completion.`);
        habitListStatusDiv.textContent = 'Updating habit...';
        habitListStatusDiv.className = 'status';

        try {
            // We send a POST request to mark *a* completion for today.
            // The backend increments the counter for today.
            const response = await fetch(`/api/habits/${habitId}/complete`, { // Assuming this endpoint
                method: 'POST',
                // No body needed if the endpoint just increments today's count
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update habit. Server error.' }));
                // If error is because target is met, maybe show a specific message?
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Reload the list to show updated progress/state
            loadHabits();
            // Optional: Clear status after a delay, or maybe not needed if loadHabits clears it.
            // setTimeout(() => { habitListStatusDiv.textContent = ''; }, 1000);

        } catch (error) {
            console.error('Error updating habit completion:', error);
            habitListStatusDiv.textContent = `Error: ${error.message}`;
            habitListStatusDiv.className = 'status error';
            // Revert checkbox? Reloading handles this indirectly.
            // loadHabits(); // Reload even on error to sync state?
        }
    }

    // Add listener for the habit form submission
    addHabitForm.addEventListener('submit', addHabit);

    // --- NEW: Add Habit Modal Listeners ---
    addHabitBtn.addEventListener('click', () => {
        addHabitModal.style.display = 'block';
        addHabitForm.reset(); // Clear form on open
        handleHabitRecurrenceChange(); // Set initial state for completions input
    });

    closeHabitModalBtn.addEventListener('click', () => {
        addHabitModal.style.display = 'none';
    });

    // Close modal if clicking outside the content
    addHabitModal.addEventListener('click', (event) => {
        if (event.target === addHabitModal) {
            addHabitModal.style.display = 'none';
        }
    });

    // Show/hide completions per day based on frequency
    function handleHabitRecurrenceChange() {
        if (habitRecurrenceTypeInput.value === 'daily') {
            habitCompletionsGroup.style.display = 'block';
        } else {
            habitCompletionsGroup.style.display = 'none';
        }
    }
    habitRecurrenceTypeInput.addEventListener('change', handleHabitRecurrenceChange);
    // --- END NEW ---

    // Open and populate the edit habit modal
    function openEditHabitModal(habit) {
        editHabitIdInput.value = habit.id;
        editHabitTitleInput.value = habit.title;
        editHabitRecurrenceTypeInput.value = habit.frequency;
        editHabitCompletionsPerDayInput.value = habit.completions_per_day;
        handleEditHabitRecurrenceChange(); // Show/hide completions input correctly
        editHabitStatusDiv.textContent = ''; // Clear status
        editHabitStatusDiv.className = 'status';
        editHabitModal.style.display = 'block';
    }

    // Handle edit habit form submission
    async function handleEditHabitSubmit(event) {
        event.preventDefault();
        const habitId = editHabitIdInput.value;
        editHabitStatusDiv.textContent = 'Saving changes...';
        editHabitStatusDiv.className = 'status';

        const title = editHabitTitleInput.value;
        const frequency = editHabitRecurrenceTypeInput.value;
        const completionsPerDay = editHabitCompletionsPerDayInput.value;

        const updatedHabitData = {
            title,
            frequency,
            completions_per_day: frequency === 'daily' ? parseInt(completionsPerDay, 10) : 1,
        };

        try {
            const response = await fetch(`/api/habits/${habitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedHabitData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update habit. Server error.' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            editHabitStatusDiv.textContent = 'Habit updated successfully!';
            editHabitStatusDiv.className = 'status success';
            setTimeout(() => {
                editHabitModal.style.display = 'none'; // Close modal after short delay
                loadHabits(); // Reload the habit list
            }, 1000);

        } catch (error) {
            console.error('Error updating habit:', error);
            editHabitStatusDiv.textContent = `Error: ${error.message}`;
            editHabitStatusDiv.className = 'status error';
        }
    }

    // --- NEW: Edit Habit Modal Listeners ---
    editHabitForm.addEventListener('submit', handleEditHabitSubmit);

    closeEditModalBtn.addEventListener('click', () => {
        editHabitModal.style.display = 'none';
    });

    editHabitModal.addEventListener('click', (event) => {
        if (event.target === editHabitModal) {
            editHabitModal.style.display = 'none';
        }
    });

    // Show/hide completions per day in EDIT modal
    function handleEditHabitRecurrenceChange() {
        if (editHabitRecurrenceTypeInput.value === 'daily') {
            editHabitCompletionsGroup.style.display = 'block';
        } else {
            editHabitCompletionsGroup.style.display = 'none';
        }
    }
    editHabitRecurrenceTypeInput.addEventListener('change', handleEditHabitRecurrenceChange);
    // --- END NEW ---

}); // End DOMContentLoaded
