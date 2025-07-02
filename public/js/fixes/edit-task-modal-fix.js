/**
 * Edit Task Modal Fix
 * Ensures Edit Task modal works correctly and can be properly closed
 */

// Run immediately to prevent auto-opening
(function() {
    console.log('[Edit Task Modal Fix] Early initialization to prevent auto-opening...');
    
    // Force close modal immediately if it exists
    const modal = document.getElementById('editTaskModal');
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        modal.classList.remove('modal-visible');
        document.body.style.overflow = '';
        console.log('[Edit Task Modal Fix] Modal forced closed early');
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Edit Task Modal Fix] Initializing edit task modal fixes...');

    const editTaskModal = document.getElementById('editTaskModal');
    const closeEditTaskModalBtn = document.querySelector('#editTaskModal .close-button, #editTaskModal .modal-close, #editTaskModal i[class*="close"], #editTaskModal i[class*="times"]');

    console.log('[Edit Task Modal Fix] Modal element:', editTaskModal);
    console.log('[Edit Task Modal Fix] Close button element:', closeEditTaskModalBtn);

    if (!editTaskModal) {
        console.error('[Edit Task Modal Fix] Modal element not found');
        return;
    }

    // Ensure modal starts closed
    editTaskModal.style.setProperty('display', 'none', 'important');
    editTaskModal.classList.remove('modal-visible');
    document.body.style.overflow = '';
    
    initializeEditTaskModal(editTaskModal, closeEditTaskModalBtn);
    
    // Also run after a delay to catch any late auto-opening
    setTimeout(function() {
        const computedStyle = window.getComputedStyle(editTaskModal);
        if (computedStyle.display !== 'none' || editTaskModal.offsetWidth > 0) {
            console.log('[Edit Task Modal Fix] Modal was auto-opened, forcing it closed again');
            editTaskModal.style.setProperty('display', 'none', 'important');
            editTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = '';
        }
    }, 1000);
});

function initializeEditTaskModal(editTaskModal, closeEditTaskModalBtn) {
    console.log('[Edit Task Modal Fix] Setting up edit task modal functionality...');
    
    // Enhanced close button functionality
    if (closeEditTaskModalBtn) {
        // Remove any existing event listeners by cloning the element
        const newCloseBtn = closeEditTaskModalBtn.cloneNode(true);
        closeEditTaskModalBtn.parentNode.replaceChild(newCloseBtn, closeEditTaskModalBtn);
        
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Edit Task Modal Fix] Close button clicked');
            closeEditTaskModal(editTaskModal);
        });
        
        console.log('[Edit Task Modal Fix] Close button event listener added');
    } else {
        console.warn('[Edit Task Modal Fix] Close button not found, creating one...');
        createCloseButton(editTaskModal);
    }
    
    // Handle modal backdrop click
    editTaskModal.addEventListener('click', function(e) {
        if (e.target === editTaskModal) {
            console.log('[Edit Task Modal Fix] Modal backdrop clicked');
            closeEditTaskModal(editTaskModal);
        }
    });
    
    // Handle Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isEditTaskModalVisible(editTaskModal)) {
            console.log('[Edit Task Modal Fix] Escape key pressed');
            closeEditTaskModal(editTaskModal);
        }
    });
    
    console.log('[Edit Task Modal Fix] Edit task modal fixes initialized successfully');
}

function closeEditTaskModal(editTaskModal) {
    console.log('[Edit Task Modal Fix] Closing edit task modal...');
    
    // Close the modal - use setProperty with important to override CSS !important rules
    editTaskModal.style.setProperty('display', 'none', 'important');
    editTaskModal.classList.remove('modal-visible');
    editTaskModal.classList.remove('show');
    editTaskModal.classList.remove('visible');
    editTaskModal.classList.remove('active');
    editTaskModal.classList.remove('open');
    
    // Clear any positioning styles that might interfere
    editTaskModal.style.setProperty('position', 'fixed', 'important');
    editTaskModal.style.setProperty('top', '-9999px', 'important');
    editTaskModal.style.setProperty('left', '-9999px', 'important');
    editTaskModal.style.setProperty('visibility', 'hidden', 'important');
    editTaskModal.style.setProperty('opacity', '0', 'important');
    editTaskModal.style.setProperty('z-index', '-9999', 'important');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.height = '';
    
    console.log('[Edit Task Modal Fix] Modal closed successfully');
}

function isEditTaskModalVisible(editTaskModal) {
    const computedStyle = window.getComputedStyle(editTaskModal);
    return editTaskModal.style.display === 'flex' || 
           editTaskModal.style.display === 'block' ||
           computedStyle.display === 'flex' ||
           computedStyle.display === 'block' ||
           (editTaskModal.style.display !== 'none' && computedStyle.display !== 'none') ||
           editTaskModal.classList.contains('modal-visible') ||
           editTaskModal.classList.contains('show') ||
           editTaskModal.classList.contains('visible') ||
           editTaskModal.classList.contains('active') ||
           editTaskModal.classList.contains('open') ||
           (editTaskModal.offsetWidth > 0 && editTaskModal.offsetHeight > 0);
}

function createCloseButton(editTaskModal) {
    console.log('[Edit Task Modal Fix] Creating close button...');
    
    const modalContent = editTaskModal.querySelector('.modal-content');
    if (!modalContent) {
        console.error('[Edit Task Modal Fix] Modal content not found, cannot create close button');
        return;
    }
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'modal-close-btn';
    closeButton.style.cssText = `
        position: absolute !important;
        top: 10px !important;
        right: 15px !important;
        background: none !important;
        border: none !important;
        font-size: 24px !important;
        color: #fff !important;
        cursor: pointer !important;
        z-index: 10001 !important;
        width: 30px !important;
        height: 30px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;
    
    closeButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Edit Task Modal Fix] Created close button clicked');
        closeEditTaskModal(editTaskModal);
    });
    
    modalContent.style.position = 'relative';
    modalContent.appendChild(closeButton);
    
    console.log('[Edit Task Modal Fix] Close button created and added');
}

// Protection against other scripts opening the modal
function protectEditTaskModal() {
    const editTaskModal = document.getElementById('editTaskModal');
    if (!editTaskModal) return;
    
    // Create a MutationObserver to watch for style changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                // If something tries to open the modal without user interaction
                const computedStyle = window.getComputedStyle(editTaskModal);
                if ((computedStyle.display === 'flex' || computedStyle.display === 'block') && 
                    !editTaskModal.getAttribute('data-user-opened')) {
                    console.log('[Edit Task Modal Fix] PROTECTION: Modal was auto-opened, closing...');
                    closeEditTaskModal(editTaskModal);
                }
            }
        });
    });
    
    // Start observing
    observer.observe(editTaskModal, {
        attributes: true,
        attributeFilter: ['style', 'class']
    });
    
    console.log('[Edit Task Modal Fix] Protection mechanism activated');
}

// Initialize protection when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectEditTaskModal);
} else {
    protectEditTaskModal();
}
