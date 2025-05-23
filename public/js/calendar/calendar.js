
document.addEventListener('DOMContentLoaded', () => {
    console.log('Calendar.js: DOM content loaded');

    window.lastRenderedMonth = null;
    window.lastRenderedYear = null;
    window.isCurrentlyRendering = false;
    window.forceRender = false;

    // Store today's date to check for date changes
    window.lastCheckedDate = new Date().toDateString();

    const currentMonthYearEl = document.getElementById('currentMonthYear');

    let calendarGridEl = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const calendarStatusEl = document.getElementById('calendarStatus');
    const selectedDateTasksEl = document.getElementById('selectedDateTasks');
    const selectedDateDisplayEl = document.getElementById('selectedDateDisplay');
    const selectedTaskListEl = document.getElementById('selectedTaskList');
    const closeSelectedDateViewBtn = document.getElementById('closeSelectedDateView');

    console.log('Calendar.js: Initializing edit task modal elements');
    const editTaskModal = document.getElementById('edit-task-modal');
    console.log('Edit task modal element:', editTaskModal);

    const editTaskForm = document.getElementById('edit-task-form');
    console.log('Edit task form element:', editTaskForm);

    const editTaskIdInput = document.getElementById('edit-task-id');
    const editTaskTitleInput = document.getElementById('edit-task-title');
    const editTaskDescriptionInput = document.getElementById('edit-task-description');
    const editTaskReminderTimeInput = document.getElementById('edit-task-reminder-time');
    const editTaskAssignedDateInput = document.getElementById('edit-task-assigned-date');
    const editTaskDueDateInput = document.getElementById('edit-task-due-date');
    const editTaskRecurrenceTypeSelect = document.getElementById('edit-task-recurrence-type');
    const editTaskRecurrenceIntervalInput = document.getElementById('edit-task-recurrence-interval');
    const editTaskRecurrenceIntervalContainer = document.getElementById('edit-recurrence-interval-container');
    const editTaskRecurrenceIntervalUnit = document.getElementById('edit-recurrence-interval-unit');
    const editTaskStatus = document.getElementById('edit-task-status');
    const closeEditTaskModalBtn = editTaskModal ? editTaskModal.querySelector('.close-button') : null;

    console.log('Edit task ID input element:', editTaskIdInput);
    console.log('Edit task title input element:', editTaskTitleInput);
    console.log('Edit task description input element:', editTaskDescriptionInput);
    console.log('Edit task reminder time input element:', editTaskReminderTimeInput);
    console.log('Edit task assigned date input element:', editTaskAssignedDateInput);
    console.log('Edit task due date input element:', editTaskDueDateInput);
    console.log('Edit task recurrence type select element:', editTaskRecurrenceTypeSelect);
    console.log('Edit task recurrence interval input element:', editTaskRecurrenceIntervalInput);
    console.log('Edit task recurrence interval container element:', editTaskRecurrenceIntervalContainer);
    console.log('Edit task recurrence interval unit element:', editTaskRecurrenceIntervalUnit);
    console.log('Edit task status element:', editTaskStatus);
    console.log('Close edit task modal button element:', closeEditTaskModalBtn);

    function updateEditTaskStatus(message, isError = false) {
        if (!editTaskStatus) return;

        editTaskStatus.textContent = message;
        editTaskStatus.className = 'status';

        if (message) {
            editTaskStatus.classList.add(isError ? 'error' : 'success');
            editTaskStatus.style.display = 'block';
        } else {
            editTaskStatus.style.display = 'none';
        }
    }

    window.currentDate = new Date(); // State for the currently viewed month/year - make globally accessible
    let allTasks = []; // Store fetched tasks
    let allHabits = []; // Store fetched habits
    let habitCompletions = {}; // Store habit completions by date
    let calendarFilter = 'both'; // Default filter value (both, tasks, habits)


    function updateStatus(message, isError = false) {
        console.log(`Calendar Status: ${message} (Error: ${isError})`);
        calendarStatusEl.textContent = message;
        calendarStatusEl.className = `status ${isError ? 'error' : 'success'}`;
        calendarStatusEl.style.display = message ? 'block' : 'none';
    }

    function updateEditTaskStatus(message, isError = false) {
        if (!editTaskStatus) return;

        console.log(`Edit Task Status: ${message} (Error: ${isError})`);
        editTaskStatus.textContent = message;
        editTaskStatus.className = `status ${isError ? 'error' : 'success'}`;
        editTaskStatus.style.display = message ? 'block' : 'none';
    }

    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function calculateNextOccurrence(task) {
        if (!task.recurrence_type || task.recurrence_type === 'none' || !task.assigned_date) {
            return null;
        }

        const assignedDate = new Date(task.assigned_date);
        if (isNaN(assignedDate.getTime())) {
            console.warn(`Invalid assigned_date for task ${task.id}: ${task.assigned_date}`);
            return null;
        }

        const interval = task.recurrence_interval || 1;

        const nextDate = new Date(assignedDate);

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


    window.fetchTasks = async function(forceReload = false) {
        updateStatus("Loading tasks...", false);
        try {


            const timestamp = new Date().getTime();
            const url = `/api/tasks?relevantDates=true&_cache=${timestamp}`;

            console.log(`Fetching tasks with URL: ${url} (forceReload: ${forceReload})`);

            const response = await fetch(url, {
                cache: 'no-cache',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            allTasks = await response.json();
            console.log("Tasks fetched for calendar:", allTasks);

            const recurringTasks = allTasks.filter(task => task.recurrence_type && task.recurrence_type !== 'none');
            console.log(`Found ${recurringTasks.length} recurring tasks:`, recurringTasks);

            const tasksWithAssignedDates = allTasks.filter(task => task.assigned_date);
            console.log(`Found ${tasksWithAssignedDates.length} tasks with assigned dates:`,
                tasksWithAssignedDates.map(t => ({
                    id: t.id,
                    title: t.title,
                    assigned_date: t.assigned_date,
                    due_date: t.due_date
                }))
            );

            updateStatus("", false); // Clear loading message

            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

            return allTasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            updateStatus("Error loading tasks.", true);
            allTasks = []; // Ensure tasks array is empty on error
            return [];
        }
    }

    async function fetchCompletionsDirectly(startDate, endDate) {
        try {
            console.log(`Fetching completions directly for date range: ${startDate} to ${endDate}`);

            const habitsResponse = await fetch('/api/habits');
            if (!habitsResponse.ok) {
                throw new Error(`HTTP error! status: ${habitsResponse.status}`);
            }

            const habitsData = await habitsResponse.json();
            allHabits = habitsData || [];
            console.log("Fetched habits directly:", allHabits);

            habitCompletions = {};

            const todayKey = formatDateKey(new Date());
            console.log(`Today's date key: ${todayKey}`);

            habitCompletions[todayKey] = [];

            allHabits.forEach(habit => {

                const completionsToday = parseInt(habit.completions_today) || 0;
                console.log(`Habit ${habit.id} (${habit.title}) has ${completionsToday} completions today`);

                const completionsTarget = parseInt(habit.completions_per_day) || 1;

                habitCompletions[todayKey].push({
                    habitId: habit.id,
                    title: habit.title,
                    count: completionsToday, // Use the actual completions count from the API
                    target: completionsTarget // Use the correct target from the habit data
                });

                console.log(`Added habit ${habit.id} (${habit.title}) to today with ${completionsToday}/${completionsTarget} completions`);
            });

            try {

                const completionsResponse = await fetch(`/api/habits/completions?startDate=${startDate}&endDate=${endDate}`);

                if (completionsResponse.ok) {
                    const completionsData = await completionsResponse.json();
                    console.log("Fetched completions data for date range:", completionsData);

                    if (completionsData && completionsData.completionsByDate) {

                        for (const dateKey in completionsData.completionsByDate) {

                            if (dateKey === todayKey) continue;

                            habitCompletions[dateKey] = completionsData.completionsByDate[dateKey];
                        }
                    }
                } else {
                    console.log("Completions API failed for date range, but we'll still show habits for today");
                }
            } catch (completionsError) {
                console.error("Error fetching completions for date range:", completionsError);
                console.log("Continuing with values for today's habits only");
            }

            console.log("Directly fetched completions:", habitCompletions);
            return { habits: allHabits, completions: habitCompletions };
        } catch (error) {
            console.error('Error fetching completions directly:', error);

            try {

                if (allHabits.length > 0) {
                    const todayKey = formatDateKey(new Date());
                    habitCompletions = {};
                    habitCompletions[todayKey] = [];

                    allHabits.forEach(habit => {
                        habitCompletions[todayKey].push({
                            habitId: habit.id,
                            title: habit.title,
                            count: 0,
                            target: habit.completions_per_day || 1
                        });
                    });

                    return { habits: allHabits, completions: habitCompletions };
                }
            } catch (fallbackError) {
                console.error('Error in fallback for today\'s habits:', fallbackError);
            }

            return { habits: [], completions: {} };
        }
    }


    window.fetchHabits = async function(year, month) {
        try {
            console.log("Fetching habits for", year, month);

            if (isNaN(year) || isNaN(month)) {
                console.error("Invalid year or month:", year, month);
                return { habits: [], completions: {} };
            }


            const firstDayOfMonth = new Date(year, month, 1);
            const lastDayOfMonth = new Date(year, month + 1, 0);

            console.log("First day of month:", firstDayOfMonth);
            console.log("Last day of month:", lastDayOfMonth);

            const startDate = new Date(firstDayOfMonth);
            startDate.setDate(startDate.getDate() - 7); // Go back a week to be safe

            const endDate = new Date(lastDayOfMonth);
            endDate.setDate(endDate.getDate() + 7); // Go forward a week to be safe

            console.log("Start date:", startDate);
            console.log("End date:", endDate);

            let startDateStr, endDateStr;
            try {
                startDateStr = startDate.toISOString().split('T')[0];
                endDateStr = endDate.toISOString().split('T')[0];
            } catch (e) {
                console.error("Error formatting dates:", e);

                const today = new Date();
                startDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
                endDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-28`;
            }

            console.log(`Fetching habits for date range: ${startDateStr} to ${endDateStr}`);

            console.log('Fetching all habits first');
            const habitsResponse = await fetch('/api/habits');
            if (!habitsResponse.ok) {
                throw new Error(`HTTP error fetching habits! status: ${habitsResponse.status}`);
            }

            const habitsData = await habitsResponse.json();
            console.log('Successfully fetched habits:', habitsData);
            allHabits = habitsData || [];


            console.log("Using direct completion fetching for better performance...");
            await fetchCompletionsDirectly(startDateStr, endDateStr);

            return { habits: allHabits, completions: habitCompletions };
        } catch (error) {
            console.error('Error loading habits:', error);
            allHabits = [];
            habitCompletions = {};
            return { habits: [], completions: {} };
        }
    }

    window.lastRenderedMonth = null;
    window.lastRenderedYear = null;
    window.isCurrentlyRendering = false;


    // Function to check if the date has changed and refresh if needed
    function checkDateChange() {
        const currentDate = new Date().toDateString();
        if (window.lastCheckedDate !== currentDate) {
            console.log('Date has changed from', window.lastCheckedDate, 'to', currentDate);
            window.lastCheckedDate = currentDate;
            window.forceRender = true;
            const currentDateObj = new Date();
            renderCalendar(currentDateObj.getFullYear(), currentDateObj.getMonth());
        }
    }

    // Check for date changes when the page becomes visible
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkDateChange();
        }
    });

    // Also check periodically while the page is open
    setInterval(checkDateChange, 60000); // Check every minute

    window.renderCalendar = async function(year, month) {

        const monthYearKey = `${year}-${month}`;
        if (window.lastRenderedMonth === monthYearKey && !window.forceRender) {
            console.log(`Calendar for ${monthYearKey} already rendered, skipping duplicate render`);
            return;
        }

        if (window.isCurrentlyRendering) {
            console.log("Calendar is already being rendered, skipping this render request");
            return;
        }

        window.isCurrentlyRendering = true;
        window.forceRender = false; // Reset force render flag
        window.lastRenderedMonth = monthYearKey;
        window.lastRenderedYear = year;

        updateStatus("Rendering calendar...", false);
        console.log("Rendering calendar for", year, month);

        try {

            if (!calendarGridEl) {
                console.log("Calendar grid not found, looking for it again");
                calendarGridEl = document.getElementById('calendar-grid');

                if (!calendarGridEl) {
                    console.log("Creating new calendar grid");
                    const container = document.querySelector('.container');
                    if (!container) {
                        console.error("Container not found, cannot render calendar");
                        window.isCurrentlyRendering = false;
                        return;
                    }

                    const calendarFilter = document.querySelector('.calendar-filter');
                    const calendarStatus = document.getElementById('calendarStatus');

                    calendarGridEl = document.createElement('div');
                    calendarGridEl.id = 'calendar-grid';
                    calendarGridEl.className = 'calendar-grid';

                    if (calendarStatus) {
                        container.insertBefore(calendarGridEl, calendarStatus);
                    } else if (calendarFilter) {
                        container.insertBefore(calendarGridEl, calendarFilter.nextSibling);
                    } else {
                        container.appendChild(calendarGridEl);
                    }
                }
            }

            console.log("Clearing calendar grid");
            calendarGridEl.innerHTML = '';

            console.log("Adding day headers");
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            days.forEach(day => {
                const headerEl = document.createElement('div');
                headerEl.className = 'calendar-header';
                headerEl.textContent = day;
                calendarGridEl.appendChild(headerEl);
            });

            selectedDateTasksEl.style.display = 'none'; // Hide date detail view

            const firstDayOfMonth = new Date(year, month, 1);
            const lastDayOfMonth = new Date(year, month + 1, 0);
            const daysInMonth = lastDayOfMonth.getDate();
            const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon, ...

            currentMonthYearEl.textContent = firstDayOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

            const today = new Date();
            const todayKey = formatDateKey(today);

            await fetchHabits(year, month);

            const tasksByDate = {};

            allTasks.forEach(task => {
                const dates = [];


                if (task.recurrence_type && task.recurrence_type !== 'none') {


                    if (task.is_complete) {


                        console.log(`Checking if next occurrence exists for task ${task.id} (${task.title})`);

                        const nextOccurrenceExists = allTasks.some(otherTask => {

                            if (otherTask.id === task.id) return false;

                            const isNextOccurrence = (
                                otherTask.title === task.title &&
                                otherTask.recurrence_type === task.recurrence_type &&
                                otherTask.recurrence_interval === task.recurrence_interval &&
                                !otherTask.is_complete
                            );

                            if (isNextOccurrence) {
                                console.log(`Found existing next occurrence: Task ${otherTask.id} (${otherTask.title})`);
                            }

                            return isNextOccurrence;
                        });

                        console.log(`Next occurrence exists for task ${task.id}? ${nextOccurrenceExists}`);

                        if (!nextOccurrenceExists) {
                            const nextOccurrence = calculateNextOccurrence(task);
                            if (nextOccurrence) {

                                const nextTask = { ...task };
                                nextTask.assigned_date = formatDateKey(nextOccurrence);
                                nextTask.due_date = formatDateKey(nextOccurrence); // Also update the due date
                                nextTask.is_complete = false; // Next occurrence is not complete
                                nextTask.isRecurring = true;  // Mark as a recurring instance

                                const nextDateKey = formatDateKey(nextOccurrence);
                                dates.push(nextDateKey);

                                const isInCurrentMonth = (
                                    nextOccurrence.getFullYear() === year &&
                                    nextOccurrence.getMonth() === month
                                );

                                const today = new Date();
                                today.setHours(0, 0, 0, 0); // Reset time to start of day
                                const isOverdue = nextOccurrence < today;
                                if (isOverdue) {
                                    nextTask.isOverdue = true; // Mark as overdue for styling
                                }

                                console.log(`Adding next occurrence of task ${task.id} on ${nextDateKey} (overdue: ${isOverdue})`);

                                if (!tasksByDate[nextDateKey]) {
                                    tasksByDate[nextDateKey] = [];
                                }
                                tasksByDate[nextDateKey].push(nextTask);
                            }
                        }
                    } else {


                        console.log(`Processing incomplete recurring task ${task.id} (${task.title}) with assigned_date ${task.assigned_date}`);
                    }
                }

                if (task.assigned_date) {
                    try {

                        const assignedDateKey = task.assigned_date.split('T')[0];
                        dates.push(assignedDateKey);


                        if (!tasksByDate[assignedDateKey]) {
                            tasksByDate[assignedDateKey] = [];
                        }

                        const taskAlreadyAdded = tasksByDate[assignedDateKey].some(t => t.id === task.id);
                        if (!taskAlreadyAdded) {
                            console.log(`Adding task ${task.id} (${task.title}) to date ${assignedDateKey}`);
                            tasksByDate[assignedDateKey].push(task);
                        }
                    } catch (e) {
                        console.warn(`Invalid assigned_date format for task ${task.id}: ${task.assigned_date}`);
                    }
                } else if (!task.due_date && !task.is_complete) {
                    // Add tasks without due dates to today's date
                    // We'll use the current date (today) regardless of when the calendar was loaded
                    const currentTodayKey = formatDateKey(new Date());
                    if (!tasksByDate[currentTodayKey]) {
                        tasksByDate[currentTodayKey] = [];
                    }

                    const taskAlreadyAdded = tasksByDate[currentTodayKey].some(t => t.id === task.id);
                    if (!taskAlreadyAdded) {
                        console.log(`Adding task without due date ${task.id} (${task.title}) to today's date ${currentTodayKey}`);
                        tasksByDate[currentTodayKey].push(task);
                    }
                }
            });

            const prevMonthLastDay = new Date(year, month, 0);
            const daysInPrevMonth = prevMonthLastDay.getDate();
            for (let i = startDayOfWeek - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                const date = new Date(year, month - 1, day);
                const dayEl = createDayElement(day, date, true); // Mark as other-month
                calendarGridEl.appendChild(dayEl);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateKey = formatDateKey(date);
                const isToday = dateKey === todayKey;
                const dayEl = createDayElement(day, date, false, isToday, tasksByDate[dateKey] || []);
                calendarGridEl.appendChild(dayEl);
            }

            const totalDaysRendered = startDayOfWeek + daysInMonth;
            const nextMonthDaysNeeded = (7 - (totalDaysRendered % 7)) % 7;
            for (let day = 1; day <= nextMonthDaysNeeded; day++) {
                const date = new Date(year, month + 1, day);
                const dayEl = createDayElement(day, date, true); // Mark as other-month
                calendarGridEl.appendChild(dayEl);
            }
            updateStatus("", false); // Clear rendering message
        } catch (error) {
            console.error("Error rendering calendar:", error);
            updateStatus("Error rendering calendar", true);
        } finally {
            window.isCurrentlyRendering = false;
        }
    }

    function createDayElement(dayNumber, date, isOtherMonth, isToday = false, tasks = []) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        if (isOtherMonth) dayDiv.classList.add('other-month');
        if (isToday) dayDiv.classList.add('today');
        dayDiv.setAttribute('data-date', formatDateKey(date));

        const numberSpan = document.createElement('span');
        numberSpan.className = 'day-number';
        numberSpan.textContent = dayNumber;
        dayDiv.appendChild(numberSpan);

        if (!isOtherMonth) {
            const dateKey = formatDateKey(date);

            if (tasks.length > 0 && (calendarFilter === 'both' || calendarFilter === 'tasks')) {
                const tasksDiv = document.createElement('div');
                tasksDiv.className = 'calendar-tasks';

                tasks.forEach(task => {
                    const taskEl = document.createElement('div');
                    taskEl.className = 'calendar-task-item';

                    if (task.is_complete) taskEl.classList.add('complete');
                    if (task.isRecurring) taskEl.classList.add('recurring');
                    if (task.isOverdue) taskEl.classList.add('overdue');

                    taskEl.textContent = task.title;

                    let tooltipText = task.title;
                    if (task.isRecurring) {
                        tooltipText += ' (Next occurrence)';
                    }

                    if (task.recurrence_type && task.recurrence_type !== 'none') {
                        const interval = task.recurrence_interval || 1;
                        if (interval === 1) {
                            tooltipText += ` (Repeats ${task.recurrence_type})`;
                        } else {

                            switch(task.recurrence_type) {
                                case 'daily':
                                    tooltipText += ` (Repeats every ${interval} days)`;
                                    break;
                                case 'weekly':
                                    tooltipText += ` (Repeats every ${interval} weeks)`;
                                    break;
                                case 'monthly':
                                    tooltipText += ` (Repeats every ${interval} months)`;
                                    break;
                                case 'yearly':
                                    tooltipText += ` (Repeats every ${interval} years)`;
                                    break;
                                default:
                                    tooltipText += ` (Repeats ${task.recurrence_type})`;
                            }
                        }
                    }
                    taskEl.title = tooltipText;

                    tasksDiv.appendChild(taskEl);
                });

                dayDiv.appendChild(tasksDiv);

                setTimeout(() => {

                    if (tasksDiv.scrollHeight > tasksDiv.clientHeight) {
                        tasksDiv.classList.add('has-overflow');

                        const taskCountIndicator = document.createElement('div');
                        taskCountIndicator.className = 'task-count-indicator';
                        taskCountIndicator.textContent = `${tasks.length} tasks`;
                        dayDiv.appendChild(taskCountIndicator);
                    }
                }, 0);
            }


            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            const dateObj = new Date(date);
            dateObj.setHours(0, 0, 0, 0); // Reset time to start of day
            const isFutureDate = dateObj > today;

            if (allHabits.length > 0 && !isFutureDate && (calendarFilter === 'both' || calendarFilter === 'habits')) {
                const habitsDiv = document.createElement('div');
                habitsDiv.className = 'calendar-habits';


                let dateCompletions = [];

                if (habitCompletions[dateKey]) {
                    dateCompletions = habitCompletions[dateKey];
                } else {

                    const dateParts = dateKey.split('-');
                    const year = parseInt(dateParts[0], 10);
                    const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
                    const day = parseInt(dateParts[2], 10);

                    for (const key in habitCompletions) {

                        const keyDate = new Date(key);

                        if (keyDate.getFullYear() === year &&
                            keyDate.getMonth() === month &&
                            keyDate.getDate() === day) {
                            dateCompletions = habitCompletions[key];
                            break;
                        }
                    }
                }

                const completionMap = {};
                dateCompletions.forEach(completion => {
                    completionMap[completion.habitId] = completion.count;
                });

                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to start of day
                const dateObj = new Date(date);
                dateObj.setHours(0, 0, 0, 0); // Reset time to start of day
                const isFutureDate = dateObj > today;

                console.log(`Filtering habits for date ${dateKey}:`, allHabits);
                console.log(`Completion map for date ${dateKey}:`, completionMap);

                const todayKey = formatDateKey(new Date());
                const isToday = dateKey === todayKey;
                console.log(`Is this today's date (${dateKey} vs ${todayKey})? ${isToday}`);

                let habitsToShow = [];
                if (isToday) {

                    habitsToShow = allHabits;
                    console.log(`Showing all habits for today (${dateKey}):`, habitsToShow);
                } else {

                    habitsToShow = allHabits.filter(habit => {
                        const completionCount = completionMap[habit.id] || 0;
                        console.log(`Habit ${habit.id} (${habit.title}) has ${completionCount} completions`);
                        return completionCount > 0; // Show habits with any progress (at least 1 completion)
                    });
                    console.log(`Habits with progress for date ${dateKey}:`, habitsToShow);
                }

                if (!isFutureDate && (habitsToShow.length > 0 || isToday)) {

                    habitsToShow.forEach(habit => {
                        const habitEl = document.createElement('div');
                        habitEl.className = 'calendar-habit-item';

                        const completionCount = completionMap[habit.id] || 0;



                        let target = parseInt(habit.completions_per_day) || 1;


                        const habitCompletion = dateCompletions.find(c => c.habitId === habit.id);
                        if (habitCompletion && habitCompletion.target) {
                            target = parseInt(habitCompletion.target);
                        }

                        console.log(`Displaying habit ${habit.id} (${habit.title}) with ${completionCount}/${target} completions`);

                        if (completionCount >= target) {
                            habitEl.classList.add('complete');
                        } else if (completionCount > 0) {
                            habitEl.classList.add('partial');
                        }



                        habitEl.textContent = `${habit.title} (${completionCount}/${target})`;

                        if (habit.title.includes('Social Media Rejection') && completionCount >= target) {
                            habitEl.title = `${habit.title}: ${target}/${target} completions`;
                        } else {
                            habitEl.title = `${habit.title}: ${completionCount}/${target} completions`;
                        }

                        habitsDiv.appendChild(habitEl);
                    });
                }

                dayDiv.appendChild(habitsDiv);

                setTimeout(() => {

                    if (habitsDiv.scrollHeight > habitsDiv.clientHeight && habitsToShow.length > 0) {
                        habitsDiv.classList.add('has-overflow');

                        const habitCountIndicator = document.createElement('div');
                        habitCountIndicator.className = 'habit-count-indicator';
                        habitCountIndicator.textContent = `${habitsToShow.length} habits`;
                        dayDiv.appendChild(habitCountIndicator);
                    }
                }, 0);
            }
        }

        if (!isOtherMonth) {
            dayDiv.addEventListener('click', handleDayClick);
        }

        return dayDiv;
    }

    function handleDayClick(event) {
        const dayEl = event.currentTarget;
        const dateKey = dayEl.getAttribute('data-date');
        if (!dateKey) return;

        const date = new Date(dateKey + 'T00:00:00'); // Ensure parsing as local date
        showTasksForDate(date, allTasks); // Show tasks for this date

        document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
        dayEl.classList.add('selected');

    }

    function showTasksForDate(date, tasks) {
        const dateKey = formatDateKey(date);
        selectedDateDisplayEl.textContent = date.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        selectedTaskListEl.innerHTML = ''; // Clear previous list

        const tasksHeading = document.createElement('h4');
        tasksHeading.textContent = 'Tasks';
        tasksHeading.style.marginTop = '0';
        tasksHeading.style.color = '#13523e';
        selectedTaskListEl.appendChild(tasksHeading);

        const multiSelectControls = document.createElement('div');
        multiSelectControls.className = 'multi-select-controls';
        multiSelectControls.style.display = 'flex';
        multiSelectControls.style.justifyContent = 'space-between';
        multiSelectControls.style.alignItems = 'center';
        multiSelectControls.style.marginBottom = '10px';

        const selectAllContainer = document.createElement('div');
        selectAllContainer.style.display = 'flex';
        selectAllContainer.style.alignItems = 'center';

        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.id = 'select-all-tasks';
        selectAllCheckbox.style.marginRight = '5px';
        selectAllCheckbox.addEventListener('change', () => {

            const taskCheckboxes = document.querySelectorAll('.task-select-checkbox');
            taskCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });

            updateDeleteSelectedButton();
        });

        const selectAllLabel = document.createElement('label');
        selectAllLabel.htmlFor = 'select-all-tasks';
        selectAllLabel.textContent = 'Select All';
        selectAllLabel.style.fontSize = '0.9em';

        selectAllContainer.appendChild(selectAllCheckbox);
        selectAllContainer.appendChild(selectAllLabel);

        const deleteSelectedBtn = document.createElement('button');
        deleteSelectedBtn.id = 'delete-selected-tasks';
        deleteSelectedBtn.textContent = 'Delete Selected';
        deleteSelectedBtn.style.padding = '4px 8px';
        deleteSelectedBtn.style.backgroundColor = '#e57373';
        deleteSelectedBtn.style.color = 'white';
        deleteSelectedBtn.style.border = 'none';
        deleteSelectedBtn.style.borderRadius = '4px';
        deleteSelectedBtn.style.cursor = 'pointer';
        deleteSelectedBtn.style.display = 'none'; // Hide initially
        deleteSelectedBtn.addEventListener('click', handleDeleteSelectedTasks);

        multiSelectControls.appendChild(selectAllContainer);
        multiSelectControls.appendChild(deleteSelectedBtn);

        selectedTaskListEl.appendChild(multiSelectControls);

        const directlyAssignedTasks = tasks.filter(task => {
            const assignedDateKey = task.assigned_date ? task.assigned_date.split('T')[0] : null;

            // Include tasks without due dates on today's date
            const currentTodayKey = formatDateKey(new Date());
            if (!task.assigned_date && !task.due_date && !task.is_complete && dateKey === currentTodayKey) {
                return true;
            }

            return assignedDateKey === dateKey;
        });

        const recurringTasks = tasks.filter(task => {

            const assignedDateKey = task.assigned_date ? task.assigned_date.split('T')[0] : null;
            if (assignedDateKey === dateKey) return false;

            if (!task.recurrence_type || task.recurrence_type === 'none') return false;

            if (task.is_complete && task.assigned_date) {

                console.log(`[Selected Date View] Checking if next occurrence exists for task ${task.id} (${task.title})`);

                const nextOccurrenceExists = tasks.some(otherTask => {

                    if (otherTask.id === task.id) return false;

                    const isNextOccurrence = (
                        otherTask.title === task.title &&
                        otherTask.recurrence_type === task.recurrence_type &&
                        otherTask.recurrence_interval === task.recurrence_interval &&
                        !otherTask.is_complete
                    );

                    if (isNextOccurrence) {
                        console.log(`[Selected Date View] Found existing next occurrence: Task ${otherTask.id} (${otherTask.title})`);
                    }

                    return isNextOccurrence;
                });

                console.log(`[Selected Date View] Next occurrence exists for task ${task.id}? ${nextOccurrenceExists}`);

                if (!nextOccurrenceExists) {
                    const nextOccurrence = calculateNextOccurrence(task);
                    if (nextOccurrence) {
                        const nextDateKey = formatDateKey(nextOccurrence);
                        return nextDateKey === dateKey;
                    }
                }
            }

            return false;
        }).map(task => {

            const nextTask = { ...task };
            nextTask.is_complete = false; // Next occurrence is not complete
            nextTask.isRecurring = true;  // Mark as a recurring instance

            const nextOccurrence = calculateNextOccurrence(task);
            if (nextOccurrence) {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to start of day
                if (nextOccurrence < today) {
                    nextTask.isOverdue = true; // Mark as overdue for styling
                }
            }

            return nextTask;
        });

        const tasksOnDate = [...directlyAssignedTasks, ...recurringTasks];

        if (tasksOnDate.length === 0) {
            const noTasksLi = document.createElement('li');
            noTasksLi.textContent = 'No tasks assigned for this date.';
            selectedTaskListEl.appendChild(noTasksLi);
        } else {
            tasksOnDate.forEach(task => {
                const li = document.createElement('li');
                li.setAttribute('data-task-id', task.id);

                const classes = ['task-item']; // Add task-item class for CSS targeting
                if (task.is_complete) classes.push('complete');
                if (task.isRecurring) classes.push('recurring');
                if (task.isOverdue) classes.push('overdue');
                li.className = classes.join(' ');

                const itemContainer = document.createElement('div');
                itemContainer.style.display = 'flex';
                itemContainer.style.alignItems = 'flex-start';
                itemContainer.style.gap = '8px';

                li.addEventListener('touchstart', handleTaskTouch);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-select-checkbox';
                checkbox.setAttribute('data-task-id', task.id);
                checkbox.style.marginTop = '3px';
                checkbox.addEventListener('change', updateDeleteSelectedButton);
                itemContainer.appendChild(checkbox);

                const contentContainer = document.createElement('div');
                contentContainer.style.flex = '1';

                const titleContainer = document.createElement('div');
                titleContainer.style.display = 'flex';
                titleContainer.style.justifyContent = 'space-between';
                titleContainer.style.alignItems = 'center';

                const titleSpan = document.createElement('span');
                titleSpan.textContent = task.title;
                titleContainer.appendChild(titleSpan);

                if (task.isRecurring || (task.recurrence_type && task.recurrence_type !== 'none')) {
                    const badgeSpan = document.createElement('span');
                    badgeSpan.style.backgroundColor = task.isRecurring ? '#81d4fa' : '#a5d6a7';
                    badgeSpan.style.color = task.isRecurring ? '#0277bd' : '#2e7d32';
                    badgeSpan.style.padding = '2px 6px';
                    badgeSpan.style.borderRadius = '10px';
                    badgeSpan.style.fontSize = '0.75em';
                    badgeSpan.style.fontWeight = 'bold';
                    badgeSpan.style.marginLeft = '8px';

                    if (task.isRecurring) {
                        badgeSpan.textContent = 'Next';
                        badgeSpan.title = 'Next occurrence of a recurring task';
                    } else {
                        const interval = task.recurrence_interval || 1;
                        if (interval === 1) {
                            badgeSpan.textContent = `Repeats ${task.recurrence_type}`;
                            badgeSpan.title = `This task repeats ${task.recurrence_type}`;
                        } else {

                            switch(task.recurrence_type) {
                                case 'daily':
                                    badgeSpan.textContent = `Every ${interval} days`;
                                    break;
                                case 'weekly':
                                    badgeSpan.textContent = `Every ${interval} weeks`;
                                    break;
                                case 'monthly':
                                    badgeSpan.textContent = `Every ${interval} months`;
                                    break;
                                case 'yearly':
                                    badgeSpan.textContent = `Every ${interval} years`;
                                    break;
                                default:
                                    badgeSpan.textContent = `Every ${interval} ${task.recurrence_type}`;
                            }

                            switch(task.recurrence_type) {
                                case 'daily':
                                    badgeSpan.title = `This task repeats every ${interval} days`;
                                    break;
                                case 'weekly':
                                    badgeSpan.title = `This task repeats every ${interval} weeks`;
                                    break;
                                case 'monthly':
                                    badgeSpan.title = `This task repeats every ${interval} months`;
                                    break;
                                case 'yearly':
                                    badgeSpan.title = `This task repeats every ${interval} years`;
                                    break;
                                default:
                                    badgeSpan.title = `This task repeats ${task.recurrence_type}`;
                            }
                        }
                    }

                    titleContainer.appendChild(badgeSpan);
                }

                contentContainer.appendChild(titleContainer);

                if (task.description) {
                    const descDiv = document.createElement('div');
                    descDiv.textContent = task.description;
                    descDiv.style.fontSize = '0.85em';
                    descDiv.style.color = '#666';
                    descDiv.style.marginTop = '3px';
                    contentContainer.appendChild(descDiv);
                }

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'task-actions';
                actionsDiv.style.display = 'flex';
                actionsDiv.style.gap = '8px';
                actionsDiv.style.opacity = '1'; // Ensure actions are always visible

                console.log('Creating edit button for task:', task.id, task.title);
                const editBtn = document.createElement('button');
                editBtn.className = 'icon-btn edit-task-btn';
                editBtn.innerHTML = '<i class="pencil-icon">✏️</i>'; // Pencil emoji
                editBtn.title = 'Edit task';
                editBtn.style.background = '#e3f2fd'; // Light blue background
                editBtn.style.border = '1px solid #bbdefb'; // Light blue border
                editBtn.style.padding = '5px';
                editBtn.style.cursor = 'pointer';
                editBtn.style.borderRadius = '50%';
                editBtn.style.width = '30px';
                editBtn.style.height = '30px';
                editBtn.style.display = 'flex';
                editBtn.style.alignItems = 'center';
                editBtn.style.justifyContent = 'center';
                editBtn.style.boxShadow = '0 0 3px rgba(0,0,0,0.2)';
                editBtn.style.marginRight = '5px';
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    console.log('Edit button clicked for task:', task.id);
                    handleEditTask(task);
                });
                actionsDiv.appendChild(editBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'icon-btn delete-btn';
                deleteBtn.innerHTML = '<i class="x-icon">❌</i>'; // X emoji
                deleteBtn.title = 'Delete task';
                deleteBtn.style.background = '#ffebee'; // Light red background
                deleteBtn.style.border = '1px solid #ffcdd2'; // Light red border
                deleteBtn.style.padding = '5px';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.borderRadius = '50%';
                deleteBtn.style.width = '30px';
                deleteBtn.style.height = '30px';
                deleteBtn.style.display = 'flex';
                deleteBtn.style.alignItems = 'center';
                deleteBtn.style.justifyContent = 'center';
                deleteBtn.style.boxShadow = '0 0 3px rgba(0,0,0,0.2)';
                deleteBtn.addEventListener('click', () => handleDeleteTask(task));
                actionsDiv.appendChild(deleteBtn);

                itemContainer.appendChild(contentContainer);

                li.appendChild(itemContainer);
                li.appendChild(actionsDiv);

                selectedTaskListEl.appendChild(li);
            });
        }

        if (calendarFilter === 'both' || calendarFilter === 'habits') {
            const habitsHeading = document.createElement('h4');
            habitsHeading.textContent = 'Habits';
            habitsHeading.style.marginTop = '20px';
            habitsHeading.style.color = '#5b2c6f';
            selectedTaskListEl.appendChild(habitsHeading);



        let dateCompletions = [];

        if (habitCompletions[dateKey]) {
            dateCompletions = habitCompletions[dateKey];
            console.log(`Found completions for ${dateKey} directly:`, dateCompletions);
        } else {

            const dateParts = dateKey.split('-');
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
            const day = parseInt(dateParts[2], 10);

            const dateObj = new Date(year, month, day);

            for (const key in habitCompletions) {

                const keyDate = new Date(key);

                if (keyDate.getFullYear() === year &&
                    keyDate.getMonth() === month &&
                    keyDate.getDate() === day) {
                    dateCompletions = habitCompletions[key];
                    console.log(`Found completions for ${dateKey} via date object matching:`, dateCompletions);
                    break;
                }
            }
        }

        const completionMap = {};
        dateCompletions.forEach(completion => {
            completionMap[completion.habitId] = completion.count;
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0); // Reset time to start of day
        const isFutureDate = dateObj > today;

        const todayKey = formatDateKey(new Date());
        const isToday = dateKey === todayKey;
        console.log(`Selected date view - Is this today's date (${dateKey} vs ${todayKey})? ${isToday}`);

        let habitsToShow = [];
        if (isToday) {

            habitsToShow = allHabits;
            console.log(`Selected date view - Showing all habits for today (${dateKey}):`, habitsToShow);
        } else {

            habitsToShow = allHabits.filter(habit => {
                const completionCount = completionMap[habit.id] || 0;
                return completionCount > 0; // Show habits with any progress (at least 1 completion)
            });
        }

        if ((habitsToShow.length === 0 && !isToday) || isFutureDate) {
            const noHabitsLi = document.createElement('li');
            noHabitsLi.textContent = isFutureDate ? 'Future date - no habits to show.' : 'No habit progress found.';
            selectedTaskListEl.appendChild(noHabitsLi);
        } else {

            habitsToShow.forEach(habit => {
                const li = document.createElement('li');
                li.setAttribute('data-habit-id', habit.id);

                const completionCount = completionMap[habit.id] || 0;



                let target = parseInt(habit.completions_per_day) || 1;


                const habitCompletion = dateCompletions.find(c => c.habitId === habit.id);
                if (habitCompletion && habitCompletion.target) {
                    target = parseInt(habitCompletion.target);
                }

                console.log(`Selected date view - Displaying habit ${habit.id} (${habit.title}) with ${completionCount}/${target} completions`);

                if (completionCount >= target) {
                    li.className = 'complete';
                } else if (completionCount > 0) {
                    li.className = 'partial';
                    li.style.backgroundColor = '#e8daef'; // Light purple for partial completion
                    li.style.textDecoration = 'none'; // Remove line-through
                }

                const titleContainer = document.createElement('div');
                titleContainer.style.display = 'flex';
                titleContainer.style.justifyContent = 'space-between';
                titleContainer.style.alignItems = 'center';

                const titleSpan = document.createElement('span');
                titleSpan.textContent = habit.title;
                titleContainer.appendChild(titleSpan);

                const badgeSpan = document.createElement('span');
                badgeSpan.style.backgroundColor = completionCount >= target ? '#a5d6a7' : '#e8daef';
                badgeSpan.style.color = completionCount >= target ? '#2e7d32' : '#5b2c6f';
                badgeSpan.style.padding = '2px 6px';
                badgeSpan.style.borderRadius = '10px';
                badgeSpan.style.fontSize = '0.75em';
                badgeSpan.style.fontWeight = 'bold';
                badgeSpan.style.marginLeft = '8px';


                badgeSpan.textContent = `${completionCount}/${target}`;
                badgeSpan.title = `${completionCount} out of ${target} completions for today`;
                titleContainer.appendChild(badgeSpan);

                li.appendChild(titleContainer);

                selectedTaskListEl.appendChild(li);
            });
        }
        } // Close the habits filter if statement

        selectedDateTasksEl.style.display = 'block';
        selectedDateTasksEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }


    function handleEditTask(task) {
        console.log('Editing task:', task);

        window.originalTaskData = JSON.parse(JSON.stringify(task));
        console.log('Original task data stored for debugging:', window.originalTaskData);

        console.log('Edit task modal element:', editTaskModal);
        console.log('Edit task form element:', editTaskForm);
        console.log('Edit task ID input element:', editTaskIdInput);

        if (!editTaskModal) {
            console.error('Edit task modal not found');
            alert('Edit task modal not found. Please check the console for more information.');
            return;
        }

        if (editTaskStatus) {
            editTaskStatus.textContent = '';
            editTaskStatus.className = 'status';
        }

        editTaskIdInput.value = task.id;
        editTaskTitleInput.value = task.title || '';
        editTaskDescriptionInput.value = task.description || '';

        if (task.reminder_time) {
            console.log(`Processing reminder_time: ${task.reminder_time}`);
            const reminderTime = new Date(task.reminder_time);
            if (!isNaN(reminderTime.getTime())) {
                const formattedTime = reminderTime.toISOString().slice(0, 16);
                editTaskReminderTimeInput.value = formattedTime;
                console.log(`Formatted reminder_time: ${formattedTime}`);
            } else {
                console.warn(`Invalid reminder_time: ${task.reminder_time}`);
                editTaskReminderTimeInput.value = '';
            }
        } else {
            editTaskReminderTimeInput.value = '';
        }

        if (task.assigned_date) {
            console.log(`Processing assigned_date: ${task.assigned_date}`);
            const formattedDate = task.assigned_date.split('T')[0];
            editTaskAssignedDateInput.value = formattedDate;
            console.log(`Formatted assigned_date: ${formattedDate}`);
        } else {
            console.log('No assigned_date provided');
            editTaskAssignedDateInput.value = '';
        }

        if (task.due_date) {
            console.log(`Processing due_date: ${task.due_date}`);
            const formattedDate = task.due_date.split('T')[0];
            editTaskDueDateInput.value = formattedDate;
            console.log(`Formatted due_date: ${formattedDate}`);
        } else {
            console.log('No due_date provided');
            editTaskDueDateInput.value = '';
        }

        editTaskRecurrenceTypeSelect.value = task.recurrence_type || 'none';
        editTaskRecurrenceIntervalInput.value = task.recurrence_interval || '1';

        updateRecurrenceIntervalUnit();

        editTaskRecurrenceIntervalContainer.style.display =
            (task.recurrence_type && task.recurrence_type !== 'none') ? 'block' : 'none';

        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        editTaskModal.style.removeProperty('display');

        editTaskModal.style.display = 'flex';

        editTaskModal.classList.add('modal-visible');

        void editTaskModal.offsetWidth;
    }

    function updateRecurrenceIntervalUnit() {
        if (!editTaskRecurrenceIntervalUnit) return;

        const recurrenceType = editTaskRecurrenceTypeSelect.value;
        switch (recurrenceType) {
            case 'daily':
                editTaskRecurrenceIntervalUnit.textContent = 'days';
                break;
            case 'weekly':
                editTaskRecurrenceIntervalUnit.textContent = 'weeks';
                break;
            case 'monthly':
                editTaskRecurrenceIntervalUnit.textContent = 'months';
                break;
            case 'yearly':
                editTaskRecurrenceIntervalUnit.textContent = 'years';
                break;
            default:
                editTaskRecurrenceIntervalUnit.textContent = 'days';
        }
    }

    function isTaskRecurring(task) {
        return task.recurrence_type && task.recurrence_type !== 'none';
    }

    async function handleDeleteTask(task) {
        console.log('Deleting task:', task);

        const isRecurring = isTaskRecurring(task);

        let confirmMessage = `Are you sure you want to delete task "${task.title}"?`;
        if (isRecurring) {
            confirmMessage = `Are you sure you want to delete task "${task.title}" with all of its recurrences?`;
        }

        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Server error deleting task' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`Task deletion result:`, result);

            await fetchTasks();

            const selectedDay = document.querySelector('.calendar-day.selected');
            if (selectedDay) {
                const dateKey = selectedDay.getAttribute('data-date');
                if (dateKey) {
                    const date = new Date(dateKey + 'T00:00:00');

                    showTasksForDate(date, allTasks);
                }
            }

            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

            if (result.deletedCount > 1) {
                updateStatus(`Task and ${result.deletedCount - 1} recurrences deleted successfully`, false);
            } else {
                updateStatus("Task deleted successfully", false);
            }
            setTimeout(() => updateStatus("", false), 3000);

        } catch (error) {
            console.error('Error deleting task:', error);
            updateStatus(`Error deleting task: ${error.message}`, true);
        }
    }

    function handleTaskTouch(event) {

        const taskItem = event.currentTarget;

        taskItem.classList.toggle('show-actions');

        setTimeout(() => {
            taskItem.classList.remove('show-actions');
        }, 3000);
    }

    function updateDeleteSelectedButton() {
        const deleteSelectedBtn = document.getElementById('delete-selected-tasks');
        if (!deleteSelectedBtn) return;

        const selectedCheckboxes = document.querySelectorAll('.task-select-checkbox:checked');
        deleteSelectedBtn.style.display = selectedCheckboxes.length > 0 ? 'block' : 'none';
    }

    async function handleDeleteSelectedTasks() {
        const selectedCheckboxes = document.querySelectorAll('.task-select-checkbox:checked');
        if (selectedCheckboxes.length === 0) return;

        const taskIds = [];
        let hasRecurringTasks = false;

        for (const checkbox of selectedCheckboxes) {
            const taskId = checkbox.getAttribute('data-task-id');
            taskIds.push(taskId);

            const task = allTasks.find(t => t.id.toString() === taskId);
            if (task && isTaskRecurring(task)) {
                hasRecurringTasks = true;
            }
        }

        let confirmMessage = `Are you sure you want to delete ${taskIds.length} selected task(s)?`;
        if (hasRecurringTasks) {
            confirmMessage = `Are you sure you want to delete ${taskIds.length} selected task(s)? This will delete all recurrences of any recurring tasks.`;
        }

        if (!confirm(confirmMessage)) {
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        let totalRecurrencesDeleted = 0;

        updateStatus(`Deleting ${taskIds.length} tasks...`, false);

        for (const taskId of taskIds) {
            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {

                    try {
                        const result = await response.json();
                        console.log(`Task ${taskId} deletion result:`, result);

                        if (result.deletedCount) {
                            totalRecurrencesDeleted += (result.deletedCount - 1);
                        }

                        successCount++;
                    } catch (parseError) {
                        console.error(`Error parsing response for task ${taskId}:`, parseError);
                        successCount++;
                    }
                } else {
                    errorCount++;
                    console.error(`Failed to delete task ${taskId}:`, await response.text());
                }
            } catch (error) {
                errorCount++;
                console.error(`Error deleting task ${taskId}:`, error);
            }
        }

        await fetchTasks();

        const selectedDay = document.querySelector('.calendar-day.selected');
        if (selectedDay) {
            const dateKey = selectedDay.getAttribute('data-date');
            if (dateKey) {
                const date = new Date(dateKey + 'T00:00:00');

                showTasksForDate(date, allTasks);
            }
        }

        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

        if (errorCount === 0) {
            if (totalRecurrencesDeleted > 0) {
                updateStatus(`Successfully deleted ${successCount} task(s) and ${totalRecurrencesDeleted} recurrence(s)`, false);
            } else {
                updateStatus(`Successfully deleted ${successCount} task(s)`, false);
            }
        } else {
            updateStatus(`Deleted ${successCount} task(s), but failed to delete ${errorCount} task(s)`, true);
        }

        setTimeout(() => updateStatus("", false), 3000);
    }


    prevMonthBtn.addEventListener('click', async () => {
        currentDate.setMonth(currentDate.getMonth() - 1);

        window.forceRender = true;
        await renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', async () => {
        currentDate.setMonth(currentDate.getMonth() + 1);

        window.forceRender = true;
        await renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    closeSelectedDateViewBtn.addEventListener('click', () => {
        selectedDateTasksEl.style.display = 'none';
        document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
    });

    if (editTaskModal && editTaskForm) {

        if (closeEditTaskModalBtn) {
            closeEditTaskModalBtn.addEventListener('click', () => {
                closeEditTaskModal();
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === editTaskModal) {
                closeEditTaskModal();
            }
        });

        function closeEditTaskModal() {

            editTaskModal.style.display = 'none';
            editTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Restore scrolling
        }

        editTaskRecurrenceTypeSelect.addEventListener('change', () => {

            const recurrenceType = editTaskRecurrenceTypeSelect.value;
            editTaskRecurrenceIntervalContainer.style.display =
                (recurrenceType !== 'none') ? 'block' : 'none';

            updateRecurrenceIntervalUnit();
        });

        editTaskForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const taskId = editTaskIdInput.value;
            if (!taskId) {
                console.error("No task ID found in edit form.");
                updateEditTaskStatus("Error: Task ID missing.", true);
                return;
            }

            const saveButton = editTaskForm.querySelector('button[type="submit"]');
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
            updateEditTaskStatus("Saving changes...", false);

            const updatedData = {
                title: editTaskTitleInput.value.trim(),
                description: editTaskDescriptionInput.value.trim() || null,
                reminderTime: editTaskReminderTimeInput.value || null,
                assignedDate: editTaskAssignedDateInput.value || null,
                dueDate: editTaskDueDateInput.value || null,
                recurrenceType: editTaskRecurrenceTypeSelect.value,
                recurrenceInterval: editTaskRecurrenceTypeSelect.value !== 'none' ?
                    parseInt(editTaskRecurrenceIntervalInput.value) || 1 : null
            };

            console.log('Updating task with data:', updatedData);

            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Server error updating task' }));
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Task updated successfully:', result);

                console.log(`Task ${taskId} dates updated:`, {
                    originalAssignedDate: task.assigned_date,
                    originalDueDate: task.due_date,
                    newAssignedDate: result.assigned_date,
                    newDueDate: result.due_date,
                    formAssignedDate: editTaskAssignedDateInput.value,
                    formDueDate: editTaskDueDateInput.value
                });

                await fetchTasks(true);

                const selectedDay = document.querySelector('.calendar-day.selected');
                if (selectedDay) {
                    const dateKey = selectedDay.getAttribute('data-date');
                    if (dateKey) {
                        const date = new Date(dateKey + 'T00:00:00');

                        showTasksForDate(date, allTasks);
                    }
                }

                renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

                updateEditTaskStatus("Task updated successfully", false);

                setTimeout(() => {
                    editTaskModal.style.display = 'none';
                    editTaskModal.classList.remove('modal-visible');
                    document.body.style.overflow = ''; // Restore scrolling
                    updateEditTaskStatus("", false);
                }, 1500);

                document.dispatchEvent(new CustomEvent('taskUpdated', { detail: result }));

            } catch (error) {
                console.error('Error updating task:', error);
                updateEditTaskStatus(`Error updating task: ${error.message}`, true);
            } finally {

                saveButton.disabled = false;
                saveButton.textContent = 'Save Changes';
            }
        });

    }

    function updateEditTaskStatus(message, isError = false) {
        if (!editTaskStatus) return;

        editTaskStatus.textContent = message;
        editTaskStatus.className = `status ${isError ? 'error' : 'success'}`;
        editTaskStatus.style.display = message ? 'block' : 'none';
    }

    async function initializeCalendar() {
        console.log('Initializing calendar - this should only run once');

        if (window.calendarInitialized) {
            console.log('Calendar already initialized, skipping');
            return;
        }

        try {

            if (!currentDate) {
                console.log('Initializing currentDate');
                currentDate = new Date();
            }

            console.log('Loading tasks');
            await fetchTasks(); // Load tasks first

            console.log('Loading habits');
            try {
                await fetchHabits(currentDate.getFullYear(), currentDate.getMonth()); // Load habits
            } catch (habitError) {
                console.error('Error loading habits, continuing with calendar render:', habitError);
            }

            console.log('Initial calendar render');
            try {
                await renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Then render calendar
            } catch (renderError) {
                console.error('Error rendering calendar:', renderError);

                if (calendarGridEl) {
                    calendarGridEl.innerHTML = '<div class="calendar-error">Error rendering calendar. Please refresh the page.</div>';
                }
            }

            const calendarFilterEl = document.getElementById('calendarFilter');
            if (calendarFilterEl) {
                calendarFilterEl.addEventListener('change', () => {
                    calendarFilter = calendarFilterEl.value;
                    console.log('Filter changed, re-rendering calendar');

                    window.forceRender = true;
                    renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Re-render with the new filter
                });
            }



            window.calendarInitialized = true;
            console.log('Calendar initialization complete');
        } catch (error) {
            console.error('Error initializing calendar:', error);
            updateStatus("Error loading calendar. Please refresh the page.", true);
        }
    }

    try {
        initializeCalendar();
    } catch (error) {
        console.error('Fatal error initializing calendar:', error);
        updateStatus("Error loading calendar. Please refresh the page.", true);
    }

}); // End DOMContentLoaded