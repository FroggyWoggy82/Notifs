/**
 * Weekly Summary Notification
 * Shows a clickable notification on Sundays with weekly task completion summary
 */

(function() {
    'use strict';

    let weeklyNotificationShown = false;
    let lastNotificationTime = 0;

    // Check if today is Sunday
    function isSunday() {
        const today = new Date();
        return today.getDay() === 0; // 0 = Sunday
    }

    // Check if we've already shown the notification today
    function hasShownNotificationToday() {
        const today = new Date().toDateString();
        const lastShown = localStorage.getItem('weeklyNotificationLastShown');
        return lastShown === today;
    }

    // Mark notification as shown today
    function markNotificationShown() {
        const today = new Date().toDateString();
        localStorage.setItem('weeklyNotificationLastShown', today);
        weeklyNotificationShown = true;
    }

    // Get weekly task summary data
    async function getWeeklySummary() {
        try {
            const response = await fetch('/api/tasks/weekly-complete-list');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching weekly summary:', error);
            return null;
        }
    }

    // Create a clickable weekly summary notification
    function createWeeklySummaryNotification(summaryData) {
        const container = document.getElementById('notification-container') || createNotificationContainer();
        
        const notification = document.createElement('div');
        notification.className = 'notification weekly-summary';
        notification.style.cursor = 'pointer';
        notification.style.maxWidth = '450px';
        notification.style.minWidth = '350px';
        
        const summary = summaryData.summary;
        const completionRate = summary.completionRate || 0;
        const weekStart = new Date(summaryData.weekStart).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        const weekEnd = new Date(summaryData.weekEnd).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });

        // Create icon based on completion rate
        let iconHtml = '';
        let borderColor = '#2196F3'; // Default blue
        
        if (completionRate >= 80) {
            iconHtml = '<span class="notification-icon" style="color: #4CAF50;">🏆</span>';
            borderColor = '#4CAF50'; // Green for high completion
        } else if (completionRate >= 60) {
            iconHtml = '<span class="notification-icon" style="color: #FF9800;">⭐</span>';
            borderColor = '#FF9800'; // Orange for good completion
        } else if (completionRate >= 40) {
            iconHtml = '<span class="notification-icon" style="color: #2196F3;">📊</span>';
            borderColor = '#2196F3'; // Blue for moderate completion
        } else {
            iconHtml = '<span class="notification-icon" style="color: #9E9E9E;">📋</span>';
            borderColor = '#9E9E9E'; // Gray for low completion
        }

        notification.style.borderLeft = `4px solid ${borderColor}`;
        notification.style.background = '#121212';

        notification.innerHTML = `
            ${iconHtml}
            <div class="notification-content">
                <div style="font-weight: bold; margin-bottom: 4px;">Weekly Summary (${weekStart} - ${weekEnd})</div>
                <div style="font-size: 14px; opacity: 0.9;">
                    ${summary.completedTasks}/${summary.totalTasks} tasks completed (${completionRate}%)
                </div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 2px;">
                    Click to view detailed breakdown
                </div>
            </div>
            <span class="notification-close" style="align-self: flex-start;">×</span>
        `;
        
        container.appendChild(notification);
        
        // Trigger reflow to ensure transition works
        notification.offsetHeight;
        notification.classList.add('show');
        
        // Set up click handler to open weekly task list
        notification.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                openWeeklyTaskList();
            }
        });
        
        // Set up close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeNotification(notification);
        });
        
        // Auto close after 10 seconds (longer than normal notifications)
        setTimeout(() => {
            closeNotification(notification);
        }, 10000);
        
        return notification;
    }

    // Create notification container if it doesn't exist
    function createNotificationContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '10000';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'flex-end';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }
        return container;
    }

    // Close a notification with animation
    function closeNotification(notification) {
        notification.classList.remove('show');
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Open weekly task list in a modal
    async function openWeeklyTaskList() {
        try {
            const summaryData = await getWeeklySummary();
            if (summaryData && summaryData.success) {
                showWeeklyTaskModal(summaryData);
            }
        } catch (error) {
            console.error('Error loading weekly task data:', error);
        }
    }

    // Create and show the weekly task modal
    function showWeeklyTaskModal(data) {
        // Remove existing modal if any
        const existingModal = document.getElementById('weekly-task-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'weekly-task-modal';
        modalOverlay.className = 'weekly-task-modal-overlay';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'weekly-task-modal-content';

        // Create header
        const header = document.createElement('div');
        header.className = 'weekly-task-modal-header';
        header.innerHTML = `
            <h2>Weekly Task List - Complete Overview</h2>
            <p>All tasks organized by day and notification</p>
            <button class="weekly-task-modal-close" onclick="closeWeeklyTaskModal()">&times;</button>
        `;

        // Create stats section
        const stats = document.createElement('div');
        stats.className = 'weekly-task-stats';
        stats.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${data.summary.totalTasks}</div>
                <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.summary.completedTasks}</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.summary.pendingTasks}</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.summary.completionRate}%</div>
                <div class="stat-label">Completion Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.summary.tasksWithNotifications}</div>
                <div class="stat-label">With Notifications</div>
            </div>
        `;

        // Create tabs
        const tabs = document.createElement('div');
        tabs.className = 'weekly-task-tabs';
        tabs.innerHTML = `
            <button class="tab-button active" onclick="showWeeklyTab('daily')">Daily View</button>
            <button class="tab-button" onclick="showWeeklyTab('notifications')">Notifications</button>
        `;

        // Create content area
        const contentArea = document.createElement('div');
        contentArea.className = 'weekly-task-content';
        contentArea.innerHTML = generateDailyView(data) + generateNotificationsView(data);

        // Assemble modal
        modalContent.appendChild(header);
        modalContent.appendChild(stats);
        modalContent.appendChild(tabs);
        modalContent.appendChild(contentArea);
        modalOverlay.appendChild(modalContent);

        // Add to page
        document.body.appendChild(modalOverlay);

        // Show modal with animation
        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);

        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeWeeklyTaskModal();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', handleEscapeKey);
    }

    // Generate daily view content
    function generateDailyView(data) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let html = '<div id="daily-view" class="tab-content active">';

        days.forEach((day, index) => {
            const tasks = data.dailyBreakdown[day] || [];
            html += `
                <div class="day-section">
                    <h3>${dayNames[index]} (${tasks.length} tasks)</h3>
                    ${tasks.length === 0 ?
                        '<p class="no-tasks">No tasks for this day</p>' :
                        tasks.map(task => `
                            <div class="task-item">
                                <div class="task-title">${task.title}</div>
                                <div class="task-meta">
                                    ${task.description ? `<span class="task-description">${task.description}</span>` : ''}
                                    <span class="task-type">Type: ${task.task_type}</span>
                                    ${task.reminderFormatted ? `<span class="task-reminder">Reminder: ${task.reminderFormatted}</span>` : ''}
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    // Generate notifications view content
    function generateNotificationsView(data) {
        let html = '<div id="notifications-view" class="tab-content">';

        if (data.notificationBreakdown.length === 0) {
            html += '<p class="no-notifications">No notifications scheduled for this week</p>';
        } else {
            data.notificationBreakdown.forEach(notification => {
                html += `
                    <div class="notification-section">
                        <h3>${notification.dateFormatted} at ${notification.time}</h3>
                        ${notification.tasks.map(task => `
                            <div class="task-item">
                                <div class="task-title">${task.title}</div>
                                <div class="task-meta">
                                    <span class="task-due">Due: ${task.taskDateFormatted}</span>
                                    ${task.description ? `<span class="task-description">${task.description}</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            });
        }

        html += '</div>';
        return html;
    }

    // Close the weekly task modal
    function closeWeeklyTaskModal() {
        const modal = document.getElementById('weekly-task-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        document.removeEventListener('keydown', handleEscapeKey);
    }

    // Handle escape key to close modal
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            closeWeeklyTaskModal();
        }
    }

    // Show specific tab in the modal
    function showWeeklyTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[onclick="showWeeklyTab('${tabName}')"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-view`).classList.add('active');
    }

    // Make functions globally available
    window.closeWeeklyTaskModal = closeWeeklyTaskModal;
    window.showWeeklyTab = showWeeklyTab;

    // Main function to check and show weekly summary notification
    async function checkAndShowWeeklySummary() {
        // Only show on Sundays
        if (!isSunday()) {
            return;
        }

        // On Sundays, allow showing multiple times throughout the day
        // But add a cooldown period to prevent spam (minimum 30 minutes between notifications)
        const now = Date.now();
        const cooldownPeriod = 30 * 60 * 1000; // 30 minutes in milliseconds

        if (now - lastNotificationTime < cooldownPeriod) {
            return; // Still in cooldown period
        }

        try {
            const summaryData = await getWeeklySummary();
            if (summaryData && summaryData.success) {
                createWeeklySummaryNotification(summaryData);
                lastNotificationTime = now; // Update last notification time
            }
        } catch (error) {
            console.error('Error showing weekly summary notification:', error);
        }
    }

    // Add CSS for weekly summary notification and modal
    function addWeeklySummaryStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Notification styles */
            .notification.weekly-summary {
                background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%) !important;
                border-radius: 8px !important;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
                transition: all 0.3s ease !important;
            }
            .notification.weekly-summary:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5) !important;
            }
            .notification.weekly-summary .notification-content {
                line-height: 1.4;
            }

            /* Modal styles */
            .weekly-task-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(5px);
            }

            .weekly-task-modal-overlay.show {
                opacity: 1;
            }

            .weekly-task-modal-content {
                background: #1a1a1a;
                border-radius: 12px;
                width: 90%;
                max-width: 900px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                transform: scale(0.9);
                transition: transform 0.3s ease;
                border: 1px solid #333;
            }

            .weekly-task-modal-overlay.show .weekly-task-modal-content {
                transform: scale(1);
            }

            .weekly-task-modal-header {
                background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
                padding: 20px 25px;
                border-bottom: 1px solid #333;
                position: relative;
            }

            .weekly-task-modal-header h2 {
                color: #ffffff;
                margin: 0 0 5px 0;
                font-size: 24px;
                font-weight: 600;
            }

            .weekly-task-modal-header p {
                color: #b0b0b0;
                margin: 0;
                font-size: 14px;
            }

            .weekly-task-modal-close {
                position: absolute;
                top: 20px;
                right: 25px;
                background: none;
                border: none;
                color: #b0b0b0;
                font-size: 28px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .weekly-task-modal-close:hover {
                background: #333;
                color: #ffffff;
            }

            .weekly-task-stats {
                display: flex;
                gap: 15px;
                padding: 20px 25px;
                background: #222;
                border-bottom: 1px solid #333;
                overflow-x: auto;
            }

            .stat-card {
                background: #2a2a2a;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                min-width: 120px;
                border: 1px solid #333;
            }

            .stat-number {
                color: #4CAF50;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .stat-label {
                color: #b0b0b0;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .weekly-task-tabs {
                display: flex;
                background: #1f1f1f;
                border-bottom: 1px solid #333;
            }

            .tab-button {
                background: none;
                border: none;
                color: #b0b0b0;
                padding: 15px 25px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                border-bottom: 3px solid transparent;
            }

            .tab-button:hover {
                background: #2a2a2a;
                color: #ffffff;
            }

            .tab-button.active {
                color: #4CAF50;
                border-bottom-color: #4CAF50;
                background: #222;
            }

            .weekly-task-content {
                max-height: 50vh;
                overflow-y: auto;
                padding: 0;
            }

            .tab-content {
                display: none;
                padding: 20px 25px;
            }

            .tab-content.active {
                display: block;
            }

            .day-section {
                margin-bottom: 25px;
            }

            .day-section h3 {
                color: #ffffff;
                margin: 0 0 15px 0;
                font-size: 18px;
                font-weight: 600;
                padding-bottom: 8px;
                border-bottom: 2px solid #333;
            }

            .notification-section {
                margin-bottom: 25px;
            }

            .notification-section h3 {
                color: #4CAF50;
                margin: 0 0 15px 0;
                font-size: 16px;
                font-weight: 600;
            }

            .weekly-task-modal-content .task-item {
                background: #2a2a2a;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                border-left: 4px solid #4CAF50;
                border: 1px solid #333;
            }

            .weekly-task-modal-content .task-title {
                color: #ffffff;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 16px;
            }

            .weekly-task-modal-content .task-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .weekly-task-modal-content .task-meta span {
                background: #333;
                color: #b0b0b0;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }

            .weekly-task-modal-content .task-description {
                background: #444 !important;
                color: #e0e0e0 !important;
            }

            .weekly-task-modal-content .task-due {
                background: #4CAF50 !important;
                color: #ffffff !important;
            }

            .no-tasks, .no-notifications {
                color: #888;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }

            /* Scrollbar styling */
            .weekly-task-content::-webkit-scrollbar {
                width: 8px;
            }

            .weekly-task-content::-webkit-scrollbar-track {
                background: #1a1a1a;
            }

            .weekly-task-content::-webkit-scrollbar-thumb {
                background: #444;
                border-radius: 4px;
            }

            .weekly-task-content::-webkit-scrollbar-thumb:hover {
                background: #555;
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .weekly-task-modal-content {
                    width: 95%;
                    max-height: 95vh;
                }

                .weekly-task-stats {
                    flex-direction: column;
                    gap: 10px;
                }

                .stat-card {
                    min-width: auto;
                }

                .weekly-task-modal-header {
                    padding: 15px 20px;
                }

                .weekly-task-modal-header h2 {
                    font-size: 20px;
                }

                .tab-content {
                    padding: 15px 20px;
                }

                .weekly-task-modal-content .task-meta {
                    flex-direction: column;
                    gap: 5px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize the weekly summary notification system
    function init() {
        // Add styles
        addWeeklySummaryStyles();
        
        // Check immediately when the page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(checkAndShowWeeklySummary, 2000); // Wait 2 seconds after page load
            });
        } else {
            setTimeout(checkAndShowWeeklySummary, 2000);
        }

        // Check more frequently on Sundays (every 10 minutes), less frequently on other days (every 30 minutes)
        const checkInterval = isSunday() ? 10 * 60 * 1000 : 30 * 60 * 1000;
        setInterval(checkAndShowWeeklySummary, checkInterval);
    }

    // Expose function globally for manual testing
    window.WeeklySummaryNotification = {
        checkAndShow: checkAndShowWeeklySummary,
        forceShow: async () => {
            // Force show for testing (ignores day and previous show checks)
            lastNotificationTime = 0; // Reset cooldown for testing
            const summaryData = await getWeeklySummary();
            if (summaryData && summaryData.success) {
                createWeeklySummaryNotification(summaryData);
                lastNotificationTime = Date.now(); // Update cooldown after showing
            }
        },
        showModal: async () => {
            // Show the modal directly for testing
            const summaryData = await getWeeklySummary();
            if (summaryData && summaryData.success) {
                showWeeklyTaskModal(summaryData);
            }
        }
    };

    // Initialize when script loads
    init();
})();
