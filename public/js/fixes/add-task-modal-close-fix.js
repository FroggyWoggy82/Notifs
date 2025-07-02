/**
 * Simple Add Task Modal Close Fix
 * Ensures the close button works on both desktop and mobile
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Add Task Modal Close Fix] Starting...');
    
    const addTaskModal = document.getElementById('addTaskModal');
    if (!addTaskModal) {
        console.error('[Add Task Modal Close Fix] Modal not found');
        return;
    }
    
    // Find all possible close button selectors
    const closeSelectors = [
        '.close-button',
        '.close-button i',
        '.fas.fa-times',
        'i.fas.fa-times',
        '[class*="close"]',
        'i[class*="times"]'
    ];
    
    let closeButton = null;
    for (const selector of closeSelectors) {
        closeButton = addTaskModal.querySelector(selector);
        if (closeButton) {
            console.log('[Add Task Modal Close Fix] Found close button with selector:', selector);
            break;
        }
    }
    
    if (!closeButton) {
        console.warn('[Add Task Modal Close Fix] No close button found, creating one...');
        createCloseButton(addTaskModal);
        return;
    }
    
    // Remove any existing event listeners by cloning the element
    const newCloseButton = closeButton.cloneNode(true);
    closeButton.parentNode.replaceChild(newCloseButton, closeButton);
    
    // Add the close functionality
    newCloseButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Add Task Modal Close Fix] Close button clicked');
        closeAddTaskModal(addTaskModal);
    });
    
    // Also handle clicks on parent elements (in case the icon is nested)
    const parentCloseButton = newCloseButton.closest('.close-button');
    if (parentCloseButton && parentCloseButton !== newCloseButton) {
        const newParentCloseButton = parentCloseButton.cloneNode(true);
        parentCloseButton.parentNode.replaceChild(newParentCloseButton, parentCloseButton);
        
        newParentCloseButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Add Task Modal Close Fix] Parent close button clicked');
            closeAddTaskModal(addTaskModal);
        });
    }
    
    // Add backdrop click functionality
    addTaskModal.addEventListener('click', function(e) {
        if (e.target === addTaskModal) {
            console.log('[Add Task Modal Close Fix] Backdrop clicked');
            closeAddTaskModal(addTaskModal);
        }
    });
    
    // Add Escape key functionality
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isAddTaskModalVisible(addTaskModal)) {
            console.log('[Add Task Modal Close Fix] Escape key pressed');
            closeAddTaskModal(addTaskModal);
        }
    });
    
    console.log('[Add Task Modal Close Fix] Complete');
});

function closeAddTaskModal(addTaskModal) {
    console.log('[Add Task Modal Close Fix] Closing modal...');
    
    // Use the strongest possible method to close the modal
    addTaskModal.style.setProperty('display', 'none', 'important');
    addTaskModal.classList.remove('modal-visible');
    addTaskModal.classList.remove('show');
    addTaskModal.classList.remove('visible');
    addTaskModal.classList.remove('active');
    addTaskModal.classList.remove('open');
    
    // Clear mobile FAB markers if they exist
    addTaskModal.removeAttribute('data-mobile-fab-opened');
    if (window.mobileFabModalOpen !== undefined) {
        window.mobileFabModalOpen = false;
    }
    
    // Restore body scrolling
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.height = '';
    
    console.log('[Add Task Modal Close Fix] Modal closed successfully');
}

function isAddTaskModalVisible(addTaskModal) {
    const computedStyle = window.getComputedStyle(addTaskModal);
    return addTaskModal.style.display === 'flex' || 
           addTaskModal.style.display === 'block' ||
           computedStyle.display === 'flex' ||
           computedStyle.display === 'block' ||
           (addTaskModal.style.display !== 'none' && computedStyle.display !== 'none') ||
           addTaskModal.classList.contains('modal-visible') ||
           addTaskModal.classList.contains('show') ||
           addTaskModal.classList.contains('visible') ||
           addTaskModal.classList.contains('active') ||
           addTaskModal.classList.contains('open') ||
           (addTaskModal.offsetWidth > 0 && addTaskModal.offsetHeight > 0);
}

function createCloseButton(addTaskModal) {
    console.log('[Add Task Modal Close Fix] Creating close button...');
    
    const modalContent = addTaskModal.querySelector('.modal-content');
    if (!modalContent) {
        console.error('[Add Task Modal Close Fix] Modal content not found, cannot create close button');
        return;
    }
    
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.style.cssText = `
        position: absolute !important;
        top: 15px !important;
        right: 15px !important;
        cursor: pointer !important;
        font-size: 20px !important;
        color: #999 !important;
        background-color: #333333 !important;
        border-radius: 50% !important;
        width: 30px !important;
        height: 30px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 10001 !important;
        transition: background-color 0.2s, color 0.2s !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
    `;
    
    closeButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Add Task Modal Close Fix] Created close button clicked');
        closeAddTaskModal(addTaskModal);
    });
    
    modalContent.style.position = 'relative';
    modalContent.appendChild(closeButton);
    
    console.log('[Add Task Modal Close Fix] Close button created and added');
}
