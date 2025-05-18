/**
 * Notification System
 * Provides a consistent way to show notifications across the application
 */

(function() {
    // Create notification container if it doesn't exist
    function ensureNotificationContainer() {
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
            
            // Add CSS for notifications
            const style = document.createElement('style');
            style.textContent = `
                .notification {
                    padding: 12px 20px;
                    border-radius: 4px;
                    color: white;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    opacity: 0;
                    transform: translateX(50px);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    max-width: 400px;
                    min-width: 250px;
                }
                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }
                .notification.success {
                    background-color: #121212;
                    border-left: 4px solid #4CAF50;
                }
                .notification.error {
                    background-color: #121212;
                    border-left: 4px solid #F44336;
                }
                .notification.info {
                    background-color: #121212;
                    border-left: 4px solid #2196F3;
                }
                .notification.warning {
                    background-color: #121212;
                    border-left: 4px solid #FF9800;
                }
                .notification-icon {
                    font-size: 18px;
                }
                .notification-content {
                    flex: 1;
                }
                .notification-close {
                    cursor: pointer;
                    font-size: 16px;
                    opacity: 0.7;
                }
                .notification-close:hover {
                    opacity: 1;
                }
                @keyframes checkmark {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                .checkmark {
                    display: inline-block;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background-color: #4CAF50;
                    position: relative;
                    animation: checkmark 0.3s ease-in-out;
                }
                .checkmark:after {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 8px;
                    width: 6px;
                    height: 10px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }
            `;
            document.head.appendChild(style);
        }
        return container;
    }

    // Create and show a notification
    function showNotification(message, type = 'success', duration = 3000) {
        const container = ensureNotificationContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let iconHtml = '';
        if (type === 'success') {
            iconHtml = '<div class="checkmark"></div>';
        } else if (type === 'error') {
            iconHtml = '<span class="notification-icon">⚠️</span>';
        } else if (type === 'info') {
            iconHtml = '<span class="notification-icon">ℹ️</span>';
        } else if (type === 'warning') {
            iconHtml = '<span class="notification-icon">⚠️</span>';
        }
        
        notification.innerHTML = `
            ${iconHtml}
            <div class="notification-content">${message}</div>
            <span class="notification-close">×</span>
        `;
        
        container.appendChild(notification);
        
        // Trigger reflow to ensure transition works
        notification.offsetHeight;
        notification.classList.add('show');
        
        // Set up close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            closeNotification(notification);
        });
        
        // Auto close after duration
        if (duration > 0) {
            setTimeout(() => {
                closeNotification(notification);
            }, duration);
        }
        
        return notification;
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
        }, 300); // Match the transition duration
    }
    
    // Expose functions globally
    window.NotificationSystem = {
        showSuccess: (message, duration = 3000) => showNotification(message, 'success', duration),
        showError: (message, duration = 3000) => showNotification(message, 'error', duration),
        showInfo: (message, duration = 3000) => showNotification(message, 'info', duration),
        showWarning: (message, duration = 3000) => showNotification(message, 'warning', duration),
        closeAll: () => {
            const container = document.getElementById('notification-container');
            if (container) {
                const notifications = container.querySelectorAll('.notification');
                notifications.forEach(closeNotification);
            }
        }
    };
})();
