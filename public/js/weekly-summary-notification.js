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
            <div class="weekly-summary-card">
                <div class="weekly-summary-header">
                    <div class="weekly-summary-icon">${iconHtml}</div>
                    <div class="weekly-summary-title">
                        <h3>Weekly Summary</h3>
                        <span class="weekly-summary-date">${weekStart} - ${weekEnd}</span>
                    </div>
                    <button class="weekly-summary-close" aria-label="Close notification">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="weekly-summary-stats">
                    <div class="stat-item">
                        <div class="stat-number">${summary.completedTasks}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <div class="stat-number">${summary.totalTasks}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <div class="stat-number">${completionRate}%</div>
                        <div class="stat-label">Rate</div>
                    </div>
                </div>
                <div class="weekly-summary-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionRate}%"></div>
                    </div>
                </div>
                <div class="weekly-summary-action">
                    <span class="action-text">Click to view detailed breakdown</span>
                    <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </div>
            </div>
        `;
        
        container.appendChild(notification);

        // Trigger reflow and add entrance animation
        notification.offsetHeight;
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px) scale(0.9)';

        // Animate in
        setTimeout(() => {
            notification.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0) scale(1)';
            notification.classList.add('show');
        }, 100);
        
        // Set up click handler to open weekly task list
        notification.addEventListener('click', (e) => {
            if (!e.target.closest('.weekly-summary-close')) {
                openWeeklyTaskList();
            }
        });

        // Set up close button
        const closeBtn = notification.querySelector('.weekly-summary-close');
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
            /* Modern Weekly Summary Notification */
            .notification.weekly-summary {
                background: linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 16px !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                backdrop-filter: blur(10px) !important;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                padding: 0 !important;
                overflow: hidden !important;
                min-width: 380px !important;
                max-width: 420px !important;
            }

            .notification.weekly-summary:hover {
                transform: translateY(-4px) scale(1.02) !important;
                box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7), 0 4px 16px rgba(0, 0, 0, 0.4) !important;
                border-color: rgba(76, 175, 80, 0.3) !important;
            }

            .weekly-summary-card {
                padding: 20px;
                position: relative;
            }

            .weekly-summary-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                margin-bottom: 16px;
            }

            .weekly-summary-icon {
                font-size: 24px;
                margin-right: 12px;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }

            .weekly-summary-title h3 {
                color: #ffffff;
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 4px 0;
                letter-spacing: -0.5px;
            }

            .weekly-summary-date {
                color: #a0a0a0;
                font-size: 13px;
                font-weight: 500;
                opacity: 0.8;
            }

            .weekly-summary-close {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 8px;
                color: #a0a0a0;
                cursor: pointer;
                padding: 8px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
            }

            .weekly-summary-close:hover {
                background: rgba(255, 255, 255, 0.2);
                color: #ffffff;
                transform: scale(1.1);
            }

            .weekly-summary-stats {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;
                padding: 16px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .stat-item {
                text-align: center;
                flex: 1;
            }

            .stat-number {
                color: #4CAF50;
                font-size: 24px;
                font-weight: 800;
                margin-bottom: 4px;
                text-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
            }

            .stat-label {
                color: #b0b0b0;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .stat-divider {
                width: 1px;
                height: 40px;
                background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent);
                margin: 0 8px;
            }

            .weekly-summary-progress {
                margin-bottom: 16px;
            }

            .progress-bar {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                height: 8px;
                overflow: hidden;
                position: relative;
            }

            .progress-fill {
                background: linear-gradient(90deg, #4CAF50, #66BB6A);
                height: 100%;
                border-radius: 8px;
                transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 0 8px rgba(76, 175, 80, 0.4);
                position: relative;
            }

            .progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            .weekly-summary-action {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: rgba(76, 175, 80, 0.1);
                border: 1px solid rgba(76, 175, 80, 0.2);
                border-radius: 10px;
                transition: all 0.2s ease;
                cursor: pointer;
            }

            .weekly-summary-action:hover {
                background: rgba(76, 175, 80, 0.15);
                border-color: rgba(76, 175, 80, 0.3);
                transform: translateX(2px);
            }

            .action-text {
                color: #4CAF50;
                font-size: 13px;
                font-weight: 600;
            }

            .action-arrow {
                color: #4CAF50;
                transition: transform 0.2s ease;
            }

            .weekly-summary-action:hover .action-arrow {
                transform: translateX(2px);
            }

            /* Mobile responsiveness for notification */
            @media (max-width: 768px) {
                .notification.weekly-summary {
                    min-width: 320px !important;
                    max-width: 360px !important;
                    margin: 0 10px !important;
                }

                .weekly-summary-card {
                    padding: 16px;
                }

                .weekly-summary-header {
                    margin-bottom: 12px;
                }

                .weekly-summary-title h3 {
                    font-size: 16px;
                }

                .weekly-summary-stats {
                    padding: 12px;
                    margin-bottom: 12px;
                }

                .stat-number {
                    font-size: 20px;
                }

                .stat-label {
                    font-size: 10px;
                }

                .weekly-summary-action {
                    padding: 10px 12px;
                }

                .action-text {
                    font-size: 12px;
                }
            }

            /* Dark mode enhancements */
            @media (prefers-color-scheme: dark) {
                .notification.weekly-summary {
                    background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%) !important;
                    border-color: rgba(255, 255, 255, 0.15) !important;
                }

                .weekly-summary-stats {
                    background: rgba(0, 0, 0, 0.3);
                    border-color: rgba(255, 255, 255, 0.08);
                }
            }

            /* Accessibility improvements */
            .weekly-summary-close:focus {
                outline: 2px solid #4CAF50;
                outline-offset: 2px;
            }

            .weekly-summary-action:focus {
                outline: 2px solid #4CAF50;
                outline-offset: 2px;
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .notification.weekly-summary,
                .weekly-summary-close,
                .weekly-summary-action,
                .action-arrow,
                .progress-fill {
                    transition: none !important;
                    animation: none !important;
                }

                .progress-fill::after {
                    animation: none !important;
                }
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
