/**
 * Habit Icons Fix
 *
 * Replaces the habit list's edit and delete buttons with icons that match the task list
 * and adds hover functionality similar to the task list.
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHabitIconsFix);
    } else {
        initHabitIconsFix();
    }

    function initHabitIconsFix() {
        console.log('[Habit Icons Fix] Initializing...');

        const habitListContainer = document.getElementById('habitList');
        if (!habitListContainer) {
            console.error('[Habit Icons Fix] Could not find habit list container');
            return;
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {

                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('habit-item')) {
                            updateHabitIcons(node);
                        }
                    });
                }
            });
        });

        observer.observe(habitListContainer, { childList: true, subtree: true });

        const existingHabits = habitListContainer.querySelectorAll('.habit-item');
        existingHabits.forEach(updateHabitIcons);

        console.log('[Habit Icons Fix] Initialized successfully');
    }

    /**
     * Updates the habit item to use icon buttons instead of text buttons
     * @param {HTMLElement} habitItem - The habit item element
     */
    function updateHabitIcons(habitItem) {

        const editBtn = habitItem.querySelector('.edit-habit-btn');
        const deleteBtn = habitItem.querySelector('.delete-habit-btn');

        if (!editBtn || !deleteBtn) {
            console.warn('[Habit Icons Fix] Could not find edit or delete buttons for habit item');
            return;
        }

        let actionsContainer = habitItem.querySelector('.habit-actions');

        if (!actionsContainer) {
            console.warn('[Habit Icons Fix] Could not find actions container, creating one');
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'habit-actions';
            habitItem.appendChild(actionsContainer);
        }

        actionsContainer.innerHTML = '';

        const newEditBtn = document.createElement('button');
        newEditBtn.className = 'icon-btn edit-habit-icon-btn';
        newEditBtn.innerHTML = '<i class="pencil-icon"><i class="fas fa-pencil-alt"></i></i>'; // Font Awesome icon
        newEditBtn.title = 'Edit habit';

        newEditBtn.addEventListener('click', (event) => {

            event.stopPropagation();

            editBtn.click();
        });

        const newDeleteBtn = document.createElement('button');
        newDeleteBtn.className = 'icon-btn delete-habit-icon-btn';
        newDeleteBtn.innerHTML = '<i class="x-icon"><i class="fas fa-times"></i></i>'; // Font Awesome icon
        newDeleteBtn.title = 'Delete habit';

        newDeleteBtn.addEventListener('click', (event) => {

            event.stopPropagation();

            deleteBtn.click();
        });

        actionsContainer.appendChild(newEditBtn);
        actionsContainer.appendChild(newDeleteBtn);

        habitItem.addEventListener('touchstart', handleHabitTouch);

        console.log('[Habit Icons Fix] Updated habit item icons');
    }

    /**
     * Handles touch events for mobile devices
     * @param {TouchEvent} event - The touch event
     */
    function handleHabitTouch(event) {
        const habitItem = event.currentTarget;
        const touch = event.touches[0];

        // Don't show edit buttons if touching interactive elements
        const target = event.target;
        if (target.closest('.habit-checkbox') ||
            target.closest('.habit-increment-btn') ||
            target.closest('.habit-level') ||
            target.closest('.habit-progress') ||
            target.closest('.habit-actions')) {
            return;
        }

        // Check if we're on mobile (screen width <= 768px)
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // On mobile, only show edit buttons if touching the far right edge (last 10% of the habit item)
            const habitRect = habitItem.getBoundingClientRect();
            const touchX = touch.clientX;
            const habitRightEdge = habitRect.right - (habitRect.width * 0.1);

            // Only trigger edit buttons if touching the very far right edge
            if (touchX >= habitRightEdge) {
                // Remove any existing mobile edit mode from other habits
                document.querySelectorAll('.habit-item.mobile-edit-mode').forEach(item => {
                    item.classList.remove('mobile-edit-mode');
                });

                habitItem.classList.add('mobile-edit-mode');

                setTimeout(() => {
                    habitItem.classList.remove('mobile-edit-mode');
                }, 1500); // Even shorter timeout on mobile
            }
        } else {
            // On desktop, use the original behavior (right 30%)
            const habitRect = habitItem.getBoundingClientRect();
            const touchX = touch.clientX;
            const habitRightThird = habitRect.right - (habitRect.width * 0.3);

            if (touchX >= habitRightThird) {
                habitItem.classList.toggle('show-actions');

                setTimeout(() => {
                    habitItem.classList.remove('show-actions');
                }, 3000);
            }
        }
    }
})();
