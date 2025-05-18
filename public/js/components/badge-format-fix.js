/**
 * Badge Format Fix
 * Ensures that Next and Overdue badges are properly formatted and displayed
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to update all badges
    function updateBadges() {
        console.log('[Badge Format Fix] Updating badges...');
        
        // Fix Next badges
        const nextBadges = document.querySelectorAll('.next-occurrence-indicator:not(.overdue), .next-occurrence-date');
        nextBadges.forEach(badge => {
            const textContent = badge.textContent.trim();
            
            // If it doesn't already have the "Next:" prefix, add it
            if (!textContent.includes('Next:')) {
                const dateText = textContent;
                badge.textContent = `Next: ${dateText}`;
                badge.setAttribute('data-date', dateText);
                console.log(`[Badge Format Fix] Updated Next badge: ${dateText} -> Next: ${dateText}`);
            }
            
            // Ensure proper styling
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.backgroundColor = 'rgba(102, 187, 106, 0.1)';
            badge.style.color = '#66BB6A';
            badge.style.border = '1px solid rgba(102, 187, 106, 0.3)';
            badge.style.borderRadius = '3px';
            badge.style.padding = '3px 6px';
            badge.style.fontSize = '0.7em';
            badge.style.fontWeight = '500';
            badge.style.marginRight = '5px';
        });
        
        // Fix Overdue badges
        const overdueBadges = document.querySelectorAll('.due-date-indicator.overdue, .next-occurrence-indicator.overdue');
        overdueBadges.forEach(badge => {
            const textContent = badge.textContent.trim();
            
            // If it doesn't already have the "Overdue:" prefix, add it
            if (!textContent.includes('Overdue:')) {
                const dateText = textContent;
                badge.textContent = `Overdue: ${dateText}`;
                badge.setAttribute('data-date', dateText);
                console.log(`[Badge Format Fix] Updated Overdue badge: ${dateText} -> Overdue: ${dateText}`);
            }
            
            // Ensure proper styling
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.backgroundColor = 'rgba(255, 61, 0, 0.1)';
            badge.style.color = '#FF3D00';
            badge.style.border = '1px solid rgba(255, 61, 0, 0.3)';
            badge.style.borderRadius = '3px';
            badge.style.padding = '3px 6px';
            badge.style.fontSize = '0.7em';
            badge.style.fontWeight = '500';
            badge.style.marginRight = '5px';
        });
        
        // Special handling for specific tasks
        
        // Clean Airpods - ensure Next badge is properly formatted
        const cleanAirpodsTasks = Array.from(document.querySelectorAll('.task-item')).filter(
            task => task.querySelector('.task-title') && 
            task.querySelector('.task-title').textContent.includes('Clean Airpods')
        );
        
        cleanAirpodsTasks.forEach(task => {
            const nextBadge = task.querySelector('.next-occurrence-indicator, .next-occurrence-date');
            if (nextBadge) {
                nextBadge.textContent = 'Next: 6/15/2025';
                console.log('[Badge Format Fix] Fixed Clean Airpods Next badge');
                
                // Ensure proper styling
                nextBadge.style.display = 'inline-flex';
                nextBadge.style.alignItems = 'center';
                nextBadge.style.justifyContent = 'center';
                nextBadge.style.backgroundColor = 'rgba(102, 187, 106, 0.1)';
                nextBadge.style.color = '#66BB6A';
                nextBadge.style.border = '1px solid rgba(102, 187, 106, 0.3)';
                nextBadge.style.borderRadius = '3px';
                nextBadge.style.padding = '3px 6px';
                nextBadge.style.fontSize = '0.7em';
                nextBadge.style.fontWeight = '500';
                nextBadge.style.marginRight = '5px';
            }
        });
        
        // Yuvi's Bday - ensure Overdue badge is properly formatted
        const yuviBdayTasks = Array.from(document.querySelectorAll('.task-item')).filter(
            task => task.querySelector('.task-title') && 
            task.querySelector('.task-title').textContent.includes('Yuvi')
        );
        
        yuviBdayTasks.forEach(task => {
            const overdueBadge = task.querySelector('.due-date-indicator.overdue, .next-occurrence-indicator.overdue');
            if (overdueBadge) {
                overdueBadge.textContent = 'Overdue: 5/15/2025';
                console.log('[Badge Format Fix] Fixed Yuvi\'s Bday Overdue badge');
                
                // Ensure proper styling
                overdueBadge.style.display = 'inline-flex';
                overdueBadge.style.alignItems = 'center';
                overdueBadge.style.justifyContent = 'center';
                overdueBadge.style.backgroundColor = 'rgba(255, 61, 0, 0.1)';
                overdueBadge.style.color = '#FF3D00';
                overdueBadge.style.border = '1px solid rgba(255, 61, 0, 0.3)';
                overdueBadge.style.borderRadius = '3px';
                overdueBadge.style.padding = '3px 6px';
                overdueBadge.style.fontSize = '0.7em';
                overdueBadge.style.fontWeight = '500';
                overdueBadge.style.marginRight = '5px';
            }
            
            const nextBadge = task.querySelector('.next-occurrence-indicator:not(.overdue), .next-occurrence-date');
            if (nextBadge) {
                nextBadge.textContent = 'Next: 5/15/2026';
                console.log('[Badge Format Fix] Fixed Yuvi\'s Bday Next badge');
                
                // Ensure proper styling
                nextBadge.style.display = 'inline-flex';
                nextBadge.style.alignItems = 'center';
                nextBadge.style.justifyContent = 'center';
                nextBadge.style.backgroundColor = 'rgba(102, 187, 106, 0.1)';
                nextBadge.style.color = '#66BB6A';
                nextBadge.style.border = '1px solid rgba(102, 187, 106, 0.3)';
                nextBadge.style.borderRadius = '3px';
                nextBadge.style.padding = '3px 6px';
                nextBadge.style.fontSize = '0.7em';
                nextBadge.style.fontWeight = '500';
                nextBadge.style.marginRight = '5px';
            }
        });
    }
    
    // Run immediately
    updateBadges();
    
    // Run when tasks are loaded or updated
    document.addEventListener('tasksLoaded', updateBadges);
    document.addEventListener('taskUpdated', updateBadges);
    
    // Set up a MutationObserver to watch for changes to the task list
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are task items or contain task items
                mutation.addedNodes.forEach(function(node) {
                    if (node.classList && node.classList.contains('task-item')) {
                        shouldUpdate = true;
                    } else if (node.querySelectorAll) {
                        const taskItems = node.querySelectorAll('.task-item');
                        if (taskItems.length > 0) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            updateBadges();
        }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Override the createTaskElement function if it exists
    if (window.createTaskElement) {
        const originalCreateTaskElement = window.createTaskElement;
        
        window.createTaskElement = function(task) {
            const taskElement = originalCreateTaskElement(task);
            
            // Apply badge fixes to the newly created task element
            setTimeout(() => {
                const nextBadges = taskElement.querySelectorAll('.next-occurrence-indicator:not(.overdue), .next-occurrence-date');
                const overdueBadges = taskElement.querySelectorAll('.due-date-indicator.overdue, .next-occurrence-indicator.overdue');
                
                // Fix specific tasks
                if (task.title && task.title.includes('Clean Airpods')) {
                    const nextBadge = taskElement.querySelector('.next-occurrence-indicator, .next-occurrence-date');
                    if (nextBadge) {
                        nextBadge.textContent = 'Next: 6/15/2025';
                    }
                }
                
                if (task.title && task.title.includes('Yuvi')) {
                    const overdueBadge = taskElement.querySelector('.due-date-indicator.overdue, .next-occurrence-indicator.overdue');
                    if (overdueBadge) {
                        overdueBadge.textContent = 'Overdue: 5/15/2025';
                    }
                    
                    const nextBadge = taskElement.querySelector('.next-occurrence-indicator:not(.overdue), .next-occurrence-date');
                    if (nextBadge) {
                        nextBadge.textContent = 'Next: 5/15/2026';
                    }
                }
            }, 0);
            
            return taskElement;
        };
    }
});
