// Initialize variables at the top
let scheduledNotifications = [];
let deferredPrompt;
let serviceWorkerRegistration = null;

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
                const datePart = typeof task.due_date === 'string' && task.due_date.includes('T') ?
                    task.due_date.split('T')[0] : task.due_date;

                if (typeof datePart !== 'string' || !datePart.includes('-')) {
                    return false;
                }

                const [year, month, day] = datePart.split('-').map(Number);

                if (isNaN(year) || isNaN(month) || isNaN(day)) {
                    return false;
                }

                // Check if date is before today
                return (year < today.getFullYear() ||
                       (year === today.getFullYear() && month - 1 < today.getMonth()) ||
                       (year === today.getFullYear() && month - 1 === today.getMonth() && day < today.getDate()));
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
            is_unassigned: isTaskUnassigned(t),
            is_overdue: isTaskOverdue(t)
        })));

        // Apply filter
        switch(filterValue) {
            case 'unassigned_today':
                // Show tasks that are either unassigned OR due today OR overdue
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
            // Use the dedicated toggle-completion endpoint instead of the general update endpoint
            const response = await fetch(`/api/tasks/${taskId}/toggle-completion`, {
                method: 'PATCH',
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

            // Determine if habit is complete based on counter or regular completions
            const isComplete = hasCounter ?
                (currentCount >= totalCount) : // For counter habits, only complete when counter reaches max
                (completionsToday >= completionsTarget); // For regular habits

            // We no longer need progressText since we're showing progress separately

            // Calculate level based on counter or total completions
            let counterLevel = 1;
            let counterTotal = 0;

            if (hasCounter) {
                counterLevel = Math.max(1, currentCount);
                counterTotal = totalCount;
                console.log(`Habit with counter: ${habit.title}, Current: ${currentCount}, Total: ${totalCount}`);
            }

            // Calculate level display - use counter value if available, otherwise use total completions
            const level = hasCounter ? counterLevel : (habit.level || 1);
            const totalCompletions = hasCounter ? counterTotal : (habit.total_completions || 0);

            // Determine level class based on level value
            let levelClass = 'level-1';
            if (level >= 10) {
                levelClass = 'level-10';
            } else if (level >= 5) {
                levelClass = 'level-5';
            } else if (level >= 3) {
                levelClass = 'level-3';
            }

            // Determine the appropriate checkbox display
            let checkboxHtml = '';
            // Check if this is an unlimited habit (completions_per_day >= 999)
            const isUnlimitedHabit = habit.completions_per_day >= 999;

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
            } else if (isUnlimitedHabit) {
                // For unlimited habits, show a +1 button that's always enabled
                checkboxHtml = `<div class="habit-control-container">
                    <button class="habit-increment-btn unlimited" title="Click to increment level">+1</button>
                </div>`;
            } else {
                // For regular habits, show a normal checkbox
                checkboxHtml = `<div class="habit-control-container">
                    <input type="checkbox" class="habit-checkbox" title="Mark as done" ${isComplete ? 'checked' : ''}>
                </div>`;
            }

            // Calculate total completions count for level display
            const totalCompletionsCount = hasCounter ? habit.total_completions || 0 : habit.total_completions || 0;
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
                    ${hasCounter ? `
                    <div class="habit-progress-container">
                        <div class="habit-progress ${levelClass}" title="Current progress: ${level}/${totalCompletions}">
                            Progress: ${level}/${totalCompletions}
                        </div>
                    </div>` : ''}
                    <div class="habit-level-container">
                        <div class="habit-level ${totalLevelClass}" title="${totalCompletionsCount} total completions">
                            Level ${totalCompletionsCount}
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

            // Add appropriate click handler based on habit type
            if ((hasCounter && !isComplete) || isUnlimitedHabit) {
                // For counter habits that aren't complete or unlimited habits, use the +1 button
                const incrementBtn = habitElement.querySelector('.habit-increment-btn');
                if (incrementBtn) {
                    incrementBtn.addEventListener('click', () => handleHabitCheckboxClick(habit.id, true, isUnlimitedHabit));
                }
            } else if (!hasCounter && !isUnlimitedHabit) {
                // For regular habits, use the checkbox
                const checkbox = habitElement.querySelector('.habit-checkbox');
                if (checkbox) {
                    checkbox.addEventListener('click', () => handleHabitCheckboxClick(habit.id, checkbox.checked, false));
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
        const isUnlimited = document.getElementById('habitUnlimitedCompletions').checked;
        const completionsPerDay = document.getElementById('habitCompletionsPerDay').value;

        // Use a very high number (999) for unlimited completions
        const effectiveCompletions = isUnlimited ? 999 : parseInt(completionsPerDay, 10);

        const habitData = {
            title,
            frequency,
            // Only include completions_per_day if frequency is daily
            completions_per_day: frequency === 'daily' ? effectiveCompletions : 1,
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
    async function handleHabitCheckboxClick(habitId, _isChecked, isUnlimitedHabit = false) {
        // Note: We're ignoring the isChecked parameter for now and always incrementing.
        // For simplicity, clicking always attempts to record *one* completion.
        // The backend should handle logic like not exceeding the target, or decrementing if needed.

        console.log(`Checkbox clicked for habit ${habitId}, attempting to record completion. Unlimited: ${isUnlimitedHabit}`);
        habitListStatusDiv.textContent = 'Updating habit...';
        habitListStatusDiv.className = 'status';

        // Find the habit element and check if it has a counter in the title
        const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
        const habitTitleEl = habitElement?.querySelector('.habit-title');
        const habitTitle = habitTitleEl?.textContent || '';
        const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);

        try {
            // Special handling for unlimited habits
            if (isUnlimitedHabit) {
                console.log('Handling unlimited habit click');

                // For unlimited habits, we'll use the direct update endpoint
                const directUpdateResponse = await fetch(`/api/habits/${habitId}/update-total`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ increment: 1 })
                });

                if (directUpdateResponse.ok) {
                    console.log('Direct update to total_completions successful for unlimited habit');
                    const updateData = await directUpdateResponse.json();

                    // Add the complete class temporarily for visual feedback
                    habitElement.classList.add('complete');
                    console.log('Added complete class to habit element (unlimited habit)');

                    // Remove the complete class after a short delay
                    setTimeout(() => {
                        habitElement.classList.remove('complete');
                        console.log('Removed complete class from unlimited habit');

                        // Force a reload of habits to ensure level is up to date
                        loadHabits(true); // Pass true to force refresh
                    }, 500);

                    // Update the level indicator
                    const levelEl = habitElement.querySelector('.habit-level');
                    if (levelEl && updateData.level) {
                        levelEl.textContent = `Level ${updateData.level}`;
                        levelEl.title = `${updateData.total_completions} total completions`;

                        // Update the level class
                        updateLevelClass(levelEl, updateData.level);
                        console.log(`Updated level to ${updateData.level} (unlimited habit)`);
                    }

                    // Clear status
                    habitListStatusDiv.textContent = '';
                    return;
                } else {
                    const errorText = await directUpdateResponse.text();
                    console.error(`Error updating unlimited habit: ${directUpdateResponse.status}`);
                    console.error('Response body:', errorText);
                    throw new Error(`Server returned ${directUpdateResponse.status}: ${errorText}`);
                }
            }

            // Special handling for habits with counters in the title
            else if (counterMatch && habitTitleEl) {
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

                // Also make a direct update to total_completions to ensure the level is properly updated
                console.log(`Making direct update to total_completions for counter habit ${habitId}`);
                try {
                    const directUpdateResponse = await fetch(`/api/habits/${habitId}/update-total`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ increment: 1 })
                    });

                    if (!directUpdateResponse.ok) {
                        console.warn(`Failed to update total_completions directly: ${directUpdateResponse.status}`);
                    }

                    // Also record a completion to increment the total_completions counter
                    // Send isCounterHabit flag to let the server know this is a counter habit
                    console.log(`Sending counter habit completion request for habit ${habitId}`);
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
                        // Don't throw an error here, we'll continue with the direct update data
                    } else {
                        // If the completion was successful, update the level indicator
                        try {
                            // Get the current level from the server with cache busting
                            const levelResponse = await fetch(`/api/habits/${habitId}/level?_=${Date.now()}`, {
                                headers: {
                                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                                    'Pragma': 'no-cache',
                                    'Expires': '0'
                                },
                                cache: 'reload' // Force reload from network
                            });

                            if (levelResponse.ok) {
                                const levelData = await levelResponse.json();
                                console.log(`Got level data directly: Level ${levelData.level}, Total: ${levelData.total_completions}`);

                                // Find the level element
                                const levelEl = habitElement.querySelector('.habit-level');
                                if (levelEl) {
                                    // Update the level text and tooltip
                                    levelEl.textContent = `Level ${levelData.level}`;
                                    levelEl.title = `${levelData.total_completions} total completions`;
                                    updateLevelClass(levelEl, levelData.level);
                                    console.log(`Updated level to ${levelData.level} (direct fetch)`);
                                }
                            }
                        } catch (levelError) {
                            console.warn('Error fetching updated level:', levelError);
                        }
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

                // Try to update the level indicator even if the server request failed
                try {
                    // Get the current level from the level indicator
                    const levelEl = habitElement.querySelector('.habit-level');
                    if (levelEl) {
                        const currentLevelText = levelEl.textContent || 'Level 0';
                        const currentLevel = parseInt(currentLevelText.replace('Level ', ''), 10) || 0;
                        const newLevel = currentLevel + 1;

                        // Update the level text
                        levelEl.textContent = `Level ${newLevel}`;
                        levelEl.title = `${newLevel} total completions`;

                        // Update the level class
                        levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                        let newLevelClass = 'level-1';
                        if (newLevel >= 10) {
                            newLevelClass = 'level-10';
                        } else if (newLevel >= 5) {
                            newLevelClass = 'level-5';
                        } else if (newLevel >= 3) {
                            newLevelClass = 'level-3';
                        }
                        levelEl.classList.add(newLevelClass);

                        console.log(`Updated level to ${newLevel} (fallback method)`);

                        // Also make a direct update to the database to ensure the level persists
                        try {
                            console.log('Making direct update to total_completions in database');
                            const directUpdateResponse = await fetch(`/api/habits/${habitId}/update-total`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ increment: 1 })
                            });

                            if (directUpdateResponse.ok) {
                                console.log('Direct update to total_completions successful');
                            } else {
                                console.warn('Direct update to total_completions failed:', await directUpdateResponse.text());
                            }
                        } catch (updateError) {
                            console.error('Error making direct update to total_completions:', updateError);
                        }
                    }
                } catch (levelError) {
                    console.warn('Error updating level indicator:', levelError);
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

                    // For unlimited habits, we want to continue even if we get a 409 Conflict
                    const habit = allHabitsData.find(h => h.id == habitId);
                    const isUnlimitedHabit = habit && habit.completions_per_day >= 999;

                    if (response.status === 409 && isUnlimitedHabit) {
                        console.log('Got 409 for unlimited habit, continuing with fallback method');
                        // Use the fallback method
                        const directUpdateResponse = await fetch(`/api/habits/${habitId}/update-total`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ increment: 1 })
                        });

                        if (directUpdateResponse.ok) {
                            const updateData = await directUpdateResponse.json();

                            // Mark the habit as completed
                            habitElement.classList.add('complete');
                            console.log('Added complete class to habit element (fallback for unlimited habit)');

                            // Update the level indicator
                            const levelEl = habitElement.querySelector('.habit-level');
                            if (levelEl && updateData.level) {
                                levelEl.textContent = `Level ${updateData.level}`;
                                levelEl.title = `${updateData.total_completions} total completions`;

                                // Update level class
                                updateLevelClass(levelEl, updateData.level);

                                console.log(`Updated level to ${updateData.level} (fallback for unlimited habit)`);
                                habitListStatusDiv.textContent = '';
                                return; // Exit early
                            }
                        }
                    }

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

                // Mark the habit as completed
                habitElement.classList.add('complete');
                console.log('Added complete class to habit element (primary method)');

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

                // If the regular completion fails, try a direct update as a fallback
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

                        // Mark the habit as completed
                        habitElement.classList.add('complete');
                        console.log('Added complete class to habit element (fallback method)');

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

            // Try the fallback method - direct update to total_completions
            try {
                console.log('Making direct update to total_completions in database as fallback');
                const directUpdateResponse = await fetch(`/api/habits/${habitId}/update-total`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ increment: 1 })
                });

                if (directUpdateResponse.ok) {
                    console.log('Direct update to total_completions succeeded');
                    const fallbackData = await directUpdateResponse.json();

                    // Update the level indicator with the data from the fallback method
                    if (fallbackData.level) {
                        const levelElement = habitElement.querySelector('.habit-level');
                        if (levelElement) {
                            levelElement.textContent = `Level ${fallbackData.level}`;
                            levelElement.title = `${fallbackData.total_completions} total completions`;

                            // Update the level class
                            levelElement.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                            let newLevelClass = 'level-1';
                            if (fallbackData.level >= 10) {
                                newLevelClass = 'level-10';
                            } else if (fallbackData.level >= 5) {
                                newLevelClass = 'level-5';
                            } else if (fallbackData.level >= 3) {
                                newLevelClass = 'level-3';
                            }
                            levelElement.classList.add(newLevelClass);
                        }
                    }

                    habitListStatusDiv.textContent = 'Habit updated successfully.';
                    habitListStatusDiv.className = 'status success';
                    return; // Exit the catch block successfully
                } else {
                    console.warn('Direct update to total_completions failed:', await directUpdateResponse.text());
                }
            } catch (fallbackError) {
                console.error('Fallback method also failed:', fallbackError);
            }

            // If we get here, both methods failed
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
        handleUnlimitedCompletionsChange(); // Set initial state for unlimited checkbox
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

    // Handle unlimited completions checkbox
    function handleUnlimitedCompletionsChange() {
        const unlimitedCheckbox = document.getElementById('habitUnlimitedCompletions');
        const completionsInput = document.getElementById('habitCompletionsPerDay');

        // Disable completions input when unlimited is checked
        completionsInput.disabled = unlimitedCheckbox.checked;
    }
    document.getElementById('habitUnlimitedCompletions').addEventListener('change', handleUnlimitedCompletionsChange);
    // --- END NEW ---

    // Open and populate the edit habit modal
    function openEditHabitModal(habit) {
        editHabitIdInput.value = habit.id;
        editHabitTitleInput.value = habit.title;
        editHabitRecurrenceTypeInput.value = habit.frequency;

        // Check if completions_per_day is very high (unlimited)
        const isUnlimited = habit.completions_per_day >= 999;
        document.getElementById('editHabitUnlimitedCompletions').checked = isUnlimited;

        // Set the completions per day value
        editHabitCompletionsPerDayInput.value = isUnlimited ? 1 : habit.completions_per_day;
        editHabitCompletionsPerDayInput.disabled = isUnlimited;

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
        const isUnlimited = document.getElementById('editHabitUnlimitedCompletions').checked;
        const completionsPerDay = editHabitCompletionsPerDayInput.value;

        // Use a very high number (999) for unlimited completions
        const effectiveCompletions = isUnlimited ? 999 : parseInt(completionsPerDay, 10);

        // Check if this is a counter habit by looking for the pattern (X/Y) in the title
        const counterMatch = title.match(/\((\d+)\/(\d+)\)/);
        let updatedTitle = title;

        // If this is a counter habit and the completions_per_day is changing, update the counter in the title
        if (counterMatch && parseInt(counterMatch[2], 10) !== effectiveCompletions) {
            const currentCount = parseInt(counterMatch[1], 10) || 0;
            updatedTitle = title.replace(
                /\((\d+)\/(\d+)\)/,
                `(${currentCount}/${effectiveCompletions})`
            );
            console.log(`Updating counter in title from "${title}" to "${updatedTitle}"`);
        }

        const updatedHabitData = {
            title: updatedTitle,
            frequency,
            completions_per_day: frequency === 'daily' ? effectiveCompletions : 1,
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
                loadHabits(true); // Reload the habit list with force refresh
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

    // Handle unlimited completions checkbox in EDIT modal
    function handleEditUnlimitedCompletionsChange() {
        const unlimitedCheckbox = document.getElementById('editHabitUnlimitedCompletions');
        const completionsInput = document.getElementById('editHabitCompletionsPerDay');

        // Disable completions input when unlimited is checked
        completionsInput.disabled = unlimitedCheckbox.checked;
    }
    document.getElementById('editHabitUnlimitedCompletions').addEventListener('change', handleEditUnlimitedCompletionsChange);
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
            // Make sure we're working with clean date objects without time components
            const assignedDateStr = task.assigned_date.split('T')[0];
            const dueDateStr = task.due_date ? task.due_date.split('T')[0] : null;

            // Create date objects with the correct date parts only
            // Use YYYY-MM-DD format to avoid timezone issues
            const [assignedYear, assignedMonth, assignedDay] = assignedDateStr.split('-').map(Number);
            const assignedDate = new Date(assignedYear, assignedMonth - 1, assignedDay);

            let dueDate = null;
            if (dueDateStr) {
                const [dueYear, dueMonth, dueDay] = dueDateStr.split('-').map(Number);
                dueDate = new Date(dueYear, dueMonth - 1, dueDay);
            }

            const interval = task.recurrence_interval || 1;

            // Create new date objects to avoid modifying the originals
            let nextAssignedDate = new Date(assignedDate);
            let nextDueDate = dueDate ? new Date(dueDate) : null;

            console.log(`Original assigned date: ${assignedDateStr}, parsed as: ${assignedDate.toISOString()}`);
            if (dueDate) console.log(`Original due date: ${dueDateStr}, parsed as: ${dueDate.toISOString()}`);

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

            console.log(`Calculated next assigned date: ${nextAssignedDate.toISOString()}`);
            if (nextDueDate) console.log(`Calculated next due date: ${nextDueDate.toISOString()}`);

            // Validate that the next occurrence is actually in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time part for proper date comparison

            if (nextAssignedDate < today) {
                console.error(`Calculated next date ${nextAssignedDate.toISOString()} is in the past!`);
                // Recalculate to ensure it's in the future
                while (nextAssignedDate < today) {
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
                    }
                }
                console.log(`Corrected next assigned date to: ${nextAssignedDate.toISOString()}`);
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

    // Helper function to update level class
    function updateLevelClass(levelElement, level) {
        levelElement.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
        let newLevelClass = 'level-1';
        if (level >= 10) {
            newLevelClass = 'level-10';
        } else if (level >= 5) {
            newLevelClass = 'level-5';
        } else if (level >= 3) {
            newLevelClass = 'level-3';
        }
        levelElement.classList.add(newLevelClass);
        return newLevelClass;
    }

}); // End DOMContentLoaded
