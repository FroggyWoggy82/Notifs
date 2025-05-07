// public/js/calendar.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Calendar.js: DOM content loaded');

    // Initialize tracking variables for calendar rendering
    window.lastRenderedMonth = null;
    window.lastRenderedYear = null;
    window.isCurrentlyRendering = false;
    window.forceRender = false;

    const currentMonthYearEl = document.getElementById('currentMonthYear');
    // Use let instead of const so we can reassign it later
    let calendarGridEl = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const calendarStatusEl = document.getElementById('calendarStatus');
    const selectedDateTasksEl = document.getElementById('selectedDateTasks');
    const selectedDateDisplayEl = document.getElementById('selectedDateDisplay');
    const selectedTaskListEl = document.getElementById('selectedTaskList');
    const closeSelectedDateViewBtn = document.getElementById('closeSelectedDateView');

    // Edit task modal elements
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

    // Debug all modal elements
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

    // Function to update the edit task status
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

    // --- Helper Functions ---

    function updateStatus(message, isError = false) {
        console.log(`Calendar Status: ${message} (Error: ${isError})`);
        calendarStatusEl.textContent = message;
        calendarStatusEl.className = `status ${isError ? 'error' : 'success'}`;
        calendarStatusEl.style.display = message ? 'block' : 'none';
    }

    // Update the edit task status message
    function updateEditTaskStatus(message, isError = false) {
        if (!editTaskStatus) return;

        console.log(`Edit Task Status: ${message} (Error: ${isError})`);
        editTaskStatus.textContent = message;
        editTaskStatus.className = `status ${isError ? 'error' : 'success'}`;
        editTaskStatus.style.display = message ? 'block' : 'none';
    }

    // Format date as YYYY-MM-DD (used for matching tasks)
    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Calculate the next occurrence date for a recurring task
    function calculateNextOccurrence(task) {
        if (!task.recurrence_type || task.recurrence_type === 'none' || !task.assigned_date) {
            return null;
        }

        // Parse the assigned date
        const assignedDate = new Date(task.assigned_date);
        if (isNaN(assignedDate.getTime())) {
            console.warn(`Invalid assigned_date for task ${task.id}: ${task.assigned_date}`);
            return null;
        }

        // Get the recurrence interval (default to 1 if not specified)
        const interval = task.recurrence_interval || 1;

        // Calculate the next occurrence based on recurrence type
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

    // Fetch all tasks (or potentially filter by date range later)
    // Make this function globally accessible for the calendar-refresh-fix.js script
    window.fetchTasks = async function(forceReload = false) {
        updateStatus("Loading tasks...", false);
        try {
            // Always add a cache-busting parameter to ensure we get fresh data
            // This is especially important after editing a task
            const timestamp = new Date().getTime();
            const url = `/api/tasks?relevantDates=true&_cache=${timestamp}`;

            console.log(`Fetching tasks with URL: ${url} (forceReload: ${forceReload})`);

            // Use cache: 'no-cache' to ensure we don't get cached data
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

            // Log recurring tasks specifically for debugging
            const recurringTasks = allTasks.filter(task => task.recurrence_type && task.recurrence_type !== 'none');
            console.log(`Found ${recurringTasks.length} recurring tasks:`, recurringTasks);

            // Log tasks with assigned dates for debugging
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

            // Re-render the calendar with the new data
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

            return allTasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            updateStatus("Error loading tasks.", true);
            allTasks = []; // Ensure tasks array is empty on error
            return [];
        }
    }

    // Fetch completions directly from the database using a more efficient approach
    async function fetchCompletionsDirectly(startDate, endDate) {
        try {
            console.log(`Fetching completions directly for date range: ${startDate} to ${endDate}`);

            // First, get all habits
            const habitsResponse = await fetch('/api/habits');
            if (!habitsResponse.ok) {
                throw new Error(`HTTP error! status: ${habitsResponse.status}`);
            }

            const habitsData = await habitsResponse.json();
            allHabits = habitsData || [];
            console.log("Fetched habits directly:", allHabits);

            // Initialize completions map
            habitCompletions = {};

            // Get today's date for special handling
            const todayKey = formatDateKey(new Date());
            console.log(`Today's date key: ${todayKey}`);

            // Initialize completions for today's date with all habits (even those with no completions)
            habitCompletions[todayKey] = [];

            // Add all habits to today's date with their current completion status
            allHabits.forEach(habit => {
                // Use the completions_today value from the habits API
                const completionsToday = parseInt(habit.completions_today) || 0;
                console.log(`Habit ${habit.id} (${habit.title}) has ${completionsToday} completions today`);

                // Make sure we use the correct target value from the habit data
                const completionsTarget = parseInt(habit.completions_per_day) || 1;

                habitCompletions[todayKey].push({
                    habitId: habit.id,
                    title: habit.title,
                    count: completionsToday, // Use the actual completions count from the API
                    target: completionsTarget // Use the correct target from the habit data
                });

                console.log(`Added habit ${habit.id} (${habit.title}) to today with ${completionsToday}/${completionsTarget} completions`);
            });

            // For past dates, we'll use the completions API to get historical data
            try {
                // Try to use the completions API for the date range
                const completionsResponse = await fetch(`/api/habits/completions?startDate=${startDate}&endDate=${endDate}`);

                if (completionsResponse.ok) {
                    const completionsData = await completionsResponse.json();
                    console.log("Fetched completions data for date range:", completionsData);

                    // Process completions data for past dates
                    if (completionsData && completionsData.completionsByDate) {
                        // For each date in the completions data
                        for (const dateKey in completionsData.completionsByDate) {
                            // Skip today as we've already handled it with more accurate data
                            if (dateKey === todayKey) continue;

                            // Add the completions for this date
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

            // Even if there's an error, make sure we still show all habits for today
            try {
                // If we have habits but no completions, at least set up today's date
                if (allHabits.length > 0) {
                    const todayKey = formatDateKey(new Date());
                    habitCompletions = {};
                    habitCompletions[todayKey] = [];

                    // Add all habits to today's date with 0 completions
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

    // Fetch habits and their completions for a date range
    // Make this function globally accessible so it can be called from calendar-refresh.js
    window.fetchHabits = async function(year, month) {
        try {
            console.log("Fetching habits for", year, month);

            // Validate inputs
            if (isNaN(year) || isNaN(month)) {
                console.error("Invalid year or month:", year, month);
                return { habits: [], completions: {} };
            }

            // Calculate start and end dates for the month view
            // We need to include some days from previous and next months
            const firstDayOfMonth = new Date(year, month, 1);
            const lastDayOfMonth = new Date(year, month + 1, 0);

            console.log("First day of month:", firstDayOfMonth);
            console.log("Last day of month:", lastDayOfMonth);

            // Add buffer days before and after to account for calendar view
            const startDate = new Date(firstDayOfMonth);
            startDate.setDate(startDate.getDate() - 7); // Go back a week to be safe

            const endDate = new Date(lastDayOfMonth);
            endDate.setDate(endDate.getDate() + 7); // Go forward a week to be safe

            console.log("Start date:", startDate);
            console.log("End date:", endDate);

            // Format dates as YYYY-MM-DD with error handling
            let startDateStr, endDateStr;
            try {
                startDateStr = startDate.toISOString().split('T')[0];
                endDateStr = endDate.toISOString().split('T')[0];
            } catch (e) {
                console.error("Error formatting dates:", e);
                // Use fallback dates
                const today = new Date();
                startDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
                endDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-28`;
            }

            console.log(`Fetching habits for date range: ${startDateStr} to ${endDateStr}`);

            // First, get all habits directly
            console.log('Fetching all habits first');
            const habitsResponse = await fetch('/api/habits');
            if (!habitsResponse.ok) {
                throw new Error(`HTTP error fetching habits! status: ${habitsResponse.status}`);
            }

            const habitsData = await habitsResponse.json();
            console.log('Successfully fetched habits:', habitsData);
            allHabits = habitsData || [];

            // Skip the completions API and go straight to the direct method
            // This is more efficient and ensures all habits show up for today
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

    // Track the last rendered month/year to prevent duplicate renders
    window.lastRenderedMonth = null;
    window.lastRenderedYear = null;
    window.isCurrentlyRendering = false;

    // Render the calendar grid for the given month and year
    // Make this function globally accessible so it can be called from calendar-refresh.js
    window.renderCalendar = async function(year, month) {
        // Prevent duplicate renders of the same month
        const monthYearKey = `${year}-${month}`;
        if (window.lastRenderedMonth === monthYearKey && !window.forceRender) {
            console.log(`Calendar for ${monthYearKey} already rendered, skipping duplicate render`);
            return;
        }

        // Prevent concurrent renders
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
            // Check if the calendar grid exists
            if (!calendarGridEl) {
                console.log("Calendar grid not found, looking for it again");
                calendarGridEl = document.getElementById('calendar-grid');

                // If it still doesn't exist, find the container and create it
                if (!calendarGridEl) {
                    console.log("Creating new calendar grid");
                    const container = document.querySelector('.container');
                    if (!container) {
                        console.error("Container not found, cannot render calendar");
                        window.isCurrentlyRendering = false;
                        return;
                    }

                    // Find where to insert the calendar grid (after the filter, before the status)
                    const calendarFilter = document.querySelector('.calendar-filter');
                    const calendarStatus = document.getElementById('calendarStatus');

                    // Create a new calendar grid element
                    calendarGridEl = document.createElement('div');
                    calendarGridEl.id = 'calendar-grid';
                    calendarGridEl.className = 'calendar-grid';

                    // Insert it in the right place
                    if (calendarStatus) {
                        container.insertBefore(calendarGridEl, calendarStatus);
                    } else if (calendarFilter) {
                        container.insertBefore(calendarGridEl, calendarFilter.nextSibling);
                    } else {
                        container.appendChild(calendarGridEl);
                    }
                }
            }

            // Clear the existing grid
            console.log("Clearing calendar grid");
            calendarGridEl.innerHTML = '';

            // Add the header elements
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

            // Fetch habits for this month
            await fetchHabits(year, month);

            // --- Group tasks by date for faster lookup --- //
            const tasksByDate = {};
            allTasks.forEach(task => {
                const dates = [];

                // For recurring tasks, calculate and show the next occurrence
                // Note: We process both complete and incomplete recurring tasks
                if (task.recurrence_type && task.recurrence_type !== 'none') {
                    // For completed tasks, calculate the next occurrence
                    // For incomplete tasks, we still want to show them on their assigned date
                    if (task.is_complete) {
                        // Check if a next occurrence already exists in the database
                        // We can identify this by looking for a task with the same title and recurrence settings
                        console.log(`Checking if next occurrence exists for task ${task.id} (${task.title})`);

                        const nextOccurrenceExists = allTasks.some(otherTask => {
                            // Skip the current task
                            if (otherTask.id === task.id) return false;

                            // Check if this is a potential next occurrence
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

                        // Only create a virtual next occurrence if a real one doesn't exist
                        if (!nextOccurrenceExists) {
                            const nextOccurrence = calculateNextOccurrence(task);
                            if (nextOccurrence) {
                                // Create a copy of the task for the next occurrence
                                const nextTask = { ...task };
                                nextTask.assigned_date = formatDateKey(nextOccurrence);
                                nextTask.due_date = formatDateKey(nextOccurrence); // Also update the due date
                                nextTask.is_complete = false; // Next occurrence is not complete
                                nextTask.isRecurring = true;  // Mark as a recurring instance

                                // Add the next occurrence date
                                const nextDateKey = formatDateKey(nextOccurrence);
                                dates.push(nextDateKey);

                                // Check if the next occurrence is within the current month view
                                const isInCurrentMonth = (
                                    nextOccurrence.getFullYear() === year &&
                                    nextOccurrence.getMonth() === month
                                );

                                // Also check if the next occurrence is overdue (for highlighting)
                                const today = new Date();
                                today.setHours(0, 0, 0, 0); // Reset time to start of day
                                const isOverdue = nextOccurrence < today;
                                if (isOverdue) {
                                    nextTask.isOverdue = true; // Mark as overdue for styling
                                }

                                console.log(`Adding next occurrence of task ${task.id} on ${nextDateKey} (overdue: ${isOverdue})`);

                                // Store the next occurrence task
                                if (!tasksByDate[nextDateKey]) {
                                    tasksByDate[nextDateKey] = [];
                                }
                                tasksByDate[nextDateKey].push(nextTask);
                            }
                        }
                    } else {
                        // For incomplete recurring tasks, make sure they show up on their assigned date
                        // This ensures that recurring tasks that haven't been completed yet are visible
                        console.log(`Processing incomplete recurring task ${task.id} (${task.title}) with assigned_date ${task.assigned_date}`);
                    }
                }

                // Use assigned_date as the primary date for calendar view
                if (task.assigned_date) {
                    try {
                        // Extract YYYY-MM-DD part
                        const assignedDateKey = task.assigned_date.split('T')[0];
                        dates.push(assignedDateKey);

                        // Add all tasks to their assigned date, even recurring ones
                        // This ensures that recurring tasks always show up on their assigned date
                        if (!tasksByDate[assignedDateKey]) {
                            tasksByDate[assignedDateKey] = [];
                        }

                        // Only add the task if it's not already in the array for this date
                        const taskAlreadyAdded = tasksByDate[assignedDateKey].some(t => t.id === task.id);
                        if (!taskAlreadyAdded) {
                            console.log(`Adding task ${task.id} (${task.title}) to date ${assignedDateKey}`);
                            tasksByDate[assignedDateKey].push(task);
                        }
                    } catch (e) {
                        console.warn(`Invalid assigned_date format for task ${task.id}: ${task.assigned_date}`);
                    }
                }
            });

            // --- Fill in days from previous month --- //
            const prevMonthLastDay = new Date(year, month, 0);
            const daysInPrevMonth = prevMonthLastDay.getDate();
            for (let i = startDayOfWeek - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                const date = new Date(year, month - 1, day);
                const dayEl = createDayElement(day, date, true); // Mark as other-month
                calendarGridEl.appendChild(dayEl);
            }

            // --- Fill in days of the current month --- //
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateKey = formatDateKey(date);
                const isToday = dateKey === todayKey;
                const dayEl = createDayElement(day, date, false, isToday, tasksByDate[dateKey] || []);
                calendarGridEl.appendChild(dayEl);
            }

            // --- Fill in days from next month --- //
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

    // Create a single day element for the grid
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

        // Only add content for days in the current month
        if (!isOtherMonth) {
            const dateKey = formatDateKey(date);

            // Add tasks to the day cell if filter allows
            if (tasks.length > 0 && (calendarFilter === 'both' || calendarFilter === 'tasks')) {
                const tasksDiv = document.createElement('div');
                tasksDiv.className = 'calendar-tasks';

                // Add all tasks
                tasks.forEach(task => {
                    const taskEl = document.createElement('div');
                    taskEl.className = 'calendar-task-item';

                    // Apply appropriate classes based on task state
                    if (task.is_complete) taskEl.classList.add('complete');
                    if (task.isRecurring) taskEl.classList.add('recurring');
                    if (task.isOverdue) taskEl.classList.add('overdue');

                    // Set the task title
                    taskEl.textContent = task.title;

                    // Add tooltip with additional information
                    let tooltipText = task.title;
                    if (task.isRecurring) {
                        tooltipText += ' (Next occurrence)';
                    }

                    // Add recurrence information with interval if applicable
                    if (task.recurrence_type && task.recurrence_type !== 'none') {
                        const interval = task.recurrence_interval || 1;
                        if (interval === 1) {
                            tooltipText += ` (Repeats ${task.recurrence_type})`;
                        } else {
                            // Add custom interval information
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

                // Check for overflow after the element is added to the DOM
                setTimeout(() => {
                    // Check if content overflows
                    if (tasksDiv.scrollHeight > tasksDiv.clientHeight) {
                        tasksDiv.classList.add('has-overflow');

                        // Add a small indicator showing number of tasks
                        const taskCountIndicator = document.createElement('div');
                        taskCountIndicator.className = 'task-count-indicator';
                        taskCountIndicator.textContent = `${tasks.length} tasks`;
                        dayDiv.appendChild(taskCountIndicator);
                    }
                }, 0);
            }

            // Add habits to the day cell, but only if they have completions
            // and only for past or current dates, and if filter allows
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            const dateObj = new Date(date);
            dateObj.setHours(0, 0, 0, 0); // Reset time to start of day
            const isFutureDate = dateObj > today;

            // Only proceed if this is not a future date and filter allows habits
            if (allHabits.length > 0 && !isFutureDate && (calendarFilter === 'both' || calendarFilter === 'habits')) {
                const habitsDiv = document.createElement('div');
                habitsDiv.className = 'calendar-habits';

                // Get completions for this date
                // The dateKey is in YYYY-MM-DD format, but the keys in habitCompletions might be full date strings
                let dateCompletions = [];

                // Try direct lookup first
                if (habitCompletions[dateKey]) {
                    dateCompletions = habitCompletions[dateKey];
                } else {
                    // Try to find the date in other formats
                    const dateParts = dateKey.split('-');
                    const year = parseInt(dateParts[0], 10);
                    const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
                    const day = parseInt(dateParts[2], 10);

                    // Check all keys in habitCompletions
                    for (const key in habitCompletions) {
                        // Try to extract the date from the key
                        const keyDate = new Date(key);

                        // Check if the dates match (ignoring time)
                        if (keyDate.getFullYear() === year &&
                            keyDate.getMonth() === month &&
                            keyDate.getDate() === day) {
                            dateCompletions = habitCompletions[key];
                            break;
                        }
                    }
                }

                // Create a map for quick lookup of completions
                const completionMap = {};
                dateCompletions.forEach(completion => {
                    completionMap[completion.habitId] = completion.count;
                });

                // Check if this date is in the future
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to start of day
                const dateObj = new Date(date);
                dateObj.setHours(0, 0, 0, 0); // Reset time to start of day
                const isFutureDate = dateObj > today;

                // Filter habits to only show those with any progress
                console.log(`Filtering habits for date ${dateKey}:`, allHabits);
                console.log(`Completion map for date ${dateKey}:`, completionMap);

                // Check if this is today's date
                const todayKey = formatDateKey(new Date());
                const isToday = dateKey === todayKey;
                console.log(`Is this today's date (${dateKey} vs ${todayKey})? ${isToday}`);

                // For today's date, show all habits. For other dates, only show habits with progress
                let habitsToShow = [];
                if (isToday) {
                    // Show all habits for today
                    habitsToShow = allHabits;
                    console.log(`Showing all habits for today (${dateKey}):`, habitsToShow);
                } else {
                    // For other dates, only show habits with progress
                    habitsToShow = allHabits.filter(habit => {
                        const completionCount = completionMap[habit.id] || 0;
                        console.log(`Habit ${habit.id} (${habit.title}) has ${completionCount} completions`);
                        return completionCount > 0; // Show habits with any progress (at least 1 completion)
                    });
                    console.log(`Habits with progress for date ${dateKey}:`, habitsToShow);
                }

                // Only show habits for past or current dates
                if (!isFutureDate && (habitsToShow.length > 0 || isToday)) {
                    // Add habits with any progress
                    habitsToShow.forEach(habit => {
                        const habitEl = document.createElement('div');
                        habitEl.className = 'calendar-habit-item';

                        // Get completion count for this habit on this date
                        const completionCount = completionMap[habit.id] || 0;

                        // Make sure we use the correct target value
                        // First try to get it from the habit object's completions_per_day property
                        // If not available, try to find it in the dateCompletions array
                        let target = parseInt(habit.completions_per_day) || 1;

                        // For habits like Social Media Rejection that have a specific target
                        // Try to find the target in the dateCompletions array
                        const habitCompletion = dateCompletions.find(c => c.habitId === habit.id);
                        if (habitCompletion && habitCompletion.target) {
                            target = parseInt(habitCompletion.target);
                        }

                        console.log(`Displaying habit ${habit.id} (${habit.title}) with ${completionCount}/${target} completions`);

                        // Set completion status
                        if (completionCount >= target) {
                            habitEl.classList.add('complete');
                        } else if (completionCount > 0) {
                            habitEl.classList.add('partial');
                        }

                        // Set the habit title with completion status
                        // For habits with multiple completions per day, always show the actual count/target
                        // This ensures habits like Social Media Rejection show 2/8 instead of 0/1
                        habitEl.textContent = `${habit.title} (${completionCount}/${target})`;

                        // Add tooltip
                        if (habit.title.includes('Social Media Rejection') && completionCount >= target) {
                            habitEl.title = `${habit.title}: ${target}/${target} completions`;
                        } else {
                            habitEl.title = `${habit.title}: ${completionCount}/${target} completions`;
                        }

                        habitsDiv.appendChild(habitEl);
                    });
                }

                dayDiv.appendChild(habitsDiv);

                // Check for overflow after the element is added to the DOM
                setTimeout(() => {
                    // Check if content overflows and there are habits to show
                    if (habitsDiv.scrollHeight > habitsDiv.clientHeight && habitsToShow.length > 0) {
                        habitsDiv.classList.add('has-overflow');

                        // Add a small indicator showing number of habits
                        const habitCountIndicator = document.createElement('div');
                        habitCountIndicator.className = 'habit-count-indicator';
                        habitCountIndicator.textContent = `${habitsToShow.length} habits`;
                        dayDiv.appendChild(habitCountIndicator);
                    }
                }, 0);
            }
        }

        // Add click listener only for days in the current month
        if (!isOtherMonth) {
            dayDiv.addEventListener('click', handleDayClick);
        }

        return dayDiv;
    }

    // Handle clicking on a day cell
    function handleDayClick(event) {
        const dayEl = event.currentTarget;
        const dateKey = dayEl.getAttribute('data-date');
        if (!dateKey) return;

        const date = new Date(dateKey + 'T00:00:00'); // Ensure parsing as local date
        showTasksForDate(date, allTasks); // Show tasks for this date

        // Optional: Highlight selected day
        document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
        dayEl.classList.add('selected');
        // Add .selected { background-color: #cfe8fc; border-color: #a1cff7; } to CSS if needed
    }

    // Display tasks and habits for the selected date in the dedicated section
    function showTasksForDate(date, tasks) {
        const dateKey = formatDateKey(date);
        selectedDateDisplayEl.textContent = date.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        selectedTaskListEl.innerHTML = ''; // Clear previous list

        // Add a heading for tasks
        const tasksHeading = document.createElement('h4');
        tasksHeading.textContent = 'Tasks';
        tasksHeading.style.marginTop = '0';
        tasksHeading.style.color = '#13523e';
        selectedTaskListEl.appendChild(tasksHeading);

        // Add multi-select controls container
        const multiSelectControls = document.createElement('div');
        multiSelectControls.className = 'multi-select-controls';
        multiSelectControls.style.display = 'flex';
        multiSelectControls.style.justifyContent = 'space-between';
        multiSelectControls.style.alignItems = 'center';
        multiSelectControls.style.marginBottom = '10px';

        // Add select all checkbox
        const selectAllContainer = document.createElement('div');
        selectAllContainer.style.display = 'flex';
        selectAllContainer.style.alignItems = 'center';

        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.id = 'select-all-tasks';
        selectAllCheckbox.style.marginRight = '5px';
        selectAllCheckbox.addEventListener('change', () => {
            // Select or deselect all task checkboxes
            const taskCheckboxes = document.querySelectorAll('.task-select-checkbox');
            taskCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });

            // Update delete button state
            updateDeleteSelectedButton();
        });

        const selectAllLabel = document.createElement('label');
        selectAllLabel.htmlFor = 'select-all-tasks';
        selectAllLabel.textContent = 'Select All';
        selectAllLabel.style.fontSize = '0.9em';

        selectAllContainer.appendChild(selectAllCheckbox);
        selectAllContainer.appendChild(selectAllLabel);

        // Add delete selected button
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

        // First, find all tasks directly assigned to this date
        const directlyAssignedTasks = tasks.filter(task => {
            const assignedDateKey = task.assigned_date ? task.assigned_date.split('T')[0] : null;
            return assignedDateKey === dateKey;
        });

        // Then, find recurring tasks that should appear on this date
        const recurringTasks = tasks.filter(task => {
            // Skip if already directly assigned to this date
            const assignedDateKey = task.assigned_date ? task.assigned_date.split('T')[0] : null;
            if (assignedDateKey === dateKey) return false;

            // Skip if not a recurring task
            if (!task.recurrence_type || task.recurrence_type === 'none') return false;

            // For completed recurring tasks, check if the next occurrence falls on this date
            if (task.is_complete && task.assigned_date) {
                // Check if a next occurrence already exists in the database
                console.log(`[Selected Date View] Checking if next occurrence exists for task ${task.id} (${task.title})`);

                const nextOccurrenceExists = tasks.some(otherTask => {
                    // Skip the current task
                    if (otherTask.id === task.id) return false;

                    // Check if this is a potential next occurrence
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

                // Only create a virtual next occurrence if a real one doesn't exist
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
            // Create a copy of the task for the next occurrence
            const nextTask = { ...task };
            nextTask.is_complete = false; // Next occurrence is not complete
            nextTask.isRecurring = true;  // Mark as a recurring instance

            // Check if the next occurrence is overdue
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

        // Combine both lists
        const tasksOnDate = [...directlyAssignedTasks, ...recurringTasks];

        if (tasksOnDate.length === 0) {
            const noTasksLi = document.createElement('li');
            noTasksLi.textContent = 'No tasks assigned for this date.';
            selectedTaskListEl.appendChild(noTasksLi);
        } else {
            tasksOnDate.forEach(task => {
                const li = document.createElement('li');
                li.setAttribute('data-task-id', task.id);
                // Apply appropriate classes based on task state
                const classes = ['task-item']; // Add task-item class for CSS targeting
                if (task.is_complete) classes.push('complete');
                if (task.isRecurring) classes.push('recurring');
                if (task.isOverdue) classes.push('overdue');
                li.className = classes.join(' ');

                // Create a container for the checkbox and content
                const itemContainer = document.createElement('div');
                itemContainer.style.display = 'flex';
                itemContainer.style.alignItems = 'flex-start';
                itemContainer.style.gap = '8px';

                // Add touch event for mobile devices
                li.addEventListener('touchstart', handleTaskTouch);

                // Add checkbox for multi-select
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-select-checkbox';
                checkbox.setAttribute('data-task-id', task.id);
                checkbox.style.marginTop = '3px';
                checkbox.addEventListener('change', updateDeleteSelectedButton);
                itemContainer.appendChild(checkbox);

                // Create content container
                const contentContainer = document.createElement('div');
                contentContainer.style.flex = '1';

                // Create a container for the task title and badge
                const titleContainer = document.createElement('div');
                titleContainer.style.display = 'flex';
                titleContainer.style.justifyContent = 'space-between';
                titleContainer.style.alignItems = 'center';

                // Create the task title element
                const titleSpan = document.createElement('span');
                titleSpan.textContent = task.title;
                titleContainer.appendChild(titleSpan);

                // Add badge for recurring tasks
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
                            // Show the interval in the badge with proper pluralization
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

                            // Add detailed information in the tooltip
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

                // Add description if available
                if (task.description) {
                    const descDiv = document.createElement('div');
                    descDiv.textContent = task.description;
                    descDiv.style.fontSize = '0.85em';
                    descDiv.style.color = '#666';
                    descDiv.style.marginTop = '3px';
                    contentContainer.appendChild(descDiv);
                }

                // Add action buttons (Edit and Delete Icons)
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'task-actions';
                actionsDiv.style.display = 'flex';
                actionsDiv.style.gap = '8px';
                actionsDiv.style.opacity = '1'; // Ensure actions are always visible

                // Edit button
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

                // Delete button
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

                // Add content container to item container
                itemContainer.appendChild(contentContainer);

                // Add item container and action buttons to the list item
                li.appendChild(itemContainer);
                li.appendChild(actionsDiv);

                selectedTaskListEl.appendChild(li);
            });
        }

        // Add habits section if filter allows
        if (calendarFilter === 'both' || calendarFilter === 'habits') {
            const habitsHeading = document.createElement('h4');
            habitsHeading.textContent = 'Habits';
            habitsHeading.style.marginTop = '20px';
            habitsHeading.style.color = '#5b2c6f';
            selectedTaskListEl.appendChild(habitsHeading);

        // Get completions for this date
        // The dateKey is in YYYY-MM-DD format, but the keys in habitCompletions might be full date strings
        // So we need to check all possible formats
        let dateCompletions = [];

        // Try direct lookup first
        if (habitCompletions[dateKey]) {
            dateCompletions = habitCompletions[dateKey];
            console.log(`Found completions for ${dateKey} directly:`, dateCompletions);
        } else {
            // Try to find the date in other formats
            const dateParts = dateKey.split('-');
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
            const day = parseInt(dateParts[2], 10);

            // Create a date object and try different formats
            const dateObj = new Date(year, month, day);

            // Check all keys in habitCompletions
            for (const key in habitCompletions) {
                // Try to extract the date from the key
                const keyDate = new Date(key);

                // Check if the dates match (ignoring time)
                if (keyDate.getFullYear() === year &&
                    keyDate.getMonth() === month &&
                    keyDate.getDate() === day) {
                    dateCompletions = habitCompletions[key];
                    console.log(`Found completions for ${dateKey} via date object matching:`, dateCompletions);
                    break;
                }
            }
        }

        // Create a map for quick lookup of completions
        const completionMap = {};
        dateCompletions.forEach(completion => {
            completionMap[completion.habitId] = completion.count;
        });

        // Check if this date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0); // Reset time to start of day
        const isFutureDate = dateObj > today;

        // Check if this is today's date
        const todayKey = formatDateKey(new Date());
        const isToday = dateKey === todayKey;
        console.log(`Selected date view - Is this today's date (${dateKey} vs ${todayKey})? ${isToday}`);

        // For today's date, show all habits. For other dates, only show habits with progress
        let habitsToShow = [];
        if (isToday) {
            // Show all habits for today
            habitsToShow = allHabits;
            console.log(`Selected date view - Showing all habits for today (${dateKey}):`, habitsToShow);
        } else {
            // For other dates, only show habits with progress
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
            // Display habits
            habitsToShow.forEach(habit => {
                const li = document.createElement('li');
                li.setAttribute('data-habit-id', habit.id);

                // Get completion count for this habit on this date
                const completionCount = completionMap[habit.id] || 0;

                // Make sure we use the correct target value
                // First try to get it from the habit object's completions_per_day property
                // If not available, try to find it in the dateCompletions array
                let target = parseInt(habit.completions_per_day) || 1;

                // For habits like Social Media Rejection that have a specific target
                // Try to find the target in the dateCompletions array
                const habitCompletion = dateCompletions.find(c => c.habitId === habit.id);
                if (habitCompletion && habitCompletion.target) {
                    target = parseInt(habitCompletion.target);
                }

                console.log(`Selected date view - Displaying habit ${habit.id} (${habit.title}) with ${completionCount}/${target} completions`);

                // Set completion status
                if (completionCount >= target) {
                    li.className = 'complete';
                } else if (completionCount > 0) {
                    li.className = 'partial';
                    li.style.backgroundColor = '#e8daef'; // Light purple for partial completion
                    li.style.textDecoration = 'none'; // Remove line-through
                }

                // Create a container for the habit title and badge
                const titleContainer = document.createElement('div');
                titleContainer.style.display = 'flex';
                titleContainer.style.justifyContent = 'space-between';
                titleContainer.style.alignItems = 'center';

                // Create the habit title element
                const titleSpan = document.createElement('span');
                titleSpan.textContent = habit.title;
                titleContainer.appendChild(titleSpan);

                // Add badge for completion status
                const badgeSpan = document.createElement('span');
                badgeSpan.style.backgroundColor = completionCount >= target ? '#a5d6a7' : '#e8daef';
                badgeSpan.style.color = completionCount >= target ? '#2e7d32' : '#5b2c6f';
                badgeSpan.style.padding = '2px 6px';
                badgeSpan.style.borderRadius = '10px';
                badgeSpan.style.fontSize = '0.75em';
                badgeSpan.style.fontWeight = 'bold';
                badgeSpan.style.marginLeft = '8px';
                // Always show the actual completion count and target
                // This ensures habits like Social Media Rejection show 2/8 instead of 0/1
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

    // --- Task Edit and Delete Handlers ---

    // Handle editing a task
    function handleEditTask(task) {
        console.log('Editing task:', task);

        // Store the original task data for debugging
        window.originalTaskData = JSON.parse(JSON.stringify(task));
        console.log('Original task data stored for debugging:', window.originalTaskData);

        // Debug information
        console.log('Edit task modal element:', editTaskModal);
        console.log('Edit task form element:', editTaskForm);
        console.log('Edit task ID input element:', editTaskIdInput);

        if (!editTaskModal) {
            console.error('Edit task modal not found');
            alert('Edit task modal not found. Please check the console for more information.');
            return;
        }

        // Clear any previous status
        if (editTaskStatus) {
            editTaskStatus.textContent = '';
            editTaskStatus.className = 'status';
        }

        // Populate the form fields
        editTaskIdInput.value = task.id;
        editTaskTitleInput.value = task.title || '';
        editTaskDescriptionInput.value = task.description || '';

        // Format dates/times for input fields with better logging
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

        // Set recurrence fields
        editTaskRecurrenceTypeSelect.value = task.recurrence_type || 'none';
        editTaskRecurrenceIntervalInput.value = task.recurrence_interval || '1';

        // Update the interval unit text based on recurrence type
        updateRecurrenceIntervalUnit();

        // Show/hide interval input based on recurrence type
        editTaskRecurrenceIntervalContainer.style.display =
            (task.recurrence_type && task.recurrence_type !== 'none') ? 'block' : 'none';

        // Show the modal
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Remove any display: none !important from the style
        editTaskModal.style.removeProperty('display');

        // Set display to flex
        editTaskModal.style.display = 'flex';

        // Also add a class to ensure it's visible
        editTaskModal.classList.add('modal-visible');

        // Force a reflow to ensure the modal is displayed properly
        void editTaskModal.offsetWidth;
    }

    // Update the interval unit text based on recurrence type
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

    // Helper function to check if a task is recurring
    function isTaskRecurring(task) {
        return task.recurrence_type && task.recurrence_type !== 'none';
    }

    // Handle deleting a task
    async function handleDeleteTask(task) {
        console.log('Deleting task:', task);

        // Check if this is a recurring task
        const isRecurring = isTaskRecurring(task);

        // Show appropriate confirmation message based on whether the task is recurring
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

            // Parse the response to get information about deleted tasks
            const result = await response.json();
            console.log(`Task deletion result:`, result);

            // Refresh the tasks data
            await fetchTasks();

            // Get the currently selected date
            const selectedDay = document.querySelector('.calendar-day.selected');
            if (selectedDay) {
                const dateKey = selectedDay.getAttribute('data-date');
                if (dateKey) {
                    const date = new Date(dateKey + 'T00:00:00');
                    // Refresh the task list for the selected date
                    showTasksForDate(date, allTasks);
                }
            }

            // Refresh the calendar view
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

            // Show a success message based on how many tasks were deleted
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

    // Handle touch events for mobile devices
    function handleTaskTouch(event) {
        // Get the task item
        const taskItem = event.currentTarget;

        // Toggle the show-actions class
        taskItem.classList.toggle('show-actions');

        // Remove the class after 3 seconds
        setTimeout(() => {
            taskItem.classList.remove('show-actions');
        }, 3000);
    }

    // Function to update the Delete Selected button visibility
    function updateDeleteSelectedButton() {
        const deleteSelectedBtn = document.getElementById('delete-selected-tasks');
        if (!deleteSelectedBtn) return;

        // Check if any checkboxes are selected
        const selectedCheckboxes = document.querySelectorAll('.task-select-checkbox:checked');
        deleteSelectedBtn.style.display = selectedCheckboxes.length > 0 ? 'block' : 'none';
    }

    // Handle deleting multiple selected tasks
    async function handleDeleteSelectedTasks() {
        const selectedCheckboxes = document.querySelectorAll('.task-select-checkbox:checked');
        if (selectedCheckboxes.length === 0) return;

        // Get the task IDs and check if any are recurring
        const taskIds = [];
        let hasRecurringTasks = false;

        // Check each selected task
        for (const checkbox of selectedCheckboxes) {
            const taskId = checkbox.getAttribute('data-task-id');
            taskIds.push(taskId);

            // Find the task in allTasks
            const task = allTasks.find(t => t.id.toString() === taskId);
            if (task && isTaskRecurring(task)) {
                hasRecurringTasks = true;
            }
        }

        // Create appropriate confirmation message
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

        // Show loading status
        updateStatus(`Deleting ${taskIds.length} tasks...`, false);

        // Delete each task one by one
        for (const taskId of taskIds) {
            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Parse the response to get information about deleted tasks
                    try {
                        const result = await response.json();
                        console.log(`Task ${taskId} deletion result:`, result);

                        // Count the number of recurrences deleted
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

        // Refresh the tasks data
        await fetchTasks();

        // Get the currently selected date
        const selectedDay = document.querySelector('.calendar-day.selected');
        if (selectedDay) {
            const dateKey = selectedDay.getAttribute('data-date');
            if (dateKey) {
                const date = new Date(dateKey + 'T00:00:00');
                // Refresh the task list for the selected date
                showTasksForDate(date, allTasks);
            }
        }

        // Refresh the calendar view
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

        // Show a success/error message
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

    // --- Event Listeners ---

    prevMonthBtn.addEventListener('click', async () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        // Force render when explicitly navigating to a new month
        window.forceRender = true;
        await renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', async () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        // Force render when explicitly navigating to a new month
        window.forceRender = true;
        await renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    closeSelectedDateViewBtn.addEventListener('click', () => {
        selectedDateTasksEl.style.display = 'none';
        document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
    });

    // Edit Task Modal Event Listeners
    if (editTaskModal && editTaskForm) {
        // Close button event listener
        if (closeEditTaskModalBtn) {
            closeEditTaskModalBtn.addEventListener('click', () => {
                closeEditTaskModal();
            });
        }

        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === editTaskModal) {
                closeEditTaskModal();
            }
        });

        // Function to properly close the edit task modal
        function closeEditTaskModal() {
            // Hide the modal
            editTaskModal.style.display = 'none';
            editTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Restore scrolling
        }

        // Handle recurrence type change
        editTaskRecurrenceTypeSelect.addEventListener('change', () => {
            // Show/hide interval input based on recurrence type
            const recurrenceType = editTaskRecurrenceTypeSelect.value;
            editTaskRecurrenceIntervalContainer.style.display =
                (recurrenceType !== 'none') ? 'block' : 'none';

            // Update the interval unit text
            updateRecurrenceIntervalUnit();
        });

        // Handle form submission
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

            // Gather data from the form
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

                // Log the updated dates for debugging
                console.log(`Task ${taskId} dates updated:`, {
                    originalAssignedDate: task.assigned_date,
                    originalDueDate: task.due_date,
                    newAssignedDate: result.assigned_date,
                    newDueDate: result.due_date,
                    formAssignedDate: editTaskAssignedDateInput.value,
                    formDueDate: editTaskDueDateInput.value
                });

                // Refresh the tasks data with force reload to ensure we get the latest data
                await fetchTasks(true);

                // Get the currently selected date
                const selectedDay = document.querySelector('.calendar-day.selected');
                if (selectedDay) {
                    const dateKey = selectedDay.getAttribute('data-date');
                    if (dateKey) {
                        const date = new Date(dateKey + 'T00:00:00');
                        // Refresh the task list for the selected date
                        showTasksForDate(date, allTasks);
                    }
                }

                // Refresh the calendar view
                renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

                // Show success message
                updateEditTaskStatus("Task updated successfully", false);

                // Close the modal after a short delay
                setTimeout(() => {
                    editTaskModal.style.display = 'none';
                    editTaskModal.classList.remove('modal-visible');
                    document.body.style.overflow = ''; // Restore scrolling
                    updateEditTaskStatus("", false);
                }, 1500);

                // Dispatch a custom event to notify other components
                document.dispatchEvent(new CustomEvent('taskUpdated', { detail: result }));

            } catch (error) {
                console.error('Error updating task:', error);
                updateEditTaskStatus(`Error updating task: ${error.message}`, true);
            } finally {
                // Re-enable the save button
                saveButton.disabled = false;
                saveButton.textContent = 'Save Changes';
            }
        });

        // Note: Close button and outside click handlers are already set up above
    }

    // Helper function to update edit task status
    function updateEditTaskStatus(message, isError = false) {
        if (!editTaskStatus) return;

        editTaskStatus.textContent = message;
        editTaskStatus.className = `status ${isError ? 'error' : 'success'}`;
        editTaskStatus.style.display = message ? 'block' : 'none';
    }


    // --- Initial Load ---
    async function initializeCalendar() {
        console.log('Initializing calendar - this should only run once');

        // Set a flag to prevent multiple initializations
        if (window.calendarInitialized) {
            console.log('Calendar already initialized, skipping');
            return;
        }

        try {
            // Make sure currentDate is initialized
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
                // Try a simpler approach if the main render fails
                if (calendarGridEl) {
                    calendarGridEl.innerHTML = '<div class="calendar-error">Error rendering calendar. Please refresh the page.</div>';
                }
            }

            // Set up calendar filter
            const calendarFilterEl = document.getElementById('calendarFilter');
            if (calendarFilterEl) {
                calendarFilterEl.addEventListener('change', () => {
                    calendarFilter = calendarFilterEl.value;
                    console.log('Filter changed, re-rendering calendar');
                    // Force render when filter changes
                    window.forceRender = true;
                    renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Re-render with the new filter
                });
            }

            // Note: Task event listeners are now handled by calendar-refresh-fix.js
            // and habit event listeners are handled by calendar-refresh.js

            // Set the initialization flag
            window.calendarInitialized = true;
            console.log('Calendar initialization complete');
        } catch (error) {
            console.error('Error initializing calendar:', error);
            updateStatus("Error loading calendar. Please refresh the page.", true);
        }
    }

    // Initialize with error handling
    try {
        initializeCalendar();
    } catch (error) {
        console.error('Fatal error initializing calendar:', error);
        updateStatus("Error loading calendar. Please refresh the page.", true);
    }

}); // End DOMContentLoaded