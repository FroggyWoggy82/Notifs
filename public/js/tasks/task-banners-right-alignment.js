/**
 * Task Banners Right Alignment
 * Moves task banners (Due Today, Weekly, Monthly, Next: date) to the right of the task title
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Task Banners Right Alignment] Initializing...');
    
    function moveTaskBannersToRight() {
        // Find all task items
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(taskItem => {
            // Skip if already processed
            if (taskItem.hasAttribute('data-banners-moved')) {
                return;
            }
            
            const titleContainer = taskItem.querySelector('.task-title-container');
            const metadata = taskItem.querySelector('.task-metadata');
            
            if (!titleContainer || !metadata) {
                return;
            }
            
            // Create left and right sections if they don't exist
            let titleLeft = titleContainer.querySelector('.task-title-left');
            let titleRight = titleContainer.querySelector('.task-title-right');
            
            if (!titleLeft) {
                titleLeft = document.createElement('div');
                titleLeft.className = 'task-title-left';
                
                // Move existing title and recurring icon to left section
                const title = titleContainer.querySelector('.task-title');
                const recurringIcon = titleContainer.querySelector('.recurring-icon');
                
                if (title) {
                    titleLeft.appendChild(title);
                }
                if (recurringIcon) {
                    titleLeft.appendChild(recurringIcon);
                }
                
                titleContainer.appendChild(titleLeft);
            }
            
            if (!titleRight) {
                titleRight = document.createElement('div');
                titleRight.className = 'task-title-right';
                titleContainer.appendChild(titleRight);
            }
            
            // Move banners from metadata to title right section
            const banners = metadata.querySelectorAll('.due-date-indicator, .recurrence-indicator, .next-occurrence-indicator, .notification-indicator');

            banners.forEach(banner => {
                // Clone the banner to avoid moving issues
                const clonedBanner = banner.cloneNode(true);
                titleRight.appendChild(clonedBanner);
                // Remove the original banner to prevent duplicates
                banner.remove();
            });
            
            // Mark as processed
            taskItem.setAttribute('data-banners-moved', 'true');
            
            console.log(`[Task Banners Right Alignment] Moved banners for task: ${taskItem.getAttribute('data-task-id')}`);
        });
    }
    
    // Initial move
    moveTaskBannersToRight();
    
    // Watch for new tasks being added
    const observer = new MutationObserver(function(mutations) {
        let shouldProcess = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if it's a task item or contains task items
                        if (node.classList && node.classList.contains('task-item')) {
                            shouldProcess = true;
                        } else if (node.querySelectorAll && node.querySelectorAll('.task-item').length > 0) {
                            shouldProcess = true;
                        }
                    }
                });
            }
        });
        
        if (shouldProcess) {
            // Delay slightly to ensure DOM is fully updated
            setTimeout(moveTaskBannersToRight, 100);
        }
    });
    
    // Observe the task list containers
    const taskListContainer = document.getElementById('taskList');
    const completedTaskListContainer = document.getElementById('completedTaskList');
    
    if (taskListContainer) {
        observer.observe(taskListContainer, {
            childList: true,
            subtree: true
        });
    }
    
    if (completedTaskListContainer) {
        observer.observe(completedTaskListContainer, {
            childList: true,
            subtree: true
        });
    }
    
    // Also listen for the custom tasksRendered event
    document.addEventListener('tasksRendered', function() {
        console.log('[Task Banners Right Alignment] Tasks rendered, moving banners...');
        setTimeout(moveTaskBannersToRight, 50);
    });
    
    console.log('[Task Banners Right Alignment] Initialized successfully');
});
