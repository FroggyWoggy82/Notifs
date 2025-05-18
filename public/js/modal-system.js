/**
 * Modal System
 * Provides a consistent way to show modals across the application
 */

(function() {
    // Create and show a modal
    function createModal(options = {}) {
        const {
            title = '',
            content = '',
            size = 'medium', // small, medium, large
            buttons = [],
            closeOnBackdropClick = true,
            onClose = null,
            id = 'modal-' + Date.now()
        } = options;

        // Create modal elements
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.id = id + '-backdrop';

        const container = document.createElement('div');
        container.className = `modal-container modal-${size}`;
        container.id = id;

        // Create modal content
        container.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button type="button" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">${content}</div>
            ${buttons.length > 0 ? '<div class="modal-footer"></div>' : ''}
        `;

        // Add buttons if provided
        if (buttons.length > 0) {
            const footer = container.querySelector('.modal-footer');
            buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = `modal-btn ${button.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}`;
                btn.textContent = button.text;

                if (button.id) {
                    btn.id = button.id;
                }

                if (button.action) {
                    btn.addEventListener('click', (e) => {
                        button.action(e, {
                            close: () => closeModal(backdrop),
                            modal: container
                        });
                    });
                }

                footer.appendChild(btn);
            });
        }

        // Add close functionality
        const closeBtn = container.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            closeModal(backdrop);
        });

        // Add backdrop click to close
        if (closeOnBackdropClick) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    closeModal(backdrop);
                }
            });
        }

        // Add to DOM
        backdrop.appendChild(container);
        document.body.appendChild(backdrop);

        // Save current scroll position
        const scrollY = window.scrollY;

        // Prevent body scrolling while modal is open
        // But do it in a way that doesn't cause layout shifts
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${scrollY}px`;

        // Trigger animation
        setTimeout(() => {
            backdrop.classList.add('show');
        }, 10);

        // Store onClose callback
        if (onClose) {
            backdrop._onClose = onClose;
        }

        // Return the modal elements for further manipulation
        return {
            backdrop,
            container,
            close: () => closeModal(backdrop)
        };
    }

    // Close a modal with animation
    function closeModal(backdrop) {
        if (!backdrop) return;

        backdrop.classList.remove('show');

        // Restore scrolling when closing modal
        // Get the scroll position from the body's top style
        const scrollY = document.body.style.top ?
            parseInt(document.body.style.top.replace('-', '')) : 0;

        // Reset all styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.top = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);

        setTimeout(() => {
            if (backdrop.parentNode) {
                // Call onClose callback if exists
                if (backdrop._onClose) {
                    backdrop._onClose();
                }
                backdrop.parentNode.removeChild(backdrop);
            }
        }, 300); // Match the transition duration
    }

    // Position an element relative to a trigger element
    function positionDropdown(dropdown, trigger, options = {}) {
        const {
            position = 'bottom', // top, bottom, left, right
            offsetX = 0,
            offsetY = 0,
            width = null,
            maxHeight = null
        } = options;

        if (!dropdown || !trigger) return;

        // Get trigger element position
        const triggerRect = trigger.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Set width if provided
        if (width) {
            dropdown.style.width = typeof width === 'number' ? `${width}px` : width;
        }

        // Set max height if provided
        if (maxHeight) {
            dropdown.style.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
        }

        // Position dropdown based on specified position
        let top, left;

        switch (position) {
            case 'top':
                top = triggerRect.top - dropdown.offsetHeight + offsetY;
                left = triggerRect.left + (triggerRect.width / 2) - (dropdown.offsetWidth / 2) + offsetX;
                break;
            case 'bottom':
                top = triggerRect.bottom + offsetY;
                left = triggerRect.left + (triggerRect.width / 2) - (dropdown.offsetWidth / 2) + offsetX;
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height / 2) - (dropdown.offsetHeight / 2) + offsetY;
                left = triggerRect.left - dropdown.offsetWidth + offsetX;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height / 2) - (dropdown.offsetHeight / 2) + offsetY;
                left = triggerRect.right + offsetX;
                break;
        }

        // Adjust if dropdown would go off screen
        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (left + dropdown.offsetWidth > viewportWidth) {
            left = viewportWidth - dropdown.offsetWidth;
        }
        if (top + dropdown.offsetHeight > viewportHeight) {
            // If it would go off bottom, flip to top if there's room
            if (position === 'bottom' && triggerRect.top > dropdown.offsetHeight) {
                top = triggerRect.top - dropdown.offsetHeight + offsetY;
            } else {
                top = viewportHeight - dropdown.offsetHeight;
            }
        }

        // Apply position
        dropdown.style.position = 'fixed';
        dropdown.style.top = `${top}px`;
        dropdown.style.left = `${left}px`;
        dropdown.style.zIndex = '1000';
    }

    // Expose functions globally
    window.ModalSystem = {
        show: createModal,
        close: closeModal,
        positionDropdown
    };
})();
