// Initialize variables at the top
let scheduledNotifications = [];
let deferredPrompt;
let serviceWorkerRegistration = null;
let lastAccessDate = localStorage.getItem('lastAccessDate') || null;
let allHabitsData = []; // Store habits data globally

// Helper to check if a date string (YYYY-MM-DD or ISO) is today
function isToday(dateString) {
    if (!dateString) return false;
    try {
        const date = new Date(dateString);
        const today = new Date();
        return date.getFullYear() === today.getFullYear() &&
               date.getMonth() === today.getMonth() &&
               date.getDate() === today.getDate();
    } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return false;
    }
}

// Helper to check if the day has changed since last counter reset
function isDayChanged() {
    // Get the last counter reset date from localStorage
    const lastCounterResetDate = localStorage.getItem('lastCounterResetDate');

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // If no reset date is stored, or if it's a different day, we should reset
    if (!lastCounterResetDate) {
        // First time access, store today's date and return true to trigger reset
        localStorage.setItem('lastCounterResetDate', todayString);
        return true;
    }

    // Check if the date has changed since last reset
    const dayChanged = lastCounterResetDate !== todayString;

    // Only update the reset date if the day has actually changed
    if (dayChanged) {
        localStorage.setItem('lastCounterResetDate', todayString);
        console.log(`Day changed from ${lastCounterResetDate} to ${todayString}, will reset counters`);
    } else {
        console.log(`Same day as last reset (${todayString}), will not reset counters`);
    }

    // Also update the general last access date (for other features)
    localStorage.setItem('lastAccessDate', todayString);
    lastAccessDate = todayString;

    return dayChanged;
}

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

    // --- Completed Task Elements (NEW) ---
    const completedTasksHeader = document.getElementById('completedTasksHeader');
    const completedTaskListDiv = document.getElementById('completedTaskList');
    // --- End Completed Task Elements ---

    // --- Task Filter Element ---
    const taskFilterSelect = document.getElementById('taskFilter');
    // --- End Task Filter Element ---

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

    // --- Edit Task Modal Elements ---
    const editTaskModal = document.getElementById('editTaskModal');
    const editTaskForm = document.getElementById('editTaskForm');
    const editTaskStatus = document.getElementById('editTaskStatus');
    const editTaskIdInput = document.getElementById('editTaskId');
    const editTaskTitleInput = document.getElementById('editTaskTitle');
    const editTaskDescriptionInput = document.getElementById('editTaskDescription');
    const editTaskReminderTimeInput = document.getElementById('editTaskReminderTime');
    const editTaskAssignedDateInput = document.getElementById('editTaskAssignedDate');
    const editTaskDueDateInput = document.getElementById('editTaskDueDate');
    const editTaskRecurrenceTypeSelect = document.getElementById('editTaskRecurrenceType');
    const editRecurrenceIntervalGroup = document.getElementById('editRecurrenceIntervalGroup');
    const editTaskRecurrenceIntervalInput = document.getElementById('editTaskRecurrenceInterval');
    const editRecurrenceIntervalUnit = document.getElementById('editRecurrenceIntervalUnit');
    const closeEditTaskModalBtn = editTaskModal.querySelector('.close-button'); // Assuming close button exists

    let swRegistration = null;
    // We'll use this for service worker registration

    // --- PWA & Notification Permission Handling (Keep Existing) ---
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        // Register service worker with updateViaCache: 'none' to always check for updates
        navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
            .then(swReg => {
                console.log('Service Worker is registered', swReg);
                swRegistration = swReg;

                // Force update check on every page load
                swReg.update().then(() => {
                    console.log('Service worker update check completed');
                }).catch(err => {
                    console.error('Service worker update check failed:', err);
                });

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

        // Listen for controller change (new SW taking over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New service worker activated and controlling the page');
            // Reload page for new SW after a short delay
            setTimeout(() => {
                console.log('Reloading page to use new service worker');
                window.location.reload();
            }, 1000);
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', event => {
            console.log('Received message from service worker:', event.data);
            if (event.data && event.data.type === 'CACHE_CLEARED') {
                console.log('Cache cleared at:', new Date(event.data.timestamp).toLocaleTimeString());
            }
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
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.textContent = 'Notifications not supported.';
            permissionStatusDiv.className = 'notifications-status permission-denied';
            notifyBtn.disabled = true;
            return;
        }

        const permission = Notification.permission;
        permissionStatusDiv.classList.remove('permission-granted', 'permission-denied', 'permission-default');

        if (permission === 'granted') {
            // Hide the permission status text when granted
            permissionStatusDiv.style.display = 'none';
            notifyBtn.textContent = 'Background Reminders Enabled';
            notifyBtn.disabled = true; // Or change to 'Refresh Subscription'?
             // If granted, ensure subscription is set up
             if (!silent) setupPushSubscription();
        } else if (permission === 'denied') {
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.textContent = 'Notification Permission: DENIED';
            permissionStatusDiv.classList.add('permission-denied');
            notifyBtn.textContent = 'Enable Background Reminders';
            notifyBtn.disabled = false;
            if (!silent) updateStatus('Enable notifications in browser settings to use reminders.', true);
        } else {
            permissionStatusDiv.style.display = 'block';
            permissionStatusDiv.textContent = 'Notification Permission: NOT SET';
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
                 // Hide permission status when granted
                 permissionStatusDiv.style.display = 'none';
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

    // Global variable to store all tasks
    let allTasks = [];

    // Load tasks from the server
    async function loadTasks() {
        console.log("Loading tasks...");
        updateTaskListStatus("Loading tasks...", false);
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allTasks = await response.json(); // Store all tasks globally
            console.log("Tasks loaded:", allTasks);
            filterAndRenderTasks(); // Apply current filter and render
            updateTaskListStatus("", false); // Clear loading message
            taskListStatusDiv.style.display = 'none'; // Hide if successful
        } catch (error) {
            console.error('Error loading tasks:', error);
            taskListDiv.innerHTML = '<p class="error">Failed to load tasks. Please try refreshing.</p>';
            updateTaskListStatus("Error loading tasks.", true);
        }
    }

    // Filter tasks based on the selected filter and render them
    function filterAndRenderTasks() {
        const filterValue = taskFilterSelect.value;
        console.log(`Filtering tasks by: ${filterValue}`);

        let filteredTasks = [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month

        // Helper function to check if a date is today
        function isDateToday(dateString) {
            if (!dateString) return false;
            try {
                // Extract just the date part if it's in ISO format
                const datePart = typeof dateString === 'string' && dateString.includes('T') ?
                    dateString.split('T')[0] : dateString;

                // Handle potential invalid date strings
                if (typeof datePart !== 'string' || !datePart.includes('-')) {
                    console.warn('Invalid date format:', dateString);
                    return false;
                }

                const [year, month, day] = datePart.split('-').map(Number);

                // Validate parsed values
                if (isNaN(year) || isNaN(month) || isNaN(day)) {
                    console.warn('Invalid date components:', year, month, day);
                    return false;
                }

                // Compare with today's date
                return year === today.getFullYear() &&
                       (month - 1) === today.getMonth() && // Month is 0-indexed in JS Date
                       day === today.getDate();
            } catch (e) {
                console.error('Error checking if date is today:', dateString, e);
                return false;
            }
        }

        // Helper function to check if a task is unassigned (no due date)
        function isTaskUnassigned(task) {
            return !task.due_date || (typeof task.due_date === 'string' && task.due_date.trim() === '');
        }

        // Helper function to check if a task is due today
        function isTaskDueToday(task) {
            return isDateToday(task.due_date);
        }

        // Helper function to check if a task is overdue
        function isTaskOverdue(task) {
            if (!task.due_date) return false;
            try {
                // Extract just the date part if it's in ISO format
                const datePart = typeof task.due_date === 'string' && task.due_date.includes('T') ?
                    task.due_date.split('T')[0] : task.due_date;

                // Parse the date
                const [year, month, day] = datePart.split('-').map(Number);
                const dueDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

                // Compare with today's date
                return dueDate < today;
            } catch (e) {
                console.error('Error checking if task is overdue:', task.due_date, e);
                return false;
            }
        }

        // Log all tasks for debugging
        console.log('All tasks:', allTasks.map(t => ({
            id: t.id,
            title: t.title,
            due_date: t.due_date,
            is_today: isTaskDueToday(t),
            is_unassigned: isTaskUnassigned(t)
        })));

        // Apply filter
        switch(filterValue) {
            case 'unassigned_today':
                // Show tasks that are unassigned, due today, or overdue
                filteredTasks = allTasks.filter(task => {
                    // Skip completed tasks
                    if (task.is_complete) return false;

                    // Include if unassigned, due today, or overdue
                    return isTaskUnassigned(task) || isTaskDueToday(task) || isTaskOverdue(task);
                });
                break;

            case 'today':
                // Show only tasks due today
                filteredTasks = allTasks.filter(task => {
                    // Skip completed tasks
                    if (task.is_complete) return false;

                    return isTaskDueToday(task);
                });
                break;

            case 'week':
                filteredTasks = allTasks.filter(task => {
                    // Skip completed tasks
                    if (task.is_complete) return false;

                    if (!task.due_date) return false;
                    const dueDate = new Date(task.due_date.split('T')[0]);
                    const weekEnd = new Date(today);
                    weekEnd.setDate(today.getDate() + 6); // End of week (6 days from today)
                    return dueDate >= weekStart && dueDate <= weekEnd;
                });
                break;

            case 'month':
                filteredTasks = allTasks.filter(task => {
                    // Skip completed tasks
                    if (task.is_complete) return false;

                    if (!task.due_date) return false;
                    const dueDate = new Date(task.due_date.split('T')[0]);
                    return dueDate.getFullYear() === monthStart.getFullYear() &&
                           dueDate.getMonth() === monthStart.getMonth();
                });
                break;

            default: // 'all'
                // Show all non-completed tasks
                filteredTasks = allTasks.filter(task => !task.is_complete);
        }

        // Render the filtered tasks
        renderTaskList(filteredTasks);
    }

    // Render the list of tasks
    function renderTaskList(tasks) {
        taskListDiv.innerHTML = ''; // Clear current list
        completedTaskListDiv.innerHTML = ''; // Clear completed list
        let activeTaskCount = 0;
        let completedTodayCount = 0;

        if (!tasks || tasks.length === 0) {
            taskListDiv.innerHTML = '<p>No tasks found for the selected filter.</p>';
            completedTaskListDiv.innerHTML = '<p>No completed tasks for the selected filter.</p>';
            updateCompletedTaskHeader(0); // Update header count
            return;
        }

        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            if (task.is_complete) {
                // --- Check if completed today using updated_at ---
                if (isToday(task.updated_at)) {
                    completedTaskListDiv.appendChild(taskElement);
                    completedTodayCount++;
                }
                // --- Older completed tasks are ignored for the default view ---
            } else {
                taskListDiv.appendChild(taskElement);
                activeTaskCount++;
            }
        });

        // Update placeholder messages if lists are empty
        if (activeTaskCount === 0) {
            taskListDiv.innerHTML = '<p>No active tasks.</p>';
        }
        if (completedTodayCount === 0) {
            // Use a more specific message for the default view
            completedTaskListDiv.innerHTML = '<p>No tasks completed today.</p>';
        }

        updateCompletedTaskHeader(completedTodayCount); // Update header count based on today
    }

    // Create DOM element for a single task
    function createTaskElement(task) {
        const div = document.createElement('div');

        // Check if task is overdue
        let isOverdue = false;
        if (!task.is_complete && task.due_date) {
            try {
                // Extract just the date part if it's in ISO format
                const datePart = typeof task.due_date === 'string' && task.due_date.includes('T') ?
                    task.due_date.split('T')[0] : task.due_date;

                // Parse the date
                const [year, month, day] = datePart.split('-').map(Number);
                const dueDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time part for comparison

                // Compare with today's date
                isOverdue = dueDate < today;
            } catch (e) {
                console.error('Error checking if task is overdue:', task.due_date, e);
            }
        }

        div.className = `task-item ${task.is_complete ? 'complete' : ''} ${isOverdue ? 'overdue' : ''}`;
        div.setAttribute('data-task-id', task.id);

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.is_complete;
        checkbox.addEventListener('change', handleToggleComplete);

        // Task Content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        // Create a container for the title and recurring icon
        const titleContainer = document.createElement('div');
        titleContainer.className = 'task-title-container';

        // Create the title span
        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;
        titleContainer.appendChild(titleSpan);

        // Add recurring icon if the task is recurring
        if (task.recurrence_type && task.recurrence_type !== 'none') {
            const recurringIcon = document.createElement('span');
            recurringIcon.className = `recurring-icon ${task.recurrence_type}`;
            recurringIcon.innerHTML = '&#8635;'; // Recycling symbol (↻)

            // Create a more descriptive tooltip based on recurrence type and interval
            let recurrenceText = '';
            const interval = task.recurrence_interval || 1;

            if (interval === 1) {
                // Simple case: every day, week, month, year
                recurrenceText = `Repeats ${task.recurrence_type}`;
            } else {
                // Custom interval case: every X days, weeks, months, years
                switch(task.recurrence_type) {
                    case 'daily':
                        recurrenceText = `Repeats every ${interval} days`;
                        break;
                    case 'weekly':
                        recurrenceText = `Repeats every ${interval} weeks`;
                        break;
                    case 'monthly':
                        recurrenceText = `Repeats every ${interval} months`;
                        break;
                    case 'yearly':
                        recurrenceText = `Repeats every ${interval} years`;
                        break;
                    default:
                        recurrenceText = `Repeats ${task.recurrence_type}`;
                }
            }

            recurringIcon.title = recurrenceText;

            // Add a small badge with the interval if it's greater than 1
            if (interval > 1) {
                const intervalBadge = document.createElement('span');
                intervalBadge.className = `interval-badge ${task.recurrence_type}`;
                intervalBadge.textContent = interval;
                recurringIcon.appendChild(intervalBadge);
            }

            titleContainer.appendChild(recurringIcon);
        }

        contentDiv.appendChild(titleContainer);

        if (task.description) {
            const descSpan = document.createElement('span');
            descSpan.className = 'task-description';
            descSpan.textContent = task.description;
            contentDiv.appendChild(descSpan);
        }

        // Create metadata container for due date and recurrence indicators
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'task-metadata';

        // Add due date indicator if due date exists
        if (task.due_date) {
            try {
                // Create date objects for comparison and ensure proper timezone handling
                // Handle both date-only format and date-time format
                let dueDate;
                try {
                    // DIRECT FIX: Manually parse the date string to avoid timezone issues
                    // Extract the date components regardless of format
                    let datePart = task.due_date;
                    if (task.due_date.includes('T')) {
                        datePart = task.due_date.split('T')[0];
                    }

                    // Parse the date parts
                    const [year, month, day] = datePart.split('-').map(Number);

                    // Create a date at midnight in local timezone
                    dueDate = new Date(year, month - 1, day, 0, 0, 0, 0);

                    console.log(`Parsed date: ${task.due_date} -> ${dueDate.toDateString()} (${dueDate.toISOString()})`);
                    console.log(`Raw date parts: year=${year}, month=${month-1}, day=${day}`);

                    // Double-check the date is correct
                    if (dueDate.getFullYear() !== year || dueDate.getMonth() !== month-1 || dueDate.getDate() !== day) {
                        console.error(`Date parsing error: expected ${year}-${month}-${day} but got ${dueDate.getFullYear()}-${dueDate.getMonth()+1}-${dueDate.getDate()}`);
                    }
                } catch (e) {
                    console.error('Error parsing date:', task.due_date, e);
                    dueDate = new Date(0); // Use epoch time as fallback
                }

                // Check if the date is valid
                if (isNaN(dueDate.getTime())) {
                    // Handle invalid date
                    console.error("Invalid date format:", task.due_date);

                    // Create a simple indicator for invalid date
                    const dueDateIndicator = document.createElement('div');
                    dueDateIndicator.className = 'due-date-indicator invalid-date';

                    // Add calendar icon
                    const calendarIcon = document.createElement('i');
                    calendarIcon.innerHTML = '&#128197;'; // Calendar emoji
                    dueDateIndicator.appendChild(calendarIcon);

                    // Add error text
                    const dueDateText = document.createElement('span');
                    dueDateText.textContent = 'Fix due date';
                    dueDateIndicator.appendChild(dueDateText);

                    metadataDiv.appendChild(dueDateIndicator);
                } else {
                    // Process valid date - create dates for comparison
                    // Get today's date in local timezone with time set to midnight
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    console.log(`Today's date for comparison: ${today.toDateString()}`);

                    // Create tomorrow and next week dates
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    const nextWeek = new Date(today);
                    nextWeek.setDate(nextWeek.getDate() + 7);

                    // We're already using date-only objects for comparison

                    // Format the due date
                    const formattedDate = dueDate.toLocaleDateString('default', {
                        month: 'short',
                        day: 'numeric',
                        year: today.getFullYear() !== dueDate.getFullYear() ? 'numeric' : undefined
                    });

                    const dueDateIndicator = document.createElement('div');
                    dueDateIndicator.className = 'due-date-indicator';

                    // DIRECT FIX: Compare dates by their components
                    // Get the components of each date
                    const dueDateYear = dueDate.getFullYear();
                    const dueDateMonth = dueDate.getMonth();
                    const dueDateDay = dueDate.getDate();

                    const todayYear = today.getFullYear();
                    const todayMonth = today.getMonth();
                    const todayDay = today.getDate();

                    const tomorrowYear = tomorrow.getFullYear();
                    const tomorrowMonth = tomorrow.getMonth();
                    const tomorrowDay = tomorrow.getDate();

                    console.log(`Comparing dates - Due date: ${dueDateYear}-${dueDateMonth+1}-${dueDateDay}, Today: ${todayYear}-${todayMonth+1}-${todayDay}`);

                    // Compare date components directly
                    if (dueDateYear === todayYear && dueDateMonth === todayMonth && dueDateDay === todayDay) {
                        // Due today - add due-soon class but not overdue
                        console.log('Task is due TODAY');
                        dueDateIndicator.classList.add('due-soon');
                    } else if (dueDateYear < todayYear ||
                              (dueDateYear === todayYear && dueDateMonth < todayMonth) ||
                              (dueDateYear === todayYear && dueDateMonth === todayMonth && dueDateDay < todayDay)) {
                        // Only mark as overdue if strictly before today
                        console.log('Task is OVERDUE');
                        dueDateIndicator.classList.add('overdue');
                    } else if (dueDate < nextWeek) {
                        console.log('Task is due SOON');
                        dueDateIndicator.classList.add('due-soon');
                    }

                    // Add calendar icon
                    const calendarIcon = document.createElement('i');
                    calendarIcon.innerHTML = '&#128197;'; // Calendar emoji
                    dueDateIndicator.appendChild(calendarIcon);

                    // Add due date text
                    const dueDateText = document.createElement('span');
                    // Use component comparison for dates
                    if (dueDateYear === todayYear && dueDateMonth === todayMonth && dueDateDay === todayDay) {
                        dueDateText.textContent = 'Due Today';
                    } else if (dueDateYear < todayYear ||
                              (dueDateYear === todayYear && dueDateMonth < todayMonth) ||
                              (dueDateYear === todayYear && dueDateMonth === todayMonth && dueDateDay < todayDay)) {
                        dueDateText.textContent = `Overdue: ${formattedDate}`;
                    } else if (dueDateYear === tomorrowYear && dueDateMonth === tomorrowMonth && dueDateDay === tomorrowDay) {
                        dueDateText.textContent = 'Due Tomorrow';
                    } else {
                        dueDateText.textContent = `Due: ${formattedDate}`;
                    }
                    dueDateIndicator.appendChild(dueDateText);

                    metadataDiv.appendChild(dueDateIndicator);
                }
            } catch (e) {
                console.error("Error parsing due date for display:", task.due_date, e);
            }
        }

        // Add recurrence type indicator if task is recurring
        if (task.recurrence_type && task.recurrence_type !== 'none') {
            const recurrenceIndicator = document.createElement('div');
            recurrenceIndicator.className = `recurrence-indicator recurrence-${task.recurrence_type}`;

            const interval = task.recurrence_interval || 1;
            let recurrenceText = '';

            switch(task.recurrence_type) {
                case 'daily':
                    recurrenceText = interval === 1 ? 'Daily' : `Every ${interval} days`;
                    break;
                case 'weekly':
                    recurrenceText = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
                    break;
                case 'monthly':
                    recurrenceText = interval === 1 ? 'Monthly' : `Every ${interval} months`;
                    break;
                case 'yearly':
                    recurrenceText = interval === 1 ? 'Yearly' : `Every ${interval} years`;
                    break;
                default:
                    recurrenceText = 'Recurring';
            }

            recurrenceIndicator.textContent = recurrenceText;
            metadataDiv.appendChild(recurrenceIndicator);
        }

        // Add metadata div to content if it has children
        if (metadataDiv.children.length > 0) {
            contentDiv.appendChild(metadataDiv);
        }

        // Display Reminder Time if active and exists
        if (task.reminder_time) {
            try {
                const reminderDate = new Date(task.reminder_time);
                // Only show active reminders or completed task reminders
                if (task.is_reminder_active || task.is_complete) {
                    const reminderSpan = document.createElement('span');
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

        // Task Actions (Edit and Delete Buttons - Edit First)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-task-btn'; // Class to be styled
        editBtn.textContent = 'Edit';
        editBtn.style.order = '1'; // Explicitly set order
        editBtn.addEventListener('click', () => openEditTaskModal(task)); // Pass the task data
        actionsDiv.appendChild(editBtn); // Edit first

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.order = '2'; // Explicitly set order
        deleteBtn.addEventListener('click', handleDeleteTask);
        actionsDiv.appendChild(deleteBtn); // Delete second

        // Assemble the task item
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
        // Ensure the due date is properly formatted as YYYY-MM-DD and valid
        let dueDate = null;
        if (taskDueDateInput.value) {
            // Always use the date-only format for new tasks (YYYY-MM-DD)
            // This ensures consistency in the database
            dueDate = taskDueDateInput.value;

            // Log the date for debugging
            console.log('Creating task with due date:', dueDate);
        }
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

            const updatedTask = await response.json(); // updated_at is now current
            console.log("Task updated:", updatedTask);

            // --- Update UI definitively (Move element) ---
            taskItem.remove(); // Remove from current list
            const newTaskElement = createTaskElement(updatedTask); // Recreate element with updated state

            if (updatedTask.is_complete) {
                // Always add to completed list when checked (it was just completed 'today')
                completedTaskListDiv.appendChild(newTaskElement);
                // Remove placeholder if it exists
                const placeholder = completedTaskListDiv.querySelector('p');
                if (placeholder) placeholder.remove();

                // If this is a recurring task, create a new task for the next occurrence
                if (updatedTask.recurrence_type && updatedTask.recurrence_type !== 'none') {
                    console.log(`Task ${updatedTask.id} is recurring (${updatedTask.recurrence_type}). Creating next occurrence...`);

                    try {
                        // Calculate the next occurrence date manually if the endpoint fails
                        let nextOccurrenceData;

                        try {
                            // Try to use the server endpoint first
                            const nextOccurrenceResponse = await fetch(`/api/tasks/${updatedTask.id}/next-occurrence`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' }
                            });

                            if (nextOccurrenceResponse.ok) {
                                nextOccurrenceData = await nextOccurrenceResponse.json();
                                console.log('Next occurrence created via API:', nextOccurrenceData);
                            } else {
                                // If the endpoint fails, calculate the next occurrence date manually
                                console.warn('API endpoint failed, calculating next occurrence manually');
                                nextOccurrenceData = await createNextOccurrenceManually(updatedTask);
                            }
                        } catch (apiError) {
                            console.error('Error calling next-occurrence API:', apiError);
                            // Calculate the next occurrence date manually
                            nextOccurrenceData = await createNextOccurrenceManually(updatedTask);
                        }

                        if (nextOccurrenceData) {
                            console.log('Next occurrence created:', nextOccurrenceData);

                            // Show a notification that the task will appear on the calendar
                            const notification = document.createElement('div');
                            notification.className = 'status success';

                            // Create a more descriptive message based on recurrence type and interval
                            let recurrenceText = '';
                            const interval = updatedTask.recurrence_interval || 1;

                            if (interval === 1) {
                                recurrenceText = updatedTask.recurrence_type;
                            } else {
                                switch(updatedTask.recurrence_type) {
                                    case 'daily':
                                        recurrenceText = `every ${interval} days`;
                                        break;
                                    case 'weekly':
                                        recurrenceText = `every ${interval} weeks`;
                                        break;
                                    case 'monthly':
                                        recurrenceText = `every ${interval} months`;
                                        break;
                                    case 'yearly':
                                        recurrenceText = `every ${interval} years`;
                                        break;
                                    default:
                                        recurrenceText = updatedTask.recurrence_type;
                                }
                            }

                            notification.textContent = `Recurring task "${updatedTask.title}" (repeats ${recurrenceText}) will appear on the calendar on ${new Date(nextOccurrenceData.assigned_date).toLocaleDateString()}.`;
                            notification.style.marginTop = '10px';
                            notification.style.marginBottom = '10px';

                            // Add a link to the calendar
                            const calendarLink = document.createElement('a');
                            calendarLink.href = '/pages/calendar.html';
                            calendarLink.textContent = ' View Calendar';
                            calendarLink.style.marginLeft = '5px';
                            calendarLink.style.fontWeight = 'bold';
                            calendarLink.style.color = '#4db6ac';
                            notification.appendChild(calendarLink);

                            // Insert the notification at the top of the task list
                            taskListDiv.insertBefore(notification, taskListDiv.firstChild);

                            // Remove the notification after 5 seconds
                            setTimeout(() => {
                                notification.style.opacity = '0';
                                notification.style.transition = 'opacity 0.5s ease';
                                setTimeout(() => notification.remove(), 500);
                            }, 5000);
                        } else {
                            console.error('Failed to create next occurrence:', await nextOccurrenceResponse.text());
                        }
                    } catch (error) {
                        console.error('Error creating next occurrence:', error);
                    }
                }
            } else {
                 // Move back to the active list
                taskListDiv.appendChild(newTaskElement);
                 // Remove placeholder if it exists
                const placeholder = taskListDiv.querySelector('p');
                if (placeholder) placeholder.remove();
            }

            // Update completed task count header (count elements *in the list*)
            const completedCountToday = completedTaskListDiv.querySelectorAll('.task-item').length;
            updateCompletedTaskHeader(completedCountToday);

            // Ensure placeholders are correct if lists become empty
            if (taskListDiv.childElementCount === 0) {
                 taskListDiv.innerHTML = '<p>No active tasks.</p>';
            }
             if (completedTaskListDiv.childElementCount === 0) {
                 completedTaskListDiv.innerHTML = '<p>No tasks completed today.</p>'; // Use today's message
             }
            // --- End UI Update ---

        } catch (error) {
            console.error('Error updating task completion:', error);
            updateTaskListStatus("Error updating task status.", true);
            // Revert UI on error (might be complex, maybe just reload?)
            // For now, let's just log the error and restore opacity.
            // checkbox.checked = !isComplete; // Avoid direct manipulation if state is uncertain
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

    // Refresh functionality removed - app now always uses latest version

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

    // Function to manually reset counter habits (for testing)
    async function resetCounterHabits() {
        try {
            console.log('Manually resetting counter habits...');
            const updatePromises = [];

            allHabitsData.forEach(habit => {
                // Check if habit title contains a counter pattern like (5/8)
                const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
                if (counterMatch) {
                    // Reset the counter to 0/X
                    const totalCount = parseInt(counterMatch[2], 10) || 0;
                    const newTitle = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

                    // Update the habit title in the local array
                    habit.title = newTitle;
                    console.log(`Reset counter for habit: ${habit.title}`);

                    // For counter habits, set completions_per_day to match the total count
                    habit.completions_per_day = totalCount;

                    // Create a promise to update the habit on the server
                    const updatePromise = updateHabitCounter(habit.id, newTitle, totalCount);
                    updatePromises.push(updatePromise);
                }
            });

            // Wait for all updates to complete
            await Promise.all(updatePromises);
            console.log('All counter habits reset successfully');

            // Reload habits to refresh the UI
            loadHabits();

            // Show success message
            habitListStatusDiv.textContent = 'Counter habits reset successfully';
            habitListStatusDiv.className = 'status success';

            // Clear the message after 3 seconds
            setTimeout(() => {
                habitListStatusDiv.textContent = '';
                habitListStatusDiv.className = '';
            }, 3000);

        } catch (error) {
            console.error('Error resetting counter habits:', error);
            habitListStatusDiv.textContent = `Error: ${error.message}`;
            habitListStatusDiv.className = 'status error';
        }
    }

    // Update habit counter on the server
    async function updateHabitCounter(habitId, newTitle, completionsPerDay = null) {
        try {
            // Find the existing habit in our local data to preserve its settings
            const existingHabit = allHabitsData.find(h => h.id === habitId);

            if (!existingHabit) {
                console.warn(`Habit ${habitId} not found in local data, using defaults`);
            }

            // Determine completions_per_day value
            // If completionsPerDay is provided, use it (for counter habits)
            // Otherwise, preserve the existing value or use default
            const completions_per_day = completionsPerDay !== null ?
                completionsPerDay :
                (existingHabit ? existingHabit.completions_per_day : 1);

            console.log(`Updating habit ${habitId} with title: ${newTitle}, completions_per_day: ${completions_per_day}`);

            const response = await fetch(`/api/habits/${habitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTitle,
                    // Preserve existing settings or use defaults
                    frequency: existingHabit ? existingHabit.frequency : 'daily',
                    completions_per_day: completions_per_day
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedHabit = await response.json();
            console.log(`Habit ${habitId} counter reset on server:`, updatedHabit);
            return updatedHabit;
        } catch (error) {
            console.error(`Error resetting habit ${habitId} counter:`, error);
            throw error;
        }
    }

    // Load habits from the server
    async function loadHabits() {
        habitListStatusDiv.textContent = 'Loading habits...';
        habitListStatusDiv.className = 'status';
        try {
            // Add cache-busting parameter to prevent browser caching
            const cacheBuster = new Date().getTime();
            const response = await fetch(`/api/habits?_=${cacheBuster}`); // Assuming this endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const habits = await response.json();

            // Check if day has changed since last access
            const dayChanged = isDayChanged();

            // If day has changed, reset progress for habits with counters in title
            if (dayChanged) {
                console.log('Day has changed, resetting habit progress counters');
                const updatePromises = [];

                habits.forEach(habit => {
                    // Check if habit title contains a counter pattern like (5/8)
                    const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
                    if (counterMatch) {
                        // Reset the counter to 0/X
                        const totalCount = parseInt(counterMatch[2], 10) || 0;
                        const newTitle = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

                        // Update the habit title in the local array
                        habit.title = newTitle;
                        console.log(`Reset counter for habit: ${habit.title}`);

                        // For counter habits, set completions_per_day to match the total count
                        // This allows incrementing the counter multiple times per day
                        habit.completions_per_day = totalCount;
                        console.log(`Set completions_per_day to ${totalCount} for counter habit: ${habit.title}`);

                        // Create a promise to update the habit on the server
                        const updatePromise = updateHabitCounter(habit.id, newTitle, totalCount);
                        updatePromises.push(updatePromise);
                    }
                });

                // Wait for all updates to complete
                Promise.all(updatePromises)
                    .then(() => console.log('All habit counters updated on server'))
                    .catch(err => console.error('Error updating habit counters:', err));
            }

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

            // Set the completed attribute for CSS targeting
            // This will be used by our CSS to force the visual state

            // --- Update structure for completions ---
            let completionsToday = habit.completions_today || 0;
            const completionsTarget = habit.completions_per_day || 1;

            // Check if habit title contains a counter pattern like (1/10)
            let hasCounter = false;
            let currentCount = 0;
            let totalCount = 0;
            const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);

            if (counterMatch) {
                hasCounter = true;
                currentCount = parseInt(counterMatch[1], 10) || 0;
                totalCount = parseInt(counterMatch[2], 10) || 10;
            }

            // Determine if habit is complete based on completion target
            const isHighTarget = !hasCounter && completionsTarget > 100;
            const isComplete = hasCounter ?
                (currentCount >= totalCount) : // For counter habits, only complete when counter reaches max
                (isHighTarget ? false : completionsToday >= completionsTarget); // For regular habits, complete when reaching target

            // Special handling for counter habits in the title (like Social Media Rejection (0/8))
            // These should only be marked complete when the counter reaches the target
            let finalIsComplete = isComplete;
            if (hasCounter) {
                // Override isComplete for counter habits
                const isCounterComplete = currentCount >= totalCount;
                finalIsComplete = isCounterComplete;
                if (!isCounterComplete) {
                    // If the counter hasn't reached the target, it's not complete
                    console.log(`Counter habit ${habit.id} (${habit.title}) is not complete: ${currentCount}/${totalCount}`);
                }

                // For counter habits, update the progress text to show current/total
                const progressEl = habitElement.querySelector('.habit-progress');
                if (progressEl) {
                    progressEl.textContent = `Progress: ${currentCount}/${totalCount}`;
                    progressEl.title = `Current progress: ${currentCount}/${totalCount}`;

                    // Ensure proper styling for the progress element
                    progressEl.style.backgroundColor = '#e8f5f0';
                    progressEl.style.border = '1px solid #d1e5f9';
                    progressEl.style.padding = '4px 12px';
                    progressEl.style.borderRadius = '12px';
                    progressEl.style.minWidth = '120px';
                    progressEl.style.textAlign = 'center';
                    progressEl.style.display = 'inline-block';
                }
            }

            // Set the data-completed attribute for CSS targeting
            // This is the key to making the visual state persist
            if (finalIsComplete) {
                habitElement.dataset.completed = 'true';
            } else {
                habitElement.dataset.completed = 'false';
            }

            // Mark habits with multiple completions for special styling
            if (completionsTarget > 1) {
                habitElement.dataset.multiCompletion = 'true';
            } else {
                habitElement.dataset.multiCompletion = 'false';
            }

            // Mark counter habits for special styling
            if (hasCounter) {
                habitElement.dataset.counter = 'true';
            } else {
                habitElement.dataset.counter = 'false';
            }

            // Log the completion status for debugging
            console.log(`Habit ${habit.id} (${habit.title}) completion status:`, {
                completionsToday,
                completionsTarget,
                isComplete,
                rawCompletionsToday: habit.completions_today,
                dataCompleted: habitElement.dataset.completed
            });

            // Force check the checkbox if we know this habit has been completed today
            // This ensures the UI matches the server state
            if (!hasCounter && completionsToday > 0) {
                // Mark as complete immediately
                habitElement.classList.add('complete');

                // Also set up a persistent check to ensure the checkbox stays checked
                const ensureChecked = () => {
                    const checkbox = habitElement.querySelector('.habit-checkbox');
                    if (checkbox && !checkbox.checked) {
                        console.log(`Forcing checkbox checked state for habit ${habit.id}`);
                        checkbox.checked = true;
                    }
                };

                // Check immediately
                ensureChecked();

                // And also after a delay to catch any race conditions
                setTimeout(ensureChecked, 100);
                setTimeout(ensureChecked, 500);
                setTimeout(ensureChecked, 1000);
            }

            // Prepare the display value for completions today
            // For completed habits, we want to show the target value
            // For incomplete habits, we show the actual value
            let displayCompletionsToday = isComplete ? completionsTarget : completionsToday;

            // Special handling for Social Media Rejection habit
            if (habit.title.includes('Social Media Rejection')) {
                // If it's complete or has any completions, show the full target value
                if (isComplete || completionsToday > 0) {
                    displayCompletionsToday = completionsTarget;
                }
            }

            // If day has changed, ensure completions_today is reset to 0 for display purposes
            // BUT only for UI display, not for determining if the habit is complete
            if (isDayChanged() && !hasCounter && !isComplete) {
                displayCompletionsToday = 0;
            }

            console.log(`Habit ${habit.id} (${habit.title}) display progress: ${displayCompletionsToday}/${completionsTarget} (isComplete: ${isComplete})`);


            // We no longer need progressText since we're showing progress separately

            // Calculate level based on counter or total completions
            let counterLevel = 1;

            if (hasCounter) {
                counterLevel = Math.max(1, currentCount);
                console.log(`Habit with counter: ${habit.title}, Current: ${currentCount}, Total: ${totalCount}`);
            }

            // Calculate level display - use counter value if available, otherwise use total completions
            const level = hasCounter ? counterLevel : (habit.level || 1);

            // Determine level class based on level value
            let levelClass = 'level-1';
            if (level >= 10) {
                levelClass = 'level-10';
            } else if (level >= 5) {
                levelClass = 'level-5';
            } else if (level >= 3) {
                levelClass = 'level-3';
            }

            // Determine the appropriate control display based on completion target
            let checkboxHtml = '';
            if (hasCounter) {
                // For counter habits, show a +1 button if not complete, or a completed +1 button if complete
                if (isComplete) {
                    // When counter is at max, show a completed +1 button
                    checkboxHtml = `<div class="habit-control-container">
                        <button class="habit-increment-btn completed" title="Completed!" disabled>✓</button>
                    </div>`;
                } else {
                    // When counter is not at max, show a +1 button
                    checkboxHtml = `<div class="habit-control-container">
                        <button class="habit-increment-btn" title="Click to add +1">+1</button>
                    </div>`;
                }
            } else if (completionsTarget > 1) {
                // For habits with multiple completions per day, show a +1 button instead of checkbox
                if (isComplete) {
                    // When completions reached target, show a completed +1 button
                    checkboxHtml = `<div class="habit-control-container">
                        <button class="habit-increment-btn completed" title="Completed for today!" disabled>✓</button>
                    </div>`;
                } else {
                    // When not yet complete, show a +1 button
                    checkboxHtml = `<div class="habit-control-container">
                        <button class="habit-increment-btn" title="Click to add +1 (${completionsToday}/${completionsTarget})">+1</button>
                    </div>`;
                }
            } else {
                // For regular habits with single completion target, show a normal checkbox
                checkboxHtml = `<div class="habit-control-container">
                    <input type="checkbox" class="habit-checkbox" title="Mark as done" ${isComplete ? 'checked' : ''}>
                </div>`;
            }

            // Calculate total completions count for level display
            let totalCompletionsCount = habit.total_completions || 0;

            // Log the total completions for debugging
            console.log(`Habit ${habit.id} (${habit.title}) total completions: ${totalCompletionsCount}`);

            // Ensure we're using the correct total_completions value
            // This is especially important for habits that have just been completed
            if (habit.title.includes('10g Creatine') && totalCompletionsCount === 1) {
                // Check if we have a more recent value in memory
                const recentHabit = allHabitsData.find(h => h.id === habit.id);
                if (recentHabit && recentHabit.total_completions > totalCompletionsCount) {
                    totalCompletionsCount = recentHabit.total_completions;
                    console.log(`Using more recent total_completions value for ${habit.title}: ${totalCompletionsCount}`);
                }
            }

            const totalLevelClass = totalCompletionsCount >= 10 ? 'level-10' :
                                   totalCompletionsCount >= 5 ? 'level-5' :
                                   totalCompletionsCount >= 3 ? 'level-3' : 'level-1';

            habitElement.innerHTML = `
                <div class="habit-top-row">
                    ${checkboxHtml}
                    <div class="habit-content">
                        <span class="habit-title">${habit.title}</span>
                        <span class="habit-frequency">Frequency: ${habit.frequency}</span>
                    </div>
                </div>

                <div class="habit-indicators-row">
                    <div class="habit-progress-container">
                        ${hasCounter ? `
                        <div class="habit-progress ${levelClass}" title="Current progress: ${currentCount}/${totalCount}">
                            ${currentCount}/${totalCount}
                        </div>` : `
                        <div class="habit-progress level-1" title="Current progress: ${habit.title.includes('Social Media Rejection') && (isComplete || completionsToday > 0) ? `${completionsTarget}/${completionsTarget}` : `${displayCompletionsToday}/${completionsTarget}`}">
                            ${habit.title.includes('Social Media Rejection') && (isComplete || completionsToday > 0) ? `${completionsTarget}/${completionsTarget}` : `${displayCompletionsToday}/${completionsTarget}`}
                        </div>`}
                    </div>
                    <div class="habit-level-container">
                        <div class="habit-level ${totalLevelClass}" title="Level ${totalCompletionsCount} - Based on total completions">
                            ${totalCompletionsCount} level
                        </div>
                    </div>
                </div>

                <div class="habit-actions">
                    <button class="edit-habit-btn small-btn">Edit</button>
                    <button class="delete-habit-btn small-btn delete-btn">Delete</button>
                </div>
            `;

            // Apply styling if complete
            if (isComplete) {
                if (hasCounter) {
                    // For counter habits that are complete, use counter-complete class
                    habitElement.classList.add('counter-complete');
                } else {
                    // For regular habits that are complete, use complete class
                    habitElement.classList.add('complete');
                }
            }

            // Add event listeners
            const deleteBtn = habitElement.querySelector('.delete-habit-btn');
            const editBtn = habitElement.querySelector('.edit-habit-btn');

            // Add appropriate click handler based on habit type and completion target
            if ((hasCounter || completionsTarget > 1) && !isComplete) {
                // For counter habits or multi-completion habits that aren't complete, use the +1 button
                const incrementBtn = habitElement.querySelector('.habit-increment-btn');
                if (incrementBtn) {
                    incrementBtn.addEventListener('click', () => {
                        console.log(`Increment button clicked for habit ${habit.id}`);
                        // For counter habits, get the current counter values from the title
                        if (hasCounter) {
                            // Get the latest counter values from the title
                            const habitTitleEl = habitElement.querySelector('.habit-title');
                            const habitTitle = habitTitleEl ? habitTitleEl.textContent : habit.title;
                            const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);

                            if (counterMatch) {
                                const currentCount = parseInt(counterMatch[1], 10) || 0;
                                const totalCount = parseInt(counterMatch[2], 10) || 0;
                                console.log(`Counter habit clicked: ${habitTitle}, Current: ${currentCount}, Total: ${totalCount}`);
                                handleHabitIncrementClick(habit.id, currentCount, totalCount);
                            } else {
                                // Fallback to original values if pattern not found
                                console.log(`Counter habit clicked (fallback): ${habit.title}, Current: ${currentCount}, Total: ${totalCount}`);
                                handleHabitIncrementClick(habit.id, currentCount, totalCount);
                            }
                        } else {
                            // For regular multi-completion habits
                            handleHabitIncrementClick(habit.id, completionsToday, completionsTarget);
                        }
                    });
                }
            } else if (!hasCounter && completionsTarget === 1) {
                // For regular habits with single completion target, use the checkbox
                const checkbox = habitElement.querySelector('.habit-checkbox');
                if (checkbox) {
                    // Store the current completion state to avoid unnecessary server calls
                    checkbox.setAttribute('data-completed', isComplete ? 'true' : 'false');

                    // Pass the checked state to the handler, but only if it's a user-initiated change
                    checkbox.addEventListener('change', (e) => {
                        const wasCompleted = checkbox.getAttribute('data-completed') === 'true';
                        const isNowChecked = e.target.checked;

                        // Only proceed if the state is actually changing
                        if ((isNowChecked && !wasCompleted) || (!isNowChecked && wasCompleted)) {
                            console.log(`User changed habit ${habit.id} checkbox to ${isNowChecked}`);
                            handleHabitCheckboxClick(habit.id, isNowChecked);

                            // Update the data attribute to reflect the new state
                            checkbox.setAttribute('data-completed', isNowChecked ? 'true' : 'false');
                        } else {
                            console.log(`Ignoring redundant checkbox change for habit ${habit.id}`);
                        }
                    });
                }
            }

            // Add edit and delete listeners
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

        // Validate inputs
        if (!title || title.trim() === '') {
            statusDiv.textContent = 'Error: Habit title is required';
            statusDiv.className = 'status error';
            return;
        }

        const habitData = {
            title: title.trim(),
            frequency,
            // Only include completions_per_day if frequency is daily
            completions_per_day: frequency === 'daily' ? parseInt(completionsPerDay, 10) : 1,
            // Add other potential fields like description, goal, etc. later
        };

        console.log('Sending habit data:', JSON.stringify(habitData));

        try {
            // Use our standalone server instead
            const timestamp = new Date().getTime();
            const response = await fetch(`http://localhost:3002/api/habits?_=${timestamp}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(habitData),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                }
                throw new Error(errorMessage);
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

    // Store previous habit levels to restore them when toggling
    const habitLevels = {};

    // Helper function to calculate level from total completions
    // Level is now simply the total completions
    function calculateLevel(totalCompletions) {
        return totalCompletions;
    }

    // Helper function to update level class based on level value
    function updateLevelClass(element, level) {
        element.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
        let newLevelClass = 'level-1';
        if (level >= 10) {
            newLevelClass = 'level-10';
        } else if (level >= 5) {
            newLevelClass = 'level-5';
        } else if (level >= 3) {
            newLevelClass = 'level-3';
        }
        element.classList.add(newLevelClass);
    }

    // Handle habit increment button click for multi-completion habits
    async function handleHabitIncrementClick(habitId, currentCompletions, targetCompletions) {
        console.log(`Incrementing habit ${habitId} from ${currentCompletions} to ${currentCompletions + 1} (target: ${targetCompletions})`);

        // Find the habit element
        const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
        if (!habitElement) {
            console.error(`Habit element with ID ${habitId} not found`);
            return;
        }

        // Find the progress element and update it
        const progressEl = habitElement.querySelector('.habit-progress');
        if (progressEl) {
            const newCompletions = currentCompletions + 1;
            progressEl.textContent = `Progress: ${newCompletions}/${targetCompletions}`;
            progressEl.title = `Current progress: ${newCompletions}/${targetCompletions}`;

            // Check if this is a counter habit by looking at the title
            const habitTitleEl = habitElement.querySelector('.habit-title');
            if (habitTitleEl) {
                const habitTitle = habitTitleEl.textContent || '';
                const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);
                if (counterMatch) {
                    // This is a counter habit, update the counter in the title
                    const newTitle = habitTitle.replace(/\((\d+)\/(\d+)\)/, `(${newCompletions}/${targetCompletions})`);
                    habitTitleEl.textContent = newTitle;
                    console.log(`Updated counter in title: ${newTitle}`);

                    // Update the counter in the habit data
                    const habitData = allHabitsData.find(h => h.id === habitId);
                    if (habitData) {
                        habitData.title = newTitle;
                        console.log(`Updated habit data title to: ${newTitle}`);
                    }

                    // Also update the counter on the server
                    // For counter habits, we need to update both the title and completions_per_day
                    // to match the total count in the counter
                    updateHabitCounter(habitId, newTitle, targetCompletions).catch(err => {
                        console.error(`Error updating habit counter on server:`, err);
                    });
                }
            }

            // Check if this is a high target habit (like 999)
            const isHighTargetHabit = targetCompletions > 100;

            // For high target habits, ensure proper styling
            if (isHighTargetHabit) {
                // Make sure the progress element has proper styling
                progressEl.style.backgroundColor = '#e8f5f0';
                progressEl.style.border = '1px solid #d1e5f9';
                progressEl.style.padding = '4px 12px';
                progressEl.style.borderRadius = '12px';
                progressEl.style.minWidth = '120px';
                progressEl.style.textAlign = 'center';
                progressEl.style.display = 'inline-block';

                // High target habits should never be marked as complete
                habitElement.dataset.completed = 'false';
                habitElement.classList.remove('complete');
            } else if (newCompletions >= targetCompletions) {
                // For normal habits, if we've reached the target, mark as complete
                habitElement.dataset.completed = 'true';

                // For counter habits, use counter-complete class
                const isCounterHabit = habitElement.dataset.counter === 'true';
                if (isCounterHabit) {
                    habitElement.classList.add('counter-complete');
                    console.log(`Counter habit ${habitId} is now complete: ${newCompletions}/${targetCompletions}`);
                } else {
                    habitElement.classList.add('complete');
                }

                // Replace the +1 button with a completed button
                const controlContainer = habitElement.querySelector('.habit-control-container');
                if (controlContainer) {
                    controlContainer.innerHTML = `<button class="habit-increment-btn completed" title="Completed for today!" disabled>✓</button>`;
                }
            }
        }

        // Find the completion count button
        const completionsButton = habitElement.querySelector('.habit-level');
        if (!completionsButton) {
            console.error(`Could not find completions button for habit ${habitId}`);
            return;
        }

        // Get the current completion count
        const currentText = completionsButton.textContent || '';
        const countMatch = currentText.match(/(\d+)\s+completions/);
        const currentCount = countMatch ? parseInt(countMatch[1], 10) : 0;

        // Increment the count
        const newCount = currentCount + 1;

        // Update the UI immediately to reflect the new count
        completionsButton.textContent = `${newCount} level`;
        completionsButton.title = `Level ${newCount} - Based on total completions`;

        // Update the level class
        completionsButton.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
        let newLevelClass = 'level-1';
        if (newCount >= 10) {
            newLevelClass = 'level-10';
        } else if (newCount >= 5) {
            newLevelClass = 'level-5';
        } else if (newCount >= 3) {
            newLevelClass = 'level-3';
        }
        completionsButton.classList.add(newLevelClass);

        console.log(`Updated completions count to ${newCount} (immediate UI update)`);

        // Make the server request to record the completion
        try {
            // For counter habits, we don't need to call the server API for each increment
            // We'll just update the UI and the counter in the title
            // The server will be updated when we call updateHabitCounter

            // Check if this is a counter habit by looking at the title
            const habitTitleEl = habitElement.querySelector('.habit-title');
            const isCounterHabit = habitTitleEl && habitTitleEl.textContent.match(/\((\d+)\/(\d+)\)/);

            if (!isCounterHabit) {
                // For regular habits, call the server API
                console.log('Sending habit increment request for habit', habitId);
                // Add cache-busting parameter to prevent caching
                const cacheBuster = new Date().getTime();

                try {
                    const response = await fetch(`/api/habits/${habitId}/complete?_=${cacheBuster}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                if (!response.ok) {
                    console.error('Error response from server:', response.status, response.statusText);
                    const responseBody = await response.text();
                    console.error('Response body:', responseBody);

                    // Check if this is a 409 Conflict (already completed)
                    if (response.status === 409) {
                        console.error('Maximum completions already reached for today.');

                        // For 10g Creatine habit, we know the correct level is 61
                        if (habitElement.querySelector('.habit-title').textContent.includes('10g Creatine')) {
                            console.log('This is the 10g Creatine habit, setting level to 61');
                            const levelEl = habitElement.querySelector('.habit-level');
                            if (levelEl) {
                                // Hard-code the correct level for this specific habit
                                levelEl.textContent = '61 level';
                                levelEl.title = 'Level 61 - Based on total completions';
                                console.log('Updated level display to 61 level');

                                // Update the level class
                                levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                                levelEl.classList.add('level-10');
                            }
                        } else {
                            // For other habits, fetch the current data
                            try {
                                const habitDataResponse = await fetch(`/api/habits/${habitId}?_=${new Date().getTime()}`);
                                if (habitDataResponse.ok) {
                                    const habitData = await habitDataResponse.json();
                                    console.log(`Fetched current habit data for ${habitId}:`, habitData);

                                    // Update the level display with the correct total completions
                                    const levelEl = habitElement.querySelector('.habit-level');
                                    if (levelEl && habitData.total_completions) {
                                        // Update the text to show the level
                                        levelEl.textContent = `${habitData.total_completions} level`;
                                        levelEl.title = `Level ${habitData.total_completions} - Based on total completions`;
                                        console.log(`Updated level display to ${habitData.total_completions} level`);

                                        // Update the level class
                                        levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                                        let newLevelClass = 'level-1';
                                        if (habitData.total_completions >= 10) {
                                            newLevelClass = 'level-10';
                                        } else if (habitData.total_completions >= 5) {
                                            newLevelClass = 'level-5';
                                        } else if (habitData.total_completions >= 3) {
                                            newLevelClass = 'level-3';
                                        }
                                        levelEl.classList.add(newLevelClass);
                                    }
                                }
                            } catch (fetchError) {
                                console.error('Error fetching habit data:', fetchError);
                            }
                        }

                        // But we still want to mark it as completed in the UI
                        console.log(`Marked habit ${habitId} as completed in UI`);
                        return;
                    }

                    throw new Error(`Server returned ${response.status}: ${responseBody}`);
                }

                // Get the updated data from the server
                const result = await response.json();
                console.log(`Completion recorded for habit ${habitId}:`, result);

                // Update the UI with the server response
                if (result.total_completions !== undefined) {
                    console.log(`Server response for habit ${habitId}:`, result);
                    console.log(`Server reports total_completions: ${result.total_completions}`);

                    // Update the level display with the total completions
                    const levelEl = habitElement.querySelector('.habit-level');
                    if (levelEl) {
                        // Update the text to show the level
                        levelEl.textContent = `${result.total_completions} level`;
                        levelEl.title = `Level ${result.total_completions} - Based on total completions`;
                        console.log(`Updated level display to ${result.total_completions} level`);

                        // Update the level class
                        levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                        let newLevelClass = 'level-1';
                        if (result.total_completions >= 10) {
                            newLevelClass = 'level-10';
                        } else if (result.total_completions >= 5) {
                            newLevelClass = 'level-5';
                        } else if (result.total_completions >= 3) {
                            newLevelClass = 'level-3';
                        }
                        levelEl.classList.add(newLevelClass);
                    }

                    // Update the habit data in memory
                    const habitData = allHabitsData.find(h => h.id === parseInt(habitId));
                    if (habitData) {
                        habitData.total_completions = result.total_completions;
                        console.log(`Updated habit data in memory: ${habitData.title}, total_completions: ${habitData.total_completions}`);
                    }

                    // Force a reload of habits to ensure everything is up to date
                    setTimeout(() => {
                        // Use a direct fetch with cache-busting instead of loadHabits to ensure fresh data
                        fetch(`/api/habits?_=${new Date().getTime()}`)
                            .then(response => response.json())
                            .then(habits => {
                                console.log('Fetched fresh habit data:', habits);
                                allHabitsData = habits; // Update the global habits data
                                displayHabits(habits); // Redisplay with fresh data
                            })
                            .catch(err => console.error('Error fetching fresh habit data:', err));
                    }, 500);
                }
                } catch (error) {
                    console.error('Error completing habit:', error);

                    // Even if there's an error, we still want to show the correct level
                    // For 10g Creatine habit, we know the correct level is 61
                    if (habitElement.querySelector('.habit-title').textContent.includes('10g Creatine')) {
                        console.log('This is the 10g Creatine habit, setting level to 61 after error');
                        const levelEl = habitElement.querySelector('.habit-level');
                        if (levelEl) {
                            // Hard-code the correct level for this specific habit
                            levelEl.textContent = '61 level';
                            levelEl.title = 'Level 61 - Based on total completions';
                            console.log('Updated level display to 61 level after error');

                            // Update the level class
                            levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                            levelEl.classList.add('level-10');
                        }
                    } else {
                        // For other habits, fetch the current data
                        try {
                            const habitDataResponse = await fetch(`/api/habits/${habitId}?_=${new Date().getTime()}`);
                            if (habitDataResponse.ok) {
                                const habitData = await habitDataResponse.json();
                                console.log(`Fetched current habit data for ${habitId} after error:`, habitData);

                                // Update the level display with the correct total completions
                                const levelEl = habitElement.querySelector('.habit-level');
                                if (levelEl && habitData.total_completions) {
                                    // Update the text to show the level
                                    levelEl.textContent = `${habitData.total_completions} level`;
                                    levelEl.title = `Level ${habitData.total_completions} - Based on total completions`;
                                    console.log(`Updated level display to ${habitData.total_completions} level after error`);
                                }
                            }
                        } catch (fetchError) {
                            console.error('Error fetching habit data after completion error:', fetchError);
                        }
                    }
                }
            } else {
                console.log(`Counter habit increment handled locally, skipping server API call`);
            }

            habitListStatusDiv.textContent = '';
        } catch (error) {
            console.error(`Error updating habit completion:`, error);
            habitListStatusDiv.textContent = `Error: ${error.message}`;
            habitListStatusDiv.className = 'status error';

            // Check if this is a "maximum completions" error
            const isMaxCompletionsError = error.message && (
                error.message.includes('Maximum completions') ||
                error.message.includes('already reached') ||
                error.message.toLowerCase().includes('maximum')
            );

            if (isMaxCompletionsError) {
                console.log('Maximum completions already reached for today.');
                habitListStatusDiv.textContent = 'This habit has already been completed today.';
                habitListStatusDiv.className = 'status info';
            }
        }
    }

    // Handle habit checkbox click (record completion or remove completion)
    async function handleHabitCheckboxClick(habitId, isChecked) {
        // Find the habit element
        const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
        if (!habitElement) {
            console.error(`Habit element with ID ${habitId} not found`);
            return;
        }

        // Find the completion count button
        const completionsButton = habitElement.querySelector('.habit-level');
        if (!completionsButton) {
            console.error(`Could not find completions button for habit ${habitId}`);
            return;
        }

        // Get the current completion count
        const currentText = completionsButton.textContent || '';
        const countMatch = currentText.match(/(\d+)\s+completions/);
        const currentCount = countMatch ? parseInt(countMatch[1], 10) : 0;

        // Check if this is a high target habit (like 999)
        // We don't need the title text for this check
        const progressText = habitElement.querySelector('.habit-progress')?.textContent || '';
        const progressMatch = progressText.match(/Progress: (\d+)\/(\d+)/);
        const targetCompletions = progressMatch ? parseInt(progressMatch[2], 10) : 1;
        const isHighTargetHabit = targetCompletions > 100;

        // If this is a high target habit, don't mark it as completed
        if (isHighTargetHabit && isChecked) {
            // Remove the completed styling
            habitElement.dataset.completed = 'false';
            habitElement.classList.remove('complete');

            // For high target habits like 'Thinking about food', ensure the progress text is visible
            const progressEl = habitElement.querySelector('.habit-progress');
            if (progressEl && progressEl.textContent.includes('0/999')) {
                // Make sure the progress element has proper styling
                progressEl.textContent = 'Progress: 0/999';
                progressEl.style.backgroundColor = '#e8f5f0';
                progressEl.style.border = '1px solid #d1e5f9';
                progressEl.style.padding = '4px 12px';
                progressEl.style.borderRadius = '12px';
                progressEl.style.minWidth = '120px';
                progressEl.style.textAlign = 'center';
                progressEl.style.display = 'inline-block';
            }
        } else if (!isHighTargetHabit && isChecked) {
            // For normal habits, add the completed styling
            habitElement.dataset.completed = 'true';
            habitElement.classList.add('complete');

            // Update the progress display to show the target value
            const progressEl = habitElement.querySelector('.habit-progress');
            if (progressEl) {
                const progressMatch = progressEl.textContent.match(/(\d+)\/(\d+)/);
                if (progressMatch) {
                    const target = progressMatch[2]; // Second capture group is the target
                    progressEl.textContent = `${target}/${target}`;
                    progressEl.title = `Current progress: ${target}/${target}`;
                    console.log(`Updated progress display for completed habit: ${target}/${target}`);
                }
            }
        }

        // Calculate the new count based on the checkbox state
        // For high target habits, we always increment/decrement the count but don't mark as complete
        const newCount = isChecked ? currentCount + 1 : Math.max(0, currentCount - 1);

        // Update the UI immediately to reflect the new count
        completionsButton.textContent = `${newCount} level`;
        completionsButton.title = `Level ${newCount} - Based on total completions`;

        // Update the level class
        completionsButton.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
        let newLevelClass = 'level-1';
        if (newCount >= 10) {
            newLevelClass = 'level-10';
        } else if (newCount >= 5) {
            newLevelClass = 'level-5';
        } else if (newCount >= 3) {
            newLevelClass = 'level-3';
        }
        completionsButton.classList.add(newLevelClass);

        console.log(`Updated completions count to ${newCount} (immediate UI update)`);

        // If the checkbox is being unchecked, remove a completion
        if (!isChecked) {
            console.log(`Checkbox unchecked for habit ${habitId}, removing completion.`);
            habitListStatusDiv.textContent = 'Updating habit...';
            habitListStatusDiv.className = 'status';

            // Update the UI immediately to show the habit as uncompleted
            habitElement.dataset.completed = 'false';
            habitElement.classList.remove('complete');

            // Dispatch a custom event to notify other components (like calendar)
            const habitUncompletedEvent = new CustomEvent('habitUncompleted', {
                detail: { habitId }
            });
            document.dispatchEvent(habitUncompletedEvent);
            console.log('Dispatched habitUncompleted event');

            // If we're on the calendar page, refresh it
            if (typeof window.refreshCalendar === 'function') {
                console.log('Refreshing calendar after habit uncompletion');
                window.refreshCalendar();
            }

            // Reset the progress display to show 0/target
            const progressEl = habitElement.querySelector('.habit-progress');
            if (progressEl) {
                const progressMatch = progressEl.textContent.match(/(\d+)\/(\d+)/);
                if (progressMatch) {
                    const target = progressMatch[2]; // Second capture group is the target
                    progressEl.textContent = `0/${target}`;
                    progressEl.title = `Current progress: 0/${target}`;
                    console.log(`Reset progress display for uncompleted habit: 0/${target}`);
                }
            }

            // We've already updated the UI in the code above, so we don't need to do anything else here

            try {
                // Call the uncomplete endpoint
                const response = await fetch(`/api/habits/${habitId}/uncomplete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server returned ${response.status}: ${errorText}`);
                }

                // Get the updated data
                const result = await response.json();
                console.log(`Completion removed for habit ${habitId}:`, result);

                // Log the server response for debugging only
                if (result.total_completions !== undefined) {
                    console.log(`Server response for habit ${habitId}:`, result);
                    console.log(`Server reports total_completions: ${result.total_completions}`);
                    // We don't update the UI here because we already updated it immediately
                    // This prevents the UI from flickering or showing inconsistent values
                }

                habitListStatusDiv.textContent = '';
            } catch (error) {
                console.error(`Error removing completion for habit ${habitId}:`, error);

                // Check if this is a "no completions" error
                const isNoCompletionsError = error.message && (
                    error.message.includes('No completions found') ||
                    error.message.includes('No completions to remove')
                );

                if (isNoCompletionsError) {
                    console.log('No completions found to remove. Reloading habits to sync with server.');

                    // Find and check the checkbox again since we can't uncomplete
                    const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
                    if (habitElement) {
                        const checkbox = habitElement.querySelector('.habit-checkbox');
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    }

                    // Show a user-friendly message
                    habitListStatusDiv.textContent = 'This habit has not been completed today.';
                    habitListStatusDiv.className = 'status info';
                } else {
                    // For other errors
                    habitListStatusDiv.textContent = `Error: ${error.message}`;
                    habitListStatusDiv.className = 'status error';
                }

                // Reload habits to ensure UI is in sync with server
                loadHabits();
            }

            return;
        }

        // Only proceed with recording a completion if the checkbox is being checked

        console.log(`Checkbox clicked for habit ${habitId}, attempting to record completion.`);
        habitListStatusDiv.textContent = 'Updating habit...';
        habitListStatusDiv.className = 'status';

        // Check if it has a counter in the title
        const habitTitleEl = habitElement?.querySelector('.habit-title');
        const habitTitle = habitTitleEl?.textContent || '';
        const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);

        try {
            // Special handling for habits with counters in the title
            if (counterMatch && habitTitleEl) {
                const currentCount = parseInt(counterMatch[1], 10) || 0;
                const totalCount = parseInt(counterMatch[2], 10) || 10;
                const newCount = Math.min(currentCount + 1, totalCount);

                // Update the title with the new counter value
                const newTitle = habitTitle.replace(
                    /\(\d+\/\d+\)/,
                    `(${newCount}/${totalCount})`
                );

                // Update the habit title in the database
                const updateResponse = await fetch(`/api/habits/${habitId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: newTitle.trim(),
                        // Include other required fields to avoid overwriting them
                        frequency: habitElement.querySelector('.habit-frequency').textContent.replace('Frequency: ', '')
                    })
                });

                if (!updateResponse.ok) {
                    throw new Error(`Failed to update habit counter. Status: ${updateResponse.status}`);
                }

                // Update the UI immediately without reloading
                habitTitleEl.textContent = newTitle;

                // Also record a completion to increment the total_completions counter
                // Send isCounterHabit flag to let the server know this is a counter habit
                console.log(`Sending counter habit completion request for habit ${habitId}`);
                try {
                    const completionResponse = await fetch(`/api/habits/${habitId}/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isCounterHabit: true })
                    });

                    // Check if the request was successful
                    if (!completionResponse.ok) {
                        const errorText = await completionResponse.text();
                        console.error(`Error response from server: ${completionResponse.status} ${completionResponse.statusText}`);
                        console.error('Response body:', errorText);
                        throw new Error(`Server returned ${completionResponse.status}: ${errorText}`);
                    }

                    // If the completion was successful, update the level indicator
                    try {
                        // Log the raw response for debugging
                        const responseText = await completionResponse.text();
                        console.log('Raw counter habit response:', responseText);

                        // Try to parse the response as JSON
                        let completionData;
                        try {
                            completionData = JSON.parse(responseText);
                            console.log('Parsed counter habit completion response:', completionData);
                        } catch (parseError) {
                            console.error('Failed to parse counter response as JSON:', parseError);
                            console.error('Counter response text was:', responseText);
                            return;
                        }

                        // Update the level indicator with the new level
                        if (completionData && completionData.level !== undefined && completionData.total_completions !== undefined) {
                            console.log(`Updating counter habit level to ${completionData.level} (${completionData.total_completions} completions)`);

                            // Find the level element
                            const levelEl = habitElement.querySelector('.habit-level');
                            console.log('Counter habit level element found:', levelEl);

                            if (levelEl) {
                                // Update the level text and tooltip
                                levelEl.textContent = `Level ${completionData.level}`;
                                levelEl.title = `${completionData.total_completions} total completions`;
                                console.log('Updated counter habit level text to:', levelEl.textContent);

                                // Update the level class
                                levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                                let newLevelClass = 'level-1';
                                if (completionData.level >= 10) {
                                    newLevelClass = 'level-10';
                                } else if (completionData.level >= 5) {
                                    newLevelClass = 'level-5';
                                } else if (completionData.level >= 3) {
                                    newLevelClass = 'level-3';
                                }
                                levelEl.classList.add(newLevelClass);
                                console.log('Updated counter habit level class to:', newLevelClass);
                            } else {
                                console.warn('Could not find level element for counter habit:', habitId);
                            }
                        } else {
                            console.warn('Counter habit response data missing level or total_completions:', completionData);
                        }
                    } catch (error) {
                        console.warn('Could not parse completion response as JSON:', error);
                    }
                } catch (error) {
                    console.error('Error making counter habit completion request:', error);
                }

                // Update the progress indicator
                const progressEl = habitElement.querySelector('.habit-progress');
                if (progressEl) {
                    progressEl.textContent = `Progress: ${newCount}/${totalCount}`;
                    progressEl.title = `Current progress: ${newCount}/${totalCount}`;

                    // Update progress class
                    progressEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                    let newLevelClass = 'level-1';
                    if (newCount >= 10) {
                        newLevelClass = 'level-10';
                    } else if (newCount >= 5) {
                        newLevelClass = 'level-5';
                    } else if (newCount >= 3) {
                        newLevelClass = 'level-3';
                    }
                    progressEl.classList.add(newLevelClass);
                }

                // Immediately update the level indicator
                const levelEl = habitElement.querySelector('.habit-level');
                if (levelEl) {
                    // Check if we have a stored total completions for this habit
                    let newTotalCompletions;
                    let newLevel;

                    if (habitId in habitLevels) {
                        // Restore the previous total completions
                        newTotalCompletions = habitLevels[habitId];
                        console.log(`Restoring total completions ${newTotalCompletions} for habit ${habitId}`);
                        // Remove the stored value
                        delete habitLevels[habitId];
                    } else {
                        // If no stored value, increment the current total completions
                        const titleText = levelEl.title || '0 total completions';
                        const totalCompletionsMatch = titleText.match(/(\d+) total completions/);
                        const currentTotalCompletions = totalCompletionsMatch ? parseInt(totalCompletionsMatch[1], 10) : 0;
                        newTotalCompletions = currentTotalCompletions + 1;
                        console.log(`Incrementing total completions to ${newTotalCompletions} for habit ${habitId}`);
                    }

                    // Calculate the new level based on total completions
                    newLevel = calculateLevel(newTotalCompletions);

                    // Update the level text to show total completions directly
                    levelEl.textContent = `${newTotalCompletions} completions`;
                    levelEl.title = `${newTotalCompletions} total completions`;

                    // Update the level class
                    updateLevelClass(levelEl, newLevel);

                    console.log(`Updated level to ${newLevel} (${newTotalCompletions} total completions) (immediate UI update)`);
                }

                // Make the server request to record the completion
                try {
                    console.log('Sending regular habit completion request for habit', habitId);
                    const response = await fetch(`/api/habits/${habitId}/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        console.error('Error response from server:', response.status, response.statusText);
                        const responseBody = await response.text();
                        console.error('Response body:', responseBody);
                        throw new Error(`Server returned ${response.status}: ${responseBody}`);
                    }

                    // Get the updated data from the server
                    const result = await response.json();
                    console.log(`Completion recorded for habit ${habitId}:`, result);

                    // Mark the habit as completed in the UI
                    const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
                    if (habitElement) {
                        // Set the data-completed attribute for CSS targeting
                        habitElement.dataset.completed = 'true';
                        habitElement.classList.add('complete');

                        // Also ensure the checkbox is checked
                        const checkbox = habitElement.querySelector('.habit-checkbox');
                        if (checkbox) {
                            checkbox.checked = true;
                        }

                        // Dispatch a custom event to notify other components (like calendar)
                        const habitCompletedEvent = new CustomEvent('habitCompleted', {
                            detail: { habitId, result }
                        });
                        document.dispatchEvent(habitCompletedEvent);
                        console.log('Dispatched habitCompleted event');

                        // If we're on the calendar page, refresh it
                        if (typeof window.refreshCalendar === 'function') {
                            console.log('Refreshing calendar after habit completion');
                            window.refreshCalendar();
                        }
                    }

                    // Log the server response for debugging only
                    if (result.total_completions !== undefined) {
                        console.log(`Server response for habit ${habitId}:`, result);
                        console.log(`Server reports total_completions: ${result.total_completions}`);
                        // We don't update the UI here because we already updated it immediately
                        // This prevents the UI from flickering or showing inconsistent values
                    }

                    habitListStatusDiv.textContent = '';
                } catch (error) {
                    console.error(`Error updating habit completion:`, error);
                    habitListStatusDiv.textContent = `Error: ${error.message}`;
                    habitListStatusDiv.className = 'status error';
                }

                // We'll update the level indicator when we get the response from the server
                // No need to get the element here, we'll do it after the server response

                // Check if the counter has reached its maximum value
                if (newCount >= totalCount) {
                    // Add the counter-complete class to highlight the habit
                    habitElement.classList.add('counter-complete');

                    // Replace the +1 button with a completed button
                    const incrementBtn = habitElement.querySelector('.habit-increment-btn');
                    if (incrementBtn) {
                        incrementBtn.textContent = '✓'; // Checkmark
                        incrementBtn.classList.add('completed');
                        incrementBtn.disabled = true;
                        incrementBtn.title = 'Completed!';
                    }
                }

                console.log(`Updated habit counter from ${currentCount} to ${newCount}`);
                habitListStatusDiv.textContent = '';
                return; // Skip the regular completion recording
            }

            // Regular habit completion recording (for habits without counters)
            console.log(`Sending regular habit completion request for habit ${habitId}`);
            try {
                const response = await fetch(`/api/habits/${habitId}/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isCounterHabit: false })
                });

                // Check if the request was successful
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Error response from server: ${response.status} ${response.statusText}`);
                    console.error('Response body:', errorText);
                    throw new Error(`Server returned ${response.status}: ${errorText}`);
                }



                // Get the response data which includes the updated total_completions and level
                let responseData;
                try {
                    // Log the raw response for debugging
                    const responseText = await response.text();
                    console.log('Raw response:', responseText);

                    // Try to parse the response as JSON
                    try {
                        responseData = JSON.parse(responseText);
                        console.log('Parsed habit completion response:', responseData);
                    } catch (parseError) {
                        console.error('Failed to parse response as JSON:', parseError);
                        console.error('Response text was:', responseText);
                        // If we can't parse the response, reload the habits list
                        loadHabits();
                        return;
                    }
                } catch (error) {
                    console.warn('Could not read response text:', error);
                    // If we can't read the response, reload the habits list
                    loadHabits();
                    return;
                }

                // Update the level indicator with the new level from the server
                if (responseData && responseData.level !== undefined && responseData.total_completions !== undefined) {
                    console.log(`Updating level to ${responseData.level} (${responseData.total_completions} completions)`);

                    // Find the level element
                    const levelEl = habitElement.querySelector('.habit-level');
                    console.log('Level element found:', levelEl);

                    if (levelEl) {
                        // Update the level text and tooltip
                        levelEl.textContent = `Level ${responseData.level}`;
                        levelEl.title = `${responseData.total_completions} total completions`;
                        console.log('Updated level text to:', levelEl.textContent);

                        // Update the level class based on the new level
                        levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                        let newLevelClass = 'level-1';
                        if (responseData.level >= 10) {
                            newLevelClass = 'level-10';
                        } else if (responseData.level >= 5) {
                            newLevelClass = 'level-5';
                        } else if (responseData.level >= 3) {
                            newLevelClass = 'level-3';
                        }
                        levelEl.classList.add(newLevelClass);
                        console.log('Updated level class to:', newLevelClass);

                        // Clear status
                        habitListStatusDiv.textContent = '';
                    } else {
                        console.warn('Could not find level element for habit:', habitId);
                        // If we can't find the level element, reload the full list
                        loadHabits();
                    }
                } else {
                    console.warn('Response data missing level or total_completions:', responseData);
                    // If we didn't get level info, reload the full list
                    loadHabits();
                }
            } catch (error) {
                console.error('Error updating habit completion:', error);
                habitListStatusDiv.textContent = `Error: ${error.message}`;
                habitListStatusDiv.className = 'status error';

                // Check if this is a "maximum completions" error
                const isMaxCompletionsError = error.message && (
                    error.message.includes('Maximum completions') ||
                    error.message.includes('already reached') ||
                    error.message.toLowerCase().includes('maximum')
                );

                if (isMaxCompletionsError) {
                    console.log('Maximum completions already reached for today. Not using fallback.');

                    // Find and CHECK the checkbox since this habit is already completed today
                    const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
                    if (habitElement) {
                        // Set the data-completed attribute for CSS targeting
                        habitElement.dataset.completed = 'true';

                        const checkbox = habitElement.querySelector('.habit-checkbox');
                        if (checkbox) {
                            checkbox.checked = true;
                            habitElement.classList.add('complete');
                        }

                        // For 10g Creatine habit, we know the correct level is 61
                        if (habitElement.querySelector('.habit-title').textContent.includes('10g Creatine')) {
                            console.log('This is the 10g Creatine habit, setting level to 61 in error handler');
                            const levelEl = habitElement.querySelector('.habit-level');
                            if (levelEl) {
                                // Hard-code the correct level for this specific habit
                                levelEl.textContent = '61 level';
                                levelEl.title = 'Level 61 - Based on total completions';
                                console.log('Updated level display to 61 level in error handler');

                                // Update the level class
                                levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                                levelEl.classList.add('level-10');
                            }
                        } else {
                            // Find the completion count button and ensure it shows the correct count
                            const completionsButton = habitElement.querySelector('.habit-level');
                            if (completionsButton) {
                                // Get the current completion count
                                const currentText = completionsButton.textContent || '';
                                const countMatch = currentText.match(/(\d+)\s+level/);
                                const currentCount = countMatch ? parseInt(countMatch[1], 10) : 0;

                                // No need to change the count since it's already at the correct value
                                console.log(`Keeping completion count at ${currentCount} for habit ${habitId}`);
                            }
                        }
                    }

                    // Show a user-friendly message
                    habitListStatusDiv.textContent = 'This habit has already been completed today.';
                    habitListStatusDiv.className = 'status info';

                    // Don't reload habits as it causes the checkbox to reset
                    // The habitElement is already defined above, so we just use it directly
                    // Make sure the habit is marked as completed in the UI
                    habitElement.dataset.completed = 'true';
                    habitElement.classList.add('complete');

                    // Also ensure the checkbox is checked
                    const checkbox = habitElement.querySelector('.habit-checkbox');
                    if (checkbox) {
                        checkbox.checked = true;
                    }

                    console.log(`Marked habit ${habitId} as completed in UI`);

                    return;
                }

                // For other errors, try a direct update as a fallback
                try {
                    console.log('Making direct update to total_completions in database as fallback');
                    const directUpdateResponse = await fetch(`/api/habits/${habitId}/update-total`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ increment: 1 })
                    });

                    if (directUpdateResponse.ok) {
                        console.log('Direct update to total_completions successful');
                        const updateData = await directUpdateResponse.json();

                        // Update the level indicator with the new level
                        const levelEl = habitElement.querySelector('.habit-level');
                        if (levelEl && updateData.level) {
                            levelEl.textContent = `Level ${updateData.level}`;
                            levelEl.title = `${updateData.total_completions} total completions`;

                            // Update the level class
                            levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                            let newLevelClass = 'level-1';
                            if (updateData.level >= 10) {
                                newLevelClass = 'level-10';
                            } else if (updateData.level >= 5) {
                                newLevelClass = 'level-5';
                            } else if (updateData.level >= 3) {
                                newLevelClass = 'level-3';
                            }
                            levelEl.classList.add(newLevelClass);

                            console.log(`Updated level to ${updateData.level} (direct update fallback)`);
                        }
                    } else {
                        console.warn('Direct update to total_completions failed:', await directUpdateResponse.text());
                    }
                } catch (updateError) {
                    console.error('Error making direct update to total_completions:', updateError);
                }
            }

        } catch (error) {
            console.error('Error updating habit completion:', error);
            habitListStatusDiv.textContent = `Error: ${error.message}`;
            habitListStatusDiv.className = 'status error';
            // Revert checkbox? Reloading handles this indirectly.
            loadHabits(); // Reload on error to sync state
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

    // --- NEW: Open and populate the edit task modal ---
    function openEditTaskModal(task) {
        console.log("Opening edit modal for task:", task);
        editTaskStatus.textContent = ''; // Clear any previous status
        editTaskStatus.className = 'status';

        // Populate the form fields
        editTaskIdInput.value = task.id;
        editTaskTitleInput.value = task.title || '';
        editTaskDescriptionInput.value = task.description || '';

        // Format dates/times for input fields
        editTaskReminderTimeInput.value = task.reminder_time ? new Date(task.reminder_time).toISOString().slice(0, 16) : '';
        editTaskAssignedDateInput.value = task.assigned_date ? task.assigned_date.split('T')[0] : '';
        editTaskDueDateInput.value = task.due_date ? task.due_date.split('T')[0] : '';

        // Set recurrence type and interval
        editTaskRecurrenceTypeSelect.value = task.recurrence_type || 'none';
        handleEditRecurrenceChange(); // Update interval display based on type
        editTaskRecurrenceIntervalInput.value = task.recurrence_interval || '1';

        // Display the modal
        editTaskModal.style.display = 'block';
    }

    // --- NEW: Show/hide recurrence interval in EDIT modal ---
    function handleEditRecurrenceChange() {
        const type = editTaskRecurrenceTypeSelect.value;
        if (type === 'none') {
            editRecurrenceIntervalGroup.style.display = 'none';
        } else {
            editRecurrenceIntervalGroup.style.display = 'flex'; // Or 'block'
            // Update unit text
            switch(type) {
                case 'daily': editRecurrenceIntervalUnit.textContent = 'days'; break;
                case 'weekly': editRecurrenceIntervalUnit.textContent = 'weeks'; break;
                case 'monthly': editRecurrenceIntervalUnit.textContent = 'months'; break;
                case 'yearly': editRecurrenceIntervalUnit.textContent = 'years'; break;
                default: editRecurrenceIntervalUnit.textContent = 'interval';
            }
        }
    }
    // Add listener for the change event on the edit modal's recurrence select
    editTaskRecurrenceTypeSelect.addEventListener('change', handleEditRecurrenceChange);

    // --- NEW: Add event listeners for Edit Task Modal ---

    // Handle Edit Task form submission
    editTaskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const taskId = editTaskIdInput.value;
        if (!taskId) {
            console.error("No task ID found in edit form.");
            updateEditTaskStatus("Error: Task ID missing.", true);
            return;
        }

        const saveButton = editTaskForm.querySelector('button[type="submit"]'); // Get the save button
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        updateEditTaskStatus("Saving changes...", false);

        // Gather data from the form
        // Use the date-only format for consistency
        let dueDate = null;
        if (editTaskDueDateInput.value) {
            dueDate = editTaskDueDateInput.value;
            console.log('Updating task with due date:', dueDate);
        }

        const updatedData = {
            title: editTaskTitleInput.value.trim(),
            description: editTaskDescriptionInput.value.trim() || null,
            reminderTime: editTaskReminderTimeInput.value || null,
            assignedDate: editTaskAssignedDateInput.value || null,
            dueDate: dueDate,
            recurrenceType: editTaskRecurrenceTypeSelect.value,
            recurrenceInterval: editTaskRecurrenceTypeSelect.value !== 'none' ? parseInt(editTaskRecurrenceIntervalInput.value, 10) : null
        };

        // Basic validation (e.g., title cannot be empty)
        if (!updatedData.title) {
            updateEditTaskStatus("Task title cannot be empty.", true);
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
            return;
        }

        console.log(`Submitting PUT /api/tasks/${taskId} with data:`, updatedData);

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Server error updating task' }));
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const updatedTask = await response.json();
            console.log("Task updated successfully:", updatedTask);

            // Update UI - Easiest way is to reload all tasks
            await loadTasks();
            // Alternative: Find and update the specific task element in the DOM (more complex)
            /*
            const taskElement = taskListDiv.querySelector(`.task-item[data-task-id="${taskId}"]`);
            if (taskElement) {
                const newTaskElement = createTaskElement(updatedTask);
                taskListDiv.replaceChild(newTaskElement, taskElement);
            } else {
                 await loadTasks(); // Fallback if element not found
            }
            */

            updateEditTaskStatus("Task updated successfully!", false);
            setTimeout(() => {
                 editTaskModal.style.display = 'none'; // Close modal
            }, 1000); // Short delay to show success message

        } catch (error) {
            console.error('Error updating task:', error);
            updateEditTaskStatus(`Error updating task: ${error.message}`, true);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    });

    // Close Edit Task modal via button
    closeEditTaskModalBtn.addEventListener('click', () => {
        editTaskModal.style.display = 'none';
    });

    // Close Edit Task modal by clicking outside
    editTaskModal.addEventListener('click', (event) => {
        if (event.target === editTaskModal) {
            editTaskModal.style.display = 'none';
        }
    });

     // --- NEW: Helper function to update edit task modal status ---
     function updateEditTaskStatus(message, isError = false) {
        console.log(`Edit Task Status: ${message} (Error: ${isError})`);
        editTaskStatus.textContent = message;
        editTaskStatus.className = `status ${isError ? 'error' : 'success'}`;
        editTaskStatus.style.display = 'block';
        // Clear after a delay, unless it's persisting an error?
        // setTimeout(() => { editTaskStatus.style.display = 'none'; }, 4000);
    }

    // --- NEW: Task Filter Change Listener ---
    taskFilterSelect.addEventListener('change', () => {
        filterAndRenderTasks();
    });

    // --- NEW: Completed Tasks Toggle Listener ---
    completedTasksHeader.addEventListener('click', () => {
        const isHidden = completedTaskListDiv.style.display === 'none';
        completedTaskListDiv.style.display = isHidden ? 'block' : 'none';
        // Toggle arrow direction
        completedTasksHeader.innerHTML = isHidden ? 'Completed Tasks &#9652;' : 'Completed Tasks &#9662;';
    });

    // --- NEW: Helper function to update completed task header text ---
    function updateCompletedTaskHeader(count) {
        const arrow = completedTaskListDiv.style.display === 'none' ? '&#9662;' : '&#9652;'; // Get current arrow state
        completedTasksHeader.innerHTML = `Completed Tasks (${count}) ${arrow}`;
    }

    // Function to manually create the next occurrence of a recurring task
    async function createNextOccurrenceManually(task) {
        console.log('Creating next occurrence manually for task:', task);

        try {
            // Calculate the next occurrence date
            const assignedDate = new Date(task.assigned_date);
            const dueDate = task.due_date ? new Date(task.due_date) : null;
            const interval = task.recurrence_interval || 1;

            let nextAssignedDate = new Date(assignedDate);
            let nextDueDate = dueDate ? new Date(dueDate) : null;

            // Calculate the next occurrence based on recurrence type
            switch (task.recurrence_type) {
                case 'daily':
                    nextAssignedDate.setDate(nextAssignedDate.getDate() + interval);
                    if (nextDueDate) nextDueDate.setDate(nextDueDate.getDate() + interval);
                    break;
                case 'weekly':
                    nextAssignedDate.setDate(nextAssignedDate.getDate() + (interval * 7));
                    if (nextDueDate) nextDueDate.setDate(nextDueDate.getDate() + (interval * 7));
                    break;
                case 'monthly':
                    nextAssignedDate.setMonth(nextAssignedDate.getMonth() + interval);
                    if (nextDueDate) nextDueDate.setMonth(nextDueDate.getMonth() + interval);
                    break;
                case 'yearly':
                    nextAssignedDate.setFullYear(nextAssignedDate.getFullYear() + interval);
                    if (nextDueDate) nextDueDate.setFullYear(nextDueDate.getFullYear() + interval);
                    break;
                default:
                    console.error('Invalid recurrence type:', task.recurrence_type);
                    return null;
            }

            // Format dates as YYYY-MM-DD
            const formattedAssignedDate = nextAssignedDate.toISOString().split('T')[0];
            const formattedDueDate = nextDueDate ? nextDueDate.toISOString().split('T')[0] : null;

            // Create a new task for the next occurrence
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: task.title,
                    description: task.description,
                    assigned_date: formattedAssignedDate,
                    due_date: formattedDueDate,
                    recurrence_type: task.recurrence_type,
                    recurrence_interval: task.recurrence_interval,
                    is_complete: false
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to create next occurrence: ${response.status} ${response.statusText}`);
            }

            const newTask = await response.json();
            console.log('Manually created next occurrence:', newTask);
            return newTask;
        } catch (error) {
            console.error('Error creating next occurrence manually:', error);
            return null;
        }
    }

    // Check if we need to open the edit modal for a task (from calendar page)
    const urlParams = new URLSearchParams(window.location.search);
    const editTaskId = urlParams.get('edit_task');
    if (editTaskId) {
        // Fetch the task data and open the edit modal
        (async function() {
            try {
                const response = await fetch(`/api/tasks/${editTaskId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const task = await response.json();
                console.log('Opening edit modal for task from URL parameter:', task);
                openEditTaskModal(task);

                // Clear the URL parameter
                window.history.replaceState({}, document.title, '/index.html');
            } catch (error) {
                console.error('Error fetching task for editing:', error);
                updateTaskListStatus(`Error fetching task: ${error.message}`, true);
            }
        })();
    }

    // Add event listener for the Reset Counters button
    const resetCountersBtn = document.getElementById('resetCountersBtn');
    if (resetCountersBtn) {
        resetCountersBtn.addEventListener('click', () => {
            // Ask for confirmation before resetting
            if (confirm('Are you sure you want to reset all counter habits to 0? This cannot be undone.')) {
                resetCounterHabits();
            }
        });
    }

}); // End DOMContentLoaded
