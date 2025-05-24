/**
 * Subtask Button Position Fix
 * Forces the Add Subtask button to appear next to the Subtasks label
 */

(function() {
    console.log('[Subtask Button Position Fix] Initializing...');

    function fixSubtaskButtonPosition() {
        const addTaskModal = document.getElementById('addTaskModal');
        if (!addTaskModal) return;

        const subtasksHeader = addTaskModal.querySelector('.subtasks-header');
        const addSubtaskBtn = addTaskModal.querySelector('#addSubtaskBtn');
        
        if (subtasksHeader && addSubtaskBtn) {
            console.log('[Subtask Button Position Fix] Fixing subtask button position');
            
            // Force the layout with inline styles as backup
            subtasksHeader.style.setProperty('display', 'flex', 'important');
            subtasksHeader.style.setProperty('justify-content', 'flex-start', 'important');
            subtasksHeader.style.setProperty('align-items', 'center', 'important');
            subtasksHeader.style.setProperty('gap', '10px', 'important');
            subtasksHeader.style.setProperty('flex-direction', 'row', 'important');
            
            // Style the button
            addSubtaskBtn.style.setProperty('background-color', '#ffffff', 'important');
            addSubtaskBtn.style.setProperty('color', '#121212', 'important');
            addSubtaskBtn.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.1)', 'important');
            addSubtaskBtn.style.setProperty('border-radius', '4px', 'important');
            addSubtaskBtn.style.setProperty('padding', '6px 12px', 'important');
            addSubtaskBtn.style.setProperty('font-size', '14px', 'important');
            addSubtaskBtn.style.setProperty('margin', '0', 'important');
            addSubtaskBtn.style.setProperty('align-self', 'initial', 'important');
            
            console.log('[Subtask Button Position Fix] Applied inline styles');
        }
    }

    // Function to observe when the modal is shown
    function observeModal() {
        const addTaskModal = document.getElementById('addTaskModal');
        if (!addTaskModal) {
            setTimeout(observeModal, 100);
            return;
        }

        // Create a mutation observer to watch for when the modal becomes visible
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const modal = mutation.target;
                    if (modal.style.display === 'flex' || modal.style.display === 'block') {
                        setTimeout(fixSubtaskButtonPosition, 50);
                    }
                }
            });
        });

        observer.observe(addTaskModal, { attributes: true, attributeFilter: ['style'] });

        // Also fix immediately if modal is already visible
        if (addTaskModal.style.display === 'flex' || addTaskModal.style.display === 'block') {
            fixSubtaskButtonPosition();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeModal);
    } else {
        observeModal();
    }

    // Also listen for the modal show event if it exists
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'addTaskFab') {
            setTimeout(fixSubtaskButtonPosition, 100);
        }
    });

    console.log('[Subtask Button Position Fix] Initialized');
})();
