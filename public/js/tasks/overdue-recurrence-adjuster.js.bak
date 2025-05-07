/**
 * Overdue Recurrence Adjuster
 *
 * This script adds a confirmation dialog when completing an overdue recurring task,
 * asking if future recurrences should be adjusted based on the completion date.
 */

(function() {
    console.log('[Overdue Recurrence Adjuster] Script loaded');

    // We need to wait a bit to ensure all other scripts are fully loaded
    setTimeout(initOverdueRecurrenceAdjuster, 1000);

    function initOverdueRecurrenceAdjuster() {
        console.log('[Overdue Recurrence Adjuster] Initializing...');

        // Dump all task items for debugging
        scanForOverdueRecurringTasks();

        // Set up a periodic scan to detect overdue recurring tasks
        setInterval(scanForOverdueRecurringTasks, 5000);

        // Find the task list container
        const taskListContainer = document.getElementById('task-list-container');
        if (!taskListContainer) {
            console.error('[Overdue Recurrence Adjuster] Could not find task-list-container');

            // Try to find an alternative container
            const alternativeContainer = document.querySelector('.task-list') || document.body;
            if (alternativeContainer) {
                console.log('[Overdue Recurrence Adjuster] Found alternative container:', alternativeContainer.className || 'body');
                attachEventListener(alternativeContainer);
            } else {
                console.error('[Overdue Recurrence Adjuster] Could not find any suitable container');
            }
        } else {
            console.log('[Overdue Recurrence Adjuster] Found task list container, adding event listener');
            attachEventListener(taskListContainer);
        }

        // Also attach to document body as a fallback
        console.log('[Overdue Recurrence Adjuster] Adding fallback event listener to document body');
        attachEventListener(document.body);

        // Add a direct click handler to all checkboxes
        document.addEventListener('click', function(event) {
            // Check if this is a checkbox
            if (event.target.type === 'checkbox' && event.target.closest('.task-item')) {
                console.log('[Overdue Recurrence Adjuster] Direct checkbox click detected');

                // Get the task item
                const taskItem = event.target.closest('.task-item');
                const checkbox = event.target;

                // Only handle when tasks are being marked as complete
                if (!checkbox.checked) {
                    return;
                }

                // Check if this is a recurring task that's overdue using our enhanced detection
                const isOverdueRecurring = isTaskOverdueAndRecurring(taskItem);

                if (isOverdueRecurring) {
                    console.log('[Overdue Recurrence Adjuster] Direct handler found overdue recurring task');

                    // Prevent the default behavior
                    event.preventDefault();
                    event.stopPropagation();

                    // Handle the task
                    handleOverdueRecurringTask(event, checkbox, taskItem);
                }
            }
        }, true);
    }

    /**
     * Scans the DOM for overdue recurring tasks
     */
    function scanForOverdueRecurringTasks() {
        const allTaskItems = document.querySelectorAll('.task-item');
        console.log(`[Overdue Recurrence Adjuster] Scanning ${allTaskItems.length} task items on the page`);

        let overdueRecurringCount = 0;

        allTaskItems.forEach((item, index) => {
            const isOverdueRecurring = isTaskOverdueAndRecurring(item);
            const taskTitle = item.querySelector('.task-title')?.textContent || 'Unknown';

            if (isOverdueRecurring) {
                overdueRecurringCount++;
                console.log(`[Overdue Recurrence Adjuster] Found overdue recurring task #${index}: "${taskTitle}"`);

                // Add a data attribute to mark this task for easier identification
                item.setAttribute('data-overdue-recurring', 'true');

                // Add a click handler directly to this task's checkbox
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.hasAttribute('data-overdue-handler')) {
                    checkbox.setAttribute('data-overdue-handler', 'true');

                    checkbox.addEventListener('click', function(event) {
                        if (!checkbox.checked) return;

                        console.log('[Overdue Recurrence Adjuster] Direct checkbox handler triggered');

                        // Prevent the default behavior
                        event.preventDefault();
                        event.stopPropagation();

                        // Handle the task
                        handleOverdueRecurringTask(event, checkbox, item);
                    }, true);
                }
            }
        });

        console.log(`[Overdue Recurrence Adjuster] Found ${overdueRecurringCount} overdue recurring tasks`);
    }

    /**
     * Checks if a task is both overdue and recurring
     * @param {HTMLElement} taskItem - The task item element
     * @returns {boolean} - Whether the task is both overdue and recurring
     */
    function isTaskOverdueAndRecurring(taskItem) {
        // Check for overdue indicators
        const isOverdue = taskItem.classList.contains('overdue') ||
                          taskItem.getAttribute('data-overdue') === 'true' ||
                          taskItem.style.backgroundColor === 'rgb(255, 235, 238)' || // #ffebee
                          taskItem.style.borderLeft === '4px solid rgb(244, 67, 54)' || // 4px solid #f44336
                          taskItem.style.borderLeftColor === 'rgb(244, 67, 54)' ||   // #f44336
                          taskItem.querySelector('.due-date-indicator.overdue') !== null;

        // Check for recurrence indicators
        const recurrenceIndicator = taskItem.querySelector('.recurrence-indicator');
        const dueDateText = taskItem.querySelector('.due-date-indicator')?.textContent || '';
        const taskText = taskItem.textContent || '';
        const recurrenceText = taskText.match(/daily|weekly|monthly|yearly/i);
        const isRecurring = recurrenceIndicator !== null ||
                           recurrenceText !== null ||
                           dueDateText.includes('Every');

        return isOverdue && isRecurring;
    }

    function attachEventListener(container) {
        // Add a direct event listener for checkbox clicks
        container.addEventListener('click', async function(event) {
            // Check if this is a checkbox or a click near a checkbox
            const checkbox = event.target.type === 'checkbox' ?
                             event.target :
                             event.target.closest('.task-item')?.querySelector('input[type="checkbox"]');

            if (!checkbox) {
                return;
            }

            console.log('[Overdue Recurrence Adjuster] Checkbox or task item clicked');

            // Only handle when tasks are being marked as complete
            // For clicks on the task item, we need to check if the checkbox would be checked after the click
            const wouldBeChecked = event.target === checkbox ?
                                  !checkbox.checked : // It will toggle
                                  !checkbox.checked;  // It will be checked if it's currently unchecked

            if (!wouldBeChecked) {
                console.log('[Overdue Recurrence Adjuster] Task would be unchecked, ignoring');
                return;
            }

            // Get the task item
            const taskItem = checkbox.closest('.task-item');
            if (!taskItem) {
                console.error('[Overdue Recurrence Adjuster] Could not find parent task-item element');
                return;
            }

            // Check if this is a recurring task that's overdue
            // Look for multiple indicators of overdue status
            const isOverdue = taskItem.classList.contains('overdue') ||
                              taskItem.getAttribute('data-overdue') === 'true' ||
                              taskItem.style.backgroundColor === 'rgb(255, 235, 238)' || // #ffebee
                              taskItem.style.borderLeftColor === 'rgb(244, 67, 54)' ||   // #f44336
                              taskItem.querySelector('.due-date-indicator.overdue') !== null;

            // Look for multiple indicators of recurrence
            const recurrenceIndicator = taskItem.querySelector('.recurrence-indicator');
            const recurrenceText = taskItem.textContent.match(/daily|weekly|monthly|yearly/i);
            const isRecurring = recurrenceIndicator !== null || recurrenceText !== null;

            console.log('[Overdue Recurrence Adjuster] Task analysis:', {
                isOverdue,
                isRecurring,
                recurrenceIndicator: recurrenceIndicator ? recurrenceIndicator.outerHTML : 'not found',
                recurrenceText: recurrenceText ? recurrenceText[0] : 'not found',
                taskClasses: taskItem.className,
                taskStyles: {
                    backgroundColor: taskItem.style.backgroundColor,
                    borderLeft: taskItem.style.borderLeft,
                    borderLeftColor: taskItem.style.borderLeftColor
                },
                taskAttributes: {
                    'data-overdue': taskItem.getAttribute('data-overdue'),
                    'data-task-id': taskItem.getAttribute('data-task-id')
                },
                taskHTML: taskItem.innerHTML.substring(0, 200) + '...' // First 200 chars for debugging
            });

            // If it's an overdue recurring task, show the confirmation dialog
            if (isOverdue && isRecurring) {
                console.log('[Overdue Recurrence Adjuster] Found overdue recurring task, handling...');

                // Prevent the default behavior
                event.preventDefault();
                event.stopPropagation();

                handleOverdueRecurringTask(event, checkbox, taskItem);
            } else {
                // For non-overdue or non-recurring tasks, let the default handler take over
                console.log('[Overdue Recurrence Adjuster] Not an overdue recurring task, proceeding normally');
            }
        }, true); // Use capturing to intercept before the default handler

        console.log('[Overdue Recurrence Adjuster] Event listener added to', container.tagName || 'unknown element');
    }

    /**
     * Handles the completion of an overdue recurring task
     * @param {Event} event - The click event
     * @param {HTMLInputElement} checkbox - The checkbox element
     * @param {HTMLElement} taskItem - The task item element
     */
    async function handleOverdueRecurringTask(event, checkbox, taskItem) {
        console.log('[Overdue Recurrence Adjuster] Handling overdue recurring task');

        const taskId = taskItem.getAttribute('data-task-id');
        const taskTitle = taskItem.querySelector('.task-title')?.textContent || 'this task';

        console.log('[Overdue Recurrence Adjuster] Processing task directly without showing dialog:', taskTitle);

        try {
            // Check the checkbox to show immediate feedback
            checkbox.checked = true;

            // Add a visual indicator that the task is being processed
            taskItem.style.opacity = '0.7';

            // Complete the task with the adjustment preference (always keep original schedule)
            await completeTaskWithAdjustment(taskId, false);

            // Note: We don't need to manually update the UI here anymore
            // The completeTaskWithAdjustment function now handles moving the task
            // to the completed section and updating the UI
        } catch (error) {
            console.error('[Overdue Recurrence Adjuster] Error handling overdue recurring task:', error);
            alert('An error occurred while processing the task. Please try again.');
            checkbox.checked = false;

            // Restore opacity if there was an error
            taskItem.style.opacity = '1';
        }
    }

    /**
     * Shows a modal asking if future recurrences should be adjusted
     * @param {string} taskTitle - The title of the task
     * @returns {Promise<string>} 'adjust', 'keep', or 'cancel'
     */
    async function showRecurrenceAdjustmentModal(taskTitle) {
        return new Promise((resolve) => {
            // Create modal elements
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'overdue-recurrence-modal-overlay';
            modalOverlay.className = 'modal-overlay';
            modalOverlay.style.position = 'fixed';
            modalOverlay.style.top = '0';
            modalOverlay.style.left = '0';
            modalOverlay.style.width = '100%';
            modalOverlay.style.height = '100%';
            modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            modalOverlay.style.zIndex = '9999';
            modalOverlay.style.display = 'flex';
            modalOverlay.style.justifyContent = 'center';
            modalOverlay.style.alignItems = 'center';

            const modalContent = document.createElement('div');
            modalContent.id = 'overdue-recurrence-modal-content';
            modalContent.className = 'modal-content';
            modalContent.style.backgroundColor = '#fff';
            modalContent.style.borderRadius = '8px';
            modalContent.style.padding = '24px';
            modalContent.style.width = '90%';
            modalContent.style.maxWidth = '500px';
            modalContent.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.3)';
            modalContent.style.border = '1px solid #ddd';

            const modalHeader = document.createElement('h3');
            modalHeader.textContent = 'Adjust Future Recurrences?';
            modalHeader.style.margin = '0 0 15px 0';
            modalHeader.style.color = '#333';
            modalHeader.style.fontSize = '20px';
            modalHeader.style.textAlign = 'center';

            const modalMessage = document.createElement('div');
            modalMessage.innerHTML = `
                <p style="margin-bottom:15px;font-size:16px;">
                    You're completing an <strong style="color:#f44336">overdue</strong> recurring task:
                </p>
                <p style="margin-bottom:20px;font-weight:bold;font-size:18px;padding:10px;background:#f5f5f5;border-radius:4px;text-align:center;">
                    ${taskTitle}
                </p>
                <p style="margin-bottom:10px;font-size:16px;">
                    Would you like to:
                </p>
                <ul style="margin-bottom:20px;padding-left:20px;">
                    <li style="margin-bottom:8px;"><strong>Adjust future dates</strong> - Calculate next occurrence from today</li>
                    <li style="margin-bottom:8px;"><strong>Keep original schedule</strong> - Maintain the original timing</li>
                </ul>
            `;
            modalMessage.style.marginBottom = '20px';
            modalMessage.style.lineHeight = '1.5';

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'flex-end';
            buttonContainer.style.gap = '10px';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.className = 'btn btn-secondary';
            cancelButton.style.padding = '10px 16px';
            cancelButton.style.border = 'none';
            cancelButton.style.borderRadius = '4px';
            cancelButton.style.backgroundColor = '#e0e0e0';
            cancelButton.style.color = '#333';
            cancelButton.style.cursor = 'pointer';
            cancelButton.style.fontSize = '14px';
            cancelButton.style.fontWeight = 'bold';
            cancelButton.style.minWidth = '100px';
            cancelButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

            const keepButton = document.createElement('button');
            keepButton.textContent = 'Keep Original Dates';
            keepButton.className = 'btn btn-primary';
            keepButton.style.padding = '10px 16px';
            keepButton.style.border = 'none';
            keepButton.style.borderRadius = '4px';
            keepButton.style.backgroundColor = '#2196F3';
            keepButton.style.color = 'white';
            keepButton.style.cursor = 'pointer';
            keepButton.style.fontSize = '14px';
            keepButton.style.fontWeight = 'bold';
            keepButton.style.minWidth = '180px';
            keepButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

            const adjustButton = document.createElement('button');
            adjustButton.textContent = 'Adjust Future Dates';
            adjustButton.className = 'btn btn-success';
            adjustButton.style.padding = '10px 16px';
            adjustButton.style.border = 'none';
            adjustButton.style.borderRadius = '4px';
            adjustButton.style.backgroundColor = '#4CAF50';
            adjustButton.style.color = 'white';
            adjustButton.style.cursor = 'pointer';
            adjustButton.style.fontSize = '14px';
            adjustButton.style.fontWeight = 'bold';
            adjustButton.style.minWidth = '180px';
            adjustButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

            // Add event listeners
            cancelButton.addEventListener('click', () => {
                document.body.removeChild(modalOverlay);
                resolve('cancel');
            });

            keepButton.addEventListener('click', () => {
                document.body.removeChild(modalOverlay);
                resolve('keep');
            });

            adjustButton.addEventListener('click', () => {
                document.body.removeChild(modalOverlay);
                resolve('adjust');
            });

            // Assemble the modal
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(keepButton);
            buttonContainer.appendChild(adjustButton);

            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalMessage);
            modalContent.appendChild(buttonContainer);
            modalOverlay.appendChild(modalContent);

            // Add to the document
            document.body.appendChild(modalOverlay);
        });
    }

    /**
     * Completes a task with the option to adjust future recurrences
     * @param {number} taskId - The ID of the task to complete
     * @param {boolean} adjustFutureRecurrences - Whether to adjust future recurrences
     */
    async function completeTaskWithAdjustment(taskId, adjustFutureRecurrences) {
        try {
            console.log(`[Overdue Recurrence Adjuster] Completing task ${taskId} with adjust_future_recurrences=${adjustFutureRecurrences}`);

            // Find the task element in the DOM
            const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
            if (taskItem) {
                // Add visual feedback
                taskItem.style.opacity = '0.7';
            }

            // Mark the task as complete
            const completeResponse = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_complete: true,
                    create_next_occurrence: true, // Important: tell the server to create the next occurrence
                    adjust_future_recurrences: adjustFutureRecurrences
                })
            });

            if (!completeResponse.ok) {
                throw new Error(`HTTP error marking task complete! status: ${completeResponse.status}`);
            }

            const completedTask = await completeResponse.json();
            console.log(`[Overdue Recurrence Adjuster] Task ${taskId} marked complete with adjust_future_recurrences=${adjustFutureRecurrences}`);

            // If we're adjusting future recurrences, we need to calculate based on today's date
            if (adjustFutureRecurrences) {
                console.log(`[Overdue Recurrence Adjuster] Adjusting future recurrences for task ${taskId}`);

                try {
                    const adjustedResponse = await fetch(`/api/tasks/${taskId}/adjust-recurrences`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (adjustedResponse.ok) {
                        const result = await adjustedResponse.json();
                        console.log(`[Overdue Recurrence Adjuster] Successfully adjusted recurrences:`, result);
                    } else {
                        // If the endpoint doesn't exist yet, fall back to regular next occurrence
                        console.warn(`[Overdue Recurrence Adjuster] Adjust recurrences endpoint not available, falling back to regular next occurrence`);

                        // Create the next occurrence with today as the base date
                        const today = new Date();
                        const formattedToday = today.toISOString().split('T')[0];

                        const nextOccurrenceResponse = await fetch(`/api/tasks/${taskId}/next-occurrence`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                base_date: formattedToday
                            })
                        });

                        if (nextOccurrenceResponse.ok) {
                            const nextOccurrence = await nextOccurrenceResponse.json();
                            console.log(`[Overdue Recurrence Adjuster] Created adjusted next occurrence: Task ${nextOccurrence.id} with due date ${nextOccurrence.due_date}`);
                        } else {
                            console.error(`[Overdue Recurrence Adjuster] Error creating adjusted next occurrence: ${nextOccurrenceResponse.status}`);
                        }
                    }
                } catch (adjustError) {
                    console.error('[Overdue Recurrence Adjuster] Error during recurrence adjustment:', adjustError);
                    // Continue execution - we still want to move the task to completed
                }
            }

            // Show a notification about the completion
            showCompletionNotification(completedTask, adjustFutureRecurrences);

            // Move the task to the completed section
            if (taskItem) {
                console.log('[Overdue Recurrence Adjuster] Moving task to completed section');

                // Add the complete class
                taskItem.classList.add('complete');

                // Find the completed tasks container
                const completedTaskListDiv = document.getElementById('completed-task-list');
                if (completedTaskListDiv) {
                    // Remove from current container and add to completed container
                    if (taskItem.parentNode) {
                        taskItem.parentNode.removeChild(taskItem);
                    }
                    completedTaskListDiv.appendChild(taskItem);

                    // Make sure the completed section is visible
                    completedTaskListDiv.style.display = 'block';

                    // Update the completed tasks count in the header
                    const completedTasksHeader = document.getElementById('completed-tasks-header');
                    if (completedTasksHeader) {
                        const currentText = completedTasksHeader.textContent || '';
                        const match = currentText.match(/Completed Tasks \((\d+)\)/);
                        if (match) {
                            const currentCount = parseInt(match[1], 10);
                            const newCount = currentCount + 1;
                            const arrow = completedTaskListDiv.style.display === 'none' ? '▼' : '▲';
                            completedTasksHeader.innerHTML = `Completed Tasks (${newCount}) ${arrow}`;
                        }
                    }

                    // Remove any "No completed tasks" placeholder
                    const placeholder = completedTaskListDiv.querySelector('p');
                    if (placeholder) {
                        placeholder.remove();
                    }
                }

                // Restore opacity
                taskItem.style.opacity = '1';
            }

            // Dispatch a custom event to notify other components (like calendar)
            const taskCompletedEvent = new CustomEvent('taskCompleted', {
                detail: { taskId: completedTask.id, task: completedTask }
            });
            document.dispatchEvent(taskCompletedEvent);
            console.log('[Overdue Recurrence Adjuster] Dispatched taskCompleted event');

            // Refresh the task list to ensure everything is in sync
            // But do it with a slight delay to allow the UI to update first
            setTimeout(() => {
                if (typeof window.loadTasks === 'function') {
                    console.log('[Overdue Recurrence Adjuster] Reloading tasks...');
                    window.loadTasks(true); // Force a complete reload
                }
            }, 500);

        } catch (error) {
            console.error('[Overdue Recurrence Adjuster] Error completing task with adjustment:', error);
            alert(`Error completing task: ${error.message}`);

            // Restore opacity if there was an error
            const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
            if (taskItem) {
                taskItem.style.opacity = '1';
            }
        }
    }

    /**
     * Shows a notification about the task completion
     * @param {Object} task - The completed task
     * @param {boolean} adjusted - Whether future recurrences were adjusted
     */
    function showCompletionNotification(task, adjusted) {
        const notification = document.createElement('div');
        notification.className = 'status success';

        if (adjusted) {
            notification.textContent = `Task "${task.title}" completed. Future recurrences have been adjusted based on today's date.`;
        } else {
            notification.textContent = `Task "${task.title}" completed. Future recurrences will keep the original schedule.`;
        }

        document.body.appendChild(notification);

        // Remove the notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
})();
