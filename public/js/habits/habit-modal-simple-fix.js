/**
 * Simple Habit Modal Fix
 * Clean, simple solution to fix the edit habit modal
 */

(function() {
    'use strict';

    console.log('[Simple Habit Modal Fix] Loading...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('[Simple Habit Modal Fix] Initializing...');

        // Create the modal HTML if it doesn't exist
        if (!document.getElementById('editHabitModal')) {
            createModal();
        }

        // Override the openEditHabitModal function
        window.openEditHabitModal = function(habit) {
            console.log('[Simple Habit Modal Fix] Opening modal for habit:', habit);
            
            const modal = document.getElementById('editHabitModal');
            if (!modal) {
                console.error('[Simple Habit Modal Fix] Modal not found');
                return;
            }

            // Populate form fields
            const idInput = document.getElementById('editHabitId');
            const titleInput = document.getElementById('editHabitTitle');
            const frequencyInput = document.getElementById('editHabitRecurrenceType');
            const completionsInput = document.getElementById('editHabitCompletionsPerDay');

            if (idInput) idInput.value = habit.id;
            if (titleInput) titleInput.value = habit.title;
            if (frequencyInput) frequencyInput.value = habit.frequency;
            if (completionsInput) completionsInput.value = habit.completions_per_day || 1;

            // Show/hide completions field based on frequency
            const completionsGroup = document.getElementById('editHabitCompletionsGroup');
            if (completionsGroup) {
                completionsGroup.style.display = habit.frequency === 'daily' ? 'block' : 'none';
            }

            // Show the modal
            modal.classList.add('user-opened');
            modal.style.display = 'flex';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = '10000';

            // Force show modal content
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.display = 'block';
                modalContent.style.visibility = 'visible';
                modalContent.style.opacity = '1';
            }

            // Ensure buttons are visible and properly styled
            ensureButtonsExist(modal);

            document.body.style.overflow = 'hidden';
            console.log('[Simple Habit Modal Fix] Modal opened successfully');
        };

        // Set up close functionality
        setupCloseHandlers();
        
        console.log('[Simple Habit Modal Fix] Initialization complete');
    }

    function ensureButtonsExist(modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) return;

        // Remove any existing footer
        const existingFooter = modalContent.querySelector('.modal-footer');
        if (existingFooter) {
            existingFooter.remove();
        }

        // Create new footer with FORCE VISIBLE buttons
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.style.cssText = `
            position: relative !important;
            bottom: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            text-align: center !important;
            background: #1a1a1a !important;
            border-top: 1px solid #333 !important;
            margin-top: 20px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 99999 !important;
        `;

        // Create SAVE button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'SAVE CHANGES';
        saveButton.type = 'submit';
        saveButton.style.cssText = `
            background: #28a745 !important;
            color: white !important;
            border: none !important;
            padding: 15px 30px !important;
            margin: 0 10px !important;
            border-radius: 5px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 99999 !important;
        `;

        // Create CANCEL button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'CANCEL';
        cancelButton.type = 'button';
        cancelButton.className = 'close-button';
        cancelButton.style.cssText = `
            background: #dc3545 !important;
            color: white !important;
            border: none !important;
            padding: 15px 30px !important;
            margin: 0 10px !important;
            border-radius: 5px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 99999 !important;
        `;

        // Add click handlers
        cancelButton.onclick = function() {
            modal.classList.remove('user-opened');
            modal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('[Simple Habit Modal Fix] Modal cancelled');
        };

        saveButton.onclick = function(e) {
            e.preventDefault();
            console.log('[Simple Habit Modal Fix] Save button clicked');

            // Get form data
            const habitId = document.getElementById('editHabitId').value;
            const title = document.getElementById('editHabitTitle').value;
            const frequency = document.getElementById('editHabitRecurrenceType').value;
            const completionsPerDay = document.getElementById('editHabitCompletionsPerDay').value;

            // Call the existing form submit handler
            const form = document.getElementById('editHabitForm');
            if (form) {
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);
            }
        };

        footer.appendChild(saveButton);
        footer.appendChild(cancelButton);
        modalContent.appendChild(footer);

        console.log('[Simple Habit Modal Fix] FORCE VISIBLE buttons created');
    }

    function createModal() {
        const modalHTML = `
            <div id="editHabitModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Habit</h2>
                        <span class="close modal-close-x">&times;</span>
                    </div>
                    <form id="editHabitForm">
                        <input type="hidden" id="editHabitId">
                        
                        <div class="form-group">
                            <label for="editHabitTitle">Habit Title:</label>
                            <input type="text" id="editHabitTitle" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editHabitRecurrenceType">Frequency:</label>
                            <select id="editHabitRecurrenceType">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        
                        <div id="editHabitCompletionsGroup" class="form-group">
                            <label for="editHabitCompletionsPerDay">Completions per day:</label>
                            <input type="number" id="editHabitCompletionsPerDay" min="1" value="1">
                        </div>
                        
                        <div id="editHabitStatus" class="status" style="display: none;"></div>
                        
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary">Save</button>
                            <button type="button" class="btn btn-secondary close-button">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('[Simple Habit Modal Fix] Modal HTML created');
        
        // Set up form submission
        const form = document.getElementById('editHabitForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        // Set up frequency change handler
        const frequencySelect = document.getElementById('editHabitRecurrenceType');
        if (frequencySelect) {
            frequencySelect.addEventListener('change', function() {
                const completionsGroup = document.getElementById('editHabitCompletionsGroup');
                if (completionsGroup) {
                    completionsGroup.style.display = this.value === 'daily' ? 'block' : 'none';
                }
            });
        }
    }

    function setupCloseHandlers() {
        const modal = document.getElementById('editHabitModal');
        if (!modal) return;

        function closeModal() {
            modal.classList.remove('user-opened');
            modal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('[Simple Habit Modal Fix] Modal closed');
        }

        // Close button
        const closeButton = modal.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }

        // Cancel button
        const cancelButton = modal.querySelector('.close-button');
        if (cancelButton) {
            cancelButton.addEventListener('click', closeModal);
        }

        // Click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        console.log('[Simple Habit Modal Fix] Form submitted');

        const habitId = document.getElementById('editHabitId').value;
        const title = document.getElementById('editHabitTitle').value;
        const frequency = document.getElementById('editHabitRecurrenceType').value;
        const completionsPerDay = document.getElementById('editHabitCompletionsPerDay').value;
        const statusDiv = document.getElementById('editHabitStatus');

        // Show loading
        statusDiv.style.display = 'block';
        statusDiv.textContent = 'Saving...';
        statusDiv.style.backgroundColor = '#f0f0f0';
        statusDiv.style.color = '#333';

        try {
            const response = await fetch(`/api/habits/${habitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    frequency,
                    completions_per_day: parseInt(completionsPerDay)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedHabit = await response.json();
            console.log('[Simple Habit Modal Fix] Habit updated:', updatedHabit);

            // Show success
            statusDiv.textContent = 'Habit updated successfully!';
            statusDiv.style.backgroundColor = '#d4edda';
            statusDiv.style.color = '#155724';

            // Close modal after delay
            setTimeout(() => {
                const modal = document.getElementById('editHabitModal');
                modal.classList.remove('user-opened');
                modal.style.display = 'none';
                document.body.style.overflow = '';
                
                // Refresh the page to show updated habit
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('[Simple Habit Modal Fix] Error updating habit:', error);
            statusDiv.textContent = 'Error updating habit. Please try again.';
            statusDiv.style.backgroundColor = '#f8d7da';
            statusDiv.style.color = '#721c24';
        }
    }

})();
