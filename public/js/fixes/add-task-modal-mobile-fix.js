/**
 * Add Task Modal Mobile Fix
 * Ensures the add task modal is properly optimized for mobile devices
 */

(function() {
    'use strict';

    // Check if we're on a mobile device
    function isMobileDevice() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Apply mobile-specific optimizations to the modal
    function optimizeModalForMobile(modal) {
        if (!modal || !isMobileDevice()) return;

        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) return;

        // Ensure modal takes full screen on mobile
        modalContent.style.width = '100%';
        modalContent.style.height = '100vh';
        modalContent.style.maxHeight = '100vh';
        modalContent.style.margin = '0';
        modalContent.style.borderRadius = '0';
        modalContent.style.position = 'fixed';
        modalContent.style.top = '0';
        modalContent.style.left = '0';
        modalContent.style.transform = 'none';
        modalContent.style.overflowY = 'auto';

        // Optimize form elements for mobile
        const formControls = modal.querySelectorAll('.form-control');
        formControls.forEach(control => {
            control.style.fontSize = '16px'; // Prevents zoom on iOS
            control.style.padding = '8px';
        });

        // Optimize textarea specifically
        const textareas = modal.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.style.minHeight = '40px';
            textarea.style.maxHeight = '60px';
            textarea.style.resize = 'vertical';
        });

        // Ensure proper keyboard handling on mobile
        const inputs = modal.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                // Small delay to ensure the keyboard is shown
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
    }

    // Handle viewport changes (orientation change, keyboard show/hide)
    function handleViewportChange() {
        if (!isMobileDevice()) return;

        const addTaskModal = document.getElementById('addTaskModal');
        const editTaskModal = document.getElementById('editTaskModal');

        if (addTaskModal && addTaskModal.style.display !== 'none') {
            optimizeModalForMobile(addTaskModal);
        }

        if (editTaskModal && editTaskModal.style.display !== 'none') {
            optimizeModalForMobile(editTaskModal);
        }
    }

    // Initialize when DOM is ready
    function init() {
        const addTaskModal = document.getElementById('addTaskModal');
        const editTaskModal = document.getElementById('editTaskModal');

        if (addTaskModal) {
            // Override the existing showAddTaskModal function if it exists
            const originalShowAddTaskModal = window.showAddTaskModal;
            window.showAddTaskModal = function() {
                if (originalShowAddTaskModal) {
                    originalShowAddTaskModal();
                }
                setTimeout(() => optimizeModalForMobile(addTaskModal), 50);
            };

            // Also handle when modal is shown via other methods
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (addTaskModal.style.display !== 'none' && addTaskModal.style.display !== '') {
                            setTimeout(() => optimizeModalForMobile(addTaskModal), 50);
                        }
                    }
                });
            });
            observer.observe(addTaskModal, { attributes: true });
        }

        if (editTaskModal) {
            // Handle edit modal similarly
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (editTaskModal.style.display !== 'none' && editTaskModal.style.display !== '') {
                            setTimeout(() => optimizeModalForMobile(editTaskModal), 50);
                        }
                    }
                });
            });
            observer.observe(editTaskModal, { attributes: true });
        }

        // Handle viewport changes
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleViewportChange, 500); // Delay for orientation change
        });

        // Handle virtual keyboard on mobile
        if (isMobileDevice()) {
            let initialViewportHeight = window.innerHeight;
            
            window.addEventListener('resize', () => {
                const currentHeight = window.innerHeight;
                const heightDifference = initialViewportHeight - currentHeight;
                
                // If height decreased significantly, keyboard is likely shown
                if (heightDifference > 150) {
                    document.body.style.height = currentHeight + 'px';
                } else {
                    document.body.style.height = '';
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[Add Task Modal Mobile Fix] Initialized');
})();
