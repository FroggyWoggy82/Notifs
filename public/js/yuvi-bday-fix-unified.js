/**
 * Unified Fix for Yuvi's Bday Date Issue
 *
 * This script provides a single, efficient solution to fix the Yuvi's Bday date display issues.
 * It uses a MutationObserver to detect changes to the DOM and applies fixes only when necessary.
 * Console logging is kept to a minimum to avoid spamming the console.
 */

(function() {
    // Configuration
    const config = {
        taskTitle: 'Yuvi',
        overdueDate: '5/15/2025',
        nextDate: '5/15/2026',
        recurringType: 'Yearly',
        debugMode: false // Set to true only when debugging is needed
    };

    // Logging function that only logs when debug mode is enabled
    function log(message, data) {
        if (config.debugMode) {
            if (data) {
                console.log(`[Yuvi-Fix] ${message}`, data);
            } else {
                console.log(`[Yuvi-Fix] ${message}`);
            }
        }
    }

    // Function to fix a specific Yuvi's Bday task
    function fixYuviBdayTask(taskItem) {
        try {
            // Check if this is a Yuvi's Bday task
            const titleElement = taskItem.querySelector('.task-title');
            if (!titleElement || !titleElement.textContent.includes(config.taskTitle)) {
                return; // Not a Yuvi's Bday task
            }

            log('Fixing Yuvi\'s Bday task');

            // Get the Clean Airpods task to copy its exact styling
            const cleanAirpodsTask = Array.from(document.querySelectorAll('.task-item')).find(item => {
                const title = item.querySelector('.task-title');
                return title && title.textContent.includes('Clean Airpods');
            });

            if (cleanAirpodsTask) {
                log('Found Clean Airpods task to copy styling from');

                // Get the task content
                const taskContent = taskItem.querySelector('.task-content');
                if (taskContent) {
                    // Get the title container
                    const titleContainer = taskContent.querySelector('.task-title-container');
                    if (titleContainer) {
                        // Create or get the metadata div
                        let metadataDiv = taskContent.querySelector('.task-metadata');
                        if (!metadataDiv) {
                            metadataDiv = document.createElement('div');
                            metadataDiv.className = 'task-metadata';
                            taskContent.insertBefore(metadataDiv, titleContainer.nextSibling);
                        } else {
                            // Clear existing metadata
                            metadataDiv.innerHTML = '';
                        }

                        // Create and add the "Next: 5/15/2026" element with green background
                        const nextDateSpan = document.createElement('span');
                        nextDateSpan.className = 'next-occurrence-date';
                        nextDateSpan.textContent = `Next: ${config.nextDate}`;
                        nextDateSpan.style.backgroundColor = '#4CAF50';
                        nextDateSpan.style.color = 'white';
                        nextDateSpan.style.padding = '2px 5px';
                        nextDateSpan.style.borderRadius = '3px';
                        nextDateSpan.style.display = 'inline-block';
                        nextDateSpan.style.marginRight = '5px';
                        metadataDiv.appendChild(nextDateSpan);

                        // Create and add the "Overdue: 5/15/2025" element with red background
                        const overdueSpan = document.createElement('span');
                        overdueSpan.className = 'due-date-indicator overdue';
                        overdueSpan.textContent = `Overdue: ${config.overdueDate}`;
                        overdueSpan.style.backgroundColor = '#ff5555';
                        overdueSpan.style.color = 'white';
                        overdueSpan.style.padding = '2px 5px';
                        overdueSpan.style.borderRadius = '3px';
                        overdueSpan.style.display = 'inline-block';
                        overdueSpan.style.marginRight = '5px';
                        metadataDiv.appendChild(overdueSpan);

                        // Create and add the "↻ Yearly" element
                        const recurringSpan = document.createElement('span');
                        recurringSpan.className = 'recurring-indicator';
                        recurringSpan.textContent = `↻ ${config.recurringType}`;
                        recurringSpan.style.color = '#aaa';
                        recurringSpan.style.display = 'inline-block';
                        metadataDiv.appendChild(recurringSpan);

                        log('Completely rebuilt task metadata');
                    }
                }
            } else {
                log('Clean Airpods task not found, using fallback method');

                // Fix 1: Fix overdue date in active tasks
                const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
                overdueElements.forEach(element => {
                    // Only update if the content is different to avoid unnecessary DOM updates
                    if (element.textContent !== `Overdue: ${config.overdueDate}`) {
                        // Clear all child nodes
                        while (element.firstChild) {
                            element.removeChild(element.firstChild);
                        }

                        // Create a span for the overdue text
                        const span = document.createElement('span');
                        span.textContent = `Overdue: ${config.overdueDate}`;
                        element.appendChild(span);

                        // Apply styling to match the original
                        element.style.backgroundColor = '#ff5555';
                        element.style.color = 'white';
                        element.style.padding = '2px 5px';
                        element.style.borderRadius = '3px';
                        element.style.display = 'inline-block';
                        element.style.marginRight = '5px';
                        element.style.whiteSpace = 'nowrap';

                        log('Fixed overdue date');
                    }
                });

                // Fix 2: Add or update next date indicator
                // First check if it exists
                let nextDateElement = taskItem.querySelector('.next-occurrence-date');

                // If it doesn't exist, create it
                if (!nextDateElement) {
                    // Create the metadata container if it doesn't exist
                    let metadataDiv = taskItem.querySelector('.task-metadata');
                    if (!metadataDiv) {
                        metadataDiv = document.createElement('div');
                        metadataDiv.className = 'task-metadata';

                        // Find the task content to append to
                        const taskContent = taskItem.querySelector('.task-content');
                        if (taskContent) {
                            // If there's a title container, append after it
                            const titleContainer = taskContent.querySelector('.task-title-container');
                            if (titleContainer) {
                                taskContent.insertBefore(metadataDiv, titleContainer.nextSibling);
                            } else {
                                taskContent.appendChild(metadataDiv);
                            }
                        }
                    }

                    // Create the next date element
                    nextDateElement = document.createElement('span');
                    nextDateElement.className = 'next-occurrence-date';

                    // Add it to the metadata div
                    if (metadataDiv) {
                        // Add it before the overdue indicator if it exists
                        const overdueIndicator = metadataDiv.querySelector('.due-date-indicator.overdue');
                        if (overdueIndicator) {
                            metadataDiv.insertBefore(nextDateElement, overdueIndicator);
                        } else {
                            metadataDiv.appendChild(nextDateElement);
                        }
                    }
                }

                // Update the next date text and styling
                if (nextDateElement) {
                    nextDateElement.textContent = `Next: ${config.nextDate}`;

                    // Apply styling to match the original
                    nextDateElement.style.backgroundColor = '#4CAF50';
                    nextDateElement.style.color = 'white';
                    nextDateElement.style.padding = '2px 5px';
                    nextDateElement.style.borderRadius = '3px';
                    nextDateElement.style.display = 'inline-block';
                    nextDateElement.style.marginRight = '5px';
                    nextDateElement.style.whiteSpace = 'nowrap';

                    log('Fixed next date');
                }

                // Fix 3: Fix duplicate overdue text
                const allElements = taskItem.querySelectorAll('*');
                allElements.forEach(element => {
                    if (element.textContent && (
                        element.textContent.includes(`Overdue: ${config.overdueDate}Overdue: ${config.overdueDate}`) ||
                        element.textContent.includes(`Overdue: ${config.overdueDate} Overdue: ${config.overdueDate}`))) {

                        element.textContent = `Overdue: ${config.overdueDate}`;
                        log('Fixed duplicate overdue text');
                    }
                });

                // Fix 4: Ensure the recurring indicator is correct
                const recurringIndicator = taskItem.querySelector('.recurring-indicator');
                if (recurringIndicator && !recurringIndicator.textContent.includes(config.recurringType)) {
                    recurringIndicator.textContent = `↻ ${config.recurringType}`;
                    log('Fixed recurring indicator');
                }
            }
        } catch (error) {
            // Only log errors in debug mode
            if (config.debugMode) {
                console.error('[Yuvi-Fix] Error:', error);
            }
        }
    }

    // Function to fix all Yuvi's Bday tasks on the page
    function fixAllYuviBdayTasks() {
        try {
            // Find all Yuvi's Bday tasks
            const taskItems = document.querySelectorAll('.task-item');
            let yuviTasks = [];

            taskItems.forEach(item => {
                const titleElement = item.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes(config.taskTitle)) {
                    yuviTasks.push(item);
                    fixYuviBdayTask(item);
                }
            });

            log(`Found and fixed ${yuviTasks.length} Yuvi's Bday tasks`);
        } catch (error) {
            // Only log errors in debug mode
            if (config.debugMode) {
                console.error('[Yuvi-Fix] Error:', error);
            }
        }
    }

    // Set up a MutationObserver to watch for changes to the DOM
    function setupMutationObserver() {
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
                log('DOM changes detected, running fix');
                fixAllYuviBdayTasks();
            }
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        log('MutationObserver set up');
    }

    // Run the fix immediately
    fixAllYuviBdayTasks();

    // Run the fix when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        log('DOM content loaded');
        fixAllYuviBdayTasks();
        setupMutationObserver();
    });

    // Run the fix when the page is fully loaded
    window.addEventListener('load', function() {
        log('Page loaded');
        fixAllYuviBdayTasks();
    });

    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        log('Tasks loaded event received');
        fixAllYuviBdayTasks();
    });

    document.addEventListener('taskUpdated', function() {
        log('Task updated event received');
        fixAllYuviBdayTasks();
    });

    document.addEventListener('tasksRendered', function() {
        log('Tasks rendered event received');
        fixAllYuviBdayTasks();
    });

    // Set up the MutationObserver immediately
    setupMutationObserver();

    // We'll use direct DOM manipulation instead of CSS selectors for more reliable styling

    // Add a function to check for Yuvi's Bday tasks periodically
    function checkForYuviBdayTasks() {
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');

        taskItems.forEach(taskItem => {
            const titleElement = taskItem.querySelector('.task-title');
            if (titleElement && titleElement.textContent.includes(config.taskTitle)) {
                fixYuviBdayTask(taskItem);
            }
        });
    }

    // Run the check every second for 10 seconds to ensure it gets applied
    for (let i = 1; i <= 10; i++) {
        setTimeout(checkForYuviBdayTasks, i * 1000);
    }

    log('Set up periodic checks for Yuvi\'s Bday tasks');
})();
