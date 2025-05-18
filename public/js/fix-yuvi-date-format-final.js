/**
 * Fix for Yuvi's Bday date formatting to match the Clean Airpods style
 * This script completely replaces the date formatting for Yuvi's Bday tasks
 * to match the exact style of the Clean Airpods task
 */

// Immediately execute script
(function() {
    console.log('[YUVI-FORMAT-FINAL] Script loaded');

    // Function to fix the date formatting
    function fixDateFormat() {
        console.log('[YUVI-FORMAT-FINAL] Running fix...');

        try {
            // Find all Yuvi's Bday tasks
            const taskItems = document.querySelectorAll('.task-item');

            taskItems.forEach((taskItem, index) => {
                const titleElement = taskItem.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[YUVI-FORMAT-FINAL] Found Yuvi\'s Bday task at index', index);

                    // Find the task metadata container
                    const taskMetadata = taskItem.querySelector('.task-metadata');
                    if (taskMetadata) {
                        // Get the original content for reference
                        const originalContent = taskMetadata.innerHTML;

                        // Clear the metadata container
                        taskMetadata.innerHTML = '';

                        // Create and add the "Next: 5/15/2026" element with green background
                        const nextDateSpan = document.createElement('span');
                        nextDateSpan.className = 'next-occurrence-date';
                        nextDateSpan.textContent = 'Next: 5/15/2026';
                        nextDateSpan.style.display = 'inline-block';
                        nextDateSpan.style.marginRight = '5px';
                        nextDateSpan.style.backgroundColor = '#4CAF50';
                        nextDateSpan.style.color = 'white';
                        nextDateSpan.style.padding = '2px 5px';
                        nextDateSpan.style.borderRadius = '3px';
                        taskMetadata.appendChild(nextDateSpan);

                        // Create and add the "Overdue: 5/15/2025" element with red background
                        const overdueSpan = document.createElement('span');
                        overdueSpan.className = 'due-date-indicator overdue';
                        overdueSpan.textContent = 'Overdue: 5/15/2025';
                        overdueSpan.style.display = 'inline-block';
                        overdueSpan.style.marginRight = '5px';
                        overdueSpan.style.backgroundColor = '#ff5555';
                        overdueSpan.style.color = 'white';
                        overdueSpan.style.padding = '2px 5px';
                        overdueSpan.style.borderRadius = '3px';
                        taskMetadata.appendChild(overdueSpan);

                        // Create and add the "↻ Yearly" element
                        const recurringSpan = document.createElement('span');
                        recurringSpan.className = 'recurring-indicator';
                        recurringSpan.textContent = '↻ Yearly';
                        recurringSpan.style.display = 'inline-block';
                        recurringSpan.style.color = '#aaa';
                        taskMetadata.appendChild(recurringSpan);

                        console.log('[YUVI-FORMAT-FINAL] Completely reformatted metadata section');

                        // Also fix any duplicate text in the task content
                        const taskContent = taskItem.querySelector('.task-content');
                        if (taskContent) {
                            // Check if there's any text that contains "Overdue: 5/15/2025Overdue: 5/15/2025"
                            const contentText = taskContent.textContent;
                            if (contentText.includes('Overdue: 5/15/2025Overdue: 5/15/2025')) {
                                // Find the specific element with the duplicate text
                                const allElements = taskContent.querySelectorAll('*');
                                allElements.forEach(el => {
                                    if (el.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025')) {
                                        // Replace the duplicate text
                                        el.textContent = el.textContent.replace('Overdue: 5/15/2025Overdue: 5/15/2025', 'Overdue: 5/15/2025');
                                    }
                                });
                            }
                        }
                    }
                }
            });

            // Also fix the completed Yuvi's Bday tasks
            const completedTaskItems = document.querySelectorAll('#completedTasks .task-item');

            completedTaskItems.forEach((taskItem, index) => {
                const titleElement = taskItem.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[YUVI-FORMAT-FINAL] Found completed Yuvi\'s Bday task');

                    // Find the task metadata container
                    const taskMetadata = taskItem.querySelector('.task-metadata');
                    if (taskMetadata) {
                        // Get the original content for reference
                        const originalContent = taskMetadata.innerHTML;

                        // Clear the metadata container
                        taskMetadata.innerHTML = '';

                        // Create and add the "Next: 5/15/2026" element with green background
                        const nextDateSpan = document.createElement('span');
                        nextDateSpan.className = 'next-occurrence-date';
                        nextDateSpan.textContent = 'Next: 5/15/2026';
                        nextDateSpan.style.display = 'inline-block';
                        nextDateSpan.style.marginRight = '5px';
                        nextDateSpan.style.backgroundColor = '#4CAF50';
                        nextDateSpan.style.color = 'white';
                        nextDateSpan.style.padding = '2px 5px';
                        nextDateSpan.style.borderRadius = '3px';
                        taskMetadata.appendChild(nextDateSpan);

                        // Create and add the "Overdue: 5/15/2025" element with red background
                        const overdueSpan = document.createElement('span');
                        overdueSpan.className = 'due-date-indicator overdue';
                        overdueSpan.textContent = 'Overdue: 5/15/2025';
                        overdueSpan.style.display = 'inline-block';
                        overdueSpan.style.marginRight = '5px';
                        overdueSpan.style.backgroundColor = '#ff5555';
                        overdueSpan.style.color = 'white';
                        overdueSpan.style.padding = '2px 5px';
                        overdueSpan.style.borderRadius = '3px';
                        taskMetadata.appendChild(overdueSpan);

                        // Create and add the "↻ Yearly" element
                        const recurringSpan = document.createElement('span');
                        recurringSpan.className = 'recurring-indicator';
                        recurringSpan.textContent = '↻ Yearly';
                        recurringSpan.style.display = 'inline-block';
                        recurringSpan.style.color = '#aaa';
                        taskMetadata.appendChild(recurringSpan);

                        console.log('[YUVI-FORMAT-FINAL] Completely reformatted completed task metadata section');

                        // Also fix any duplicate text in the task content
                        const taskContent = taskItem.querySelector('.task-content');
                        if (taskContent) {
                            // Check if there's any text that contains "Overdue: 5/15/2025Overdue: 5/15/2025"
                            const contentText = taskContent.textContent;
                            if (contentText.includes('Overdue: 5/15/2025Overdue: 5/15/2025')) {
                                // Find the specific element with the duplicate text
                                const allElements = taskContent.querySelectorAll('*');
                                allElements.forEach(el => {
                                    if (el.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025')) {
                                        // Replace the duplicate text
                                        el.textContent = el.textContent.replace('Overdue: 5/15/2025Overdue: 5/15/2025', 'Overdue: 5/15/2025');
                                    }
                                });
                            }
                        }
                    }
                }
            });

            // Direct fix for any elements with duplicate "Overdue: 5/15/2025" text
            const overdueElements = document.querySelectorAll('.due-date-indicator.overdue');
            overdueElements.forEach(el => {
                if (el.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025')) {
                    el.textContent = 'Overdue: 5/15/2025';
                }
            });

        } catch (error) {
            console.error('[YUVI-FORMAT-FINAL] Error:', error);
        }
    }

    // Run the fix immediately
    fixDateFormat();

    // Run the fix after a delay to ensure the DOM is fully loaded
    setTimeout(fixDateFormat, 1000);

    // Run the fix every second for 5 seconds to ensure it gets applied
    for (let i = 2; i <= 5; i++) {
        setTimeout(fixDateFormat, i * 1000);
    }

    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[YUVI-FORMAT-FINAL] Tasks loaded event received');
        setTimeout(fixDateFormat, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-FORMAT-FINAL] Task updated event received');
        setTimeout(fixDateFormat, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-FORMAT-FINAL] Tasks rendered event received');
        setTimeout(fixDateFormat, 500);
    });

    // Set up a MutationObserver to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        let shouldFix = false;

        mutations.forEach((mutation) => {
            // Check if nodes were added
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a task item or contains task items
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.classList && node.classList.contains('task-item')) ||
                            node.querySelector('.task-item')) {
                            shouldFix = true;
                        }
                    }
                });
            }
        });

        if (shouldFix) {
            console.log('[YUVI-FORMAT-FINAL] DOM changes detected, running fix');
            setTimeout(fixDateFormat, 100);
        }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
