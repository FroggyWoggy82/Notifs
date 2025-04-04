// public/js/calendar.js
document.addEventListener('DOMContentLoaded', () => {
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    const calendarGridEl = document.querySelector('.calendar-grid');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const calendarStatusEl = document.getElementById('calendarStatus');
    const selectedDateTasksEl = document.getElementById('selectedDateTasks');
    const selectedDateDisplayEl = document.getElementById('selectedDateDisplay');
    const selectedTaskListEl = document.getElementById('selectedTaskList');
    const closeSelectedDateViewBtn = document.getElementById('closeSelectedDateView');

    let currentDate = new Date(); // State for the currently viewed month/year
    let allTasks = []; // Store fetched tasks

    // --- Helper Functions ---

    function updateStatus(message, isError = false) {
        console.log(`Calendar Status: ${message} (Error: ${isError})`);
        calendarStatusEl.textContent = message;
        calendarStatusEl.className = `status ${isError ? 'error' : 'success'}`;
        calendarStatusEl.style.display = message ? 'block' : 'none';
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
    async function fetchTasks() {
        updateStatus("Loading tasks...", false);
        try {
            // Fetch tasks that have either an assigned_date or due_date
            // The API might need refinement to fetch only relevant tasks for a given month view
            const response = await fetch('/api/tasks?relevantDates=true'); // Add a query param if needed
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allTasks = await response.json();
            console.log("Tasks fetched for calendar:", allTasks);
            updateStatus("", false); // Clear loading message
            return allTasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            updateStatus("Error loading tasks.", true);
            allTasks = []; // Ensure tasks array is empty on error
            return [];
        }
    }

    // Render the calendar grid for the given month and year
    function renderCalendar(year, month) {
        updateStatus("Rendering calendar...", false);
        calendarGridEl.querySelectorAll('.calendar-day').forEach(el => el.remove()); // Clear previous days
        selectedDateTasksEl.style.display = 'none'; // Hide date detail view

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon, ...

        currentMonthYearEl.textContent = firstDayOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

        const today = new Date();
        const todayKey = formatDateKey(today);

        // --- Group tasks by date for faster lookup --- //
        const tasksByDate = {};
        allTasks.forEach(task => {
            const dates = [];

            // For completed recurring tasks, calculate and show the next occurrence
            if (task.is_complete && task.recurrence_type && task.recurrence_type !== 'none') {
                const nextOccurrence = calculateNextOccurrence(task);
                if (nextOccurrence) {
                    // Create a copy of the task for the next occurrence
                    const nextTask = { ...task };
                    nextTask.assigned_date = formatDateKey(nextOccurrence);
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

                    if (isInCurrentMonth) {
                        console.log(`Adding next occurrence of task ${task.id} on ${nextDateKey}`);

                        // Store the next occurrence task
                        if (!tasksByDate[nextDateKey]) {
                            tasksByDate[nextDateKey] = [];
                        }
                        tasksByDate[nextDateKey].push(nextTask);
                    }
                }
            }

            // Use assigned_date as the primary date for calendar view
            if (task.assigned_date) {
                try {
                    // Extract YYYY-MM-DD part
                    const assignedDateKey = task.assigned_date.split('T')[0];
                    dates.push(assignedDateKey);

                    // Only add non-recurring instances or incomplete tasks to their original date
                    if (!task.is_complete || !task.recurrence_type || task.recurrence_type === 'none') {
                        if (!tasksByDate[assignedDateKey]) {
                            tasksByDate[assignedDateKey] = [];
                        }
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

        // Add tasks to the day cell (if not other month)
        if (!isOtherMonth && tasks.length > 0) {
            const tasksDiv = document.createElement('div');
            tasksDiv.className = 'calendar-tasks';

            // Add all tasks instead of limiting to 3
            tasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.className = 'calendar-task-item';

                // Apply appropriate classes based on task state
                if (task.is_complete) taskEl.classList.add('complete');
                if (task.isRecurring) taskEl.classList.add('recurring');

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
            // We'll do this in a setTimeout to ensure the DOM has been updated
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

    // Display tasks for the selected date in the dedicated section
    function showTasksForDate(date, tasks) {
        const dateKey = formatDateKey(date);
        selectedDateDisplayEl.textContent = date.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        selectedTaskListEl.innerHTML = ''; // Clear previous list

        const tasksOnDate = tasks.filter(task => {
            // Match based on assigned_date for now
            const assignedDateKey = task.assigned_date ? task.assigned_date.split('T')[0] : null;

            // Check if this is a recurring task instance for this date
            const isRecurringOnDate = task.isRecurring && assignedDateKey === dateKey;

            // Check if this is a regular task for this date
            const isRegularTaskOnDate = assignedDateKey === dateKey &&
                                       (!task.is_complete || !task.recurrence_type || task.recurrence_type === 'none');

            return isRecurringOnDate || isRegularTaskOnDate;
        });

        if (tasksOnDate.length === 0) {
            selectedTaskListEl.innerHTML = '<li>No tasks assigned for this date.</li>';
        } else {
            tasksOnDate.forEach(task => {
                const li = document.createElement('li');

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
                            // Show the interval in the badge
                            badgeSpan.textContent = `Every ${interval} ${task.recurrence_type.slice(0, -2)}s`;

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

                li.appendChild(titleContainer);

                // Add description if available
                if (task.description) {
                    const descDiv = document.createElement('div');
                    descDiv.textContent = task.description;
                    descDiv.style.fontSize = '0.85em';
                    descDiv.style.color = '#666';
                    descDiv.style.marginTop = '3px';
                    li.appendChild(descDiv);
                }

                // Apply complete class if needed
                if (task.is_complete) {
                    li.classList.add('complete');
                }

                selectedTaskListEl.appendChild(li);
            });
        }

        selectedDateTasksEl.style.display = 'block';
        selectedDateTasksEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // --- Event Listeners ---

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    closeSelectedDateViewBtn.addEventListener('click', () => {
        selectedDateTasksEl.style.display = 'none';
         document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
    });


    // --- Initial Load ---
    async function initializeCalendar() {
        await fetchTasks(); // Load tasks first
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Then render calendar
    }

    initializeCalendar();

}); // End DOMContentLoaded