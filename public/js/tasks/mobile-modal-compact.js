/**
 * Mobile Modal Compact
 * Additional JavaScript optimizations to make the add task modal more compact on mobile devices
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Mobile modal compact script loaded");

    // Function to apply mobile-specific optimizations
    function applyMobileOptimizations() {
        // Check if we're on a mobile device
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile) return;

        // Get modal elements
        const addTaskModal = document.getElementById('addTaskModal');
        const editTaskModal = document.getElementById('editTaskModal');

        if (addTaskModal) {
            optimizeModal(addTaskModal);
        }
        
        if (editTaskModal) {
            optimizeModal(editTaskModal);
        }
    }

    function optimizeModal(modal) {
        // Optimize description textarea height
        const textarea = modal.querySelector('textarea');
        if (textarea) {
            textarea.style.minHeight = '50px';
            textarea.style.maxHeight = '80px';
            textarea.rows = 2;
        }

        // Optimize reminder checkboxes layout
        const reminderCheckboxes = modal.querySelector('.reminder-checkboxes');
        if (reminderCheckboxes) {
            reminderCheckboxes.style.display = 'grid';
            reminderCheckboxes.style.gridTemplateColumns = '1fr 1fr';
            reminderCheckboxes.style.gap = '2px';
            reminderCheckboxes.style.fontSize = '0.75rem';
        }

        // Optimize form rows
        const formRows = modal.querySelectorAll('.form-row');
        formRows.forEach(row => {
            row.style.gap = '6px';
            row.style.marginBottom = '4px';
        });

        // Optimize subtasks section
        const subtasksList = modal.querySelector('.subtasks-list');
        if (subtasksList) {
            subtasksList.style.maxHeight = '100px';
            subtasksList.style.overflowY = 'auto';
        }

        // Optimize form labels
        const labels = modal.querySelectorAll('.form-label');
        labels.forEach(label => {
            label.style.fontSize = '0.8rem';
            label.style.marginBottom = '2px';
            label.style.fontWeight = '500';
        });

        // Optimize inputs and selects
        const inputs = modal.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type !== 'checkbox') {
                input.style.padding = '4px 6px';
                input.style.fontSize = '0.8rem';
                input.style.minHeight = '30px';
            }
        });

        // Optimize checkboxes
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.style.width = '16px';
            checkbox.style.height = '16px';
            checkbox.style.marginRight = '6px';
        });

        // Optimize the modal content padding
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent && window.innerWidth <= 480) {
            modalContent.style.padding = '8px';
            modalContent.style.margin = '5px auto';
        }

        // Optimize button container
        const buttonContainer = modal.querySelector('.button-container');
        if (buttonContainer) {
            buttonContainer.style.marginTop = '6px';
            buttonContainer.style.marginBottom = '0';
        }

        // Optimize submit button
        const submitButton = modal.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.style.padding = '6px 10px';
            submitButton.style.fontSize = '0.8rem';
        }
    }

    // Function to handle modal opening
    function handleModalOpen(modalId) {
        setTimeout(() => {
            const modal = document.getElementById(modalId);
            if (modal && window.innerWidth <= 768) {
                optimizeModal(modal);
                
                // Ensure modal is properly positioned
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    // Check if modal height exceeds viewport
                    const modalHeight = modalContent.offsetHeight;
                    const viewportHeight = window.innerHeight;
                    
                    if (modalHeight > viewportHeight - 20) {
                        modalContent.style.maxHeight = `${viewportHeight - 20}px`;
                        modalContent.style.overflowY = 'auto';
                    }
                }
            }
        }, 100);
    }

    // Listen for FAB click (Add Task)
    const addTaskFab = document.getElementById('addTaskFab');
    if (addTaskFab) {
        addTaskFab.addEventListener('click', () => {
            handleModalOpen('addTaskModal');
        });
    }

    // Listen for edit task button clicks
    document.addEventListener('click', function(event) {
        if (event.target.closest('.edit-task-btn')) {
            handleModalOpen('editTaskModal');
        }
    });

    // Apply optimizations on window resize
    window.addEventListener('resize', function() {
        // Debounce resize events
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(applyMobileOptimizations, 250);
    });

    // Apply initial optimizations
    applyMobileOptimizations();

    // Re-apply optimizations when modals become visible
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if ((target.id === 'addTaskModal' || target.id === 'editTaskModal') && 
                    target.style.display === 'flex' && window.innerWidth <= 768) {
                    setTimeout(() => optimizeModal(target), 50);
                }
            }
        });
    });

    // Observe modal visibility changes
    const addTaskModal = document.getElementById('addTaskModal');
    const editTaskModal = document.getElementById('editTaskModal');
    
    if (addTaskModal) {
        observer.observe(addTaskModal, { attributes: true, attributeFilter: ['style'] });
    }
    
    if (editTaskModal) {
        observer.observe(editTaskModal, { attributes: true, attributeFilter: ['style'] });
    }
});
