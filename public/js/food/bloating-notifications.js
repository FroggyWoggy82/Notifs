/**
 * Bloating Notifications System
 * Handles in-app notifications for bloating rating prompts
 */

(function() {
    'use strict';

    let activeNotification = null;
    let notificationCheckInterval = null;

    // Initialize the notification system
    function init() {
        console.log('[Bloating Notifications] Initializing...');
        
        // Check for pending notifications every 30 seconds
        notificationCheckInterval = setInterval(checkForNotifications, 30000);
        
        // Check immediately on load
        setTimeout(checkForNotifications, 2000);
        
        // Listen for notification events from service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        }
    }

    // Check for notifications that should be displayed
    async function checkForNotifications() {
        try {
            // This would typically check with the server for pending notifications
            // For now, we'll implement a simple localStorage-based system
            const pendingNotifications = JSON.parse(localStorage.getItem('pendingBloatingNotifications') || '[]');
            const now = Date.now();

            for (let i = pendingNotifications.length - 1; i >= 0; i--) {
                const notification = pendingNotifications[i];
                if (now >= notification.scheduledTime) {
                    // Time to show this notification
                    showBloatingNotification(notification);
                    // Remove from pending list
                    pendingNotifications.splice(i, 1);
                }
            }

            // Update localStorage
            localStorage.setItem('pendingBloatingNotifications', JSON.stringify(pendingNotifications));
        } catch (error) {
            console.error('[Bloating Notifications] Error checking notifications:', error);
        }
    }

    // Schedule a bloating notification
    function scheduleNotification(mealId, mealName, ingredients, scheduledTime) {
        const notification = {
            id: `bloating_${mealId}_${Date.now()}`,
            type: 'bloating_rating',
            mealId: mealId,
            mealName: mealName,
            ingredients: ingredients,
            scheduledTime: scheduledTime,
            createdAt: Date.now()
        };

        // Add to pending notifications
        const pendingNotifications = JSON.parse(localStorage.getItem('pendingBloatingNotifications') || '[]');
        pendingNotifications.push(notification);
        localStorage.setItem('pendingBloatingNotifications', JSON.stringify(pendingNotifications));

        console.log(`[Bloating Notifications] Scheduled notification for meal ${mealId} at ${new Date(scheduledTime)}`);
        return notification;
    }

    // Show bloating notification popup
    function showBloatingNotification(notificationData) {
        // Don't show if there's already an active notification
        if (activeNotification) {
            return;
        }

        console.log('[Bloating Notifications] Showing notification:', notificationData);

        // Create notification HTML
        const notificationHtml = `
            <div class="bloating-notification-overlay" id="bloating-overlay"></div>
            <div class="bloating-notification" id="bloating-notification">
                <div class="bloating-notification-header">
                    <h4 class="bloating-notification-title">Bloating Check-in</h4>
                    <button class="bloating-notification-close" id="bloating-close">&times;</button>
                </div>
                <div class="bloating-notification-body">
                    <p>How are you feeling after eating <strong>${notificationData.ingredients || notificationData.mealName}</strong>?</p>
                    <p>Please rate your bloating level:</p>
                </div>
                <div class="bloating-notification-rating" id="bloating-rating-options">
                    <label class="rating-option">
                        <input type="radio" name="notification-bloating-rating" value="1">
                        <span class="rating-label">1 - None</span>
                    </label>
                    <label class="rating-option">
                        <input type="radio" name="notification-bloating-rating" value="3">
                        <span class="rating-label">3 - Mild</span>
                    </label>
                    <label class="rating-option">
                        <input type="radio" name="notification-bloating-rating" value="6">
                        <span class="rating-label">6 - Moderate</span>
                    </label>
                    <label class="rating-option">
                        <input type="radio" name="notification-bloating-rating" value="10">
                        <span class="rating-label">10 - Severe</span>
                    </label>
                </div>
                <div class="bloating-notification-actions">
                    <button class="bloating-notification-btn secondary" id="bloating-snooze">Snooze 10min</button>
                    <button class="bloating-notification-btn secondary" id="bloating-dismiss">Dismiss</button>
                    <button class="bloating-notification-btn primary" id="bloating-submit" disabled>Submit Rating</button>
                </div>
            </div>
        `;

        // Add to page
        document.body.insertAdjacentHTML('beforeend', notificationHtml);
        activeNotification = notificationData;

        // Set up event listeners
        setupNotificationEventListeners();
    }

    // Set up event listeners for the notification
    function setupNotificationEventListeners() {
        const notification = document.getElementById('bloating-notification');
        const overlay = document.getElementById('bloating-overlay');
        const closeBtn = document.getElementById('bloating-close');
        const snoozeBtn = document.getElementById('bloating-snooze');
        const dismissBtn = document.getElementById('bloating-dismiss');
        const submitBtn = document.getElementById('bloating-submit');
        const ratingInputs = document.querySelectorAll('input[name="notification-bloating-rating"]');

        // Close handlers
        const closeNotification = () => hideNotification();
        closeBtn.addEventListener('click', closeNotification);
        overlay.addEventListener('click', closeNotification);

        // Rating selection handler
        ratingInputs.forEach(input => {
            input.addEventListener('change', function() {
                submitBtn.disabled = false;
            });
        });

        // Action handlers
        snoozeBtn.addEventListener('click', () => snoozeNotification(10)); // 10 minutes
        dismissBtn.addEventListener('click', () => dismissNotification());
        submitBtn.addEventListener('click', () => submitBloatingRating());

        // Keyboard handler
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && activeNotification) {
                closeNotification();
            }
        });
    }

    // Hide the notification
    function hideNotification() {
        const notification = document.getElementById('bloating-notification');
        const overlay = document.getElementById('bloating-overlay');
        
        if (notification) notification.remove();
        if (overlay) overlay.remove();
        
        activeNotification = null;
    }

    // Snooze notification for specified minutes
    function snoozeNotification(minutes) {
        if (!activeNotification) return;

        const snoozeTime = Date.now() + (minutes * 60 * 1000);
        const snoozedNotification = {
            ...activeNotification,
            scheduledTime: snoozeTime,
            id: `${activeNotification.id}_snoozed_${Date.now()}`
        };

        // Add back to pending notifications
        const pendingNotifications = JSON.parse(localStorage.getItem('pendingBloatingNotifications') || '[]');
        pendingNotifications.push(snoozedNotification);
        localStorage.setItem('pendingBloatingNotifications', JSON.stringify(pendingNotifications));

        console.log(`[Bloating Notifications] Snoozed for ${minutes} minutes`);
        hideNotification();
    }

    // Dismiss notification permanently
    function dismissNotification() {
        console.log('[Bloating Notifications] Notification dismissed');
        hideNotification();
    }

    // Submit bloating rating
    async function submitBloatingRating() {
        const selectedRating = document.querySelector('input[name="notification-bloating-rating"]:checked');
        
        if (!selectedRating || !activeNotification) {
            return;
        }

        const rating = parseInt(selectedRating.value);
        const mealId = activeNotification.mealId;

        try {
            // Submit rating to server
            const response = await fetch(`/api/meals/${mealId}/bloating-rating`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bloating_rating: rating
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`[Bloating Notifications] Rating submitted: ${rating}/10 for meal ${mealId}`);
                
                // Show success message briefly
                const submitBtn = document.getElementById('bloating-submit');
                if (submitBtn) {
                    submitBtn.textContent = 'Submitted!';
                    submitBtn.disabled = true;
                }
                
                // Hide notification after short delay
                setTimeout(() => {
                    hideNotification();
                }, 1500);
            } else {
                throw new Error(result.message || 'Failed to submit rating');
            }
        } catch (error) {
            console.error('[Bloating Notifications] Error submitting rating:', error);
            alert('Error submitting bloating rating. Please try again.');
        }
    }

    // Handle messages from service worker
    function handleServiceWorkerMessage(event) {
        const data = event.data;
        
        if (data && data.type === 'bloating_rating') {
            showBloatingNotification(data);
        }
    }

    // Public API
    window.BloatingNotifications = {
        init: init,
        scheduleNotification: scheduleNotification,
        showNotification: showBloatingNotification
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
