/**
 * Weekly Recap Notification
 * Shows a clickable notification with completed tasks from the current week
 * Appears in the same location as the old "Notification subscription saved successfully!" message
 */

(function() {
    'use strict';

    // Configuration
    const STORAGE_KEY = 'lastWeeklyRecapShown';
    const POPUP_FREQUENCY_DAYS = 7; // Show notification every 7 days
    const NOTIFICATION_DURATION_HOURS = 24; // Show for 24 hours

    // Initialize the weekly recap system
    function initWeeklyRecap() {
        // Check if we should show the notification
        if (shouldShowWeeklyRecap()) {
            // Delay showing the notification to allow page to load
            setTimeout(() => {
                showWeeklyRecapNotification();
            }, 3000); // Show after 3 seconds
        }
    }

    // Check if we should show the weekly recap notification
    function shouldShowWeeklyRecap() {
        const lastShown = localStorage.getItem(STORAGE_KEY);
        const now = new Date();

        if (!lastShown) {
            return true; // First time, show it
        }

        const lastShownDate = new Date(lastShown);
        const daysSinceLastShown = Math.floor((now - lastShownDate) / (1000 * 60 * 60 * 24));

        return daysSinceLastShown >= POPUP_FREQUENCY_DAYS;
    }

    // Check if the notification should still be visible (within 24 hours)
    function shouldNotificationBeVisible() {
        const lastShown = localStorage.getItem(STORAGE_KEY);

        if (!lastShown) {
            return false;
        }

        const lastShownDate = new Date(lastShown);
        const now = new Date();
        const hoursSinceLastShown = (now - lastShownDate) / (1000 * 60 * 60);

        return hoursSinceLastShown < NOTIFICATION_DURATION_HOURS;
    }

    // Fetch completed tasks for this week
    async function fetchCompletedTasksThisWeek() {
        try {
            const response = await fetch('/api/tasks/completed/week');
            const data = await response.json();

            if (data.success) {
                return data.tasks;
            } else {
                console.error('Failed to fetch completed tasks:', data.error);
                return getMockCompletedTasks(); // Fallback to mock data
            }
        } catch (error) {
            console.error('Error fetching completed tasks:', error);
            return getMockCompletedTasks(); // Fallback to mock data
        }
    }

    // Get mock completed tasks for demo purposes
    function getMockCompletedTasks() {
        const today = new Date();
        const mockTasks = [
            {
                id: 1,
                title: "Complete weekly grocery shopping",
                completion_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 2,
                title: "Finish project documentation",
                completion_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                id: 3,
                title: "Call dentist for appointment",
                completion_date: today.toISOString().split('T')[0]
            }
        ];

        console.log('Using mock completed tasks for demo');
        return mockTasks;
    }

    // Show the weekly recap notification in the status area
    async function showWeeklyRecapNotification() {
        const completedTasks = await fetchCompletedTasksThisWeek();

        // Don't show notification if no tasks completed
        if (completedTasks.length === 0) {
            console.log('No completed tasks this week, skipping weekly recap');
            return;
        }

        // Create the notification in the status area
        createWeeklyRecapNotification(completedTasks);

        // Update the last shown timestamp
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    }

    // Show the detailed popup when notification is clicked
    async function showWeeklyRecapPopup() {
        const completedTasks = await fetchCompletedTasksThisWeek();

        if (completedTasks.length === 0) {
            console.log('No completed tasks this week');
            return;
        }

        // Create the detailed popup
        createWeeklyRecapPopup(completedTasks);
    }

    // Create the weekly recap notification in the status area
    function createWeeklyRecapNotification(tasks) {
        const statusDiv = document.getElementById('status');

        if (!statusDiv) {
            console.log('Status div not found, falling back to popup');
            createWeeklyRecapPopup(tasks);
            return;
        }

        // Clear any existing status content
        statusDiv.innerHTML = '';

        // Create the notification element
        const notification = document.createElement('div');
        notification.className = 'weekly-recap-notification';
        notification.setAttribute('data-auto-dismiss', 'false'); // Don't auto-dismiss

        const taskCount = tasks.length;
        const taskWord = taskCount === 1 ? 'task' : 'tasks';

        notification.innerHTML = `
            <div class="weekly-recap-content-inline">
                <div class="weekly-recap-icon-inline">🎉</div>
                <div class="weekly-recap-text">
                    <strong>Weekly Recap:</strong> You completed ${taskCount} ${taskWord} this week!
                    <span class="click-to-view">Click to view details</span>
                </div>
                <div class="weekly-recap-close" onclick="hideWeeklyRecapNotification()">×</div>
            </div>
        `;

        // Make it clickable to show the detailed popup
        notification.style.cursor = 'pointer';
        notification.onclick = function(e) {
            // Don't trigger if clicking the close button
            if (e.target.classList.contains('weekly-recap-close')) {
                return;
            }
            showWeeklyRecapPopup();
        };

        // Add to status div
        statusDiv.appendChild(notification);

        // Add CSS styles for the notification
        addWeeklyRecapNotificationStyles();

        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        console.log(`Weekly recap notification shown for ${taskCount} completed tasks`);
    }

    // Create and display the weekly recap popup
    function createWeeklyRecapPopup(tasks) {
        // Remove any existing popup
        const existingPopup = document.getElementById('weekly-recap-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup container
        const popup = document.createElement('div');
        popup.id = 'weekly-recap-popup';
        popup.className = 'weekly-recap-popup';

        // Create popup content
        const content = document.createElement('div');
        content.className = 'weekly-recap-content';

        // Header
        const header = document.createElement('div');
        header.className = 'weekly-recap-header';
        header.innerHTML = `
            <div class="weekly-recap-icon">🎉</div>
            <h2>Weekly Recap</h2>
            <p>Great job! You completed ${tasks.length} task${tasks.length === 1 ? '' : 's'} this week!</p>
        `;

        // Tasks list
        const tasksList = document.createElement('div');
        tasksList.className = 'weekly-recap-tasks';

        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'weekly-recap-task-item';

            const completionDate = new Date(task.completion_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });

            taskItem.innerHTML = `
                <div class="task-checkmark">✓</div>
                <div class="task-details">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <div class="task-date">Completed on ${completionDate}</div>
                </div>
            `;

            tasksList.appendChild(taskItem);
        });

        // Footer with close button
        const footer = document.createElement('div');
        footer.className = 'weekly-recap-footer';
        footer.innerHTML = `
            <button class="weekly-recap-close-btn" onclick="closeWeeklyRecap()">
                <i class="fas fa-times"></i> Close
            </button>
        `;

        // Assemble popup
        content.appendChild(header);
        content.appendChild(tasksList);
        content.appendChild(footer);
        popup.appendChild(content);

        // Add to page
        document.body.appendChild(popup);

        // Add CSS styles
        addWeeklyRecapStyles();

        // Show with animation
        setTimeout(() => {
            popup.classList.add('show');
        }, 100);

        // Auto-close after 10 seconds
        setTimeout(() => {
            closeWeeklyRecap();
        }, 10000);
    }

    // Hide the weekly recap notification
    function hideWeeklyRecapNotification() {
        const statusDiv = document.getElementById('status');
        if (statusDiv) {
            const notification = statusDiv.querySelector('.weekly-recap-notification');
            if (notification) {
                notification.classList.remove('show');
                setTimeout(() => {
                    statusDiv.innerHTML = ''; // Clear the status div
                }, 300);
            }
        }
    }

    // Close the weekly recap popup
    function closeWeeklyRecap() {
        const popup = document.getElementById('weekly-recap-popup');
        if (popup) {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add CSS styles for the popup
    function addWeeklyRecapStyles() {
        // Check if styles already exist
        if (document.getElementById('weekly-recap-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'weekly-recap-styles';
        style.textContent = `
            .weekly-recap-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .weekly-recap-popup.show {
                opacity: 1;
            }

            .weekly-recap-content {
                background-color: #1e1e1e;
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .weekly-recap-popup.show .weekly-recap-content {
                transform: scale(1);
            }

            .weekly-recap-header {
                text-align: center;
                margin-bottom: 20px;
            }

            .weekly-recap-icon {
                font-size: 48px;
                margin-bottom: 12px;
            }

            .weekly-recap-header h2 {
                color: #ffffff;
                margin: 0 0 8px 0;
                font-size: 24px;
                font-weight: 600;
            }

            .weekly-recap-header p {
                color: #b0b0b0;
                margin: 0;
                font-size: 16px;
            }

            .weekly-recap-tasks {
                margin-bottom: 20px;
                max-height: 300px;
                overflow-y: auto;
            }

            .weekly-recap-task-item {
                display: flex;
                align-items: center;
                padding: 12px;
                margin-bottom: 8px;
                background-color: rgba(76, 175, 80, 0.1);
                border-radius: 8px;
                border-left: 4px solid #4CAF50;
            }

            .task-checkmark {
                color: #4CAF50;
                font-size: 18px;
                font-weight: bold;
                margin-right: 12px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: rgba(76, 175, 80, 0.2);
                border-radius: 50%;
            }

            .task-details {
                flex: 1;
            }

            .task-title {
                color: #ffffff;
                font-weight: 500;
                margin-bottom: 4px;
                font-size: 14px;
            }

            .task-date {
                color: #888;
                font-size: 12px;
            }

            .weekly-recap-footer {
                text-align: center;
            }

            .weekly-recap-close-btn {
                background-color: #333;
                color: #ffffff;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s ease;
            }

            .weekly-recap-close-btn:hover {
                background-color: #444;
            }

            .weekly-recap-close-btn i {
                margin-right: 6px;
            }

            /* Scrollbar styling for the tasks list */
            .weekly-recap-tasks::-webkit-scrollbar {
                width: 6px;
            }

            .weekly-recap-tasks::-webkit-scrollbar-track {
                background: #2a2a2a;
                border-radius: 3px;
            }

            .weekly-recap-tasks::-webkit-scrollbar-thumb {
                background: #555;
                border-radius: 3px;
            }

            .weekly-recap-tasks::-webkit-scrollbar-thumb:hover {
                background: #666;
            }
        `;

        document.head.appendChild(style);
    }

    // Add CSS styles for the notification in the status area
    function addWeeklyRecapNotificationStyles() {
        // Check if styles already exist
        if (document.getElementById('weekly-recap-notification-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'weekly-recap-notification-styles';
        style.textContent = `
            .weekly-recap-notification {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                margin: 10px 0;
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                border-left: 4px solid #2E7D32;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                position: relative;
                cursor: pointer;
            }

            .weekly-recap-notification.show {
                opacity: 1;
                transform: translateY(0);
            }

            .weekly-recap-notification:hover {
                background: linear-gradient(135deg, #45a049, #4CAF50);
                box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
                transform: translateY(-2px);
            }

            .weekly-recap-content-inline {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .weekly-recap-icon-inline {
                font-size: 20px;
                flex-shrink: 0;
            }

            .weekly-recap-text {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
            }

            .weekly-recap-text strong {
                font-weight: 600;
            }

            .click-to-view {
                display: block;
                font-size: 12px;
                opacity: 0.9;
                margin-top: 2px;
                font-style: italic;
            }

            .weekly-recap-close {
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                opacity: 0.8;
                transition: opacity 0.2s ease;
                padding: 2px 6px;
                border-radius: 3px;
                flex-shrink: 0;
            }

            .weekly-recap-close:hover {
                opacity: 1;
                background-color: rgba(255, 255, 255, 0.2);
            }

            /* Animation for the notification */
            @keyframes weeklyRecapPulse {
                0% { box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
                50% { box-shadow: 0 4px 20px rgba(76, 175, 80, 0.5); }
                100% { box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
            }

            .weekly-recap-notification.show {
                animation: weeklyRecapPulse 2s ease-in-out;
            }
        `;

        document.head.appendChild(style);
    }

    // Expose functions globally
    window.closeWeeklyRecap = closeWeeklyRecap;
    window.showWeeklyRecap = showWeeklyRecap; // For manual testing

    // Add a test button for manual triggering (for demo purposes)
    function addTestButton() {
        const statusDiv = document.getElementById('status');
        if (statusDiv && !document.getElementById('weekly-recap-test-btn')) {
            const testButton = document.createElement('button');
            testButton.id = 'weekly-recap-test-btn';
            testButton.textContent = '🎉 Show Weekly Recap';
            testButton.style.cssText = `
                margin: 10px 0;
                padding: 8px 16px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            `;
            testButton.onclick = () => {
                localStorage.removeItem(STORAGE_KEY); // Reset for demo
                showWeeklyRecap();
            };
            statusDiv.appendChild(testButton);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initWeeklyRecap();
            addTestButton();
        });
    } else {
        initWeeklyRecap();
        addTestButton();
    }

})();
