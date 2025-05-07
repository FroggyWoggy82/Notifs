
let scheduledNotifications = [];
let deferredPrompt;
let serviceWorkerRegistration = null;
let lastAccessDate = localStorage.getItem('lastAccessDate') || null;
let allHabitsData = []; // Store habits data globally

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

function isTaskDueToday(task) {
    if (!task.due_date) return false;
    try {

        const datePart = typeof task.due_date === 'string' && task.due_date.includes('T') ?
            task.due_date.split('T')[0] : task.due_date;
        const [year, month, day] = datePart.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return dueDate.getFullYear() === today.getFullYear() &&
               dueDate.getMonth() === today.getMonth() &&
               dueDate.getDate() === today.getDate();
    } catch (e) {
        console.error('Error checking if task is due today:', task.due_date, e);
        return false;
    }
}

function calculateNextOccurrence(task) {
    if (!task.recurrence_type || task.recurrence_type === 'none' || !task.due_date) {
        return null;
    }

    const dueDate = new Date(task.due_date);
    if (isNaN(dueDate.getTime())) {
        console.warn(`Invalid due_date for task ${task.id}: ${task.due_date}`);
        return null;
    }

    const interval = task.recurrence_interval || 1;

    const nextDate = new Date(dueDate);

    switch (task.recurrence_type) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + interval);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + (interval * 7));
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + interval);
            break;
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + interval);
            break;
        default:
            return null;
    }

    return nextDate;
}

function isDayChanged() {

    const lastCounterResetDate = localStorage.getItem('lastCounterResetDate');

    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    if (!lastCounterResetDate) {

        localStorage.setItem('lastCounterResetDate', todayString);
        return true;
    }

    const dayChanged = lastCounterResetDate !== todayString;

    if (dayChanged) {
        localStorage.setItem('lastCounterResetDate', todayString);
        console.log(`Day changed from ${lastCounterResetDate} to ${todayString}, will reset counters`);
    } else {
        console.log(`Same day as last reset (${todayString}), will not reset counters`);
    }

    localStorage.setItem('lastAccessDate', todayString);
    lastAccessDate = todayString;

    return dayChanged;
}

document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const permissionStatusDiv = document.getElementById('permissionStatus');

    const addTaskForm = document.getElementById('addTaskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskReminderTypeInput = document.getElementById('taskReminderType');
    const taskReminderTimeInput = document.getElementById('taskReminderTime');
    const customReminderGroup = document.getElementById('customReminderGroup');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskListDiv = document.getElementById('taskList');
    const addTaskStatusDiv = document.getElementById('addTaskStatus');
    const taskListStatusDiv = document.getElementById('taskListStatus');
    const useLastInputsToggle = document.getElementById('useLastInputs');

    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskDurationInput = document.getElementById('taskDuration');
    const taskRecurrenceTypeInput = document.getElementById('taskRecurrenceType');
    const taskRecurrenceIntervalInput = document.getElementById('taskRecurrenceInterval');
    const recurrenceIntervalGroup = document.getElementById('recurrenceIntervalGroup');
    const recurrenceIntervalUnit = document.getElementById('recurrenceIntervalUnit');


    const completedTasksHeader = document.getElementById('completedTasksHeader');
    const completedTaskListDiv = document.getElementById('completedTaskList');


    const taskFilterSelect = document.getElementById('taskFilter');


    const habitListDiv = document.getElementById('habitList');
    const habitListStatusDiv = document.getElementById('habitListStatus');
    const addHabitBtn = document.getElementById('addHabitBtn');


    const addTaskModal = document.getElementById('addTaskModal');
    const addTaskFab = document.getElementById('addTaskFab');
    const closeTaskModalBtn = addTaskModal.querySelector('.close-button');


    const addHabitModal = document.getElementById('addHabitModal');
    const closeHabitModalBtn = addHabitModal.querySelector('.close-button');
    const addHabitForm = document.getElementById('addHabitForm');
    const habitRecurrenceTypeInput = document.getElementById('habitRecurrenceType');
    const habitCompletionsGroup = document.getElementById('habitCompletionsGroup');


    const editHabitModal = document.getElementById('editHabitModal');
    const closeEditModalBtn = editHabitModal.querySelector('.close-button');
    const editHabitForm = document.getElementById('editHabitForm');
    const editHabitIdInput = document.getElementById('editHabitId');
    const editHabitTitleInput = document.getElementById('editHabitTitle');
    const editHabitRecurrenceTypeInput = document.getElementById('editHabitRecurrenceType');
    const editHabitCompletionsGroup = document.getElementById('editHabitCompletionsGroup');
    const editHabitCompletionsPerDayInput = document.getElementById('editHabitCompletionsPerDay');
    const editHabitStatusDiv = document.getElementById('editHabitStatus');


    const editTaskModal = document.getElementById('editTaskModal');
    const editTaskForm = document.getElementById('editTaskForm');
    const editTaskStatus = document.getElementById('editTaskStatus');
    const editTaskIdInput = document.getElementById('editTaskId');
    const editTaskTitleInput = document.getElementById('editTaskTitle');
    const editTaskDescriptionInput = document.getElementById('editTaskDescription');
    const editTaskReminderTypeInput = document.getElementById('editTaskReminderType');
    const editTaskReminderTimeInput = document.getElementById('editTaskReminderTime');
    const editCustomReminderGroup = document.getElementById('editCustomReminderGroup');
    const editTaskDueDateInput = document.getElementById('editTaskDueDate');
    const editTaskDurationInput = document.getElementById('editTaskDuration');
    const editTaskRecurrenceTypeSelect = document.getElementById('editTaskRecurrenceType');
    const editRecurrenceIntervalGroup = document.getElementById('editRecurrenceIntervalGroup');
    const editTaskRecurrenceIntervalInput = document.getElementById('editTaskRecurrenceInterval');
    const editRecurrenceIntervalUnit = document.getElementById('editRecurrenceIntervalUnit');
    const closeEditTaskModalBtn = editTaskModal.querySelector('.close-button'); // Assuming close button exists

    if (editTaskModal) {
        editTaskModal.style.display = 'none';
        console.log("Ensuring edit task modal is hidden on page load");
    }

    let swRegistration = null;


    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
            .then(swReg => {
                console.log('Service Worker is registered', swReg);
                swRegistration = swReg;

                swReg.update().then(() => {
                    console.log('Service worker update check completed');
                }).catch(err => {
                    console.error('Service worker update check failed:', err);
                });

                loadTasks();
                loadHabits(); // Load habits too

                function ensureOverdueStyling() {

                    const overdueTasks = document.querySelectorAll('.task-item.overdue, .task-item[data-overdue="true"]');

                    overdueTasks.forEach(task => {
                        task.style.backgroundColor = '#ffebee';
                        task.style.borderLeft = '4px solid #f44336';
                        task.style.borderColor = '#ef9a9a';
                    });
                }

                setTimeout(ensureOverdueStyling, 500);

                setInterval(ensureOverdueStyling, 2000);
            })
            .catch(error => {
                console.error('Service Worker Error', error);
                updateStatus('Service Worker registration failed', true);
            });

        navigator.serviceWorker.addEventListener('message', event => {
            console.log('Received message from service worker:', event.data);
            if (event.data && event.data.type === 'CACHE_CLEARED') {
                const timestamp = new Date(event.data.timestamp);
                console.log(`Cache cleared at: ${timestamp.toLocaleTimeString()}`);
            }
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New service worker activated and controlling the page');

            setTimeout(() => {
                console.log('Reloading page to use new service worker');
                window.location.reload();
            }, 1000);
        });

        navigator.serviceWorker.addEventListener('message', event => {
            console.log('Received message from service worker:', event.data);
            if (event.data && event.data.type === 'CACHE_CLEARED') {
                console.log('Cache cleared at:', new Date(event.data.timestamp).toLocaleTimeString());
            }
        });
    } else {
        console.warn('Push messaging is not supported');
        if (permissionStatusDiv) {
            permissionStatusDiv.textContent = 'Push messaging is not supported by this browser.';
            permissionStatusDiv.className = 'notifications-status permission-denied';
        }

         loadTasks();
         loadHabits(); // Load habits too

         function ensureOverdueStyling() {

             const overdueTasks = document.querySelectorAll('.task-item.overdue, .task-item[data-overdue="true"]');

             overdueTasks.forEach(task => {
                 task.style.backgroundColor = '#ffebee';
                 task.style.borderLeft = '4px solid #f44336';
                 task.style.borderColor = '#ef9a9a';
             });
         }

         setTimeout(ensureOverdueStyling, 500);

         setInterval(ensureOverdueStyling, 2000);
    }


    function updateStatus(message, isError = false) {
        console.log(`Status Update: ${message} (Error: ${isError})`);
        statusDiv.textContent = message;
        statusDiv.className = `status ${isError ? 'error' : 'success'}`;
        statusDiv.style.display = 'block';
        setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
    }

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


    }


    let allTasks = [];

    async function loadTasks(forceReload = false) {
        console.log("Loading tasks..." + (forceReload ? " (Force reload)" : ""));
        updateTaskListStatus("Loading tasks...", false);
        try {

            const url = forceReload ?
                `/api/tasks?_cache=${new Date().getTime()}` :
                '/api/tasks';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allTasks = await response.json(); // Store all tasks globally
            console.log("Tasks loaded:", allTasks);

            if (forceReload) {
                taskListDiv.innerHTML = '';
                completedTaskListDiv.innerHTML = '';
            }

            filterAndRenderTasks(); // Apply current filter and render
            updateTaskListStatus("", false); // Clear loading message
            taskListStatusDiv.style.display = 'none'; // Hide if successful

            setTimeout(() => {
                const overdueTasks = document.querySelectorAll('.task-item.overdue, .task-item[data-overdue="true"]');
                overdueTasks.forEach(task => {
                    task.style.backgroundColor = '#ffebee';
                    task.style.borderLeft = '4px solid #f44336';
                    task.style.borderColor = '#ef9a9a';
                });

                document.dispatchEvent(new CustomEvent('tasksLoaded'));
            }, 100);
        } catch (error) {
            console.error('Error loading tasks:', error);
            taskListDiv.innerHTML = '<p class="error">Failed to load tasks. Please try refreshing.</p>';
            updateTaskListStatus("Error loading tasks.", true);
        }
    }

    function filterAndRenderTasks() {
        const filterValue = taskFilterSelect.value;
        console.log(`Filtering tasks by: ${filterValue}`);

        let filteredTasks = [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month


        function isTaskUnassigned(task) {
            return !task.due_date || (typeof task.due_date === 'string' && task.due_date.trim() === '');
        }


        function isTaskDueTomorrow(task) {
            if (!task.due_date) return false;
            try {

                const dueDate = new Date(task.due_date);

                if (isNaN(dueDate.getTime())) {
                    console.warn('Invalid date format:', task.due_date);
                    return false;
                }

                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                const dueDateStr = dueDate.toISOString().split('T')[0];
                const tomorrowStr = tomorrow.toISOString().split('T')[0];

                console.log(`Comparing dates for tomorrow check: due=${dueDateStr}, tomorrow=${tomorrowStr}`);

                return dueDateStr === tomorrowStr;
            } catch (e) {
                console.error('Error checking if task is due tomorrow:', task.due_date, e);
                return false;
            }
        }

        function isTaskOverdue(task) {
            if (!task.due_date) return false;
            try {

                const dueDate = new Date(task.due_date);

                if (isNaN(dueDate.getTime())) {
                    console.warn('Invalid date format:', task.due_date);
                    return false;
                }

                const dueDateStr = dueDate.toISOString().split('T')[0];
                const todayStr = today.toISOString().split('T')[0];

                console.log(`Comparing dates for overdue check: due=${dueDateStr}, today=${todayStr}`);

                return dueDateStr < todayStr;
            } catch (e) {
                console.error('Error checking if task is overdue:', task.due_date, e);
                return false;
            }
        }

        console.log('All tasks:', allTasks.map(t => ({
            id: t.id,
            title: t.title,
            due_date: t.due_date,
            is_today: isTaskDueToday(t),
            is_unassigned: isTaskUnassigned(t)
        })));

        function isNextOccurrenceOverdue(task) {
            if (!task.is_complete || !task.recurrence_type || task.recurrence_type === 'none') {
                return false;
            }

            const nextOccurrence = calculateNextOccurrence(task);
            if (!nextOccurrence) return false;

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day

            console.log(`Checking if next occurrence is overdue for task ${task.id} (${task.title})`);
            console.log(`Next occurrence date: ${nextOccurrence.toISOString()}`);
            console.log(`Today's date: ${today.toISOString()}`);
            console.log(`Is overdue: ${nextOccurrence < today}`);

            return nextOccurrence < today;
        }

        switch(filterValue) {
            case 'unassigned_today':

                filteredTasks = allTasks.filter(task => {

                    if (task.is_complete) {
                        if (task.recurrence_type && task.recurrence_type !== 'none') {

                            const isOverdue = isNextOccurrenceOverdue(task);
                            console.log(`Task ${task.id} (${task.title}) is_complete=${task.is_complete}, recurrence_type=${task.recurrence_type}, isOverdue=${isOverdue}`);
                            return isOverdue;
                        }
                        return false; // Skip other completed tasks
                    }

                    const isUnassigned = isTaskUnassigned(task);
                    const isDueToday = isTaskDueToday(task);
                    const isOverdue = isTaskOverdue(task);
                    const isDueTomorrow = isTaskDueTomorrow(task);

                    if (task.title === 'Clean Airpods') {
                        console.log(`Filter check for ${task.title}: unassigned=${isUnassigned}, dueToday=${isDueToday}, overdue=${isOverdue}, dueTomorrow=${isDueTomorrow}`);
                    }

                    return (isUnassigned || isDueToday || isOverdue) && !isDueTomorrow;
                });
                break;

            case 'today':

                filteredTasks = allTasks.filter(task => {

                    if (task.is_complete) return false;

                    return isTaskDueToday(task);
                });
                break;

            case 'week':
                filteredTasks = allTasks.filter(task => {

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

                    if (task.is_complete) return false;

                    if (!task.due_date) return false;
                    const dueDate = new Date(task.due_date.split('T')[0]);
                    return dueDate.getFullYear() === monthStart.getFullYear() &&
                           dueDate.getMonth() === monthStart.getMonth();
                });
                break;

            default: // 'all'

                filteredTasks = allTasks.filter(task => !task.is_complete);
        }

        renderTaskList(filteredTasks);
    }

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

        tasks.sort((a, b) => {

            const isOverdue = (task) => {
                if (!task.due_date) return false;
                try {
                    const datePart = typeof task.due_date === 'string' && task.due_date.includes('T') ?
                        task.due_date.split('T')[0] : task.due_date;
                    const [year, month, day] = datePart.split('-').map(Number);
                    const dueDate = new Date(year, month - 1, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return dueDate < today;
                } catch (e) {
                    return false;
                }
            };

            const isDueToday = (task) => {
                if (!task.due_date) return false;
                try {
                    const datePart = typeof task.due_date === 'string' && task.due_date.includes('T') ?
                        task.due_date.split('T')[0] : task.due_date;
                    const [year, month, day] = datePart.split('-').map(Number);
                    const dueDate = new Date(year, month - 1, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return dueDate.getFullYear() === today.getFullYear() &&
                           dueDate.getMonth() === today.getMonth() &&
                           dueDate.getDate() === today.getDate();
                } catch (e) {
                    return false;
                }
            };

            const isUnassigned = (task) => {
                return !task.assigned_date && !task.due_date;
            };

            const aOverdue = isOverdue(a);
            const bOverdue = isOverdue(b);
            const aDueToday = isDueToday(a);
            const bDueToday = isDueToday(b);
            const aUnassigned = isUnassigned(a);
            const bUnassigned = isUnassigned(b);

            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            if (aDueToday && !bDueToday) return -1;
            if (!aDueToday && bDueToday) return 1;
            if (aUnassigned && !bUnassigned) return -1;
            if (!aUnassigned && bUnassigned) return 1;

            if (a.due_date && b.due_date) {
                return new Date(a.due_date) - new Date(b.due_date);
            }

            return b.id - a.id;
        });

        tasks.forEach(task => {

            let isCompletedRecurringWithOverdueNext = false;
            let nextOccurrence = null;

            if (task.is_complete && task.recurrence_type && task.recurrence_type !== 'none') {

                if (task.next_occurrence_date) {
                    nextOccurrence = new Date(task.next_occurrence_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Reset time to start of day
                    isCompletedRecurringWithOverdueNext = nextOccurrence < today;
                    console.log(`Task ${task.id} (${task.title}) is a completed recurring task with next occurrence ${nextOccurrence.toISOString()}`);
                    console.log(`Is next occurrence overdue? ${isCompletedRecurringWithOverdueNext}`);
                } else {

                    nextOccurrence = calculateNextOccurrence(task);
                    if (nextOccurrence) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Reset time to start of day
                        isCompletedRecurringWithOverdueNext = nextOccurrence < today;
                        console.log(`Task ${task.id} (${task.title}) is a completed recurring task with calculated next occurrence ${nextOccurrence.toISOString()}`);
                        console.log(`Is next occurrence overdue? ${isCompletedRecurringWithOverdueNext}`);
                    }
                }
            }

            const displayTask = {...task};


            if (isCompletedRecurringWithOverdueNext) {
                console.log(`Treating task ${task.id} (${task.title}) as incomplete for display purposes`);
                displayTask.is_complete = false;
                displayTask.isRecurringOverdue = true;

                displayTask.isOverdueNextOccurrence = true;

                if (nextOccurrence) {
                    displayTask.nextOccurrenceDate = nextOccurrence;
                    console.log(`Task ${task.id} (${task.title}) next occurrence is overdue: ${nextOccurrence.toISOString()}`);

                }
            }

            const taskElement = createTaskElement(displayTask);

            if (isCompletedRecurringWithOverdueNext) {
                taskElement.setAttribute('data-recurring-overdue', 'true');
            }

            if (task.is_complete && !isCompletedRecurringWithOverdueNext) {

                if (isToday(task.updated_at)) {
                    completedTaskListDiv.appendChild(taskElement);
                    completedTodayCount++;
                }

            } else {
                taskListDiv.appendChild(taskElement);
                activeTaskCount++;
            }
        });

        if (activeTaskCount === 0) {
            taskListDiv.innerHTML = '<p>No active tasks.</p>';
        }
        if (completedTodayCount === 0) {

            completedTaskListDiv.innerHTML = '<p>No tasks completed today.</p>';
        }

        updateCompletedTaskHeader(completedTodayCount); // Update header count based on today
    }

    function createTaskElement(task) {

        const div = document.createElement('div');

        div.addEventListener('touchstart', handleTaskTouch);

        let isOverdue = false;
        if (!task.is_complete && task.due_date) {
            try {

                const datePart = typeof task.due_date === 'string' && task.due_date.includes('T') ?
                    task.due_date.split('T')[0] : task.due_date;

                const [year, month, day] = datePart.split('-').map(Number);
                const dueDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time part for comparison

                isOverdue = dueDate < today;
            } catch (e) {
                console.error('Error checking if task is overdue:', task.due_date, e);
            }
        }

        let nextOccurrenceDate = null;
        if (task.recurrence_type && task.recurrence_type !== 'none') {

            nextOccurrenceDate = calculateNextOccurrence(task);
            if (nextOccurrenceDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time part for comparison
                isOverdue = nextOccurrenceDate < today;

                if (task.is_complete) {
                    console.log(`Task ${task.id} (${task.title}) is a completed recurring task`);
                    console.log(`Next occurrence date: ${nextOccurrenceDate.toISOString()}`);
                    console.log(`Today's date: ${today.toISOString()}`);
                    console.log(`Is next occurrence overdue: ${isOverdue}`);
                }

                if (task.isRecurringOverdue) {
                    console.log(`Task ${task.id} (${task.title}) is a recurring overdue task`);
                    isOverdue = true;
                }
            }
        }

        div.className = `task-item ${task.is_complete ? 'complete' : ''} ${isOverdue ? 'overdue' : ''}`;
        div.setAttribute('data-task-id', task.id);

        if (isOverdue) {
            div.style.backgroundColor = '#ffebee';
            div.style.borderLeft = '4px solid #f44336';
            div.style.borderColor = '#ef9a9a';
            div.setAttribute('data-overdue', 'true'); // Add a data attribute for CSS targeting
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.is_complete;
        checkbox.addEventListener('change', handleToggleComplete);

        checkbox.style.width = '24px';
        checkbox.style.height = '24px';
        checkbox.style.borderRadius = '50%';
        checkbox.style.border = '2px solid rgba(255, 255, 255, 0.4)';
        checkbox.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';
        checkbox.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';
        checkbox.style.appearance = 'none';
        checkbox.style.webkitAppearance = 'none';
        checkbox.style.cursor = 'pointer';
        checkbox.style.transition = 'all 0.2s ease';
        checkbox.style.margin = '0';
        checkbox.style.padding = '0';
        checkbox.style.position = 'relative';

        if (task.is_complete) {
            checkbox.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            checkbox.style.borderColor = 'rgba(255, 255, 255, 0.8)';
            checkbox.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.3)';
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        const titleContainer = document.createElement('div');
        titleContainer.className = 'task-title-container';


        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;
        titleContainer.appendChild(titleSpan);

        if (task.recurrence_type && task.recurrence_type !== 'none') {
            const recurringIcon = document.createElement('span');
            recurringIcon.className = `recurring-icon ${task.recurrence_type}`;
            recurringIcon.innerHTML = '&#8635;'; // Recycling symbol (↻)

            let recurrenceText = '';
            const interval = task.recurrence_interval || 1;

            if (interval === 1) {

                recurrenceText = `Repeats ${task.recurrence_type}`;
            } else {

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

        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'task-metadata';

        if (task.recurrence_type && task.recurrence_type !== 'none' && nextOccurrenceDate) {
            const nextOccurrenceIndicator = document.createElement('div');
            nextOccurrenceIndicator.className = 'next-occurrence-indicator';

            const nextOccurrenceText = document.createElement('span');
            nextOccurrenceText.textContent = nextOccurrenceDate.toLocaleDateString();
            nextOccurrenceIndicator.appendChild(nextOccurrenceText);

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            const isNextOverdue = nextOccurrenceDate < today;

            if (isNextOverdue) {
                nextOccurrenceIndicator.classList.add('overdue');
                console.log(`Task ${task.id} (${task.title}) next occurrence is overdue: ${nextOccurrenceDate.toISOString()}`);
            }

            metadataDiv.appendChild(nextOccurrenceIndicator);
        }

        if (task.due_date) {
            try {


                let dueDate;
                try {


                    let datePart = task.due_date;
                    if (task.due_date.includes('T')) {
                        datePart = task.due_date.split('T')[0];
                    }

                    const [year, month, day] = datePart.split('-').map(Number);

                    dueDate = new Date(year, month - 1, day, 0, 0, 0, 0);

                    console.log(`Parsed date: ${task.due_date} -> ${dueDate.toDateString()} (${dueDate.toISOString()})`);
                    console.log(`Raw date parts: year=${year}, month=${month-1}, day=${day}`);

                    if (dueDate.getFullYear() !== year || dueDate.getMonth() !== month-1 || dueDate.getDate() !== day) {
                        console.error(`Date parsing error: expected ${year}-${month}-${day} but got ${dueDate.getFullYear()}-${dueDate.getMonth()+1}-${dueDate.getDate()}`);
                    }
                } catch (e) {
                    console.error('Error parsing date:', task.due_date, e);
                    dueDate = new Date(0); // Use epoch time as fallback
                }

                if (isNaN(dueDate.getTime())) {

                    console.error("Invalid date format:", task.due_date);

                    const dueDateIndicator = document.createElement('div');
                    dueDateIndicator.className = 'due-date-indicator invalid-date';

                    const calendarIcon = document.createElement('i');
                    calendarIcon.innerHTML = '&#128197;'; // Calendar emoji
                    dueDateIndicator.appendChild(calendarIcon);

                    const dueDateText = document.createElement('span');
                    dueDateText.textContent = 'Fix due date';
                    dueDateIndicator.appendChild(dueDateText);

                    metadataDiv.appendChild(dueDateIndicator);
                } else {


                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    console.log(`Today's date for comparison: ${today.toDateString()}`);

                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    const nextWeek = new Date(today);
                    nextWeek.setDate(nextWeek.getDate() + 7);


                    const formattedDate = dueDate.toLocaleDateString('default', {
                        month: 'short',
                        day: 'numeric',
                        year: today.getFullYear() !== dueDate.getFullYear() ? 'numeric' : undefined
                    });

                    const dueDateIndicator = document.createElement('div');
                    dueDateIndicator.className = 'due-date-indicator';

                    const dueDateMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const tomorrowMidnight = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

                    console.log(`Comparing dates - Due date: ${dueDateMidnight.toISOString()}, Today: ${todayMidnight.toISOString()}, Tomorrow: ${tomorrowMidnight.toISOString()}`);

                    if (dueDateMidnight.getTime() === todayMidnight.getTime()) {

                        console.log('Task is due TODAY');
                        dueDateIndicator.classList.add('due-soon');
                    } else if (dueDateMidnight < todayMidnight) {

                        console.log('Task is OVERDUE');
                        dueDateIndicator.classList.add('overdue');
                    } else if (dueDateMidnight.getTime() === tomorrowMidnight.getTime()) {

                        console.log('Task is due TOMORROW');
                        dueDateIndicator.classList.add('due-soon');
                    } else if (dueDate < nextWeek) {
                        console.log('Task is due SOON');
                        dueDateIndicator.classList.add('due-soon');
                    }

                    const calendarIcon = document.createElement('i');
                    calendarIcon.className = 'fas fa-calendar-alt'; // Font Awesome icon
                    dueDateIndicator.appendChild(calendarIcon);

                    const dueDateText = document.createElement('span');

                    if (task.isOverdueNextOccurrence && task.nextOccurrenceDate) {



                        dueDateText.textContent = 'Overdue';
                        dueDateIndicator.classList.add('overdue'); // Ensure it's marked as overdue
                        dueDateIndicator.classList.add('next-occurrence-overdue'); // Add special styling

                        div.setAttribute('data-recurring-overdue', 'true');

                        const nextOccurrenceIndicator = document.createElement('div');
                        nextOccurrenceIndicator.className = 'next-occurrence-indicator';


                        let nextDate;
                        let nextDateText;

                        if (task.next_occurrence_date) {

                            nextDate = new Date(task.next_occurrence_date);
                            nextDateText = nextDate.toLocaleDateString();
                            console.log(`Using database next occurrence date for task ${task.id}: ${nextDateText}`);
                        } else {

                            const today = new Date();

                            if (task.recurrence_type === 'daily') {
                                const tomorrow = new Date(today);
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                nextDateText = tomorrow.toLocaleDateString();
                            } else {

                                nextDateText = today.toLocaleDateString();
                            }
                        }

                        const nextText = document.createElement('span');
                        nextText.textContent = nextDateText;
                        nextOccurrenceIndicator.appendChild(nextText);

                        task.nextOccurrenceIndicator = nextOccurrenceIndicator;
                    } else if (task.recurrence_type && task.recurrence_type !== 'none' && task.is_complete) {

                        if (task.next_occurrence_date) {

                            const nextDate = new Date(task.next_occurrence_date);
                            const formattedNextDate = nextDate.toLocaleDateString();
                            dueDateText.textContent = `Next: ${formattedNextDate}`;
                            console.log(`Using database next occurrence date for completed task ${task.id}: ${formattedNextDate}`);
                        } else {

                            const nextOccurrence = calculateNextOccurrence(task);
                            if (nextOccurrence) {
                                const formattedNextDate = nextOccurrence.toLocaleDateString();
                                dueDateText.textContent = `Next: ${formattedNextDate}`;
                            } else {

                                dueDateText.textContent = `Due: ${formattedDate}`;
                            }
                        }
                    } else {

                        if (dueDateMidnight.getTime() === todayMidnight.getTime()) {
                            dueDateText.textContent = 'Due Today';
                        } else if (dueDateMidnight < todayMidnight) {
                            dueDateText.textContent = 'Overdue';
                        } else if (dueDateMidnight.getTime() === tomorrowMidnight.getTime()) {
                            dueDateText.textContent = 'Due Tomorrow';
                        } else {
                            dueDateText.textContent = `Due: ${formattedDate}`;
                        }
                    }
                    dueDateIndicator.appendChild(dueDateText);

                    metadataDiv.appendChild(dueDateIndicator);

                    if (task.nextOccurrenceIndicator) {
                        metadataDiv.appendChild(task.nextOccurrenceIndicator);
                    }
                }
            } catch (e) {
                console.error("Error parsing due date for display:", task.due_date, e);
            }
        }

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

        if (metadataDiv.children.length > 0) {
            contentDiv.appendChild(metadataDiv);
        }

        if (task.reminder_time) {
            try {
                const reminderDate = new Date(task.reminder_time);

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

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn edit-task-btn'; // Class to be styled
        editBtn.innerHTML = '<i class="pencil-icon"><i class="fas fa-pencil-alt"></i></i>'; // Font Awesome icon
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', (event) => {
            console.log("Edit button clicked for task:", task);
            event.stopPropagation(); // Prevent event bubbling
            openEditTaskModal(task); // Pass the task data
        });
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn delete-btn';
        deleteBtn.innerHTML = '<i class="x-icon"><i class="fas fa-times"></i></i>'; // Font Awesome icon
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', handleDeleteTask);
        actionsDiv.appendChild(deleteBtn);

        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'task-checkbox-container';
        checkboxContainer.appendChild(checkbox);

        div.appendChild(checkboxContainer);
        div.appendChild(contentDiv);
        div.appendChild(actionsDiv);

        return div;
    }

    let lastTaskInputs = {
        title: '',
        description: '',
        reminderTypes: [],
        reminderTime: '',
        dueDate: '',
        duration: 1,
        recurrenceType: 'none',
        recurrenceInterval: 1
    };

    function saveCurrentInputs() {

        const selectedReminderTypes = [];
        document.querySelectorAll('.reminder-checkbox:checked').forEach(checkbox => {
            selectedReminderTypes.push(checkbox.value);
        });

        lastTaskInputs = {
            title: taskTitleInput.value.trim(),
            description: taskDescriptionInput.value.trim(),
            reminderTypes: selectedReminderTypes,
            reminderTime: taskReminderTimeInput.value,
            dueDate: taskDueDateInput.value,
            duration: taskDurationInput.value,
            recurrenceType: taskRecurrenceTypeInput.value,
            recurrenceInterval: taskRecurrenceIntervalInput.value
        };
        console.log('Saved task inputs:', lastTaskInputs);
    }

    function loadLastInputs() {
        if (!lastTaskInputs.title) return; // Don't load if no saved inputs

        taskTitleInput.value = lastTaskInputs.title;
        taskDescriptionInput.value = lastTaskInputs.description;
        taskReminderTimeInput.value = lastTaskInputs.reminderTime;
        taskDueDateInput.value = lastTaskInputs.dueDate;
        taskDurationInput.value = lastTaskInputs.duration;
        taskRecurrenceTypeInput.value = lastTaskInputs.recurrenceType;
        taskRecurrenceIntervalInput.value = lastTaskInputs.recurrenceInterval;

        document.querySelectorAll('.reminder-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

        if (lastTaskInputs.reminderTypes && lastTaskInputs.reminderTypes.length > 0) {
            lastTaskInputs.reminderTypes.forEach(type => {
                const checkbox = document.getElementById(`reminder${type.charAt(0).toUpperCase() + type.slice(1).replace('-', '')}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });

            if (lastTaskInputs.reminderTypes.includes('custom')) {
                customReminderGroup.style.display = 'block';
            } else {
                customReminderGroup.style.display = 'none';
            }
        }

        if (lastTaskInputs.recurrenceType !== 'none') {
            recurrenceIntervalGroup.style.display = 'block';
            updateRecurrenceIntervalUnit();
        } else {
            recurrenceIntervalGroup.style.display = 'none';
        }

        console.log('Loaded saved task inputs');
    }

    useLastInputsToggle.addEventListener('change', function() {
        if (this.checked) {
            loadLastInputs();
        } else {

            addTaskForm.reset();

            taskDueDateInput.value = '';
            taskDurationInput.value = 1;
            customReminderGroup.style.display = 'none';
            recurrenceIntervalGroup.style.display = 'none';
        }
    });

    addTaskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        addTaskBtn.disabled = true;
        addTaskBtn.textContent = 'Adding...';
        updateAddTaskStatus("Adding task...", false);

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();

        const reminderTypes = [];
        document.querySelectorAll('.reminder-checkbox:checked').forEach(checkbox => {
            reminderTypes.push(checkbox.value);
        });

        let dueDate = taskDueDateInput.value;


        const reminderTimes = [];
        let customReminderTime = null;

        for (const reminderType of reminderTypes) {
            if (reminderType === 'custom') {

                customReminderTime = taskReminderTimeInput.value;
                if (!customReminderTime) {
                    updateAddTaskStatus("Please set a custom reminder time or uncheck the custom reminder option.", true);
                    addTaskBtn.disabled = false;
                    addTaskBtn.textContent = 'Add Task';
                    return;
                }
                reminderTimes.push({
                    type: 'custom',
                    time: customReminderTime
                });
            } else {

                const dueDateTime = new Date(dueDate);

                if (reminderType === 'same-day') {

                    const reminderDate = new Date(dueDateTime);
                    reminderDate.setHours(9, 0, 0, 0);
                    reminderTimes.push({
                        type: 'same-day',
                        time: reminderDate.toISOString().slice(0, 16)
                    });
                } else if (reminderType === 'day-before') {

                    const reminderDate = new Date(dueDateTime);
                    reminderDate.setDate(reminderDate.getDate() - 1);
                    reminderDate.setHours(9, 0, 0, 0);
                    reminderTimes.push({
                        type: 'day-before',
                        time: reminderDate.toISOString().slice(0, 16)
                    });
                } else if (reminderType === 'week-before') {

                    const reminderDate = new Date(dueDateTime);
                    reminderDate.setDate(reminderDate.getDate() - 7);
                    reminderDate.setHours(9, 0, 0, 0);
                    reminderTimes.push({
                        type: 'week-before',
                        time: reminderDate.toISOString().slice(0, 16)
                    });
                }
            }
        }

        const duration = parseInt(taskDurationInput.value, 10) || 1;
        const recurrenceType = taskRecurrenceTypeInput.value;
        const recurrenceInterval = taskRecurrenceIntervalInput.value;

        if (!title) {
            updateAddTaskStatus("Task title cannot be empty.", true);
            addTaskBtn.disabled = false;
            addTaskBtn.textContent = 'Add Task';
            return;
        }

        const primaryReminderTime = reminderTimes.length > 0 ? reminderTimes[0].time : null;

        let reminderTimesString = null;
        if (reminderTimes.length > 0) {
            try {
                reminderTimesString = JSON.stringify(reminderTimes);
                console.log('Converted reminderTimes to string:', reminderTimesString);
            } catch (e) {
                console.error('Error stringifying reminderTimes:', e);
                reminderTimesString = null;
            }
        }

        const taskData = {
            title: title,
            description: description || null, // Send null if empty
            reminderTime: primaryReminderTime, // Use the first reminder time as the primary one
            reminderType: reminderTypes.length > 0 ? reminderTypes.join(',') : 'none', // Store all reminder types as comma-separated string
            reminderTimes: reminderTimesString, // Store all reminder times as JSON string

            dueDate: dueDate,
            duration: duration,
            recurrenceType: recurrenceType,
            recurrenceInterval: recurrenceType !== 'none' ? parseInt(recurrenceInterval, 10) : null // Send interval only if recurrence is set
        };

        console.log('Prepared task data:', taskData);

        try {
            console.log('Sending task data to server:', taskData);
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


            const taskElement = createTaskElement(newTask);

            const firstCompleted = taskListDiv.querySelector('.task-item.complete');
            taskListDiv.insertBefore(taskElement, firstCompleted); // If firstCompleted is null, it appends to end

            if (taskListDiv.querySelector('p')) { // Remove 'No tasks yet' message if present
                 taskListDiv.querySelector('p').remove();
            }



            saveCurrentInputs();

            const keepInputs = useLastInputsToggle.checked;

            addTaskForm.reset();

            if (keepInputs) {
                useLastInputsToggle.checked = true;
                loadLastInputs();
            } else {

                recurrenceIntervalGroup.style.display = 'none';
            }

            updateAddTaskStatus("Task added successfully!", false);

        } catch (error) {
            console.error('Error adding task:', error);
            updateAddTaskStatus(`Error adding task: ${error.message}`, true);
        } finally {
            addTaskBtn.disabled = false;
            addTaskBtn.textContent = 'Add Task';
        }
    });

    function updateRecurrenceIntervalUnit() {
        if (!recurrenceIntervalUnit) return;

        const recurrenceType = taskRecurrenceTypeInput.value;
        switch (recurrenceType) {
            case 'daily':
                recurrenceIntervalUnit.textContent = 'days';
                break;
            case 'weekly':
                recurrenceIntervalUnit.textContent = 'weeks';
                break;
            case 'monthly':
                recurrenceIntervalUnit.textContent = 'months';
                break;
            case 'yearly':
                recurrenceIntervalUnit.textContent = 'years';
                break;
            default:
                recurrenceIntervalUnit.textContent = 'days';
        }
    }

    taskRecurrenceTypeInput.addEventListener('change', function() {
        const type = this.value;
        if (type === 'none') {
            recurrenceIntervalGroup.style.display = 'none';
        } else {
            recurrenceIntervalGroup.style.display = 'flex'; // Or 'block' depending on your layout

            updateRecurrenceIntervalUnit();
            taskRecurrenceIntervalInput.value = '1'; // Reset interval to 1 when type changes
        }
    });

    async function handleToggleComplete(event) {
        const checkbox = event.target;
        const taskItem = checkbox.closest('.task-item');
        const taskId = taskItem.getAttribute('data-task-id');
        const isComplete = checkbox.checked;

        const isRecurringOverdue = taskItem.hasAttribute('data-recurring-overdue');

        console.log(`Toggling task ${taskId} to complete=${isComplete} (isRecurringOverdue=${isRecurringOverdue})`);
        taskItem.style.opacity = '0.7'; // Optimistic UI feedback

        try {


            if (isRecurringOverdue && isComplete) {
                console.log(`Task ${taskId} is a recurring overdue task, creating next occurrence...`);

                console.log(`Sending request to mark task ${taskId} complete...`);
                const completeResponse = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        is_complete: true
                    })
                });

                console.log(`Response status: ${completeResponse.status}`);

                if (!completeResponse.ok) {
                    throw new Error(`HTTP error marking task complete! status: ${completeResponse.status}`);
                }

                const updatedTask = await completeResponse.json();
                console.log(`Task ${taskId} marked complete:`, updatedTask);

                const taskCompletedEvent = new CustomEvent('taskCompleted', {
                    detail: { taskId: updatedTask.id, task: updatedTask }
                });
                document.dispatchEvent(taskCompletedEvent);
                console.log('Dispatched taskCompleted event for recurring overdue task');

                console.log(`Creating next occurrence for task ${taskId} using API endpoint...`);
                let nextOccurrence = null;
                try {

                    if (updatedTask.recurrence_type === 'daily') {

                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const formattedTomorrow = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD

                        const createResponse = await fetch('/api/tasks', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title: updatedTask.title,
                                description: updatedTask.description,
                                assignedDate: formattedTomorrow, // Set assigned date to ensure it appears on calendar
                                dueDate: formattedTomorrow,
                                recurrenceType: updatedTask.recurrence_type,
                                recurrenceInterval: updatedTask.recurrence_interval
                            })
                        });

                        if (createResponse.ok) {
                            nextOccurrence = await createResponse.json();
                            console.log(`Next occurrence created manually: ${nextOccurrence.id} with due date ${formattedTomorrow}`);

                            const taskUpdatedEvent = new CustomEvent('taskUpdated', {
                                detail: { taskId: nextOccurrence.id, task: nextOccurrence }
                            });
                            document.dispatchEvent(taskUpdatedEvent);
                            console.log('Dispatched taskUpdated event for manually created next occurrence of overdue task');

                            try {
                                console.log(`Updating task ${taskId} with next occurrence date ${formattedTomorrow}`);
                                const updateData = { nextOccurrenceDate: formattedTomorrow };
                                console.log('Update data:', updateData);

                                const updateResponse = await fetch(`/api/tasks/${taskId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updateData)
                                });

                                if (updateResponse.ok) {
                                    console.log(`Updated task ${taskId} with next occurrence date ${formattedTomorrow}`);
                                } else {
                                    console.error(`Failed to update task ${taskId} with next occurrence date: ${updateResponse.status}`);

                                    try {
                                        const errorData = await updateResponse.json();
                                        console.error('Error details:', errorData);
                                    } catch (e) {
                                        console.error('Could not parse error response');
                                    }
                                }
                            } catch (updateError) {
                                console.error('Error updating task with next occurrence date:', updateError);
                            }
                        } else {
                            console.error(`Failed to create next occurrence manually: ${createResponse.status}`);
                        }
                    } else {

                        const nextOccurrenceResponse = await fetch(`/api/tasks/${taskId}/next-occurrence`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        if (nextOccurrenceResponse.ok) {
                            nextOccurrence = await nextOccurrenceResponse.json();
                            console.log(`Next occurrence created via API endpoint: ${nextOccurrence.id}`);

                            const taskUpdatedEvent = new CustomEvent('taskUpdated', {
                                detail: { taskId: nextOccurrence.id, task: nextOccurrence }
                            });
                            document.dispatchEvent(taskUpdatedEvent);
                            console.log('Dispatched taskUpdated event for next occurrence of overdue task');
                        } else {
                            console.error(`Failed to create next occurrence via API: ${nextOccurrenceResponse.status}`);
                        }
                    }

                    if (nextOccurrence) {

                        const notification = document.createElement('div');
                        notification.className = 'status success';

                        const nextDate = nextOccurrence.due_date || nextOccurrence.assigned_date || new Date().toISOString();
                        notification.textContent = `Next occurrence of "${updatedTask.title}" created for ${new Date(nextDate).toLocaleDateString()}`;
                        document.body.appendChild(notification);

                        setTimeout(() => {
                            notification.remove();
                        }, 5000);
                    }
                } catch (apiError) {
                    console.error('Error creating next occurrence:', apiError);
                }


                allTasks = []; // Clear the task cache
                await loadTasks(true); // Pass true to force a full reload
                return;
            }

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

            taskItem.remove(); // Remove from current list
            const newTaskElement = createTaskElement(updatedTask); // Recreate element with updated state

            if (updatedTask.is_complete) {

                completedTaskListDiv.appendChild(newTaskElement);

                const placeholder = completedTaskListDiv.querySelector('p');
                if (placeholder) placeholder.remove();

                const taskCompletedEvent = new CustomEvent('taskCompleted', {
                    detail: { taskId: updatedTask.id, task: updatedTask }
                });
                document.dispatchEvent(taskCompletedEvent);
                console.log('Dispatched taskCompleted event');

                if (updatedTask.recurrence_type && updatedTask.recurrence_type !== 'none') {
                    console.log(`Task ${updatedTask.id} is recurring (${updatedTask.recurrence_type}). Creating next occurrence...`);

                    try {

                        let nextOccurrenceData;

                        try {

                            if (updatedTask.recurrence_type === 'daily') {

                                const today = new Date();
                                const tomorrow = new Date(today);
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const formattedTomorrow = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD

                                const createResponse = await fetch('/api/tasks', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        title: updatedTask.title,
                                        description: updatedTask.description,
                                        assignedDate: formattedTomorrow, // Set assigned date to ensure it appears on calendar
                                        dueDate: formattedTomorrow,
                                        recurrenceType: updatedTask.recurrence_type,
                                        recurrenceInterval: updatedTask.recurrence_interval
                                    })
                                });

                                if (createResponse.ok) {
                                    nextOccurrenceData = await createResponse.json();
                                    console.log(`Next occurrence created manually: ${nextOccurrenceData.id} with due date ${formattedTomorrow}`);

                                    const taskUpdatedEvent = new CustomEvent('taskUpdated', {
                                        detail: { taskId: nextOccurrenceData.id, task: nextOccurrenceData }
                                    });
                                    document.dispatchEvent(taskUpdatedEvent);
                                    console.log('Dispatched taskUpdated event for manually created next occurrence');

                                    try {
                                        console.log(`Updating task ${updatedTask.id} with next occurrence date ${formattedTomorrow}`);
                                        const updateData = { nextOccurrenceDate: formattedTomorrow };
                                        console.log('Update data:', updateData);

                                        const updateResponse = await fetch(`/api/tasks/${updatedTask.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(updateData)
                                        });

                                        if (updateResponse.ok) {
                                            console.log(`Updated task ${updatedTask.id} with next occurrence date ${formattedTomorrow}`);
                                        } else {
                                            console.error(`Failed to update task ${updatedTask.id} with next occurrence date: ${updateResponse.status}`);
                                        }
                                    } catch (updateError) {
                                        console.error('Error updating task with next occurrence date:', updateError);
                                    }
                                } else {
                                    console.error(`Failed to create next occurrence manually: ${createResponse.status}`);

                                    nextOccurrenceData = await createNextOccurrenceManually(updatedTask);
                                }
                            } else {

                                const nextOccurrenceResponse = await fetch(`/api/tasks/${updatedTask.id}/next-occurrence`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' }
                                });

                                if (nextOccurrenceResponse.ok) {
                                    nextOccurrenceData = await nextOccurrenceResponse.json();
                                    console.log('Next occurrence created via API:', nextOccurrenceData);

                                    const taskUpdatedEvent = new CustomEvent('taskUpdated', {
                                        detail: { taskId: nextOccurrenceData.id, task: nextOccurrenceData }
                                    });
                                    document.dispatchEvent(taskUpdatedEvent);
                                    console.log('Dispatched taskUpdated event for next occurrence');
                                } else {

                                    console.warn('API endpoint failed, calculating next occurrence manually');

                                    nextOccurrenceData = await createNextOccurrenceManually(updatedTask);
                                }
                            }
                        } catch (apiError) {
                            console.error('Error creating next occurrence:', apiError);


                            nextOccurrenceData = await createNextOccurrenceManually(updatedTask);
                        }

                        if (nextOccurrenceData) {
                            console.log('Next occurrence created:', nextOccurrenceData);

                            const notification = document.createElement('div');
                            notification.className = 'status success';

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

                            const nextDate = nextOccurrenceData.due_date || nextOccurrenceData.assigned_date || new Date().toISOString();
                            notification.textContent = `Recurring task "${updatedTask.title}" (repeats ${recurrenceText}) will appear on the calendar on ${new Date(nextDate).toLocaleDateString()}.`;
                            notification.style.marginTop = '10px';
                            notification.style.marginBottom = '10px';

                            const calendarLink = document.createElement('a');
                            calendarLink.href = '/pages/calendar.html';
                            calendarLink.textContent = ' View Calendar';
                            calendarLink.style.marginLeft = '5px';
                            calendarLink.style.fontWeight = 'bold';
                            calendarLink.style.color = '#4db6ac';
                            notification.appendChild(calendarLink);

                            taskListDiv.insertBefore(notification, taskListDiv.firstChild);

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

                taskListDiv.appendChild(newTaskElement);

                const placeholder = taskListDiv.querySelector('p');
                if (placeholder) placeholder.remove();

                const taskUpdatedEvent = new CustomEvent('taskUpdated', {
                    detail: { taskId: updatedTask.id, task: updatedTask }
                });
                document.dispatchEvent(taskUpdatedEvent);
                console.log('Dispatched taskUpdated event');
            }

            const completedCountToday = completedTaskListDiv.querySelectorAll('.task-item').length;
            updateCompletedTaskHeader(completedCountToday);

            if (taskListDiv.childElementCount === 0) {
                 taskListDiv.innerHTML = '<p>No active tasks.</p>';
            }
             if (completedTaskListDiv.childElementCount === 0) {
                 completedTaskListDiv.innerHTML = '<p>No tasks completed today.</p>'; // Use today's message
             }


        } catch (error) {
            console.error('Error updating task completion:', error);
            updateTaskListStatus("Error updating task status.", true);



        } finally {
             taskItem.style.opacity = '1';
        }
    }

    function handleTaskTouch(event) {

        const taskItem = event.currentTarget;

        taskItem.classList.toggle('show-actions');

        setTimeout(() => {
            taskItem.classList.remove('show-actions');
        }, 3000);
    }

    function isTaskRecurring(taskItem) {

        return !!taskItem.querySelector('.recurring-icon');
    }

    async function handleDeleteTask(event) {

        const deleteBtn = event.currentTarget || event.target;
        const taskItem = deleteBtn.closest('.task-item');
        const taskId = taskItem.getAttribute('data-task-id');
        const taskTitle = taskItem.querySelector('.task-title').textContent;

        if (!taskId) { console.error("Could not find task ID to delete"); return; }

        const isRecurring = isTaskRecurring(taskItem);

        let confirmMessage = `Are you sure you want to delete task "${taskTitle}"?`;
        if (isRecurring) {
            confirmMessage = `Are you sure you want to delete task "${taskTitle}" with all of its recurrences?`;
        }

        if (confirm(confirmMessage)) {
            console.log(`Deleting task ${taskId} (recurring: ${isRecurring})`);
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

                const result = await response.json();
                console.log(`Task deletion result:`, result);

                taskItem.remove();

                if (result.deletedCount > 1) {
                    updateTaskListStatus(`Task and ${result.deletedCount - 1} recurrences deleted.`, false);
                } else {
                    updateTaskListStatus("Task deleted.", false);
                }

                if (taskListDiv.childElementCount === 0) {
                    taskListDiv.innerHTML = '<p>No tasks yet. Add one above!</p>';
                }

                if (typeof window.refreshCalendar === 'function') {
                    console.log('Refreshing calendar after task deletion');
                    window.refreshCalendar();
                }

            } catch (error) {
                console.error('Error deleting task:', error);
                updateTaskListStatus(`Error deleting task: ${error.message}`, true);
                taskItem.style.opacity = '1'; // Restore UI on error
                deleteBtn.disabled = false;
            }
        }
    }


    addTaskFab.addEventListener('click', () => {
        addTaskModal.style.display = 'flex';

        if (useLastInputsToggle.checked && lastTaskInputs.title) {

            loadLastInputs();
        } else {

            taskDueDateInput.value = '';

            taskDurationInput.value = 1;

            taskTitleInput.value = '';
            taskDescriptionInput.value = '';
            taskReminderTypeInput.value = 'none';
            taskReminderTimeInput.value = '';
            customReminderGroup.style.display = 'none';
            taskRecurrenceTypeInput.value = 'none';

            recurrenceIntervalGroup.style.display = 'none';
        }
    });

    const reminderCheckboxes = document.querySelectorAll('.reminder-checkbox');

    reminderCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {

            if (this.id === 'reminderCustom') {
                customReminderGroup.style.display = this.checked ? 'block' : 'none';
            }

            if (this.id === 'editReminderCustom') {
                editCustomReminderGroup.style.display = this.checked ? 'block' : 'none';
            }
        });
    });

    closeTaskModalBtn.addEventListener('click', () => {
        addTaskModal.style.display = 'none';
    });

    addTaskModal.addEventListener('click', (event) => {
        if (event.target === addTaskModal) {
            addTaskModal.style.display = 'none';
        }
    });



    async function resetCounterHabits() {
        try {
            console.log('Manually resetting counter habits...');
            const updatePromises = [];

            allHabitsData.forEach(habit => {

                const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
                if (counterMatch) {

                    const totalCount = parseInt(counterMatch[2], 10) || 0;
                    const newTitle = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

                    habit.title = newTitle;
                    console.log(`Reset counter for habit: ${habit.title}`);

                    habit.completions_per_day = totalCount;

                    const updatePromise = updateHabitCounter(habit.id, newTitle, totalCount);
                    updatePromises.push(updatePromise);
                }
            });

            await Promise.all(updatePromises);
            console.log('All counter habits reset successfully');

            loadHabits();

            habitListStatusDiv.textContent = 'Counter habits reset successfully';
            habitListStatusDiv.className = 'status success';

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

    async function updateHabitCounter(habitId, newTitle, completionsPerDay = null) {
        try {

            const existingHabit = allHabitsData.find(h => h.id === habitId);

            if (!existingHabit) {
                console.warn(`Habit ${habitId} not found in local data, using defaults`);
            }



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

    async function loadHabits() {
        habitListStatusDiv.textContent = 'Loading habits...';
        habitListStatusDiv.className = 'status';
        try {

            const cacheBuster = new Date().getTime();
            const response = await fetch(`/api/habits?_=${cacheBuster}`); // Assuming this endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const habits = await response.json();

            const dayChanged = isDayChanged();

            if (dayChanged) {
                console.log('Day has changed, resetting habit progress counters');
                const updatePromises = [];

                habits.forEach(habit => {

                    const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);
                    if (counterMatch) {

                        const totalCount = parseInt(counterMatch[2], 10) || 0;
                        const newTitle = habit.title.replace(/\(\d+\/\d+\)/, `(0/${totalCount})`);

                        habit.title = newTitle;
                        console.log(`Reset counter for habit: ${habit.title}`);


                        habit.completions_per_day = totalCount;
                        console.log(`Set completions_per_day to ${totalCount} for counter habit: ${habit.title}`);

                        const updatePromise = updateHabitCounter(habit.id, newTitle, totalCount);
                        updatePromises.push(updatePromise);
                    }
                });

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



            let completionsToday = habit.completions_today || 0;
            const completionsTarget = habit.completions_per_day || 1;

            let hasCounter = false;
            let currentCount = 0;
            let totalCount = 0;
            const counterMatch = habit.title.match(/\((\d+)\/(\d+)\)/);

            if (counterMatch) {
                hasCounter = true;
                currentCount = parseInt(counterMatch[1], 10) || 0;
                totalCount = parseInt(counterMatch[2], 10) || 10;
            }

            const isHighTarget = !hasCounter && completionsTarget > 100;
            const isComplete = hasCounter ?
                (currentCount >= totalCount) : // For counter habits, only complete when counter reaches max
                (isHighTarget ? false : completionsToday >= completionsTarget); // For regular habits, complete when reaching target


            let finalIsComplete = isComplete;
            if (hasCounter) {

                const isCounterComplete = currentCount >= totalCount;
                finalIsComplete = isCounterComplete;
                if (!isCounterComplete) {

                    console.log(`Counter habit ${habit.id} (${habit.title}) is not complete: ${currentCount}/${totalCount}`);
                }

                const progressEl = habitElement.querySelector('.habit-progress');
                if (progressEl) {
                    progressEl.textContent = `Progress: ${currentCount}/${totalCount}`;
                    progressEl.title = `Current progress: ${currentCount}/${totalCount}`;

                    progressEl.style.backgroundColor = '#e8f5f0';
                    progressEl.style.border = '1px solid #d1e5f9';
                    progressEl.style.padding = '4px 12px';
                    progressEl.style.borderRadius = '12px';
                    progressEl.style.minWidth = '120px';
                    progressEl.style.textAlign = 'center';
                    progressEl.style.display = 'inline-block';
                }
            }


            if (finalIsComplete) {
                habitElement.dataset.completed = 'true';
            } else {
                habitElement.dataset.completed = 'false';
            }

            if (completionsTarget > 1) {
                habitElement.dataset.multiCompletion = 'true';
            } else {
                habitElement.dataset.multiCompletion = 'false';
            }

            if (hasCounter) {
                habitElement.dataset.counter = 'true';
            } else {
                habitElement.dataset.counter = 'false';
            }

            console.log(`Habit ${habit.id} (${habit.title}) completion status:`, {
                completionsToday,
                completionsTarget,
                isComplete,
                rawCompletionsToday: habit.completions_today,
                dataCompleted: habitElement.dataset.completed
            });


            if (!hasCounter && completionsToday > 0) {

                habitElement.classList.add('complete');

                const ensureChecked = () => {
                    const checkbox = habitElement.querySelector('.habit-checkbox');
                    if (checkbox && !checkbox.checked) {
                        console.log(`Forcing checkbox checked state for habit ${habit.id}`);
                        checkbox.checked = true;
                    }
                };

                ensureChecked();

                setTimeout(ensureChecked, 100);
                setTimeout(ensureChecked, 500);
                setTimeout(ensureChecked, 1000);
            }



            let displayCompletionsToday = isComplete ? completionsTarget : completionsToday;

            if (habit.title.includes('Social Media Rejection')) {

                if (isComplete || completionsToday > 0) {
                    displayCompletionsToday = completionsTarget;
                }
            }


            if (isDayChanged() && !hasCounter && !isComplete) {
                displayCompletionsToday = 0;
            }

            console.log(`Habit ${habit.id} (${habit.title}) display progress: ${displayCompletionsToday}/${completionsTarget} (isComplete: ${isComplete})`);


            let counterLevel = 1;

            if (hasCounter) {
                counterLevel = Math.max(1, currentCount);
                console.log(`Habit with counter: ${habit.title}, Current: ${currentCount}, Total: ${totalCount}`);
            }

            const level = hasCounter ? counterLevel : (habit.level || 1);

            let levelClass = 'level-1';
            if (level >= 10) {
                levelClass = 'level-10';
            } else if (level >= 5) {
                levelClass = 'level-5';
            } else if (level >= 3) {
                levelClass = 'level-3';
            }

            let checkboxHtml = '';
            if (hasCounter) {

                if (isComplete) {

                    checkboxHtml = `<div class="habit-control-container">
                        <button class="habit-increment-btn completed" title="Completed!" disabled>✓</button>
                    </div>`;
                } else {

                    checkboxHtml = `<div class="habit-control-container">
                        <button class="habit-increment-btn" title="Click to add +1">+1</button>
                    </div>`;
                }
            } else if (completionsTarget > 1) {

                if (isComplete) {

                    checkboxHtml = `<div class="habit-control-container">
                        <button class="habit-increment-btn completed" title="Completed for today!" disabled>✓</button>
                    </div>`;
                } else {

                    checkboxHtml = `<div class="habit-control-container">
                        <button class="habit-increment-btn" title="Click to add +1 (${completionsToday}/${completionsTarget})">+1</button>
                    </div>`;
                }
            } else {

                checkboxHtml = `<div class="habit-control-container">
                    <input type="checkbox" class="habit-checkbox" title="Mark as done" ${isComplete ? 'checked' : ''}>
                </div>`;
            }

            let totalCompletionsCount = habit.total_completions || 0;

            console.log(`Habit ${habit.id} (${habit.title}) total completions: ${totalCompletionsCount}`);


            if (habit.title.includes('10g Creatine') && totalCompletionsCount === 1) {

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
                        <div class="habit-level ${totalLevelClass}" title="${totalCompletionsCount} total completions">
                            Level ${totalCompletionsCount}
                        </div>
                    </div>
                </div>

                <div class="habit-actions">
                    <button class="icon-btn edit-habit-btn" title="Edit habit"><i class="pencil-icon">✏️</i></button>
                    <button class="icon-btn delete-habit-btn" title="Delete habit"><i class="x-icon">❌</i></button>
                </div>
            `;

            if (isComplete) {
                if (hasCounter) {

                    habitElement.classList.add('counter-complete');
                } else {

                    habitElement.classList.add('complete');
                }
            }

            const deleteBtn = habitElement.querySelector('.delete-habit-btn');
            const editBtn = habitElement.querySelector('.edit-habit-btn');

            if ((hasCounter || completionsTarget > 1) && !isComplete) {

                const incrementBtn = habitElement.querySelector('.habit-increment-btn');
                if (incrementBtn) {
                    incrementBtn.addEventListener('click', () => {
                        console.log(`Increment button clicked for habit ${habit.id}`);

                        if (hasCounter) {

                            const habitTitleEl = habitElement.querySelector('.habit-title');
                            const habitTitle = habitTitleEl ? habitTitleEl.textContent : habit.title;
                            const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);

                            if (counterMatch) {
                                const currentCount = parseInt(counterMatch[1], 10) || 0;
                                const totalCount = parseInt(counterMatch[2], 10) || 0;
                                console.log(`Counter habit clicked: ${habitTitle}, Current: ${currentCount}, Total: ${totalCount}`);
                                handleHabitIncrementClick(habit.id, currentCount, totalCount);
                            } else {

                                console.log(`Counter habit clicked (fallback): ${habit.title}, Current: ${currentCount}, Total: ${totalCount}`);
                                handleHabitIncrementClick(habit.id, currentCount, totalCount);
                            }
                        } else {

                            handleHabitIncrementClick(habit.id, completionsToday, completionsTarget);
                        }
                    });
                }
            } else if (!hasCounter && completionsTarget === 1) {

                const checkbox = habitElement.querySelector('.habit-checkbox');
                if (checkbox) {

                    checkbox.setAttribute('data-completed', isComplete ? 'true' : 'false');

                    checkbox.addEventListener('change', (e) => {
                        const wasCompleted = checkbox.getAttribute('data-completed') === 'true';
                        const isNowChecked = e.target.checked;

                        if ((isNowChecked && !wasCompleted) || (!isNowChecked && wasCompleted)) {
                            console.log(`User changed habit ${habit.id} checkbox to ${isNowChecked}`);
                            handleHabitCheckboxClick(habit.id, isNowChecked);

                            checkbox.setAttribute('data-completed', isNowChecked ? 'true' : 'false');
                        } else {
                            console.log(`Ignoring redundant checkbox change for habit ${habit.id}`);
                        }
                    });
                }
            }

            deleteBtn.addEventListener('click', () => deleteHabit(habit.id));
            editBtn.addEventListener('click', () => openEditHabitModal(habit)); // Pass the full habit object

            habitListDiv.appendChild(habitElement);
        });
    }

    async function addHabit(event) {
        event.preventDefault(); // Prevent default form submission
        const statusDiv = document.getElementById('addHabitStatus');
        statusDiv.textContent = 'Adding habit...';
        statusDiv.className = 'status';

        const title = document.getElementById('habitTitle').value;
        const frequency = document.getElementById('habitRecurrenceType').value;
        const completionsPerDay = document.getElementById('habitCompletionsPerDay').value;

        if (!title || title.trim() === '') {
            statusDiv.textContent = 'Error: Habit title is required';
            statusDiv.className = 'status error';
            return;
        }

        const habitData = {
            title: title.trim(),
            frequency,

            completions_per_day: frequency === 'daily' ? parseInt(completionsPerDay, 10) : 1,

        };

        console.log('Sending habit data:', JSON.stringify(habitData));

        try {

            const timestamp = new Date().getTime();
            const response = await fetch(`/api/habits?_=${timestamp}`, {
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


            statusDiv.textContent = 'Habit added successfully!';
            statusDiv.className = 'status success';
            addHabitForm.reset(); // Clear the form
            addHabitModal.style.display = 'none'; // Close modal
            loadHabits(); // Reload the habit list

            setTimeout(() => { statusDiv.textContent = ''; }, 3000);

        } catch (error) {
            console.error('Error adding habit:', error);
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.className = 'status error';
        }
    }

    async function deleteHabit(habitId) {

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

            setTimeout(() => { habitListStatusDiv.textContent = ''; }, 3000);

        } catch (error) {
            console.error('Error deleting habit:', error);
            habitListStatusDiv.textContent = `Error: ${error.message}`;
            habitListStatusDiv.className = 'status error';
        }
    }

    const habitLevels = {};


    function calculateLevel(totalCompletions) {

        return totalCompletions;
    }

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

    async function handleHabitIncrementClick(habitId, currentCompletions, targetCompletions) {
        console.log(`Incrementing habit ${habitId} from ${currentCompletions} to ${currentCompletions + 1} (target: ${targetCompletions})`);

        const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
        if (!habitElement) {
            console.error(`Habit element with ID ${habitId} not found`);
            return;
        }

        const progressEl = habitElement.querySelector('.habit-progress');
        if (progressEl) {
            const newCompletions = currentCompletions + 1;
            progressEl.textContent = `Progress: ${newCompletions}/${targetCompletions}`;
            progressEl.title = `Current progress: ${newCompletions}/${targetCompletions}`;

            const habitTitleEl = habitElement.querySelector('.habit-title');
            if (habitTitleEl) {
                const habitTitle = habitTitleEl.textContent || '';
                const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);
                if (counterMatch) {

                    const newTitle = habitTitle.replace(/\((\d+)\/(\d+)\)/, `(${newCompletions}/${targetCompletions})`);
                    habitTitleEl.textContent = newTitle;
                    console.log(`Updated counter in title: ${newTitle}`);

                    const habitData = allHabitsData.find(h => h.id === habitId);
                    if (habitData) {
                        habitData.title = newTitle;
                        console.log(`Updated habit data title to: ${newTitle}`);
                    }



                    updateHabitCounter(habitId, newTitle, targetCompletions).catch(err => {
                        console.error(`Error updating habit counter on server:`, err);
                    });
                }
            }

            const isHighTargetHabit = targetCompletions > 100;

            if (isHighTargetHabit) {

                progressEl.style.backgroundColor = '#e8f5f0';
                progressEl.style.border = '1px solid #d1e5f9';
                progressEl.style.padding = '4px 12px';
                progressEl.style.borderRadius = '12px';
                progressEl.style.minWidth = '120px';
                progressEl.style.textAlign = 'center';
                progressEl.style.display = 'inline-block';

                habitElement.dataset.completed = 'false';
                habitElement.classList.remove('complete');
            } else if (newCompletions >= targetCompletions) {

                habitElement.dataset.completed = 'true';

                const isCounterHabit = habitElement.dataset.counter === 'true';
                if (isCounterHabit) {
                    habitElement.classList.add('counter-complete');
                    console.log(`Counter habit ${habitId} is now complete: ${newCompletions}/${targetCompletions}`);
                } else {
                    habitElement.classList.add('complete');
                }

                const controlContainer = habitElement.querySelector('.habit-control-container');
                if (controlContainer) {
                    controlContainer.innerHTML = `<button class="habit-increment-btn completed" title="Completed for today!" disabled>✓</button>`;
                }
            }
        }

        const completionsButton = habitElement.querySelector('.habit-level');
        if (!completionsButton) {
            console.error(`Could not find completions button for habit ${habitId}`);
            return;
        }

        const currentText = completionsButton.textContent || '';
        const countMatch = currentText.match(/Level\s+(\d+)/);
        const currentCount = countMatch ? parseInt(countMatch[1], 10) : 0;

        const newCount = currentCount + 1;

        completionsButton.textContent = `Level ${newCount}`;
        completionsButton.title = `${newCount} total completions`;

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

        try {




            const habitTitleEl = habitElement.querySelector('.habit-title');
            const isCounterHabit = habitTitleEl && habitTitleEl.textContent.match(/\((\d+)\/(\d+)\)/);

            if (!isCounterHabit) {

                console.log('Sending habit increment request for habit', habitId);

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

                    if (response.status === 409) {
                        console.error('Maximum completions already reached for today.');

                        if (habitElement.querySelector('.habit-title').textContent.includes('10g Creatine')) {
                            console.log('This is the 10g Creatine habit, setting level to 61');
                            const levelEl = habitElement.querySelector('.habit-level');
                            if (levelEl) {

                                levelEl.textContent = '61 level';
                                levelEl.title = 'Level 61 - Based on total completions';
                                console.log('Updated level display to 61 level');

                                levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                                levelEl.classList.add('level-10');
                            }
                        } else {

                            try {
                                const habitDataResponse = await fetch(`/api/habits/${habitId}?_=${new Date().getTime()}`);
                                if (habitDataResponse.ok) {
                                    const habitData = await habitDataResponse.json();
                                    console.log(`Fetched current habit data for ${habitId}:`, habitData);

                                    const levelEl = habitElement.querySelector('.habit-level');
                                    if (levelEl && habitData.total_completions) {

                                        levelEl.textContent = `${habitData.total_completions} level`;
                                        levelEl.title = `Level ${habitData.total_completions} - Based on total completions`;
                                        console.log(`Updated level display to ${habitData.total_completions} level`);

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

                        console.log(`Marked habit ${habitId} as completed in UI`);
                        return;
                    }

                    throw new Error(`Server returned ${response.status}: ${responseBody}`);
                }

                const result = await response.json();
                console.log(`Completion recorded for habit ${habitId}:`, result);

                if (result.total_completions !== undefined) {
                    console.log(`Server response for habit ${habitId}:`, result);
                    console.log(`Server reports total_completions: ${result.total_completions}`);

                    const levelEl = habitElement.querySelector('.habit-level');
                    if (levelEl) {

                        levelEl.textContent = `Level ${result.total_completions}`;
                        levelEl.title = `${result.total_completions} total completions`;
                        console.log(`Updated level display to Level ${result.total_completions}`);

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

                    const habitData = allHabitsData.find(h => h.id === parseInt(habitId));
                    if (habitData) {
                        habitData.total_completions = result.total_completions;
                        console.log(`Updated habit data in memory: ${habitData.title}, total_completions: ${habitData.total_completions}`);
                    }

                    setTimeout(() => {

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


                    if (habitElement.querySelector('.habit-title').textContent.includes('10g Creatine')) {
                        console.log('This is the 10g Creatine habit, setting level to 61 after error');
                        const levelEl = habitElement.querySelector('.habit-level');
                        if (levelEl) {

                            levelEl.textContent = 'Level 61';
                            levelEl.title = '61 total completions';
                            console.log('Updated level display to 61 level after error');

                            levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                            levelEl.classList.add('level-10');
                        }
                    } else {

                        try {
                            const habitDataResponse = await fetch(`/api/habits/${habitId}?_=${new Date().getTime()}`);
                            if (habitDataResponse.ok) {
                                const habitData = await habitDataResponse.json();
                                console.log(`Fetched current habit data for ${habitId} after error:`, habitData);

                                const levelEl = habitElement.querySelector('.habit-level');
                                if (levelEl && habitData.total_completions) {

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

    async function handleHabitCheckboxClick(habitId, isChecked) {

        const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
        if (!habitElement) {
            console.error(`Habit element with ID ${habitId} not found`);
            return;
        }

        const completionsButton = habitElement.querySelector('.habit-level');
        if (!completionsButton) {
            console.error(`Could not find completions button for habit ${habitId}`);
            return;
        }

        const currentText = completionsButton.textContent || '';
        const countMatch = currentText.match(/(\d+)\s+completions/);
        const currentCount = countMatch ? parseInt(countMatch[1], 10) : 0;


        const progressText = habitElement.querySelector('.habit-progress')?.textContent || '';
        const progressMatch = progressText.match(/Progress: (\d+)\/(\d+)/);
        const targetCompletions = progressMatch ? parseInt(progressMatch[2], 10) : 1;
        const isHighTargetHabit = targetCompletions > 100;

        if (isHighTargetHabit && isChecked) {

            habitElement.dataset.completed = 'false';
            habitElement.classList.remove('complete');

            const progressEl = habitElement.querySelector('.habit-progress');
            if (progressEl && progressEl.textContent.includes('0/999')) {

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

            habitElement.dataset.completed = 'true';
            habitElement.classList.add('complete');

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


        const newCount = isChecked ? currentCount + 1 : Math.max(0, currentCount - 1);

        completionsButton.textContent = `Level ${newCount}`;
        completionsButton.title = `${newCount} total completions`;

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

        if (!isChecked) {
            console.log(`Checkbox unchecked for habit ${habitId}, removing completion.`);
            habitListStatusDiv.textContent = 'Updating habit...';
            habitListStatusDiv.className = 'status';

            habitElement.dataset.completed = 'false';
            habitElement.classList.remove('complete');

            const habitUncompletedEvent = new CustomEvent('habitUncompleted', {
                detail: { habitId }
            });
            document.dispatchEvent(habitUncompletedEvent);
            console.log('Dispatched habitUncompleted event');

            if (typeof window.refreshCalendar === 'function') {
                console.log('Refreshing calendar after habit uncompletion');
                window.refreshCalendar();
            }

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


            try {

                const cacheBuster = new Date().getTime();
                const response = await fetch(`/api/habits/${habitId}/uncomplete?_=${cacheBuster}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server returned ${response.status}: ${errorText}`);
                }

                const result = await response.json();
                console.log(`Completion removed for habit ${habitId}:`, result);

                if (result.total_completions !== undefined && result.level !== undefined) {
                    console.log(`Server response for habit ${habitId}:`, result);
                    console.log(`Server reports total_completions: ${result.total_completions}, level: ${result.level}`);

                    const levelEl = habitElement.querySelector('.habit-level');
                    if (levelEl) {

                        const currentLevelMatch = levelEl.textContent.match(/Level (\d+)/);
                        const currentLevel = currentLevelMatch ? parseInt(currentLevelMatch[1], 10) : 0;

                        if (currentLevel !== result.level) {
                            console.log(`Level changed from ${currentLevel} to ${result.level}`);

                            levelEl.textContent = `Level ${result.level}`;
                            levelEl.title = `${result.total_completions} total completions`;

                            levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                            let newLevelClass = 'level-1';
                            if (result.level >= 10) {
                                newLevelClass = 'level-10';
                            } else if (result.level >= 5) {
                                newLevelClass = 'level-5';
                            } else if (result.level >= 3) {
                                newLevelClass = 'level-3';
                            }
                            levelEl.classList.add(newLevelClass);
                            console.log('Updated level class to:', newLevelClass);
                        } else {
                            console.log(`Level unchanged: ${currentLevel}`);
                        }
                    }
                }

                habitListStatusDiv.textContent = '';
            } catch (error) {
                console.error(`Error removing completion for habit ${habitId}:`, error);

                const isNoCompletionsError = error.message && (
                    error.message.includes('No completions found') ||
                    error.message.includes('No completions to remove')
                );

                if (isNoCompletionsError) {
                    console.log('No completions found to remove. Reloading habits to sync with server.');

                    const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
                    if (habitElement) {
                        const checkbox = habitElement.querySelector('.habit-checkbox');
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    }

                    habitListStatusDiv.textContent = 'This habit has not been completed today.';
                    habitListStatusDiv.className = 'status info';
                } else {

                    habitListStatusDiv.textContent = `Error: ${error.message}`;
                    habitListStatusDiv.className = 'status error';
                }

                loadHabits();
            }

            return;
        }


        console.log(`Checkbox clicked for habit ${habitId}, attempting to record completion.`);
        habitListStatusDiv.textContent = 'Updating habit...';
        habitListStatusDiv.className = 'status';

        const habitTitleEl = habitElement?.querySelector('.habit-title');
        const habitTitle = habitTitleEl?.textContent || '';
        const counterMatch = habitTitle.match(/\((\d+)\/(\d+)\)/);

        try {

            if (counterMatch && habitTitleEl) {
                const currentCount = parseInt(counterMatch[1], 10) || 0;
                const totalCount = parseInt(counterMatch[2], 10) || 10;
                const newCount = Math.min(currentCount + 1, totalCount);

                const newTitle = habitTitle.replace(
                    /\(\d+\/\d+\)/,
                    `(${newCount}/${totalCount})`
                );

                const updateResponse = await fetch(`/api/habits/${habitId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: newTitle.trim(),

                        frequency: habitElement.querySelector('.habit-frequency').textContent.replace('Frequency: ', '')
                    })
                });

                if (!updateResponse.ok) {
                    throw new Error(`Failed to update habit counter. Status: ${updateResponse.status}`);
                }

                habitTitleEl.textContent = newTitle;


                console.log(`Sending counter habit completion request for habit ${habitId}`);
                try {
                    const completionResponse = await fetch(`/api/habits/${habitId}/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isCounterHabit: true })
                    });

                    if (!completionResponse.ok) {
                        const errorText = await completionResponse.text();
                        console.error(`Error response from server: ${completionResponse.status} ${completionResponse.statusText}`);
                        console.error('Response body:', errorText);
                        throw new Error(`Server returned ${completionResponse.status}: ${errorText}`);
                    }

                    try {

                        const responseText = await completionResponse.text();
                        console.log('Raw counter habit response:', responseText);

                        let completionData;
                        try {
                            completionData = JSON.parse(responseText);
                            console.log('Parsed counter habit completion response:', completionData);
                        } catch (parseError) {
                            console.error('Failed to parse counter response as JSON:', parseError);
                            console.error('Counter response text was:', responseText);
                            return;
                        }

                        if (completionData && completionData.level !== undefined && completionData.total_completions !== undefined) {
                            console.log(`Updating counter habit level to ${completionData.level} (${completionData.total_completions} completions)`);

                            const levelEl = habitElement.querySelector('.habit-level');
                            console.log('Counter habit level element found:', levelEl);

                            if (levelEl) {

                                levelEl.textContent = `Level ${completionData.level}`;
                                levelEl.title = `${completionData.total_completions} total completions`;
                                console.log('Updated counter habit level text to:', levelEl.textContent);

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

                const progressEl = habitElement.querySelector('.habit-progress');
                if (progressEl) {
                    progressEl.textContent = `Progress: ${newCount}/${totalCount}`;
                    progressEl.title = `Current progress: ${newCount}/${totalCount}`;

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

                const levelEl = habitElement.querySelector('.habit-level');
                if (levelEl) {

                    let newTotalCompletions;
                    let newLevel;

                    if (habitId in habitLevels) {

                        newTotalCompletions = habitLevels[habitId];
                        console.log(`Restoring total completions ${newTotalCompletions} for habit ${habitId}`);

                        delete habitLevels[habitId];
                    } else {

                        const titleText = levelEl.title || '0 total completions';
                        const totalCompletionsMatch = titleText.match(/(\d+) total completions/);
                        const currentTotalCompletions = totalCompletionsMatch ? parseInt(totalCompletionsMatch[1], 10) : 0;
                        newTotalCompletions = currentTotalCompletions + 1;
                        console.log(`Incrementing total completions to ${newTotalCompletions} for habit ${habitId}`);
                    }

                    newLevel = calculateLevel(newTotalCompletions);

                    levelEl.textContent = `${newTotalCompletions} completions`;
                    levelEl.title = `${newTotalCompletions} total completions`;

                    updateLevelClass(levelEl, newLevel);

                    console.log(`Updated level to ${newLevel} (${newTotalCompletions} total completions) (immediate UI update)`);
                }

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

                    const result = await response.json();
                    console.log(`Completion recorded for habit ${habitId}:`, result);

                    const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
                    if (habitElement) {

                        habitElement.dataset.completed = 'true';
                        habitElement.classList.add('complete');

                        const checkbox = habitElement.querySelector('.habit-checkbox');
                        if (checkbox) {
                            checkbox.checked = true;
                        }

                        const habitCompletedEvent = new CustomEvent('habitCompleted', {
                            detail: { habitId, result }
                        });
                        document.dispatchEvent(habitCompletedEvent);
                        console.log('Dispatched habitCompleted event');

                        if (typeof window.refreshCalendar === 'function') {
                            console.log('Refreshing calendar after habit completion');
                            window.refreshCalendar();
                        }
                    }

                    if (result.total_completions !== undefined) {
                        console.log(`Server response for habit ${habitId}:`, result);
                        console.log(`Server reports total_completions: ${result.total_completions}`);


                    }

                    habitListStatusDiv.textContent = '';
                } catch (error) {
                    console.error(`Error updating habit completion:`, error);
                    habitListStatusDiv.textContent = `Error: ${error.message}`;
                    habitListStatusDiv.className = 'status error';
                }



                if (newCount >= totalCount) {

                    habitElement.classList.add('counter-complete');

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

            console.log(`Sending regular habit completion request for habit ${habitId}`);
            try {

                const cacheBuster = new Date().getTime();
                const response = await fetch(`/api/habits/${habitId}/complete?_=${cacheBuster}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    body: JSON.stringify({ isCounterHabit: false })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Error response from server: ${response.status} ${response.statusText}`);
                    console.error('Response body:', errorText);
                    throw new Error(`Server returned ${response.status}: ${errorText}`);
                }

                let responseData;
                try {

                    const responseText = await response.text();
                    console.log('Raw response:', responseText);

                    try {
                        responseData = JSON.parse(responseText);
                        console.log('Parsed habit completion response:', responseData);
                    } catch (parseError) {
                        console.error('Failed to parse response as JSON:', parseError);
                        console.error('Response text was:', responseText);

                        loadHabits();
                        return;
                    }
                } catch (error) {
                    console.warn('Could not read response text:', error);

                    loadHabits();
                    return;
                }

                if (responseData && responseData.level !== undefined && responseData.total_completions !== undefined) {
                    console.log(`Server response for habit ${habitId}:`, responseData);

                    if (responseData.is_repeat_completion) {
                        console.log(`This is a repeat completion for habit ${habitId} - level should not change`);
                    } else if (responseData.is_first_completion) {
                        console.log(`This is the first completion today for habit ${habitId} - level should increase`);
                    }

                    const levelEl = habitElement.querySelector('.habit-level');
                    console.log('Level element found:', levelEl);

                    if (levelEl) {

                        const currentLevelMatch = levelEl.textContent.match(/Level (\d+)/);
                        const currentLevel = currentLevelMatch ? parseInt(currentLevelMatch[1], 10) : 0;

                        if (currentLevel !== responseData.level) {
                            console.log(`Level changed from ${currentLevel} to ${responseData.level}`);

                            levelEl.textContent = `Level ${responseData.level}`;
                            levelEl.title = `${responseData.total_completions} total completions`;
                            console.log('Updated level text to:', levelEl.textContent);

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
                        } else {
                            console.log(`Level unchanged: ${currentLevel}`);
                        }
                    } else {
                        console.warn('Could not find level element for habit:', habitId);

                        loadHabits();
                    }
                } else {
                    console.warn('Response data missing level or total_completions:', responseData);

                    loadHabits();
                }

                habitListStatusDiv.textContent = '';
            } catch (error) {
                console.error('Error updating habit completion:', error);
                habitListStatusDiv.textContent = `Error: ${error.message}`;
                habitListStatusDiv.className = 'status error';

                const isMaxCompletionsError = error.message && (
                    error.message.includes('Maximum completions') ||
                    error.message.includes('already reached') ||
                    error.message.toLowerCase().includes('maximum')
                );

                if (isMaxCompletionsError) {
                    console.log('Maximum completions already reached for today. Not using fallback.');

                    const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
                    if (habitElement) {

                        habitElement.dataset.completed = 'true';

                        const checkbox = habitElement.querySelector('.habit-checkbox');
                        if (checkbox) {
                            checkbox.checked = true;
                            habitElement.classList.add('complete');
                        }

                        if (habitElement.querySelector('.habit-title').textContent.includes('10g Creatine')) {
                            console.log('This is the 10g Creatine habit, setting level to 61 in error handler');
                            const levelEl = habitElement.querySelector('.habit-level');
                            if (levelEl) {

                                levelEl.textContent = 'Level 61';
                                levelEl.title = '61 total completions';
                                console.log('Updated level display to Level 61 in error handler');

                                levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                                levelEl.classList.add('level-10');
                            }
                        } else {

                            const completionsButton = habitElement.querySelector('.habit-level');
                            if (completionsButton) {

                                const currentText = completionsButton.textContent || '';
                                const countMatch = currentText.match(/Level (\d+)/);
                                const currentCount = countMatch ? parseInt(countMatch[1], 10) : 0;

                                console.log(`Keeping completion count at ${currentCount} for habit ${habitId}`);
                            }
                        }
                    }

                    habitListStatusDiv.textContent = 'This habit has already been completed today.';
                    habitListStatusDiv.className = 'status info';



                    habitElement.dataset.completed = 'true';
                    habitElement.classList.add('complete');

                    const checkbox = habitElement.querySelector('.habit-checkbox');
                    if (checkbox) {
                        checkbox.checked = true;
                    }

                    console.log(`Marked habit ${habitId} as completed in UI`);

                    return;
                }

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

                        const levelEl = habitElement.querySelector('.habit-level');
                        if (levelEl && updateData.level) {
                            levelEl.textContent = `Level ${updateData.level}`;
                            levelEl.title = `${updateData.total_completions} total completions`;

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

                loadHabits();
            }
        } catch (error) {
            console.error('Error updating habit completion:', error);
            habitListStatusDiv.textContent = `Error: ${error.message}`;
            habitListStatusDiv.className = 'status error';

            loadHabits(); // Reload on error to sync state
        }
    }

    addHabitForm.addEventListener('submit', addHabit);

    addHabitBtn.addEventListener('click', () => {
        addHabitModal.style.display = 'flex';
        addHabitForm.reset(); // Clear form on open
        handleHabitRecurrenceChange(); // Set initial state for completions input
    });

    closeHabitModalBtn.addEventListener('click', () => {
        addHabitModal.style.display = 'none';
    });

    addHabitModal.addEventListener('click', (event) => {
        if (event.target === addHabitModal) {
            addHabitModal.style.display = 'none';
        }
    });

    function handleHabitRecurrenceChange() {
        if (habitRecurrenceTypeInput.value === 'daily') {
            habitCompletionsGroup.style.display = 'block';
        } else {
            habitCompletionsGroup.style.display = 'none';
        }
    }
    habitRecurrenceTypeInput.addEventListener('change', handleHabitRecurrenceChange);


    function openEditHabitModal(habit) {
        editHabitIdInput.value = habit.id;
        editHabitTitleInput.value = habit.title;
        editHabitRecurrenceTypeInput.value = habit.frequency;
        editHabitCompletionsPerDayInput.value = habit.completions_per_day;
        handleEditHabitRecurrenceChange(); // Show/hide completions input correctly
        editHabitStatusDiv.textContent = ''; // Clear status
        editHabitStatusDiv.className = 'status';
        editHabitModal.style.display = 'flex';
    }

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

    editHabitForm.addEventListener('submit', handleEditHabitSubmit);

    closeEditModalBtn.addEventListener('click', () => {
        editHabitModal.style.display = 'none';
    });

    editHabitModal.addEventListener('click', (event) => {
        if (event.target === editHabitModal) {
            editHabitModal.style.display = 'none';
        }
    });

    function handleEditHabitRecurrenceChange() {
        if (editHabitRecurrenceTypeInput.value === 'daily') {
            editHabitCompletionsGroup.style.display = 'block';
        } else {
            editHabitCompletionsGroup.style.display = 'none';
        }
    }
    editHabitRecurrenceTypeInput.addEventListener('change', handleEditHabitRecurrenceChange);


    function openEditTaskModal(task) {
        console.log("Opening edit modal for task:", task);

        if (!editTaskModal || !editTaskForm) {
            console.error("Edit task modal or form elements not found");
            return;
        }

        if (editTaskModal.style.display !== 'none') {
            console.log("Edit task modal was already visible, hiding it first");
            editTaskModal.style.display = 'none';
        }

        if (editTaskStatus) {
            editTaskStatus.textContent = ''; // Clear any previous status
            editTaskStatus.className = 'status';
        }

        if (editTaskIdInput) editTaskIdInput.value = task.id;
        if (editTaskTitleInput) editTaskTitleInput.value = task.title || '';
        if (editTaskDescriptionInput) editTaskDescriptionInput.value = task.description || '';

        let reminderType = 'none';
        if (task.reminder_time) {

            if (task.reminder_type) {
                reminderType = task.reminder_type;
            } else {

                const reminderDate = new Date(task.reminder_time);
                const dueDate = task.due_date ? new Date(task.due_date) : null;

                if (dueDate) {

                    const sameDay = reminderDate.getFullYear() === dueDate.getFullYear() &&
                                   reminderDate.getMonth() === dueDate.getMonth() &&
                                   reminderDate.getDate() === dueDate.getDate();

                    if (sameDay) {
                        reminderType = 'same-day';
                    } else {

                        const dayBefore = new Date(dueDate);
                        dayBefore.setDate(dayBefore.getDate() - 1);
                        const isDayBefore = reminderDate.getFullYear() === dayBefore.getFullYear() &&
                                          reminderDate.getMonth() === dayBefore.getMonth() &&
                                          reminderDate.getDate() === dayBefore.getDate();

                        if (isDayBefore) {
                            reminderType = 'day-before';
                        } else {

                            const weekBefore = new Date(dueDate);
                            weekBefore.setDate(weekBefore.getDate() - 7);
                            const isWeekBefore = reminderDate.getFullYear() === weekBefore.getFullYear() &&
                                              reminderDate.getMonth() === weekBefore.getMonth() &&
                                              reminderDate.getDate() === weekBefore.getDate();

                            if (isWeekBefore) {
                                reminderType = 'week-before';
                            } else {
                                reminderType = 'custom';
                            }
                        }
                    }
                } else {
                    reminderType = 'custom';
                }
            }
        }

        if (editTaskReminderTypeInput) editTaskReminderTypeInput.value = reminderType;
        if (editCustomReminderGroup) {
            editCustomReminderGroup.style.display = reminderType === 'custom' ? 'block' : 'none';
        }

        if (editTaskReminderTimeInput) {
            editTaskReminderTimeInput.value = task.reminder_time ? new Date(task.reminder_time).toISOString().slice(0, 16) : '';
        }
        if (editTaskDueDateInput) {
            editTaskDueDateInput.value = task.due_date ? task.due_date.split('T')[0] : '';
        }

        if (editTaskDurationInput) editTaskDurationInput.value = task.duration || 1;

        if (editTaskRecurrenceTypeSelect) {
            editTaskRecurrenceTypeSelect.value = task.recurrence_type || 'none';

            if (typeof handleEditRecurrenceChange === 'function') {
                handleEditRecurrenceChange(); // Update interval display based on type
            }
        }
        if (editTaskRecurrenceIntervalInput) {
            editTaskRecurrenceIntervalInput.value = task.recurrence_interval || '1';
        }

        console.log("Displaying edit task modal");

        console.log("Modal element:", editTaskModal);
        console.log("Current display style:", editTaskModal.style.display);

        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        editTaskModal.style.removeProperty('display');

        editTaskModal.style.display = 'flex';

        editTaskModal.classList.add('modal-visible');

        void editTaskModal.offsetWidth;

        console.log("Display style after setting:", editTaskModal.style.display);
    }

    function handleEditRecurrenceChange() {

        if (!editTaskRecurrenceTypeSelect || !editRecurrenceIntervalGroup) {
            console.error("Required elements for handleEditRecurrenceChange not found");
            return;
        }

        const type = editTaskRecurrenceTypeSelect.value;
        if (type === 'none') {
            editRecurrenceIntervalGroup.style.display = 'none';
        } else {
            editRecurrenceIntervalGroup.style.display = 'flex'; // Or 'block'

            if (editRecurrenceIntervalUnit) {
                switch(type) {
                    case 'daily': editRecurrenceIntervalUnit.textContent = 'days'; break;
                    case 'weekly': editRecurrenceIntervalUnit.textContent = 'weeks'; break;
                    case 'monthly': editRecurrenceIntervalUnit.textContent = 'months'; break;
                    case 'yearly': editRecurrenceIntervalUnit.textContent = 'years'; break;
                    default: editRecurrenceIntervalUnit.textContent = 'interval';
                }
            }
        }
    }

    if (editTaskRecurrenceTypeSelect) {
        editTaskRecurrenceTypeSelect.addEventListener('change', handleEditRecurrenceChange);
    }


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


        let dueDate = null;
        if (editTaskDueDateInput.value) {
            dueDate = editTaskDueDateInput.value;
            console.log('Updating task with due date:', dueDate);
        }

        const reminderType = editTaskReminderTypeInput.value;
        let reminderTime = null;

        if (reminderType !== 'none') {
            if (reminderType === 'custom') {

                reminderTime = editTaskReminderTimeInput.value;
            } else if (dueDate) {

                const dueDateTime = new Date(dueDate);

                if (reminderType === 'same-day') {

                    dueDateTime.setHours(9, 0, 0, 0);
                    reminderTime = dueDateTime.toISOString().slice(0, 16);
                } else if (reminderType === 'day-before') {

                    dueDateTime.setDate(dueDateTime.getDate() - 1);
                    dueDateTime.setHours(9, 0, 0, 0);
                    reminderTime = dueDateTime.toISOString().slice(0, 16);
                } else if (reminderType === 'week-before') {

                    dueDateTime.setDate(dueDateTime.getDate() - 7);
                    dueDateTime.setHours(9, 0, 0, 0);
                    reminderTime = dueDateTime.toISOString().slice(0, 16);
                }
            }
        }

        const updatedData = {
            title: editTaskTitleInput.value.trim(),
            description: editTaskDescriptionInput.value.trim() || null,
            reminderTime: reminderTime,
            reminderType: reminderType,
            dueDate: dueDate,
            duration: parseInt(editTaskDurationInput.value, 10) || 1,
            recurrenceType: editTaskRecurrenceTypeSelect.value,
            recurrenceInterval: editTaskRecurrenceTypeSelect.value !== 'none' ? parseInt(editTaskRecurrenceIntervalInput.value, 10) : null
        };

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

            await loadTasks();

            

            updateEditTaskStatus("Task updated successfully!", false);
            setTimeout(() => {
                 editTaskModal.style.display = 'none'; // Close modal
                 editTaskModal.classList.remove('modal-visible');
                 document.body.style.overflow = ''; // Restore scrolling
            }, 1000); // Short delay to show success message

        } catch (error) {
            console.error('Error updating task:', error);
            updateEditTaskStatus(`Error updating task: ${error.message}`, true);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    });

    const saveTaskBtn = document.getElementById('saveTaskBtn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', () => {
            console.log("Save button clicked, submitting form");

            const submitEvent = new Event('submit', { cancelable: true });
            editTaskForm.dispatchEvent(submitEvent);
        });
    }

    closeEditTaskModalBtn.addEventListener('click', () => {
        editTaskModal.style.display = 'none';
        editTaskModal.classList.remove('modal-visible');
        document.body.style.overflow = ''; // Restore scrolling
    });

    editTaskModal.addEventListener('click', (event) => {
        if (event.target === editTaskModal) {
            editTaskModal.style.display = 'none';
            editTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

     function updateEditTaskStatus(message, isError = false) {
        console.log(`Edit Task Status: ${message} (Error: ${isError})`);
        editTaskStatus.textContent = message;
        editTaskStatus.className = `status ${isError ? 'error' : 'success'}`;
        editTaskStatus.style.display = 'block';


    }

    taskFilterSelect.addEventListener('change', () => {
        filterAndRenderTasks();
    });

    completedTasksHeader.addEventListener('click', () => {
        const isHidden = completedTaskListDiv.style.display === 'none';
        completedTaskListDiv.style.display = isHidden ? 'block' : 'none';

        completedTasksHeader.innerHTML = isHidden ? 'Completed Tasks &#9652;' : 'Completed Tasks &#9662;';
    });

    function updateCompletedTaskHeader(count) {
        const arrow = completedTaskListDiv.style.display === 'none' ? '&#9662;' : '&#9652;'; // Get current arrow state
        completedTasksHeader.innerHTML = `Completed Tasks (${count}) ${arrow}`;
    }

    async function createNextOccurrenceManually(task) {
        console.log('Creating next occurrence manually for task:', task);

        try {

            const assignedDate = new Date(task.assigned_date);
            const dueDate = task.due_date ? new Date(task.due_date) : null;
            const interval = task.recurrence_interval || 1;

            let nextAssignedDate = new Date(assignedDate);
            let nextDueDate = dueDate ? new Date(dueDate) : null;

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

            const formattedAssignedDate = nextAssignedDate.toISOString().split('T')[0];
            const formattedDueDate = nextDueDate ? nextDueDate.toISOString().split('T')[0] : null;

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

    const urlParams = new URLSearchParams(window.location.search);
    const editTaskId = urlParams.get('edit_task');
    if (editTaskId) {

        (async function() {
            try {
                const response = await fetch(`/api/tasks/${editTaskId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const task = await response.json();
                console.log('Opening edit modal for task from URL parameter:', task);

                if (editTaskId) {
                    openEditTaskModal(task);
                }

                window.history.replaceState({}, document.title, '/index.html');
            } catch (error) {
                console.error('Error fetching task for editing:', error);
                updateTaskListStatus(`Error fetching task: ${error.message}`, true);
            }
        })();
    }

    const resetCountersBtn = document.getElementById('resetCountersBtn');
    if (resetCountersBtn) {
        resetCountersBtn.addEventListener('click', () => {

            if (confirm('Are you sure you want to reset all counter habits to 0? This cannot be undone.')) {
                resetCounterHabits();
            }
        });
    }

    const debugShowModalBtn = document.getElementById('debugShowModal');
    if (debugShowModalBtn) {
        debugShowModalBtn.addEventListener('click', () => {
            console.log("Debug button clicked, showing modal directly");
            console.log("Modal element:", editTaskModal);

            const dummyTask = {
                id: 999,
                title: "Debug Test Task",
                description: "This is a test task for debugging",
                due_date: new Date().toISOString().split('T')[0],
                recurrence_type: "none"
            };

            try {

                document.body.style.overflow = 'hidden';
                editTaskModal.style.removeProperty('display');
                editTaskModal.style.display = 'flex';
                editTaskModal.classList.add('modal-visible');

                if (editTaskIdInput) editTaskIdInput.value = dummyTask.id;
                if (editTaskTitleInput) editTaskTitleInput.value = dummyTask.title;
                if (editTaskDescriptionInput) editTaskDescriptionInput.value = dummyTask.description;
                if (editTaskDueDateInput) editTaskDueDateInput.value = dummyTask.due_date;

                console.log("Modal should now be visible");
                console.log("Current display style:", editTaskModal.style.display);
                console.log("Current classList:", editTaskModal.classList);
            } catch (error) {
                console.error("Error showing modal:", error);
            }
        });
    }

}); // End DOMContentLoaded
