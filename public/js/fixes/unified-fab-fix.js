/**
 * Unified FAB Fix
 * Simple, clean fix for the add task FAB button
 */

console.log('[Unified FAB Fix] Loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Unified FAB Fix] Initializing...');

    const addTaskFab = document.getElementById('addTaskFab');
    const addTaskModal = document.getElementById('addTaskModal');

    if (!addTaskFab) {
        console.error('[Unified FAB Fix] FAB element not found');
        return;
    }

    if (!addTaskModal) {
        console.error('[Unified FAB Fix] Modal element not found');
        return;
    }

    // Ensure modal starts closed
    addTaskModal.style.display = 'none';
    addTaskModal.classList.remove('modal-visible');
    document.body.style.overflow = '';

    // Remove any existing event listeners by cloning the FAB
    const newFab = addTaskFab.cloneNode(true);
    addTaskFab.parentNode.replaceChild(newFab, addTaskFab);

    // Add single, clean event listener
    newFab.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('[Unified FAB Fix] FAB clicked');

        // Check if modal is currently visible
        const isModalVisible = addTaskModal.style.display === 'flex' ||
                              addTaskModal.style.display === 'block' ||
                              addTaskModal.classList.contains('modal-visible') ||
                              (addTaskModal.offsetWidth > 0 && addTaskModal.offsetHeight > 0);

        if (isModalVisible) {
            console.log('[Unified FAB Fix] Closing modal');
            // Close the modal
            addTaskModal.style.display = 'none';
            addTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = '';
        } else {
            console.log('[Unified FAB Fix] Opening modal');
            // Open the modal
            addTaskModal.style.display = 'flex';
            addTaskModal.classList.add('modal-visible');
            document.body.style.overflow = 'hidden';

            // Clear form
            const form = addTaskModal.querySelector('#addTaskForm');
            if (form) {
                form.reset();
            }

            // Focus on first input
            setTimeout(() => {
                const firstInput = addTaskModal.querySelector('input[type="text"], textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    });

    // Handle modal close button
    const closeButton = addTaskModal.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            addTaskModal.style.display = 'none';
            addTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = '';
            console.log('[Unified FAB Fix] Modal closed via close button');
        });
    }

    // Handle clicking outside modal to close
    addTaskModal.addEventListener('click', function(e) {
        if (e.target === addTaskModal) {
            addTaskModal.style.display = 'none';
            addTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = '';
            console.log('[Unified FAB Fix] Modal closed by clicking outside');
        }
    });

    console.log('[Unified FAB Fix] Initialization complete');
});
