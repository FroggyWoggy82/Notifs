/**
 * Mobile Emergency Close Button
 * Creates a persistent emergency close button for mobile devices
 */

(function() {
    'use strict';

    console.log('[Mobile Emergency Close] Initializing...');

    // Detect if we're on mobile
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768 ||
               'ontouchstart' in window;
    }

    // Emergency close function
    function emergencyCloseAllModals() {
        console.log('[Mobile Emergency Close] EMERGENCY CLOSE TRIGGERED');
        
        // Find all possible modal elements
        const modalSelectors = [
            '#editTaskModal',
            '#addTaskModal', 
            '#addHabitModal',
            '#editHabitModal',
            '.modal',
            '[id*="modal"]',
            '[id*="Modal"]',
            '[class*="modal"]'
        ];

        let closedCount = 0;
        modalSelectors.forEach(selector => {
            const modals = document.querySelectorAll(selector);
            modals.forEach(modal => {
                if (modal) {
                    // Nuclear destruction
                    modal.style.setProperty('display', 'none', 'important');
                    modal.style.setProperty('visibility', 'hidden', 'important');
                    modal.style.setProperty('opacity', '0', 'important');
                    modal.style.setProperty('pointer-events', 'none', 'important');
                    modal.style.setProperty('z-index', '-9999', 'important');
                    modal.style.setProperty('position', 'fixed', 'important');
                    modal.style.setProperty('top', '-9999px', 'important');
                    modal.style.setProperty('left', '-9999px', 'important');
                    
                    // Remove all classes
                    modal.className = '';
                    
                    // Clear content if it's a form
                    const forms = modal.querySelectorAll('form');
                    forms.forEach(form => form.reset());
                    
                    closedCount++;
                    console.log('[Mobile Emergency Close] Closed modal:', modal.id || modal.className);
                }
            });
        });

        // Restore body
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.height = '';
        document.body.style.setProperty('overflow', 'auto', 'important');
        
        // Remove any modal backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop, .backdrop, [class*="backdrop"]');
        backdrops.forEach(backdrop => backdrop.remove());
        
        console.log(`[Mobile Emergency Close] Emergency close complete - closed ${closedCount} modals`);
        
        // Show feedback to user
        showFeedback(`Closed ${closedCount} modals`);
    }

    // Show feedback to user
    function showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            z-index: 9999999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: fadeInOut 2s ease-in-out;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 2000);
    }

    // Create mobile emergency close button
    function createMobileEmergencyButton() {
        if (!isMobile()) {
            console.log('[Mobile Emergency Close] Not on mobile, skipping button creation');
            return;
        }

        // Remove existing button if any
        const existingBtn = document.getElementById('mobileEmergencyClose');
        if (existingBtn) {
            existingBtn.remove();
        }

        const emergencyBtn = document.createElement('button');
        emergencyBtn.id = 'mobileEmergencyClose';
        emergencyBtn.innerHTML = '✕';
        emergencyBtn.className = 'mobile-emergency-close';
        emergencyBtn.title = 'Emergency Close All Modals';
        
        // Add click handler
        emergencyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Mobile Emergency Close] Emergency button clicked');
            emergencyCloseAllModals();
        });
        
        // Add touch handler for better mobile response
        emergencyBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Mobile Emergency Close] Emergency button touched');
            emergencyCloseAllModals();
        });
        
        document.body.appendChild(emergencyBtn);
        console.log('[Mobile Emergency Close] Emergency button created');
    }

    // Check if modals are visible and show/hide button accordingly
    function checkModalVisibility() {
        if (!isMobile()) return;
        
        const visibleModals = document.querySelectorAll('[id*="Modal"]:not([style*="display: none"]), .modal:not([style*="display: none"])');
        const emergencyBtn = document.getElementById('mobileEmergencyClose');
        
        if (visibleModals.length > 0) {
            // Show button when modals are visible
            if (emergencyBtn) {
                emergencyBtn.style.opacity = '1';
                emergencyBtn.style.transform = 'scale(1)';
            }
        } else {
            // Hide button when no modals are visible
            if (emergencyBtn) {
                emergencyBtn.style.opacity = '0.3';
                emergencyBtn.style.transform = 'scale(0.8)';
            }
        }
    }

    // Initialize
    function init() {
        createMobileEmergencyButton();
        
        // Check modal visibility every second
        setInterval(checkModalVisibility, 1000);
        
        // Also check on DOM mutations
        const observer = new MutationObserver(checkModalVisibility);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['style', 'class'] 
        });
        
        // Make emergency function globally available
        window.mobileEmergencyClose = emergencyCloseAllModals;
        
        console.log('[Mobile Emergency Close] Initialized successfully');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also initialize on window load as backup
    window.addEventListener('load', init);

})();
