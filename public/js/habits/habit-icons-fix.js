/**
 * Habit Icons Fix
 * 
 * Replaces the habit list's edit and delete buttons with icons that match the task list
 * and adds hover functionality similar to the task list.
 */

(function() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHabitIconsFix);
    } else {
        initHabitIconsFix();
    }

    function initHabitIconsFix() {
        console.log('[Habit Icons Fix] Initializing...');
        
        // Set up a mutation observer to watch for habit list changes
        const habitListContainer = document.getElementById('habitList');
        if (!habitListContainer) {
            console.error('[Habit Icons Fix] Could not find habit list container');
            return;
        }
        
        // Create a mutation observer to watch for new habits being added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any of the added nodes are habit items
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('habit-item')) {
                            updateHabitIcons(node);
                        }
                    });
                }
            });
        });
        
        // Start observing the habit list for changes
        observer.observe(habitListContainer, { childList: true, subtree: true });
        
        // Also update any existing habit items
        const existingHabits = habitListContainer.querySelectorAll('.habit-item');
        existingHabits.forEach(updateHabitIcons);
        
        console.log('[Habit Icons Fix] Initialized successfully');
    }
    
    /**
     * Updates the habit item to use icon buttons instead of text buttons
     * @param {HTMLElement} habitItem - The habit item element
     */
    function updateHabitIcons(habitItem) {
        // Find the existing buttons
        const editBtn = habitItem.querySelector('.edit-habit-btn');
        const deleteBtn = habitItem.querySelector('.delete-habit-btn');
        
        if (!editBtn || !deleteBtn) {
            console.warn('[Habit Icons Fix] Could not find edit or delete buttons for habit item');
            return;
        }
        
        // Get the habit actions container
        let actionsContainer = habitItem.querySelector('.habit-actions');
        
        if (!actionsContainer) {
            console.warn('[Habit Icons Fix] Could not find actions container, creating one');
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'habit-actions';
            habitItem.appendChild(actionsContainer);
        }
        
        // Clear the existing buttons from the container
        actionsContainer.innerHTML = '';
        
        // Create new icon buttons
        const newEditBtn = document.createElement('button');
        newEditBtn.className = 'icon-btn edit-habit-icon-btn';
        newEditBtn.innerHTML = '<i class="pencil-icon">✏️</i>'; // Pencil emoji
        newEditBtn.title = 'Edit habit';
        
        // Copy the click event handler from the original edit button
        newEditBtn.addEventListener('click', (event) => {
            // Prevent the event from bubbling up
            event.stopPropagation();
            
            // Trigger a click on the original button
            editBtn.click();
        });
        
        const newDeleteBtn = document.createElement('button');
        newDeleteBtn.className = 'icon-btn delete-habit-icon-btn';
        newDeleteBtn.innerHTML = '<i class="x-icon">❌</i>'; // X emoji
        newDeleteBtn.title = 'Delete habit';
        
        // Copy the click event handler from the original delete button
        newDeleteBtn.addEventListener('click', (event) => {
            // Prevent the event from bubbling up
            event.stopPropagation();
            
            // Trigger a click on the original button
            deleteBtn.click();
        });
        
        // Add the new buttons to the actions container
        actionsContainer.appendChild(newEditBtn);
        actionsContainer.appendChild(newDeleteBtn);
        
        // Add touch event handler for mobile devices
        habitItem.addEventListener('touchstart', handleHabitTouch);
        
        console.log('[Habit Icons Fix] Updated habit item icons');
    }
    
    /**
     * Handles touch events for mobile devices
     * @param {TouchEvent} event - The touch event
     */
    function handleHabitTouch(event) {
        // Get the habit item
        const habitItem = event.currentTarget;
        
        // Toggle the show-actions class
        habitItem.classList.toggle('show-actions');
        
        // Remove the class after 3 seconds
        setTimeout(() => {
            habitItem.classList.remove('show-actions');
        }, 3000);
    }
})();
