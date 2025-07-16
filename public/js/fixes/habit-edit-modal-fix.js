/**
 * Habit Edit Modal Fix
 * 
 * This script ensures that habit edit buttons properly open the edit modal
 * by providing a unified event handler and ensuring the modal functions exist.
 */

(function() {
    'use strict';

    console.log('[Habit Edit Modal Fix] Initializing...');

    // Ensure the edit habit modal function exists
    function ensureEditHabitModalFunction() {
        if (typeof window.openEditHabitModal !== 'function' && typeof window.showEditHabitModal !== 'function') {
            console.log('[Habit Edit Modal Fix] Creating edit habit modal function...');
            
            window.openEditHabitModal = function(habit) {
                console.log('[Habit Edit Modal Fix] Opening edit modal for habit:', habit);
                
                const editHabitModal = document.getElementById('editHabitModal');
                const editHabitIdInput = document.getElementById('editHabitId');
                const editHabitTitleInput = document.getElementById('editHabitTitle');
                const editHabitRecurrenceTypeInput = document.getElementById('editHabitRecurrenceType');
                const editHabitCompletionsPerDayInput = document.getElementById('editHabitCompletionsPerDay');
                const editHabitStatusDiv = document.getElementById('editHabitStatus');

                if (!editHabitModal) {
                    console.error('[Habit Edit Modal Fix] Edit habit modal not found');
                    return;
                }

                // Populate the form
                if (editHabitIdInput) editHabitIdInput.value = habit.id;
                if (editHabitTitleInput) editHabitTitleInput.value = habit.title;
                if (editHabitRecurrenceTypeInput) editHabitRecurrenceTypeInput.value = habit.frequency;
                if (editHabitCompletionsPerDayInput) editHabitCompletionsPerDayInput.value = habit.completions_per_day || 1;
                if (editHabitStatusDiv) {
                    editHabitStatusDiv.textContent = '';
                    editHabitStatusDiv.className = 'status';
                }

                // Show the modal
                editHabitModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                console.log('[Habit Edit Modal Fix] Modal opened successfully');
            };

            // Also create showEditHabitModal as an alias
            window.showEditHabitModal = window.openEditHabitModal;
        }
    }

    // Set up event delegation for habit edit buttons
    function setupEditButtonHandlers() {
        console.log('[Habit Edit Modal Fix] Setting up edit button handlers...');

        document.addEventListener('click', function(event) {
            const editBtn = event.target.closest('.edit-habit-icon-btn');
            if (editBtn) {
                console.log('[Habit Edit Modal Fix] Edit button clicked');
                event.stopPropagation();
                event.preventDefault();

                const habitItem = editBtn.closest('.habit-item');
                if (habitItem) {
                    const habitId = habitItem.getAttribute('data-habit-id');
                    console.log('[Habit Edit Modal Fix] Habit ID:', habitId);

                    if (habitId) {
                        // Fetch habit data and open modal
                        fetch(`/api/habits/${habitId}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(habit => {
                                console.log('[Habit Edit Modal Fix] Habit data fetched:', habit);
                                ensureEditHabitModalFunction();
                                window.openEditHabitModal(habit);
                            })
                            .catch(error => {
                                console.error('[Habit Edit Modal Fix] Error fetching habit:', error);
                            });
                    }
                }
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ensureEditHabitModalFunction();
            setupEditButtonHandlers();
        });
    } else {
        ensureEditHabitModalFunction();
        setupEditButtonHandlers();
    }

    console.log('[Habit Edit Modal Fix] Initialized successfully');
})();
