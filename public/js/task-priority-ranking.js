/**
 * Task Priority Ranking System
 * Binary comparison interface for task prioritization
 */

let selectedTaskForRanking = null;
let comparisonTasks = [];
let currentComparisonIndex = 0;
let comparisonResults = [];
let totalComparisons = 5;

/**
 * Open the task ranking modal for a specific task
 * @param {Object} task - The task to rank
 */
async function openTaskRankingModal(task) {
    console.log('Opening binary comparison modal for task:', task);

    const modal = document.getElementById('taskRankingModal');
    const comparisonContainer = document.getElementById('binaryComparisonContainer');
    const loadingDiv = document.getElementById('comparisonLoading');
    const resultsDiv = document.getElementById('comparisonResults');
    const statusDiv = document.getElementById('rankingStatus');

    if (!modal) {
        console.error('Task ranking modal not found');
        return;
    }

    // Reset state
    selectedTaskForRanking = task;
    comparisonTasks = [];
    currentComparisonIndex = 0;
    comparisonResults = [];

    // Show modal and loading state
    modal.style.display = 'block';
    comparisonContainer.style.display = 'none';
    resultsDiv.style.display = 'none';
    loadingDiv.style.display = 'block';

    try {
        // Get the current filter value from the dropdown
        const taskFilterSelect = document.getElementById('taskFilter');
        const currentFilter = taskFilterSelect ? taskFilterSelect.value : 'all';

        console.log(`Loading comparison tasks with filter: ${currentFilter}`);

        // Fetch tasks for comparison (excluding the selected task) with current filter
        const response = await fetch(`/api/tasks/${task.id}/priority-comparison?limit=6&filter=${encodeURIComponent(currentFilter)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tasks = await response.json();

        // Filter out the selected task and get comparison tasks
        comparisonTasks = tasks.filter(t => t.id !== task.id).slice(0, 5);

        console.log(`Loaded comparison tasks with filter '${currentFilter}':`, comparisonTasks);

        if (comparisonTasks.length === 0) {
            showNoTasksMessage(currentFilter);
            return;
        }

        // Adjust total comparisons based on available tasks
        totalComparisons = Math.min(5, comparisonTasks.length);

        // Start the comparison process
        startBinaryComparison();

        // Clear any previous status
        statusDiv.textContent = '';
        statusDiv.style.display = 'none';

    } catch (error) {
        console.error('Error loading tasks for comparison:', error);
        showErrorMessage('Failed to load tasks for comparison. Please try again.');
    }
}

/**
 * Start the binary comparison process
 */
function startBinaryComparison() {
    const loadingDiv = document.getElementById('comparisonLoading');
    const comparisonContainer = document.getElementById('binaryComparisonContainer');

    loadingDiv.style.display = 'none';
    comparisonContainer.style.display = 'block';

    // Show the first comparison
    showComparison();
}

/**
 * Show the current comparison
 */
function showComparison() {
    if (currentComparisonIndex >= totalComparisons || currentComparisonIndex >= comparisonTasks.length) {
        // All comparisons complete
        finishComparisons();
        return;
    }

    const comparisonTask = comparisonTasks[currentComparisonIndex];

    // Update progress counter
    updateProgressCounter();

    // Render the selected task card
    renderTaskCard('selectedTaskCard', selectedTaskForRanking, true);

    // Render the comparison task card
    renderTaskCard('comparisonTaskCard', comparisonTask, false);

    // Add click handlers
    setupComparisonClickHandlers(comparisonTask);
}

/**
 * Update the progress counter
 */
function updateProgressCounter() {
    const counter = document.getElementById('comparisonCounter');
    if (counter) {
        counter.textContent = `Comparison ${currentComparisonIndex + 1} of ${totalComparisons}`;
    }
}

/**
 * Render a task card in the comparison interface
 * @param {string} containerId - The ID of the container element
 * @param {Object} task - The task data
 * @param {boolean} isSelected - Whether this is the selected task
 */
function renderTaskCard(containerId, task, isSelected) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Format due date
    let dueDateText = '';
    if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDateText = dueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Format assigned date
    let assignedDateText = '';
    if (task.assigned_date) {
        const assignedDate = new Date(task.assigned_date);
        assignedDateText = assignedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    // Create priority indicator
    const priorityText = task.priority_order ? `#${task.priority_order}` : 'Unranked';

    container.innerHTML = `
        <div class="task-card-content">
            <div class="task-card-title">${escapeHtml(task.title)}</div>
            <div class="task-card-meta">
                ${dueDateText ? `
                    <div class="task-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Due: ${dueDateText}</span>
                    </div>
                ` : ''}
                ${assignedDateText ? `
                    <div class="task-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>Assigned: ${assignedDateText}</span>
                    </div>
                ` : ''}
                ${task.description ? `
                    <div class="task-meta-item">
                        <i class="fas fa-align-left"></i>
                        <span>${escapeHtml(task.description.substring(0, 100))}${task.description.length > 100 ? '...' : ''}</span>
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="task-card-footer">
            <span class="task-priority-badge">${priorityText}</span>
            <span class="task-id-badge">ID: ${task.id}</span>
        </div>
    `;
}

/**
 * Setup click handlers for the comparison cards
 * @param {Object} comparisonTask - The task being compared against
 */
function setupComparisonClickHandlers(comparisonTask) {
    const selectedCard = document.getElementById('selectedTaskCard');
    const comparisonCard = document.getElementById('comparisonTaskCard');

    // Remove any existing click handlers
    selectedCard.replaceWith(selectedCard.cloneNode(true));
    comparisonCard.replaceWith(comparisonCard.cloneNode(true));

    // Get the new elements after cloning
    const newSelectedCard = document.getElementById('selectedTaskCard');
    const newComparisonCard = document.getElementById('comparisonTaskCard');

    // Add click handlers
    newSelectedCard.addEventListener('click', () => {
        handleTaskChoice(selectedTaskForRanking, comparisonTask, true);
    });

    newComparisonCard.addEventListener('click', () => {
        handleTaskChoice(selectedTaskForRanking, comparisonTask, false);
    });
}

/**
 * Handle task choice in comparison
 * @param {Object} selectedTask - The selected task
 * @param {Object} comparisonTask - The comparison task
 * @param {boolean} selectedTaskChosen - Whether the selected task was chosen
 */
function handleTaskChoice(selectedTask, comparisonTask, selectedTaskChosen) {
    console.log(`User chose: ${selectedTaskChosen ? selectedTask.title : comparisonTask.title}`);

    // Record the comparison result
    comparisonResults.push({
        selectedTask: selectedTask,
        comparisonTask: comparisonTask,
        selectedTaskWins: selectedTaskChosen
    });

    // Move to next comparison
    currentComparisonIndex++;

    // Show next comparison or finish
    setTimeout(() => {
        showComparison();
    }, 300); // Small delay for better UX
}

/**
 * Finish all comparisons and calculate priority
 */
function finishComparisons() {
    console.log('All comparisons complete:', comparisonResults);

    // Hide comparison interface and show results
    const comparisonContainer = document.getElementById('binaryComparisonContainer');
    const resultsDiv = document.getElementById('comparisonResults');

    comparisonContainer.style.display = 'none';
    resultsDiv.style.display = 'block';

    // Calculate the priority ranking
    calculatePriorityRanking();

    // Automatically save the priority order after a short delay
    setTimeout(() => {
        saveTaskRanking();
    }, 1000);
}

/**
 * Calculate priority ranking based on comparison results
 */
function calculatePriorityRanking() {
    // Simple algorithm: count wins for the selected task
    const selectedTaskWins = comparisonResults.filter(result => result.selectedTaskWins).length;
    const totalComparisons = comparisonResults.length;

    console.log(`Selected task won ${selectedTaskWins} out of ${totalComparisons} comparisons`);

    // Calculate relative priority position
    // If task wins most comparisons, it gets higher priority (lower number)
    // If task loses most comparisons, it gets lower priority (higher number)

    const winPercentage = selectedTaskWins / totalComparisons;

    // Get all existing priority orders from comparison tasks (excluding the selected task)
    const existingPriorities = comparisonTasks
        .filter(t => t.id !== selectedTaskForRanking.id && t.priority_order)
        .map(t => t.priority_order)
        .sort((a, b) => a - b);

    console.log('Existing priorities:', existingPriorities);

    let newPriorityOrder;

    if (winPercentage >= 0.8) {
        // High priority - place at the very top
        newPriorityOrder = existingPriorities.length > 0 ? Math.min(...existingPriorities) - 1 : 1;
        if (newPriorityOrder < 1) newPriorityOrder = 1;
    } else if (winPercentage >= 0.6) {
        // Medium-high priority - place in top 30%
        const targetPosition = Math.max(1, Math.floor(existingPriorities.length * 0.3));
        newPriorityOrder = existingPriorities[targetPosition - 1] || (existingPriorities.length + 1);
    } else if (winPercentage >= 0.4) {
        // Medium priority - place in middle 50%
        const targetPosition = Math.max(1, Math.floor(existingPriorities.length * 0.5));
        newPriorityOrder = existingPriorities[targetPosition - 1] || (existingPriorities.length + 1);
    } else if (winPercentage >= 0.2) {
        // Medium-low priority - place in bottom 30%
        const targetPosition = Math.max(1, Math.floor(existingPriorities.length * 0.7));
        newPriorityOrder = existingPriorities[targetPosition - 1] || (existingPriorities.length + 1);
    } else {
        // Low priority - place at the end
        newPriorityOrder = existingPriorities.length > 0 ? Math.max(...existingPriorities) + 1 : 1;
    }

    // Ensure we don't create duplicate priority orders by adding a small increment if needed
    if (existingPriorities.includes(newPriorityOrder)) {
        // Find the next available priority order
        while (existingPriorities.includes(newPriorityOrder)) {
            newPriorityOrder++;
        }
    }

    // Store the calculated priority for saving
    selectedTaskForRanking.calculatedPriorityOrder = newPriorityOrder;

    console.log(`Calculated priority order: ${newPriorityOrder} (win rate: ${(winPercentage * 100).toFixed(1)}%)`);
}

/**
 * Save the calculated priority ranking
 */
async function saveTaskRanking() {
    const autoSaveMessage = document.getElementById('autoSaveMessage');

    if (!selectedTaskForRanking || !selectedTaskForRanking.calculatedPriorityOrder) {
        if (autoSaveMessage) {
            autoSaveMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No priority ranking to save';
            autoSaveMessage.style.color = '#ef4444';
        }
        return;
    }

    try {
        // Create priority update for the selected task
        const priorityUpdates = [{
            id: selectedTaskForRanking.id,
            priorityOrder: selectedTaskForRanking.calculatedPriorityOrder
        }];

        console.log('Saving priority update:', priorityUpdates);

        // Send batch update request
        const response = await fetch('/api/tasks/batch-priority', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ priorityUpdates })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Priority update result:', result);

        // Update the auto-save message to show success
        if (autoSaveMessage) {
            autoSaveMessage.innerHTML = '<i class="fas fa-check"></i> Priority order saved successfully!';
            autoSaveMessage.style.color = '#4ade80';
        }

        // Close modal and refresh task list after a short delay
        setTimeout(() => {
            closeTaskRankingModal();
            // Reload tasks to reflect new priority order
            if (typeof loadTasks === 'function') {
                loadTasks(true);
            }
        }, 1500);

    } catch (error) {
        console.error('Error saving task priority:', error);

        // Update the auto-save message to show error
        if (autoSaveMessage) {
            autoSaveMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed to save priority ranking';
            autoSaveMessage.style.color = '#ef4444';
        }
    }
}

/**
 * Close the task ranking modal
 */
function closeTaskRankingModal() {
    const modal = document.getElementById('taskRankingModal');
    if (modal) {
        modal.style.display = 'none';
    }

    // Reset state
    selectedTaskForRanking = null;
    comparisonTasks = [];
    currentComparisonIndex = 0;
    comparisonResults = [];

    // Clear status
    const statusDiv = document.getElementById('rankingStatus');
    if (statusDiv) {
        statusDiv.textContent = '';
        statusDiv.style.display = 'none';
    }
}

/**
 * Show error message when no tasks are available for comparison
 * @param {string} filter - The current filter context
 */
function showNoTasksMessage(filter = 'all') {
    const loadingDiv = document.getElementById('comparisonLoading');
    const comparisonContainer = document.getElementById('binaryComparisonContainer');
    const resultsDiv = document.getElementById('comparisonResults');

    loadingDiv.style.display = 'none';
    comparisonContainer.style.display = 'none';
    resultsDiv.style.display = 'block';

    // Create contextual message based on filter
    let filterDescription = '';
    switch (filter) {
        case 'unassigned_today':
            filterDescription = 'in the "Unassigned, Today & Overdue" view';
            break;
        case 'today':
            filterDescription = 'due today';
            break;
        case 'week':
            filterDescription = 'due this week';
            break;
        case 'month':
            filterDescription = 'due this month';
            break;
        case 'all':
        default:
            filterDescription = 'available';
            break;
    }

    resultsDiv.innerHTML = `
        <h3>No Tasks Available for Comparison</h3>
        <p>There are no other tasks ${filterDescription} to compare against. ${filter === 'all' ? 'Please add more tasks to use the priority ranking feature.' : 'Try switching to a different filter view or add more tasks.'}</p>
        <div class="ranking-controls">
            <button type="button" id="cancelRankingBtn" class="btn btn--secondary">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;

    // Re-attach cancel button handler
    const cancelBtn = resultsDiv.querySelector('#cancelRankingBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeTaskRankingModal);
    }
}

/**
 * Show error message
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    const loadingDiv = document.getElementById('comparisonLoading');

    loadingDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #f44336;"></i>
        <p>${message}</p>
    `;

    updateRankingStatus(message, true);
}

/**
 * Update ranking status message
 * @param {string} message - The status message
 * @param {boolean} isError - Whether this is an error message
 */
function updateRankingStatus(message, isError = false) {
    const statusDiv = document.getElementById('rankingStatus');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${isError ? 'error' : 'success'}`;
        statusDiv.style.display = 'block';
        
        // Auto-hide success messages
        if (!isError) {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} The escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Close button
    const closeBtn = document.querySelector('#taskRankingModal .close-button');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTaskRankingModal);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('taskRankingModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeTaskRankingModal();
            }
        });
    }
});

// Make functions globally available
window.openTaskRankingModal = openTaskRankingModal;
window.closeTaskRankingModal = closeTaskRankingModal;
