/**
 * Weekly Summary Notification
 * Shows a clickable notification on Sundays with weekly task completion summary
 */

(function() {
    'use strict';

    let weeklyNotificationShown = false;

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

    // Open weekly task list in a modal or new window
    function openWeeklyTaskList() {
        // Option 1: Open in new tab/window
        window.open('/weekly-task-list', '_blank');
        
        // Option 2: Navigate to the page (uncomment if preferred)
        // window.location.href = '/weekly-task-list';
        
        // Option 3: Open in a modal (would require additional modal implementation)
        // showWeeklyTaskModal();
    }

    // Main function to check and show weekly summary notification
    async function checkAndShowWeeklySummary() {
        // Only show on Sundays
        if (!isSunday()) {
            return;
        }

        // Don't show if already shown today
        if (hasShownNotificationToday()) {
            return;
        }

        // Don't show if we've already shown it in this session
        if (weeklyNotificationShown) {
            return;
        }

        try {
            const summaryData = await getWeeklySummary();
            if (summaryData && summaryData.success) {
                createWeeklySummaryNotification(summaryData);
                markNotificationShown();
            }
        } catch (error) {
            console.error('Error showing weekly summary notification:', error);
        }
    }

    // Add CSS for weekly summary notification
    function addWeeklySummaryStyles() {
        const style = document.createElement('style');
        style.textContent = `
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

        // Also check periodically (every 30 minutes) in case the page stays open
        setInterval(checkAndShowWeeklySummary, 30 * 60 * 1000);
    }

    // Expose function globally for manual testing
    window.WeeklySummaryNotification = {
        checkAndShow: checkAndShowWeeklySummary,
        forceShow: async () => {
            // Force show for testing (ignores day and previous show checks)
            const summaryData = await getWeeklySummary();
            if (summaryData && summaryData.success) {
                createWeeklySummaryNotification(summaryData);
            }
        }
    };

    // Initialize when script loads
    init();
})();
