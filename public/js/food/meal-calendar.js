/**
 * Meal Calendar Module
 * Handles the meal calendar functionality in the food page
 */

(function() {
    'use strict';

    // Calendar state
    let currentDate = new Date();
    let calendarData = {};
    let isLoading = false;

    // DOM elements
    let calendarGrid;
    let monthYearDisplay;
    let prevButton;
    let nextButton;
    let statusElement;

    // Initialize the calendar when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeCalendar();
    });

    /**
     * Initialize the calendar component
     */
    function initializeCalendar() {
        console.log('[Meal Calendar] Initializing calendar...');

        // Get DOM elements
        calendarGrid = document.getElementById('meal-calendar-grid');
        monthYearDisplay = document.getElementById('calendar-month-year');
        prevButton = document.getElementById('calendar-prev-month');
        nextButton = document.getElementById('calendar-next-month');
        statusElement = document.getElementById('calendar-status');

        if (!calendarGrid || !monthYearDisplay || !prevButton || !nextButton) {
            console.error('[Meal Calendar] Required DOM elements not found');
            return;
        }

        // Add event listeners
        prevButton.addEventListener('click', navigateToPreviousMonth);
        nextButton.addEventListener('click', navigateToNextMonth);

        // Load initial calendar data
        loadCalendarData();
    }

    /**
     * Navigate to previous month
     */
    function navigateToPreviousMonth() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        loadCalendarData();
    }

    /**
     * Navigate to next month
     */
    function navigateToNextMonth() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        loadCalendarData();
    }

    /**
     * Load calendar data from the API
     */
    async function loadCalendarData() {
        if (isLoading) return;

        isLoading = true;
        showStatus('Loading calendar data...', 'info');

        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
            const userId = getCurrentUserId();

            console.log(`[Meal Calendar] Loading data for ${year}-${month}, user ${userId}`);

            const response = await fetch(`/api/meals/calendar-data?user_id=${userId}&year=${year}&month=${month}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                calendarData = result.data;
                renderCalendar();
                hideStatus();
            } else {
                throw new Error(result.message || 'Failed to load calendar data');
            }
        } catch (error) {
            console.error('[Meal Calendar] Error loading calendar data:', error);
            showStatus(`Error loading calendar: ${error.message}`, 'error');
        } finally {
            isLoading = false;
        }
    }

    /**
     * Get current user ID from the user selector
     */
    function getCurrentUserId() {
        const userSelector = document.getElementById('user-selector');
        return userSelector ? userSelector.value : 1;
    }

    /**
     * Render the calendar grid
     */
    function renderCalendar() {
        console.log('[Meal Calendar] Rendering calendar...');

        // Update month/year display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        monthYearDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        // Clear existing calendar days (keep headers)
        const headers = calendarGrid.querySelectorAll('.calendar-header');
        calendarGrid.innerHTML = '';
        headers.forEach(header => calendarGrid.appendChild(header));

        // Get calendar layout
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

        // Generate calendar days
        const today = new Date();
        const todayString = formatDateKey(today);

        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayElement = createDayElement(date, todayString);
            calendarGrid.appendChild(dayElement);
        }
    }

    /**
     * Create a calendar day element
     */
    function createDayElement(date, todayString) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';

        const dateKey = formatDateKey(date);
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const isToday = dateKey === todayString;
        const dayData = calendarData.dailyData && calendarData.dailyData[dateKey];

        // Add classes
        if (!isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        if (isToday) {
            dayElement.classList.add('today');
        }

        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);

        // Only show data for current month days
        if (isCurrentMonth) {
            // Calorie info
            const calorieInfo = document.createElement('div');
            calorieInfo.className = 'calorie-info';

            const target = (dayData && dayData.calorieTarget) || calendarData.calorieTarget;
            const consumed = Math.round((dayData && dayData.totalCalories) || 0);

            if (target) {
                const consumedText = document.createElement('div');
                consumedText.className = `calorie-consumed ${consumed > target ? 'calorie-over-target' : 'calorie-under-target'}`;
                consumedText.textContent = `${consumed}/${target} cal`;
                calorieInfo.appendChild(consumedText);
            } else if (consumed > 0) {
                const consumedText = document.createElement('div');
                consumedText.className = 'calorie-consumed';
                consumedText.textContent = `${consumed} cal`;
                calorieInfo.appendChild(consumedText);
            }

            dayElement.appendChild(calorieInfo);

            // Meals list
            if (dayData && dayData.meals && dayData.meals.length > 0) {
                const mealsList = document.createElement('div');
                mealsList.className = 'meals-list';

                dayData.meals.forEach(meal => {
                    const mealItem = document.createElement('div');
                    mealItem.className = 'meal-item';

                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'meal-time';
                    timeSpan.textContent = formatTime(meal.time);

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'meal-name';
                    nameSpan.textContent = meal.name;

                    mealItem.appendChild(timeSpan);
                    mealItem.appendChild(nameSpan);
                    mealsList.appendChild(mealItem);
                });

                dayElement.appendChild(mealsList);
            }
        }

        // Add click handler
        dayElement.addEventListener('click', () => handleDayClick(date, dayData));

        return dayElement;
    }

    /**
     * Handle day click
     */
    function handleDayClick(date, dayData) {
        console.log('[Meal Calendar] Day clicked:', date, dayData);

        // Remove previous selection
        const previousSelected = calendarGrid.querySelector('.calendar-day.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // Add selection to clicked day
        event.target.closest('.calendar-day').classList.add('selected');

        // You can add more functionality here, such as:
        // - Show detailed meal information in a modal
        // - Navigate to meal submission form with pre-filled date
        // - Show daily nutrition summary
    }

    /**
     * Format date as YYYY-MM-DD
     */
    function formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Format time as HH:MM
     */
    function formatTime(timeString) {
        if (!timeString) return '';
        return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
    }

    /**
     * Show status message
     */
    function showStatus(message, type = 'info') {
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
        statusElement.style.display = 'block';
    }

    /**
     * Hide status message
     */
    function hideStatus() {
        if (!statusElement) return;
        statusElement.style.display = 'none';
    }

    /**
     * Refresh calendar data (called when meals are submitted)
     */
    function refreshCalendar() {
        console.log('[Meal Calendar] Refreshing calendar...');
        loadCalendarData();
    }

    // Export functions for external use
    window.MealCalendar = {
        refresh: refreshCalendar
    };

})();
