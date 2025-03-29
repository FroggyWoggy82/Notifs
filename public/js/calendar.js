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
            // Use assigned_date as the primary date for calendar view
            if (task.assigned_date) {
                try {
                    // Extract YYYY-MM-DD part
                    const assignedDateKey = task.assigned_date.split('T')[0];
                    dates.push(assignedDateKey);
                } catch (e) { console.warn(`Invalid assigned_date format for task ${task.id}: ${task.assigned_date}`) }
            }
            // We could also add due_date here if needed, maybe with different styling
            // if (task.due_date) { ... }

            dates.forEach(dateKey => {
                if (!tasksByDate[dateKey]) {
                    tasksByDate[dateKey] = [];
                }
                 tasksByDate[dateKey].push(task);
            });

            // TODO: Handle recurring tasks - this requires more complex logic
            // based on task.recurrence_type and task.recurrence_interval
            // to calculate occurrences within the current month view.
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
            tasks.slice(0, 3).forEach(task => { // Limit visible tasks initially
                const taskEl = document.createElement('div');
                taskEl.className = 'calendar-task-item';
                if (task.is_complete) taskEl.classList.add('complete');
                taskEl.textContent = task.title;
                taskEl.title = task.title; // Tooltip for full title
                tasksDiv.appendChild(taskEl);
            });
             if (tasks.length > 3) {
                 const moreEl = document.createElement('div');
                 moreEl.className = 'calendar-task-more';
                 moreEl.textContent = `+${tasks.length - 3} more`;
                 moreEl.style.fontSize = '0.75em';
                 moreEl.style.textAlign = 'center';
                 moreEl.style.marginTop = '3px';
                 moreEl.style.color = '#566573';
                 tasksDiv.appendChild(moreEl);
             }
            dayDiv.appendChild(tasksDiv);
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
            // Add due_date matching later if needed
            // const dueDateKey = task.due_date ? task.due_date.split('T')[0] : null;
            return assignedDateKey === dateKey; // || dueDateKey === dateKey;
        });

        // TODO: Include recurring task instances for this date

        if (tasksOnDate.length === 0) {
            selectedTaskListEl.innerHTML = '<li>No tasks assigned for this date.</li>';
        } else {
            tasksOnDate.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task.title;
                if (task.is_complete) {
                    li.classList.add('complete');
                }
                // Add more details if needed (e.g., description, time)
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