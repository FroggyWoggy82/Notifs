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

    // Edit Task Modal Elements
    const editTaskModal = document.getElementById('edit-task-modal');
    const editTaskForm = document.getElementById('edit-task-form');
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

        // Parse the assigned date - ensure we're working with just the date part
        const assignedDateStr = task.assigned_date.split('T')[0];

        // Create date objects with the correct date parts only to avoid timezone issues
        const [assignedYear, assignedMonth, assignedDay] = assignedDateStr.split('-').map(Number);
        const assignedDate = new Date(assignedYear, assignedMonth - 1, assignedDay);

        if (isNaN(assignedDate.getTime())) {
            console.warn(`Invalid assigned_date for task ${task.id}: ${task.assigned_date}`);
            return null;
        }

        console.log(`[Calendar] Calculating next occurrence for task ${task.id} (${task.title})`);
        console.log(`[Calendar] Original assigned date: ${assignedDateStr}, parsed as: ${assignedDate.toISOString()}`);
        console.log(`[Calendar] Original date components: year=${assignedYear}, month=${assignedMonth}, day=${assignedDay}`);

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

        console.log(`[Calendar] Calculated next occurrence date: ${nextDate.toISOString()}`);

        // Validate that the next occurrence is actually in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for proper date comparison

        if (nextDate < today) {
            console.error(`[Calendar] Calculated next date ${nextDate.toISOString()} is in the past!`);
            // Recalculate to ensure it's in the future
            while (nextDate < today) {
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
                }
            }
            console.log(`[Calendar] Corrected next occurrence date to: ${nextDate.toISOString()}`);
        }

        // Ensure we're returning a date with the correct time zone handling
        // This is important for consistent date calculations

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
                const nextOccurrence = calculateNextOccurrence(task);
                if (nextOccurrence) {
                    const nextDateKey = formatDateKey(nextOccurrence);
                    const matches = nextDateKey === dateKey;

                    if (matches) {
                        console.log(`[Calendar] Found recurring task for date ${dateKey}: ${task.title} (ID: ${task.id})`);
                        console.log(`[Calendar] Next occurrence date: ${nextDateKey}`);
                    }

                    return matches;
                }
            }

            return false;
        }).map(task => {
            // Create a copy of the task for the next occurrence
            const nextTask = { ...task };
            nextTask.is_complete = false; // Next occurrence is not complete
            nextTask.isRecurring = true;  // Mark as a recurring instance
            return nextTask;
        });

        // Combine both lists
        const tasksOnDate = [...directlyAssignedTasks, ...recurringTasks];

        if (tasksOnDate.length === 0) {
            selectedTaskListEl.innerHTML = '<li>No tasks assigned for this date.</li>';
        } else {
            tasksOnDate.forEach(task => {
                const li = document.createElement('li');
                li.setAttribute('data-task-id', task.id);
                li.className = task.is_complete ? 'complete' : '';

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

                // Add action buttons (Edit and Delete)
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'task-actions';
                actionsDiv.style.marginTop = '8px';
                actionsDiv.style.display = 'flex';
                actionsDiv.style.gap = '8px';

                // Edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-task-btn';
                editBtn.textContent = 'Edit';
                editBtn.style.padding = '4px 8px';
                editBtn.style.backgroundColor = '#4db6ac';
                editBtn.style.color = 'white';
                editBtn.style.border = 'none';
                editBtn.style.borderRadius = '4px';
                editBtn.style.cursor = 'pointer';
                editBtn.addEventListener('click', () => handleEditTask(task));
                actionsDiv.appendChild(editBtn);

                // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = 'Delete';
                deleteBtn.style.padding = '4px 8px';
                deleteBtn.style.backgroundColor = '#e57373';
                deleteBtn.style.color = 'white';
                deleteBtn.style.border = 'none';
                deleteBtn.style.borderRadius = '4px';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.addEventListener('click', () => handleDeleteTask(task));
                actionsDiv.appendChild(deleteBtn);

                li.appendChild(actionsDiv);

                selectedTaskListEl.appendChild(li);
            });
        }

        selectedDateTasksEl.style.display = 'block';
        selectedDateTasksEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // --- Task Edit and Delete Handlers ---

    // Handle editing a task
    function handleEditTask(task) {
        console.log('Editing task:', task);

        if (!editTaskModal) {
            console.error('Edit task modal not found');
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

        // Format dates/times for input fields
        editTaskReminderTimeInput.value = task.reminder_time ? new Date(task.reminder_time).toISOString().slice(0, 16) : '';
        editTaskAssignedDateInput.value = task.assigned_date ? task.assigned_date.split('T')[0] : '';
        editTaskDueDateInput.value = task.due_date ? task.due_date.split('T')[0] : '';

        // Set recurrence fields
        editTaskRecurrenceTypeSelect.value = task.recurrence_type || 'none';
        editTaskRecurrenceIntervalInput.value = task.recurrence_interval || '1';

        // Update the interval unit text based on recurrence type
        updateRecurrenceIntervalUnit();

        // Show/hide interval input based on recurrence type
        editTaskRecurrenceIntervalContainer.style.display =
            (task.recurrence_type && task.recurrence_type !== 'none') ? 'block' : 'none';

        // Show the modal
        editTaskModal.style.display = 'block';
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

    // Handle deleting a task
    async function handleDeleteTask(task) {
        console.log('Deleting task:', task);

        if (!confirm(`Are you sure you want to delete task "${task.title}"?`)) {
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

            console.log(`Task ${task.id} deleted successfully`);

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

            // Show a success message
            updateStatus("Task deleted successfully", false);
            setTimeout(() => updateStatus("", false), 3000);

        } catch (error) {
            console.error('Error deleting task:', error);
            updateStatus(`Error deleting task: ${error.message}`, true);
        }
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

    // Edit Task Modal Event Listeners
    if (editTaskModal && editTaskForm) {
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
                    parseInt(editTaskRecurrenceIntervalInput.value, 10) : null
            };

            // Basic validation
            if (!updatedData.title) {
                updateEditTaskStatus("Task title cannot be empty.", true);
                saveButton.disabled = false;
                saveButton.textContent = 'Save Changes';
                return;
            }

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

                updateEditTaskStatus("Task updated successfully!", false);
                setTimeout(() => {
                    editTaskModal.style.display = 'none';
                }, 1000);

            } catch (error) {
                console.error('Error updating task:', error);
                updateEditTaskStatus(`Error updating task: ${error.message}`, true);
            } finally {
                saveButton.disabled = false;
                saveButton.textContent = 'Save Changes';
            }
        });

        // Close modal when clicking the close button
        if (closeEditTaskModalBtn) {
            closeEditTaskModalBtn.addEventListener('click', () => {
                editTaskModal.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        editTaskModal.addEventListener('click', (event) => {
            if (event.target === editTaskModal) {
                editTaskModal.style.display = 'none';
            }
        });
    }

    // Helper function to update edit task status
    function updateEditTaskStatus(message, isError = false) {
        if (!editTaskStatus) return;

        editTaskStatus.textContent = message;
        editTaskStatus.className = `status ${isError ? 'error' : 'success'}`;
        editTaskStatus.style.display = message ? 'block' : 'none';
    }


    // --- Calendar Refresh Function ---
    async function refreshCalendar() {
        try {
            await fetchTasks(); // Reload tasks
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Re-render calendar
            console.log('[Calendar] Calendar refreshed successfully');

            // If a date is selected, refresh the task list for that date
            const selectedDay = document.querySelector('.calendar-day.selected');
            if (selectedDay) {
                const dateKey = selectedDay.getAttribute('data-date');
                if (dateKey) {
                    const date = new Date(dateKey + 'T00:00:00');
                    showTasksForDate(date, allTasks);
                }
            }
        } catch (error) {
            console.error('[Calendar] Error refreshing calendar:', error);
            updateStatus('Failed to refresh calendar data. Please try again.', true);
        }
    }

    // --- Initial Load ---
    async function initializeCalendar() {
        await fetchTasks(); // Load tasks first
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Then render calendar

        // Set up a periodic refresh to catch any changes made in other tabs/windows
        setInterval(refreshCalendar, 30000); // Refresh every 30 seconds
    }

    initializeCalendar();

}); // End DOMContentLoaded