/**
 * Modal Simple Fix
 * Clean, simple solution for modal management
 * Prevents auto-opening and ensures close buttons work
 */

(function() {
    'use strict';
    
    console.log('[Modal Simple Fix] Initializing...');
    
    const MODAL_IDS = ['editTaskModal', 'addTaskModal', 'addHabitModal', 'editHabitModal'];
    
    // Force close all modals and remove any auto-opening classes
    function forceCloseAllModals() {
        MODAL_IDS.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                // Remove all classes that might make modal visible
                modal.classList.remove('visible', 'modal-visible', 'show', 'active', 'open', 'user-opened');
                
                // Force hide with inline styles
                modal.style.setProperty('display', 'none', 'important');
                modal.style.setProperty('visibility', 'hidden', 'important');
                modal.style.setProperty('opacity', '0', 'important');
                
                console.log(`[Modal Simple Fix] Closed ${modalId}`);
            }
        });
        
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.height = '';
    }
    
    // Properly open a modal (for legitimate use)
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log(`[Modal Simple Fix] Opening ${modalId}`);
            
            // First ensure it's closed
            modal.classList.remove('visible', 'modal-visible', 'show', 'active', 'open');
            modal.style.removeProperty('display');
            modal.style.removeProperty('visibility');
            modal.style.removeProperty('opacity');
            
            // Add user-opened class to allow CSS to show it
            modal.classList.add('user-opened');
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            return true;
        }
        return false;
    }
    
    // Properly close a modal
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log(`[Modal Simple Fix] Closing ${modalId}`);
            
            // Remove user-opened class
            modal.classList.remove('user-opened');
            
            // Remove other classes
            modal.classList.remove('visible', 'modal-visible', 'show', 'active', 'open');
            
            // Force hide
            modal.style.setProperty('display', 'none', 'important');
            
            // Reset any form in the modal
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Dispatch close event
            modal.dispatchEvent(new CustomEvent('modalClosed', { detail: { modalId } }));
            
            return true;
        }
        return false;
    }
    
    // Setup close button handlers
    function setupCloseButtons() {
        MODAL_IDS.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            
            // Find close button elements
            const closeElements = modal.querySelectorAll('.close-button, .close-button i, .fas.fa-times, [data-dismiss="modal"]');
            
            closeElements.forEach(element => {
                // Remove existing listeners by cloning
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                
                // Add click handler
                newElement.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`[Modal Simple Fix] Close button clicked for ${modalId}`);
                    closeModal(modalId);
                });
                
                // Add touch handler for mobile
                newElement.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`[Modal Simple Fix] Close button touched for ${modalId}`);
                    closeModal(modalId);
                });
            });
            
            // Backdrop click to close
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    console.log(`[Modal Simple Fix] Backdrop clicked for ${modalId}`);
                    closeModal(modalId);
                }
            });
        });
        
        // Global escape key handler
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                MODAL_IDS.forEach(modalId => {
                    const modal = document.getElementById(modalId);
                    if (modal && modal.classList.contains('user-opened')) {
                        console.log(`[Modal Simple Fix] Escape pressed, closing ${modalId}`);
                        closeModal(modalId);
                    }
                });
            }
        });
    }
    
    // Override existing modal functions to use our safe methods
    function overrideModalFunctions() {
        // Override showEditTaskModal if it exists
        if (window.showEditTaskModal || window.openEditTaskModal) {
            const originalShow = window.showEditTaskModal || window.openEditTaskModal;
            window.showEditTaskModal = window.openEditTaskModal = function(task) {
                console.log('[Modal Simple Fix] Intercepted edit modal open');
                
                if (task) {
                    // Fill form fields
                    const titleInput = document.getElementById('editTaskTitle');
                    const descInput = document.getElementById('editTaskDescription');
                    const dueDateInput = document.getElementById('editTaskDueDate');
                    const idInput = document.getElementById('editTaskId');
                    
                    if (titleInput) titleInput.value = task.title || '';
                    if (descInput) descInput.value = task.description || '';
                    if (dueDateInput) dueDateInput.value = task.due_date ? task.due_date.split('T')[0] : '';
                    if (idInput) idInput.value = task.id || '';
                }
                
                openModal('editTaskModal');
            };
        }
        
        // Override showAddTaskModal if it exists
        if (window.showAddTaskModal) {
            window.showAddTaskModal = function() {
                console.log('[Modal Simple Fix] Intercepted add task modal open');
                openModal('addTaskModal');
            };
        }
        
        // Override showAddHabitModal if it exists
        if (window.showAddHabitModal) {
            window.showAddHabitModal = function() {
                console.log('[Modal Simple Fix] Intercepted add habit modal open');
                openModal('addHabitModal');
            };
        }
        
        // Override showEditHabitModal if it exists
        if (window.showEditHabitModal) {
            window.showEditHabitModal = function() {
                console.log('[Modal Simple Fix] Intercepted edit habit modal open');
                openModal('editHabitModal');
            };
        }
    }
    
    // Initialize
    function initialize() {
        console.log('[Modal Simple Fix] Setting up modal management...');
        
        // Force close all modals immediately
        forceCloseAllModals();
        
        // Setup close button handlers
        setupCloseButtons();
        
        // Override modal functions
        setTimeout(overrideModalFunctions, 100);
        
        // Add global functions
        window.openModal = openModal;
        window.closeModal = closeModal;
        window.forceCloseAllModals = forceCloseAllModals;
        
        console.log('[Modal Simple Fix] Modal management ready');
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Also run after a delay to override any late-loading scripts
    setTimeout(function() {
        console.log('[Modal Simple Fix] Running delayed initialization...');
        forceCloseAllModals();
        setupCloseButtons();
        overrideModalFunctions();
    }, 1000);
    
})();
