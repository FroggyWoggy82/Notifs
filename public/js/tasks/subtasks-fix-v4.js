/**
 * Subtasks Fix V4 - Prevents duplicate subtasks in the edit modal
 * This script directly modifies the DOM to fix the duplicate subtasks issue
 */

(function() {
    console.log('[Subtasks Fix V4] Initializing...');

    // Function to fix duplicate subtasks in the edit modal
    function fixDuplicateSubtasks() {
        // Get the edit subtasks list element
        const editSubtasksList = document.getElementById('editSubtasksList');
        if (!editSubtasksList) {
            console.log('[Subtasks Fix V4] Edit subtasks list not found, waiting for it to be created...');
            return;
        }

        // Create a MutationObserver to watch for changes to the subtasks list
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    console.log('[Subtasks Fix V4] Subtasks list changed, checking for duplicates...');

                    // Get all subtask items
                    const subtaskItems = editSubtasksList.querySelectorAll('.modal-subtask-item');
                    if (subtaskItems.length <= 1) {
                        console.log('[Subtasks Fix V4] No duplicates found (0 or 1 subtasks)');
                        return;
                    }

                    console.log(`[Subtasks Fix V4] Found ${subtaskItems.length} subtask items, checking for duplicates...`);

                    // Check if we have duplicate subtasks by title
                    const subtaskTitles = new Map(); // Map of title -> array of elements
                    const duplicates = [];

                    // First pass: collect all subtasks by title
                    subtaskItems.forEach(function(item) {
                        const titleElement = item.querySelector('.subtask-title');
                        if (!titleElement) {
                            console.log('[Subtasks Fix V4] Subtask item has no title element, skipping');
                            return;
                        }

                        const title = titleElement.textContent.trim();
                        if (!title) {
                            console.log('[Subtasks Fix V4] Subtask item has empty title, skipping');
                            return;
                        }

                        if (!subtaskTitles.has(title)) {
                            subtaskTitles.set(title, []);
                        }

                        subtaskTitles.get(title).push(item);
                    });

                    // Second pass: find duplicates
                    subtaskTitles.forEach(function(items, title) {
                        if (items.length > 1) {
                            console.log(`[Subtasks Fix V4] Found ${items.length} subtasks with title "${title}", keeping only the first one`);

                            // Keep the first one, mark the rest as duplicates
                            for (let i = 1; i < items.length; i++) {
                                duplicates.push(items[i]);
                            }
                        }
                    });

                    // Remove duplicates
                    if (duplicates.length > 0) {
                        console.log(`[Subtasks Fix V4] Removing ${duplicates.length} duplicate subtasks`);
                        duplicates.forEach(function(item) {
                            item.remove();
                        });
                    } else {
                        console.log('[Subtasks Fix V4] No duplicates found');
                    }
                }
            });
        });

        // Start observing the subtasks list
        observer.observe(editSubtasksList, { childList: true, subtree: true });
        console.log('[Subtasks Fix V4] Now observing the subtasks list for changes');
    }

    // Function to check if the edit modal is open
    function checkForEditModal() {
        const editTaskModal = document.getElementById('editTaskModal');
        if (!editTaskModal) {
            console.log('[Subtasks Fix V4] Edit task modal not found, waiting for it to be created...');
            setTimeout(checkForEditModal, 500);
            return;
        }

        console.log('[Subtasks Fix V4] Found edit task modal, setting up mutation observer...');

        // Create a MutationObserver to watch for changes to the edit modal
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const isVisible = editTaskModal.style.display !== 'none';
                    if (isVisible) {
                        console.log('[Subtasks Fix V4] Edit task modal is now visible, fixing duplicate subtasks...');
                        fixDuplicateSubtasks();
                    }
                }
            });
        });

        // Start observing the edit modal
        observer.observe(editTaskModal, { attributes: true });
        console.log('[Subtasks Fix V4] Now observing the edit modal for visibility changes');

        // Also check if the edit modal is already visible
        if (editTaskModal.style.display !== 'none') {
            console.log('[Subtasks Fix V4] Edit task modal is already visible, fixing duplicate subtasks...');
            fixDuplicateSubtasks();
        }
    }

    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[Subtasks Fix V4] DOM content loaded, checking for edit modal...');
            checkForEditModal();
        });
    } else {
        console.log('[Subtasks Fix V4] DOM already loaded, checking for edit modal...');
        checkForEditModal();
    }

    console.log('[Subtasks Fix V4] Initialized');
})();
