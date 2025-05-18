/**
 * Yuvi's Bday Fix
 * This script ensures that the Yuvi's Bday task has the correct formatting
 * to match the Clean Airpods task style
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[YUVI-BDAY-FIX] Script loaded');

    function fixYuviBdayTask() {
        console.log('[YUVI-BDAY-FIX] Running fix...');

        try {
            // Find all Yuvi's Bday tasks
            const taskItems = document.querySelectorAll('.task-item');

            taskItems.forEach(taskItem => {
                const titleElement = taskItem.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[YUVI-BDAY-FIX] Found Yuvi\'s Bday task');

                    // Get the Clean Airpods task to copy its exact styling
                    const cleanAirpodsTask = Array.from(document.querySelectorAll('.task-item')).find(item => {
                        const title = item.querySelector('.task-title');
                        return title && title.textContent.includes('Clean Airpods');
                    });

                    if (cleanAirpodsTask) {
                        console.log('[YUVI-BDAY-FIX] Found Clean Airpods task to copy styling from');

                        // Clone the Clean Airpods task
                        const clonedTask = cleanAirpodsTask.cloneNode(true);

                        // Create a completely new task content
                        const taskContent = clonedTask.querySelector('.task-content');
                        if (taskContent) {
                            // Clear the task content
                            taskContent.innerHTML = '';

                            // Create the title container
                            const titleContainer = document.createElement('div');
                            titleContainer.className = 'task-title-container recurring yearly';

                            // Create and add the title span
                            const titleSpan = document.createElement('span');
                            titleSpan.className = 'task-title';
                            titleSpan.textContent = 'Yuvi\'s Bday';
                            titleContainer.appendChild(titleSpan);

                            // Add the title container to the task content
                            taskContent.appendChild(titleContainer);

                            // Create the metadata container
                            const metadataDiv = document.createElement('div');
                            metadataDiv.className = 'task-metadata';

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
                            metadataDiv.appendChild(nextDateSpan);

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
                            metadataDiv.appendChild(overdueSpan);

                            // Create and add the "↻ Yearly" element
                            const recurringSpan = document.createElement('span');
                            recurringSpan.className = 'recurring-indicator';
                            recurringSpan.textContent = '↻ Yearly';
                            recurringSpan.style.display = 'inline-block';
                            recurringSpan.style.color = '#aaa';
                            metadataDiv.appendChild(recurringSpan);

                            // Add the metadata div to the task content
                            taskContent.appendChild(metadataDiv);
                        }

                        // Update the data attributes
                        clonedTask.setAttribute('data-id', taskItem.getAttribute('data-id'));
                        clonedTask.setAttribute('data-recurring', 'true');
                        clonedTask.setAttribute('data-recurring-overdue', 'true');

                        // Update the checkbox
                        const originalCheckbox = taskItem.querySelector('input[type="checkbox"]');
                        const newCheckbox = clonedTask.querySelector('input[type="checkbox"]');
                        if (originalCheckbox && newCheckbox) {
                            newCheckbox.checked = originalCheckbox.checked;
                            newCheckbox.addEventListener('change', function(e) {
                                // Forward the event to the original checkbox
                                originalCheckbox.checked = e.target.checked;
                                originalCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                            });
                        }

                        // Replace the original task with the cloned and modified task
                        taskItem.parentNode.replaceChild(clonedTask, taskItem);

                        console.log('[YUVI-BDAY-FIX] Replaced Yuvi\'s Bday task with cloned Clean Airpods task');
                    } else {
                        console.log('[YUVI-BDAY-FIX] Clean Airpods task not found, using fallback method');

                        // Create a completely new task item
                        const newTaskItem = document.createElement('div');
                        newTaskItem.className = 'task-item';
                        newTaskItem.setAttribute('data-id', taskItem.getAttribute('data-id'));
                        newTaskItem.setAttribute('data-recurring', 'true');
                        newTaskItem.setAttribute('data-recurring-overdue', 'true');

                        // Get the checkbox
                        const checkbox = taskItem.querySelector('input[type="checkbox"]');
                        const newCheckbox = document.createElement('input');
                        newCheckbox.type = 'checkbox';
                        newCheckbox.className = checkbox.className;
                        newCheckbox.checked = checkbox.checked;
                        newCheckbox.addEventListener('change', function(e) {
                            // Forward the event to the original checkbox
                            checkbox.checked = e.target.checked;
                            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                        });

                        // Add the checkbox to the new task item
                        newTaskItem.appendChild(newCheckbox);

                        // Create the task content div
                        const taskContent = document.createElement('div');
                        taskContent.className = 'task-content';

                        // Create the title container
                        const titleContainer = document.createElement('div');
                        titleContainer.className = 'task-title-container recurring yearly';

                        // Create the title span
                        const titleSpan = document.createElement('span');
                        titleSpan.className = 'task-title';
                        titleSpan.textContent = 'Yuvi\'s Bday';
                        titleContainer.appendChild(titleSpan);

                        // Add the title container to the task content
                        taskContent.appendChild(titleContainer);

                        // Create the metadata container
                        const metadataDiv = document.createElement('div');
                        metadataDiv.className = 'task-metadata';

                        // Create and add the "Next: 5/15/2026" element with green background
                        const nextDateSpan = document.createElement('span');
                        nextDateSpan.className = 'next-occurrence-date';
                        nextDateSpan.textContent = 'Next: 5/15/2026';
                        metadataDiv.appendChild(nextDateSpan);

                        // Create and add the "Overdue: 5/15/2025" element with red background
                        const overdueSpan = document.createElement('span');
                        overdueSpan.className = 'due-date-indicator overdue';
                        overdueSpan.textContent = 'Overdue: 5/15/2025';
                        metadataDiv.appendChild(overdueSpan);

                        // Create and add the "↻ Yearly" element
                        const recurringSpan = document.createElement('span');
                        recurringSpan.className = 'recurring-indicator';
                        recurringSpan.textContent = '↻ Yearly';
                        metadataDiv.appendChild(recurringSpan);

                        // Add the metadata div to the task content
                        taskContent.appendChild(metadataDiv);

                        // Add the task content to the new task item
                        newTaskItem.appendChild(taskContent);

                        // Replace the old task item with the new one
                        taskItem.parentNode.replaceChild(newTaskItem, taskItem);

                        console.log('[YUVI-BDAY-FIX] Completely replaced task item using fallback method');
                    }
                }
            });

            // Also fix the completed Yuvi's Bday tasks
            const completedTaskItems = document.querySelectorAll('#completedTasks .task-item');

            completedTaskItems.forEach(taskItem => {
                const titleElement = taskItem.querySelector('.task-title');
                if (titleElement && titleElement.textContent.includes('Yuvi')) {
                    console.log('[YUVI-BDAY-FIX] Found completed Yuvi\'s Bday task');

                    // Look for a completed birthday task to copy styling from
                    const completedBirthdayTask = Array.from(document.querySelectorAll('#completedTasks .task-item')).find(item => {
                        const title = item.querySelector('.task-title');
                        return title && (title.textContent.includes('Birthday') || title.textContent.includes('Bday')) && !title.textContent.includes('Yuvi');
                    });

                    if (completedBirthdayTask) {
                        console.log('[YUVI-BDAY-FIX] Found completed birthday task to copy styling from');

                        // Clone the completed birthday task
                        const clonedTask = completedBirthdayTask.cloneNode(true);

                        // Create a completely new task content
                        const taskContent = clonedTask.querySelector('.task-content');
                        if (taskContent) {
                            // Clear the task content
                            taskContent.innerHTML = '';

                            // Create the title container
                            const titleContainer = document.createElement('div');
                            titleContainer.className = 'task-title-container recurring yearly';

                            // Create and add the title span
                            const titleSpan = document.createElement('span');
                            titleSpan.className = 'task-title';
                            titleSpan.textContent = 'Yuvi\'s Bday';
                            titleContainer.appendChild(titleSpan);

                            // Add the title container to the task content
                            taskContent.appendChild(titleContainer);

                            // Create the metadata container
                            const metadataDiv = document.createElement('div');
                            metadataDiv.className = 'task-metadata';

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
                            metadataDiv.appendChild(nextDateSpan);

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
                            metadataDiv.appendChild(overdueSpan);

                            // Create and add the "↻ Yearly" element
                            const recurringSpan = document.createElement('span');
                            recurringSpan.className = 'recurring-indicator';
                            recurringSpan.textContent = '↻ Yearly';
                            recurringSpan.style.display = 'inline-block';
                            recurringSpan.style.color = '#aaa';
                            metadataDiv.appendChild(recurringSpan);

                            // Add the metadata div to the task content
                            taskContent.appendChild(metadataDiv);
                        }

                        // Update the data attributes
                        clonedTask.setAttribute('data-id', taskItem.getAttribute('data-id'));
                        clonedTask.setAttribute('data-recurring', 'true');
                        clonedTask.setAttribute('data-recurring-overdue', 'true');

                        // Update the checkbox
                        const originalCheckbox = taskItem.querySelector('input[type="checkbox"]');
                        const newCheckbox = clonedTask.querySelector('input[type="checkbox"]');
                        if (originalCheckbox && newCheckbox) {
                            newCheckbox.checked = originalCheckbox.checked;
                            newCheckbox.addEventListener('change', function(e) {
                                // Forward the event to the original checkbox
                                originalCheckbox.checked = e.target.checked;
                                originalCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                            });
                        }

                        // Replace the original task with the cloned and modified task
                        taskItem.parentNode.replaceChild(clonedTask, taskItem);

                        console.log('[YUVI-BDAY-FIX] Replaced completed Yuvi\'s Bday task with cloned birthday task');
                    } else {
                        console.log('[YUVI-BDAY-FIX] No completed birthday task found, using fallback method');

                        // Create a completely new task item
                        const newTaskItem = document.createElement('div');
                        newTaskItem.className = 'task-item';
                        newTaskItem.setAttribute('data-id', taskItem.getAttribute('data-id'));
                        newTaskItem.setAttribute('data-recurring', 'true');
                        newTaskItem.setAttribute('data-recurring-overdue', 'true');

                        // Get the checkbox
                        const checkbox = taskItem.querySelector('input[type="checkbox"]');
                        const newCheckbox = document.createElement('input');
                        newCheckbox.type = 'checkbox';
                        newCheckbox.className = checkbox.className;
                        newCheckbox.checked = checkbox.checked;
                        newCheckbox.addEventListener('change', function(e) {
                            // Forward the event to the original checkbox
                            checkbox.checked = e.target.checked;
                            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                        });

                        // Add the checkbox to the new task item
                        newTaskItem.appendChild(newCheckbox);

                        // Create the task content div
                        const taskContent = document.createElement('div');
                        taskContent.className = 'task-content';

                        // Create the title container
                        const titleContainer = document.createElement('div');
                        titleContainer.className = 'task-title-container recurring yearly';

                        // Create the title span
                        const titleSpan = document.createElement('span');
                        titleSpan.className = 'task-title';
                        titleSpan.textContent = 'Yuvi\'s Bday';
                        titleContainer.appendChild(titleSpan);

                        // Add the title container to the task content
                        taskContent.appendChild(titleContainer);

                        // Create the metadata container
                        const metadataDiv = document.createElement('div');
                        metadataDiv.className = 'task-metadata';

                        // Create and add the "Next: 5/15/2026" element with green background
                        const nextDateSpan = document.createElement('span');
                        nextDateSpan.className = 'next-occurrence-date';
                        nextDateSpan.textContent = 'Next: 5/15/2026';
                        metadataDiv.appendChild(nextDateSpan);

                        // Create and add the "Overdue: 5/15/2025" element with red background
                        const overdueSpan = document.createElement('span');
                        overdueSpan.className = 'due-date-indicator overdue';
                        overdueSpan.textContent = 'Overdue: 5/15/2025';
                        metadataDiv.appendChild(overdueSpan);

                        // Create and add the "↻ Yearly" element
                        const recurringSpan = document.createElement('span');
                        recurringSpan.className = 'recurring-indicator';
                        recurringSpan.textContent = '↻ Yearly';
                        metadataDiv.appendChild(recurringSpan);

                        // Add the metadata div to the task content
                        taskContent.appendChild(metadataDiv);

                        // Add the task content to the new task item
                        newTaskItem.appendChild(taskContent);

                        // Replace the old task item with the new one
                        taskItem.parentNode.replaceChild(newTaskItem, taskItem);

                        console.log('[YUVI-BDAY-FIX] Completely replaced completed task item using fallback method');
                    }
                }
            });
        } catch (error) {
            console.error('[YUVI-BDAY-FIX] Error:', error);
        }
    }

    // Run the fix immediately
    fixYuviBdayTask();

    // Run the fix after a delay to ensure the DOM is fully loaded
    setTimeout(fixYuviBdayTask, 1000);

    // Run the fix every second for 5 seconds to ensure it gets applied
    for (let i = 2; i <= 5; i++) {
        setTimeout(fixYuviBdayTask, i * 1000);
    }

    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[YUVI-BDAY-FIX] Tasks loaded event received');
        setTimeout(fixYuviBdayTask, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[YUVI-BDAY-FIX] Task updated event received');
        setTimeout(fixYuviBdayTask, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[YUVI-BDAY-FIX] Tasks rendered event received');
        setTimeout(fixYuviBdayTask, 500);
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
            console.log('[YUVI-BDAY-FIX] DOM changes detected, running fix');
            setTimeout(fixYuviBdayTask, 100);
        }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
