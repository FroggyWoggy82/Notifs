/**
 * Overdue Recurrence Adjuster
 *
 * This script adds a confirmation dialog when completing an overdue recurring task,
 * asking if future recurrences should be adjusted based on the completion date.
 */

(function() {
    // Only log in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[Overdue Recurrence Adjuster] Script loaded');
    }

    setTimeout(initOverdueRecurrenceAdjuster, 1000);

    function initOverdueRecurrenceAdjuster() {
        // Only log once on initialization
        console.log('[Overdue Recurrence Adjuster] Initializing...');

        scanForOverdueRecurringTasks();

        setInterval(scanForOverdueRecurringTasks, 5000);

        // Look for the correct task list container with ID 'taskList'
        const taskListContainer = document.getElementById('taskList');
        if (!taskListContainer) {
            // Only log errors, not informational messages
            console.error('[Overdue Recurrence Adjuster] Could not find taskList container');

            // Try alternative selectors
            const alternativeContainer = document.querySelector('.task-list-section') || document.body;
            if (alternativeContainer) {
                // No need to log this
                attachEventListener(alternativeContainer);
            } else {
                console.error('[Overdue Recurrence Adjuster] Could not find any suitable container');
            }
        } else {
            // No need to log this
            attachEventListener(taskListContainer);
        }

        // No need to log this
        attachEventListener(document.body);

        document.addEventListener('click', function(event) {
            if (event.target.type === 'checkbox' && event.target.closest('.task-item')) {
                // No need to log every checkbox click
                const taskItem = event.target.closest('.task-item');
                const checkbox = event.target;

                if (!checkbox.checked) {
                    return;
                }

                const isOverdueRecurring = isTaskOverdueAndRecurring(taskItem);

                if (isOverdueRecurring) {
                    // No need to log this
                    event.preventDefault();
                    event.stopPropagation();

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
        // Only log on initial scan, not on subsequent scans
        const isInitialScan = !window._hasScannedTasks;

        if (isInitialScan) {
            console.log(`[Overdue Recurrence Adjuster] Scanning ${allTaskItems.length} task items on the page`);
            window._hasScannedTasks = true;
        }

        let overdueRecurringCount = 0;

        allTaskItems.forEach((item, index) => {
            const isOverdueRecurring = isTaskOverdueAndRecurring(item);

            if (isOverdueRecurring) {
                overdueRecurringCount++;
                // Don't log individual tasks to reduce console spam

                item.setAttribute('data-overdue-recurring', 'true');

                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.hasAttribute('data-overdue-handler')) {
                    checkbox.setAttribute('data-overdue-handler', 'true');

                    checkbox.addEventListener('click', function(event) {
                        if (!checkbox.checked) return;

                        // Reduced logging
                        event.preventDefault();
                        event.stopPropagation();

                        handleOverdueRecurringTask(event, checkbox, item);
                    }, true);
                }
            }
        });

        // Only log the count on initial scan or if it changes
        if (isInitialScan || window._lastOverdueCount !== overdueRecurringCount) {
            console.log(`[Overdue Recurrence Adjuster] Found ${overdueRecurringCount} overdue recurring tasks`);
            window._lastOverdueCount = overdueRecurringCount;
        }
    }

    /**
     * Checks if a task is both overdue and recurring
     * @param {HTMLElement} taskItem - The task item element
     * @returns {boolean} - Whether the task is both overdue and recurring
     */
    function isTaskOverdueAndRecurring(taskItem) {

        const isOverdue = taskItem.classList.contains('overdue') ||
                          taskItem.getAttribute('data-overdue') === 'true' ||
                          taskItem.style.backgroundColor === 'rgb(255, 235, 238)' || // #ffebee
                          taskItem.style.borderLeft === '4px solid rgb(244, 67, 54)' || // 4px solid #f44336
                          taskItem.style.borderLeftColor === 'rgb(244, 67, 54)' ||   // #f44336
                          taskItem.querySelector('.due-date-indicator.overdue') !== null;

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
        container.addEventListener('click', async function(event) {
            const checkbox = event.target.type === 'checkbox' ?
                             event.target :
                             event.target.closest('.task-item')?.querySelector('input[type="checkbox"]');

            if (!checkbox) {
                return;
            }

            // No need to log every click

            const wouldBeChecked = event.target === checkbox ?
                                  !checkbox.checked : // It will toggle
                                  !checkbox.checked;  // It will be checked if it's currently unchecked

            if (!wouldBeChecked) {
                // No need to log this
                return;
            }

            const taskItem = checkbox.closest('.task-item');
            if (!taskItem) {
                // Keep error logs for debugging
                console.error('[Overdue Recurrence Adjuster] Could not find parent task-item element');
                return;
            }

            const isOverdue = taskItem.classList.contains('overdue') ||
                              taskItem.getAttribute('data-overdue') === 'true' ||
                              taskItem.style.backgroundColor === 'rgb(255, 235, 238)' || // #ffebee
                              taskItem.style.borderLeftColor === 'rgb(244, 67, 54)' ||   // #f44336
                              taskItem.querySelector('.due-date-indicator.overdue') !== null;

            const recurrenceIndicator = taskItem.querySelector('.recurrence-indicator');
            const recurrenceText = taskItem.textContent.match(/daily|weekly|monthly|yearly/i);
            const isRecurring = recurrenceIndicator !== null || recurrenceText !== null;

            // Remove detailed task analysis logging

            if (isOverdue && isRecurring) {
                // No need to log this
                event.preventDefault();
                event.stopPropagation();

                handleOverdueRecurringTask(event, checkbox, taskItem);
            }
            // No need to log normal task handling
        }, true); // Use capturing to intercept before the default handler

        // No need to log event listener attachment
    }

    /**
     * Handles the completion of an overdue recurring task
     * @param {Event} event - The click event
     * @param {HTMLInputElement} checkbox - The checkbox element
     * @param {HTMLElement} taskItem - The task item element
     */
    async function handleOverdueRecurringTask(event, checkbox, taskItem) {
        // Only log once per session for this function
        if (!window._hasLoggedTaskHandling) {
            console.log('[Overdue Recurrence Adjuster] Handling overdue recurring tasks');
            window._hasLoggedTaskHandling = true;
        }

        const taskId = taskItem.getAttribute('data-task-id');
        const taskTitle = taskItem.querySelector('.task-title')?.textContent || 'this task';

        // No need to log every task processing

        try {
            // Check the checkbox to show immediate feedback
            checkbox.checked = true;

            // Add a visual indicator that the task is being processed
            taskItem.style.opacity = '0.7';

            // Complete the task with the adjustment preference (always keep original schedule)
            // This will internally dispatch the overdueRecurringTaskCompleted event after completion
            await completeTaskWithAdjustment(taskId, false);

        } catch (error) {
            // Keep error logs for debugging
            console.error('[Overdue Recurrence Adjuster] Error handling overdue recurring task:', error);
            alert('An error occurred while processing the task. Please try again.');
            checkbox.checked = false;
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

            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(keepButton);
            buttonContainer.appendChild(adjustButton);

            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalMessage);
            modalContent.appendChild(buttonContainer);
            modalOverlay.appendChild(modalContent);

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
            // Only log once per session for this function
            if (!window._hasLoggedTaskCompletion) {
                console.log(`[Overdue Recurrence Adjuster] Completing tasks with adjust_future_recurrences=${adjustFutureRecurrences}`);
                window._hasLoggedTaskCompletion = true;
            }

            const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
            if (taskItem) {
                // Add a visual indicator that the task is being processed
                taskItem.style.opacity = '0.7';
            }

            // Step 1: Mark the task as complete and create the next occurrence
            let completeResponse;
            let completedTask;

            try {
                completeResponse = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        is_complete: true,
                        create_next_occurrence: true, // Important: tell the server to create the next occurrence
                        adjust_future_recurrences: adjustFutureRecurrences
                    })
                });

                // Make a second request to ensure the task is marked as complete
                // This helps ensure the task stays complete after page refresh
                const confirmCompleteResponse = await fetch(`/api/tasks/${taskId}/toggle-completion`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        is_complete: true
                    })
                });

                if (!confirmCompleteResponse.ok) {
                    // Keep warning logs for debugging
                    console.warn(`[Overdue Recurrence Adjuster] Failed to confirm task ${taskId} completion status: ${confirmCompleteResponse.status}`);
                }

                if (!completeResponse.ok) {
                    // Check if it's a 404 Not Found error
                    if (completeResponse.status === 404) {
                        // Keep warning logs for debugging
                        console.warn(`[Overdue Recurrence Adjuster] Task ${taskId} not found on server. It may have been deleted.`);
                        // Create a minimal task object to continue processing
                        const taskTitle = document.querySelector(`.task-item[data-task-id="${taskId}"] .task-title`)?.textContent || 'Unknown Task';
                        completedTask = {
                            id: parseInt(taskId),
                            title: taskTitle,
                            is_complete: true
                        };
                    } else {
                        throw new Error(`HTTP error marking task complete! status: ${completeResponse.status}`);
                    }
                } else {
                    // Only parse JSON if we got a successful response
                    completedTask = await completeResponse.json();
                }
            } catch (fetchError) {
                // Keep error logs for debugging
                console.error('[Overdue Recurrence Adjuster] Error during task completion request:', fetchError);
                throw fetchError;
            }

            if (adjustFutureRecurrences) {
                try {
                    const adjustedResponse = await fetch(`/api/tasks/${taskId}/adjust-recurrences`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!adjustedResponse.ok) {
                        // Check if it's a 404 Not Found error
                        if (adjustedResponse.status === 404) {
                            // Keep warning logs for debugging
                            console.warn(`[Overdue Recurrence Adjuster] Task ${taskId} not found or adjust-recurrences endpoint not available`);
                        } else {
                            // Keep warning logs for debugging
                            console.warn(`[Overdue Recurrence Adjuster] Adjust recurrences endpoint returned status ${adjustedResponse.status}, falling back to regular next occurrence`);
                        }

                        // Only try the next-occurrence endpoint if the task exists
                        if (adjustedResponse.status !== 404) {
                            try {
                                const today = new Date();
                                const formattedToday = today.toISOString().split('T')[0];

                                const nextOccurrenceResponse = await fetch(`/api/tasks/${taskId}/next-occurrence`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        base_date: formattedToday
                                    })
                                });

                                if (!nextOccurrenceResponse.ok) {
                                    // Keep warning logs for debugging
                                    console.warn(`[Overdue Recurrence Adjuster] Error creating adjusted next occurrence: ${nextOccurrenceResponse.status}`);
                                }
                            } catch (nextOccurrenceError) {
                                // Keep warning logs for debugging
                                console.warn('[Overdue Recurrence Adjuster] Error creating next occurrence:', nextOccurrenceError.message);
                            }
                        }
                    }
                } catch (adjustError) {
                    // Keep warning logs for debugging
                    console.warn('[Overdue Recurrence Adjuster] Error during recurrence adjustment:', adjustError.message);
                    // Continue with the UI updates despite the error
                }
            }

            // Step 3: Show a notification about the completion
            showCompletionNotification(completedTask, adjustFutureRecurrences);

            // Step 4: Update the UI to reflect the completed task
            if (taskItem) {
                // Add the complete class to the task item
                taskItem.classList.add('complete');

                // Remove any overdue styling
                taskItem.classList.remove('overdue');
                taskItem.removeAttribute('data-overdue');
                taskItem.removeAttribute('data-recurring-overdue');

                // Find the completed task list - use the correct ID from index.html
                const completedTaskListDiv = document.getElementById('completedTaskList');

                if (completedTaskListDiv) {
                    // Remove the task from its current parent if it has one
                    if (taskItem.parentNode) {
                        taskItem.parentNode.removeChild(taskItem);
                    }

                    // Move the task item to the completed section
                    completedTaskListDiv.appendChild(taskItem);

                    // Make sure the completed section is visible
                    completedTaskListDiv.style.display = 'block';

                    // Update the completed tasks header count if it exists
                    const completedTasksHeader = document.getElementById('completedTasksHeader') ||
                                               document.querySelector('.completed-tasks-header');
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

                    // Remove any placeholder text in the completed tasks section
                    const placeholder = completedTaskListDiv.querySelector('p');
                    if (placeholder) {
                        placeholder.remove();
                    }
                }

                // Reset opacity
                taskItem.style.opacity = '1';
            }

            // Step 5: Dispatch a taskCompleted event for other components to react to
            const taskCompletedEvent = new CustomEvent('taskCompleted', {
                detail: { taskId: completedTask.id, task: completedTask }
            });
            document.dispatchEvent(taskCompletedEvent);

            // Step 6: Wait for the server to fully process the task completion
            // This ensures the completion state is properly saved before any page reload
            setTimeout(() => {
                // Verify the task completion state by making a GET request to the server
                fetch(`/api/tasks/${taskId}`)
                    .then(response => {
                        // Check if the response is OK before trying to parse JSON
                        if (!response.ok) {
                            // If we get a 404 or other error, throw an error with status info
                            throw new Error(`API error: ${response.status} ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(updatedTask => {
                        // Dispatch a custom event to notify that the task has been fully processed
                        const taskFullyProcessedEvent = new CustomEvent('overdueRecurringTaskCompleted', {
                            detail: { taskId: completedTask.id, task: completedTask }
                        });
                        document.dispatchEvent(taskFullyProcessedEvent);
                    })
                    .catch(error => {
                        // Keep warning logs for debugging
                        console.warn('[Overdue Recurrence Adjuster] Error verifying task state:', error.message);

                        // If the task can't be found, it might have been deleted or there's an API issue
                        // Either way, we should still dispatch the event to update the UI
                        const taskFullyProcessedEvent = new CustomEvent('overdueRecurringTaskCompleted', {
                            detail: { taskId: completedTask.id, task: completedTask }
                        });
                        document.dispatchEvent(taskFullyProcessedEvent);
                    });
            }, 1000); // Increased timeout to ensure server processing completes

        } catch (error) {
            // Keep error logs for debugging
            console.error('[Overdue Recurrence Adjuster] Error completing task with adjustment:', error);
            alert(`Error completing task: ${error.message}`);

            // Reset the UI if there was an error
            const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
            if (taskItem) {
                taskItem.style.opacity = '1';
            }

            // Re-throw the error to allow the caller to handle it
            throw error;
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

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
})();
