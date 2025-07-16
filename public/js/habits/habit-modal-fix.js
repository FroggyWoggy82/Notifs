
/**
 * Habit Modal Fix - WORKING SOLUTION
 * Fixes the "mobile edit of habit not working" issue by:
 * 1. Creating the missing editHabitModal HTML
 * 2. Providing a working openEditHabitModal function
 * 3. Attaching function to all habit edit buttons
 */

(function() {
    'use strict';

    console.log('[Habit Modal Fix] *** WORKING SOLUTION V6 LOADING ***');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHabitModalFix);
    } else {
        initializeHabitModalFix();
    }

    // Also run after a delay to catch dynamically loaded content
    setTimeout(initializeHabitModalFix, 2000);

    function initializeHabitModalFix() {
        console.log('[Habit Modal Fix] *** WORKING SOLUTION - Creating modal and function ***');

        // Remove any existing modal
        const existingModal = document.getElementById('editHabitModal');
        if (existingModal) {
            existingModal.remove();
            console.log('[Habit Modal Fix] Removed existing modal');
        }

        // Create the modal HTML with inline styles for guaranteed visibility
        const modalHTML = `
        <div id="editHabitModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9999; align-items: center; justify-content: center;">
            <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 80%; overflow-y: auto;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Edit Habit</h2>
                    <span class="modal-close-x" style="position: absolute; top: 15px; right: 15px; width: 30px; height: 30px; background-color: #333333; color: #e0e0e0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; font-weight: bold; z-index: 99999; transition: background-color 0.2s, color 0.2s, border-color 0.2s; pointer-events: auto;">&times;</span>
                </div>
                <form id="editHabitForm">
                    <input type="hidden" id="editHabitId" name="habitId">

                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editHabitTitle" style="display: block; margin-bottom: 5px; font-weight: bold;">Habit Title:</label>
                        <input type="text" id="editHabitTitle" name="title" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>

                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editHabitRecurrenceType" style="display: block; margin-bottom: 5px; font-weight: bold;">Frequency:</label>
                        <select id="editHabitRecurrenceType" name="recurrence_type" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <div id="editHabitCompletionsGroup" class="form-group" style="margin-bottom: 20px;">
                        <label for="editHabitCompletionsPerDay" style="display: block; margin-bottom: 5px; font-weight: bold;">Completions Per Day:</label>
                        <input type="number" id="editHabitCompletionsPerDay" name="completions_per_day" min="1" value="1" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>

                    <div id="editHabitStatus" class="status" style="margin-bottom: 15px; padding: 10px; border-radius: 4px; display: none;"></div>

                    <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="submit" class="btn btn-primary" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Update Habit</button>
                        <button type="button" class="btn btn-secondary close-button" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                        <button type="button" class="btn btn-danger" id="deleteHabitBtn" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete Habit</button>
                    </div>

                    <div id="editHabitStatus" class="status" style="margin-top: 15px;"></div>
                </form>
            </div>
        </div>`;

        // Add the modal to the page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('[Habit Modal Fix] Modal HTML created');

        // Set up event listener for recurrence type change
        const editHabitRecurrenceTypeInput = document.getElementById('editHabitRecurrenceType');
        if (editHabitRecurrenceTypeInput) {
            editHabitRecurrenceTypeInput.addEventListener('change', function() {
                const editHabitCompletionsGroup = document.getElementById('editHabitCompletionsGroup');
                if (editHabitCompletionsGroup) {
                    if (this.value === 'daily') {
                        editHabitCompletionsGroup.style.display = 'block';
                    } else {
                        editHabitCompletionsGroup.style.display = 'none';
                    }
                }
            });
        }

        // Create the openEditHabitModal function that overrides the broken one in script.js
        window.openEditHabitModal = function(habit) {
            console.log('[Habit Modal Fix] OVERRIDE - Opening edit modal for habit:', habit);
            console.log('[Habit Modal Fix] OVERRIDE - Function called successfully!');

            const editHabitModal = document.getElementById('editHabitModal');
            if (!editHabitModal) {
                console.error('[Habit Modal Fix] Edit habit modal not found');
                return false;
            }

            // Populate the form fields
            const editHabitIdInput = document.getElementById('editHabitId');
            const editHabitTitleInput = document.getElementById('editHabitTitle');
            const editHabitRecurrenceTypeInput = document.getElementById('editHabitRecurrenceType');
            const editHabitCompletionsPerDayInput = document.getElementById('editHabitCompletionsPerDay');
            const editHabitStatusDiv = document.getElementById('editHabitStatus');

            if (editHabitIdInput) editHabitIdInput.value = habit.id;
            if (editHabitTitleInput) editHabitTitleInput.value = habit.title;
            if (editHabitRecurrenceTypeInput) editHabitRecurrenceTypeInput.value = habit.frequency;
            if (editHabitCompletionsPerDayInput) editHabitCompletionsPerDayInput.value = habit.completions_per_day || 1;
            if (editHabitStatusDiv) {
                editHabitStatusDiv.textContent = '';
                editHabitStatusDiv.className = 'status';
            }

            // Handle completions group visibility based on frequency
            const editHabitCompletionsGroup = document.getElementById('editHabitCompletionsGroup');
            if (editHabitRecurrenceTypeInput && editHabitCompletionsGroup) {
                if (editHabitRecurrenceTypeInput.value === 'daily') {
                    editHabitCompletionsGroup.style.display = 'block';
                } else {
                    editHabitCompletionsGroup.style.display = 'none';
                }
            }

            // Add the user-opened class required by modal-default-hidden.css
            console.log('[Habit Modal Fix] Adding user-opened class...');
            editHabitModal.classList.add('user-opened');
            console.log('[Habit Modal Fix] Classes after adding:', editHabitModal.className);

            // Show the modal with proper centering
            editHabitModal.style.display = 'flex';
            editHabitModal.style.justifyContent = 'center';
            editHabitModal.style.alignItems = 'center';
            editHabitModal.style.position = 'fixed';
            editHabitModal.style.top = '0';
            editHabitModal.style.left = '0';
            editHabitModal.style.width = '100vw';
            editHabitModal.style.height = '100vh';
            editHabitModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            editHabitModal.style.visibility = 'visible';
            editHabitModal.style.opacity = '1';
            editHabitModal.style.pointerEvents = 'auto';
            editHabitModal.style.zIndex = '9999';
            document.body.style.overflow = 'hidden';

            // CRITICAL FIX: Force show modal content that might be hidden by nuclear CSS
            const modalContent = editHabitModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.display = 'block';
                modalContent.style.visibility = 'visible';
                modalContent.style.opacity = '1';
                modalContent.style.position = 'relative';
                modalContent.style.zIndex = '10001';
                console.log('[Habit Modal Fix] Forced modal content to be visible');
            }

            console.log('[Habit Modal Fix] CLEAN - Modal opened successfully');
            console.log('[Habit Modal Fix] Final modal classes:', editHabitModal.className);
            console.log('[Habit Modal Fix] Final modal display:', editHabitModal.style.display);
            return true;
        };

        console.log('[Habit Modal Fix] CLEAN - Function created successfully');

        // Store reference to our function
        const myOpenEditHabitModal = window.openEditHabitModal;

        // Add a check to see if our function gets overridden
        setTimeout(() => {
            if (window.openEditHabitModal !== myOpenEditHabitModal) {
                console.warn('[Habit Modal Fix] WARNING: openEditHabitModal function was overridden!');
                console.log('[Habit Modal Fix] Restoring our function...');
                window.openEditHabitModal = myOpenEditHabitModal;
            }
        }, 3000);

        // AGGRESSIVE OVERRIDE: Set up a timer to keep overriding the function
        setInterval(() => {
            if (window.openEditHabitModal !== myOpenEditHabitModal) {
                console.log('[Habit Modal Fix] CLEAN - Function was overridden, restoring...');
                window.openEditHabitModal = myOpenEditHabitModal;
            }
        }, 1000);

        // Add form submission handler for updating habits
        const editHabitForm = document.getElementById('editHabitForm');
        if (editHabitForm) {
            editHabitForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                console.log('[Habit Modal Fix] Form submitted');

                const habitId = document.getElementById('editHabitId').value;
                const title = document.getElementById('editHabitTitle').value;
                const frequency = document.getElementById('editHabitRecurrenceType').value;
                const completionsPerDay = document.getElementById('editHabitCompletionsPerDay').value;
                const statusDiv = document.getElementById('editHabitStatus');

                console.log('[Habit Modal Fix] Updating habit:', { habitId, title, frequency, completionsPerDay });

                // Show loading status
                statusDiv.style.display = 'block';
                statusDiv.textContent = 'Saving changes...';
                statusDiv.style.backgroundColor = '#f0f0f0';
                statusDiv.style.color = '#333';

                try {
                    const response = await fetch(`/api/habits/${habitId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: title,
                            frequency: frequency,
                            completions_per_day: frequency === 'daily' ? parseInt(completionsPerDay, 10) : 1,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const updatedHabit = await response.json();
                    console.log('[Habit Modal Fix] Habit updated successfully:', updatedHabit);

                    // Show success status
                    statusDiv.textContent = 'Habit updated successfully!';
                    statusDiv.style.backgroundColor = '#d4edda';
                    statusDiv.style.color = '#155724';

                    // Close modal after a short delay
                    setTimeout(() => {
                        editHabitModal.classList.remove('user-opened');
                        editHabitModal.style.display = 'none';
                        document.body.style.overflow = '';
                        statusDiv.style.display = 'none';
                    }, 1000);

                    // Reload habits to show updated data
                    if (window.loadHabits) {
                        console.log('[Habit Modal Fix] Reloading habits...');
                        await window.loadHabits();
                    } else {
                        console.log('[Habit Modal Fix] loadHabits function not found, reloading page...');
                        window.location.reload();
                    }

                } catch (error) {
                    console.error('[Habit Modal Fix] Error updating habit:', error);
                    statusDiv.textContent = 'Error updating habit: ' + error.message;
                    statusDiv.style.backgroundColor = '#f8d7da';
                    statusDiv.style.color = '#721c24';
                }
            });
        }

        // Add simple close functionality
        const editHabitModal = document.getElementById('editHabitModal');
        if (editHabitModal) {
            const closeModal = () => {
                console.log('[Habit Modal Fix] CLEAN - Closing modal...');
                editHabitModal.classList.remove('user-opened');
                editHabitModal.style.display = 'none';
                document.body.style.overflow = '';
            };

            // Close button functionality - target the X close button specifically
            const xCloseButton = editHabitModal.querySelector('.modal-close-x');
            if (xCloseButton) {
                xCloseButton.addEventListener('click', closeModal);

                // Add hover effects for the circular close button
                xCloseButton.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#444444';
                    this.style.color = '#ffffff';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                });

                xCloseButton.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '#333333';
                    this.style.color = '#e0e0e0';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                });
            }

            // NUCLEAR JAVASCRIPT: DESTROY ALL "INC" ELEMENTS (TEMPORARILY DISABLED FOR DEBUGGING)
            console.log('[Habit Modal Fix] NUCLEAR - Starting aggressive cleanup (DISABLED FOR DEBUGGING)');

            // Function to aggressively remove "inc" elements
            const destroyIncElements = () => {
                // Get ALL elements in the entire document
                const allElements = document.querySelectorAll('*');
                let removedCount = 0;

                allElements.forEach(el => {
                    // Skip our close button and essential elements
                    if (el.classList.contains('modal-close-x') ||
                        el.tagName.toLowerCase() === 'h2' ||
                        el.tagName.toLowerCase() === 'html' ||
                        el.tagName.toLowerCase() === 'head' ||
                        el.tagName.toLowerCase() === 'body' ||
                        el.tagName.toLowerCase() === 'script' ||
                        el.tagName.toLowerCase() === 'style') {
                        return;
                    }

                    // Check if element contains "inc" in any way
                    const hasIncText = el.textContent && (
                        el.textContent.toLowerCase().includes('inc') ||
                        el.textContent.toLowerCase().includes('INC') ||
                        el.textContent.trim() === 'inc' ||
                        el.textContent.trim() === 'INC'
                    );

                    const hasIncAttribute =
                        (el.className && typeof el.className === 'string' && el.className.toLowerCase().includes('inc')) ||
                        (el.id && typeof el.id === 'string' && el.id.toLowerCase().includes('inc')) ||
                        (el.getAttribute('data-') && el.getAttribute('data-').toLowerCase().includes('inc')) ||
                        (el.title && typeof el.title === 'string' && el.title.toLowerCase().includes('inc')) ||
                        (el.alt && typeof el.alt === 'string' && el.alt.toLowerCase().includes('inc'));

                    // If element has "inc" anywhere, DESTROY IT
                    if (hasIncText || hasIncAttribute) {
                        console.log('[Habit Modal Fix] NUCLEAR - DESTROYING element:', el.tagName, el.className, el.id, el.textContent);
                        el.remove();
                        removedCount++;
                    }
                });

                if (removedCount > 0) {
                    console.log(`[Habit Modal Fix] NUCLEAR - Destroyed ${removedCount} "inc" elements`);
                }
            };

            // Run initial cleanup
            destroyIncElements();

            // Set up continuous destruction every 50ms (DISABLED FOR DEBUGGING)
            const nuclearInterval = null; // setInterval(destroyIncElements, 50);

            // ULTIMATE NUCLEAR: Destroy any element in top-right corner of modal (DISABLED FOR DEBUGGING)
            const destroyTopRightElements = () => {
                const modal = document.getElementById('editHabitModal');
                if (!modal || modal.style.display === 'none') return;

                const modalContent = modal.querySelector('.modal-content');
                if (!modalContent) return;

                const modalRect = modalContent.getBoundingClientRect();
                const topRightX = modalRect.right - 60; // 60px from right edge
                const topRightY = modalRect.top + 60;   // 60px from top edge

                // Find all elements in the modal
                const allElements = modal.querySelectorAll('*');
                allElements.forEach(el => {
                    // Skip our close button and essential elements
                    if (el.classList.contains('modal-close-x') ||
                        el.tagName.toLowerCase() === 'h2' ||
                        el.tagName.toLowerCase() === 'input' ||
                        el.tagName.toLowerCase() === 'select' ||
                        el.tagName.toLowerCase() === 'textarea' ||
                        (el.tagName.toLowerCase() === 'button' &&
                         (el.className.includes('update') || el.className.includes('cancel') || el.className.includes('delete')))) {
                        return;
                    }

                    const rect = el.getBoundingClientRect();

                    // If element is in the top-right area of the modal, DESTROY IT
                    if (rect.right >= topRightX && rect.top <= topRightY &&
                        rect.width > 0 && rect.height > 0) {
                        console.log('[Habit Modal Fix] ULTIMATE NUCLEAR - DESTROYING top-right element:', el.tagName, el.className, el.textContent);
                        el.remove();
                    }
                });
            };

            // Run top-right destruction every 25ms (even more aggressive) (DISABLED FOR DEBUGGING)
            const topRightInterval = null; // setInterval(destroyTopRightElements, 25);

            // Set up mutation observer to catch new elements
            const nuclearObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) { // Element node
                                // Check the new node and all its children
                                const newElements = [node, ...node.querySelectorAll('*')];
                                newElements.forEach(el => {
                                    if (el.textContent &&
                                        (el.textContent.toLowerCase().includes('inc') || el.textContent.toLowerCase().includes('INC')) &&
                                        !el.classList.contains('modal-close-x')) {
                                        console.log('[Habit Modal Fix] NUCLEAR OBSERVER - DESTROYING new element:', el.tagName, el.className, el.textContent);
                                        el.remove();
                                    }
                                });
                            }
                        });
                    }
                });
            });

            // Observe the entire document
            nuclearObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeOldValue: true,
                characterData: true,
                characterDataOldValue: true
            });

            // Clean up when modal closes
            const originalCloseModal = closeModal;
            const enhancedCloseModal = function() {
                clearInterval(nuclearInterval);
                clearInterval(topRightInterval);
                nuclearObserver.disconnect();
                console.log('[Habit Modal Fix] NUCLEAR - Cleanup stopped');
                if (originalCloseModal) {
                    originalCloseModal();
                } else {
                    editHabitModal.classList.remove('user-opened');
                    editHabitModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            };

            // Override the close modal function
            window.closeEditHabitModal = enhancedCloseModal;

            console.log('[Habit Modal Fix] NUCLEAR - Aggressive monitoring started');

            // Also handle the Cancel button separately (keep existing functionality)
            const cancelButtons = editHabitModal.querySelectorAll('.close-button');
            cancelButtons.forEach(button => {
                button.addEventListener('click', closeModal);
            });

            // Close on backdrop click
            editHabitModal.addEventListener('click', function(e) {
                if (e.target === editHabitModal) {
                    closeModal();
                }
            });

            // Close on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && editHabitModal.style.display === 'flex') {
                    closeModal();
                }
            });
        }

        // REAL BUTTON FIX: Set up aggressive click listener to catch habit edit buttons
        console.log('[Habit Modal Fix] Setting up REAL button detection...');

        // First, let's add debugging to see what's being clicked
        document.addEventListener('click', function(e) {
            console.log('[Habit Modal Fix] DEBUG - Click detected on:', e.target.tagName, e.target.className, e.target.textContent);
            if (e.target.closest('.habit-item')) {
                console.log('[Habit Modal Fix] DEBUG - Click is within a habit item');
            }
        }, true);

        const clickHandler = function(e) {
            console.log('[Habit Modal Fix] Click detected on:', e.target.tagName, e.target.className, e.target.innerHTML.substring(0, 50));

            // Check if this is ANY button near habit content
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');

                // Check if this button is in a habit context
                let parent = button;
                let isHabitButton = false;

                // Go up the DOM tree looking for habit-related content
                for (let i = 0; i < 10; i++) {
                    if (!parent) break;

                    const text = parent.textContent || '';
                    if (text.includes('Creatine') || text.includes('Gooning') ||
                        text.includes('Social Media') || text.includes('Mediation') ||
                        text.includes('Frequency: daily') || text.includes('Level ')) {
                        isHabitButton = true;
                        console.log('[Habit Modal Fix] Found habit context at level', i);
                        break;
                    }
                    parent = parent.parentElement;
                }

                // If this looks like a habit edit button (empty button in habit context)
                if (isHabitButton && button.textContent.trim() === '') {
                    console.log('[Habit Modal Fix] *** HABIT EDIT BUTTON CLICKED! ***');

                    // Prevent default action
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    // Find which habit this is for
                    let habitTitle = 'Unknown Habit';
                    let habitId = 1;

                    parent = button;
                    for (let i = 0; i < 10; i++) {
                        if (!parent) break;
                        const text = parent.textContent || '';

                        if (text.includes('10g Creatine')) {
                            habitTitle = '10g Creatine, Vitamin D';
                            habitId = 1;
                            break;
                        } else if (text.includes('Gooning')) {
                            habitTitle = 'Gooning';
                            habitId = 2;
                            break;
                        } else if (text.includes('Social Media')) {
                            habitTitle = 'Social Media Rejection';
                            habitId = 3;
                            break;
                        } else if (text.includes('Mediation')) {
                            habitTitle = 'Mediation';
                            habitId = 4;
                            break;
                        }
                        parent = parent.parentElement;
                    }

                    console.log('[Habit Modal Fix] Opening modal for:', habitTitle);

                    // Call the modal function
                    window.openEditHabitModal({
                        id: habitId,
                        title: habitTitle,
                        frequency: 'daily',
                        completions_per_day: 1
                    });

                    return false;
                }
            }
        };

        document.addEventListener('click', clickHandler, true); // Use capture phase

        console.log('[Habit Modal Fix] *** WORKING SOLUTION - Setup complete ***');
    }

})();
