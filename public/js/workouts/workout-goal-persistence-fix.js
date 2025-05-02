/**
 * Workout Goal Persistence Fix
 * This script ensures that goal checkboxes are properly saved and restored when navigating between pages
 */

(function() {
    // Storage key for goal checkboxes state
    const GOAL_CHECKBOXES_KEY = 'workout_goal_checkboxes_state';
    
    // Function to save the state of all goal checkboxes
    function saveGoalCheckboxesState() {
        console.log('[Workout Goal Persistence] Saving goal checkboxes state...');
        
        // Get all goal checkboxes
        const goalCheckboxes = document.querySelectorAll('.goal-checkbox');
        if (!goalCheckboxes || goalCheckboxes.length === 0) {
            console.log('[Workout Goal Persistence] No goal checkboxes found to save');
            return;
        }
        
        // Create an object to store the state of each checkbox
        const checkboxesState = {};
        
        goalCheckboxes.forEach(checkbox => {
            // Get the exercise ID and set index from data attributes
            const exerciseId = checkbox.getAttribute('data-exercise-id');
            const setIndex = checkbox.getAttribute('data-set-index');
            
            if (exerciseId && setIndex) {
                // Create a unique key for this checkbox
                const key = `${exerciseId}-${setIndex}`;
                
                // Store the checked state
                checkboxesState[key] = checkbox.checked;
            }
        });
        
        // Save to localStorage
        localStorage.setItem(GOAL_CHECKBOXES_KEY, JSON.stringify(checkboxesState));
        console.log('[Workout Goal Persistence] Saved goal checkboxes state:', checkboxesState);
    }
    
    // Function to restore the state of all goal checkboxes
    function restoreGoalCheckboxesState() {
        console.log('[Workout Goal Persistence] Restoring goal checkboxes state...');
        
        // Get the saved state from localStorage
        const savedState = localStorage.getItem(GOAL_CHECKBOXES_KEY);
        if (!savedState) {
            console.log('[Workout Goal Persistence] No saved goal checkboxes state found');
            return;
        }
        
        // Parse the saved state
        const checkboxesState = JSON.parse(savedState);
        
        // Get all goal checkboxes
        const goalCheckboxes = document.querySelectorAll('.goal-checkbox');
        if (!goalCheckboxes || goalCheckboxes.length === 0) {
            console.log('[Workout Goal Persistence] No goal checkboxes found to restore');
            return;
        }
        
        // Restore the state of each checkbox
        goalCheckboxes.forEach(checkbox => {
            // Get the exercise ID and set index from data attributes
            const exerciseId = checkbox.getAttribute('data-exercise-id');
            const setIndex = checkbox.getAttribute('data-set-index');
            
            if (exerciseId && setIndex) {
                // Create a unique key for this checkbox
                const key = `${exerciseId}-${setIndex}`;
                
                // Restore the checked state if it exists in the saved state
                if (checkboxesState.hasOwnProperty(key)) {
                    checkbox.checked = checkboxesState[key];
                    
                    // If the checkbox is checked, add the 'completed' class
                    if (checkbox.checked) {
                        checkbox.classList.add('completed');
                    } else {
                        checkbox.classList.remove('completed');
                    }
                }
            }
        });
        
        console.log('[Workout Goal Persistence] Restored goal checkboxes state');
    }
    
    // Function to add event listeners to goal checkboxes
    function addGoalCheckboxListeners() {
        console.log('[Workout Goal Persistence] Adding goal checkbox listeners...');
        
        // Get all goal checkboxes
        const goalCheckboxes = document.querySelectorAll('.goal-checkbox');
        if (!goalCheckboxes || goalCheckboxes.length === 0) {
            console.log('[Workout Goal Persistence] No goal checkboxes found to add listeners to');
            return;
        }
        
        // Add change event listener to each checkbox
        goalCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // Save the state when a checkbox is changed
                saveGoalCheckboxesState();
                
                // Update the 'completed' class
                if (checkbox.checked) {
                    checkbox.classList.add('completed');
                } else {
                    checkbox.classList.remove('completed');
                }
            });
        });
        
        console.log('[Workout Goal Persistence] Added goal checkbox listeners');
    }
    
    // Function to set up a MutationObserver to detect when goal checkboxes are added to the DOM
    function setupGoalCheckboxObserver() {
        console.log('[Workout Goal Persistence] Setting up goal checkbox observer...');
        
        // Get the exercise list element
        const exerciseList = document.getElementById('current-exercise-list');
        if (!exerciseList) {
            console.log('[Workout Goal Persistence] Exercise list not found');
            return;
        }
        
        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(function(mutations) {
            // Check if any mutations affected the exercise list
            const shouldAddListeners = mutations.some(mutation => {
                // Check if nodes were added to the exercise list
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    return true;
                }
                
                return false;
            });
            
            // If relevant changes were detected, add listeners to goal checkboxes
            if (shouldAddListeners) {
                // Wait a moment for the DOM to settle
                setTimeout(() => {
                    addGoalCheckboxListeners();
                    restoreGoalCheckboxesState();
                }, 300);
            }
        });
        
        // Start observing the exercise list
        observer.observe(exerciseList, {
            childList: true,
            subtree: true
        });
        
        console.log('[Workout Goal Persistence] Set up goal checkbox observer');
    }
    
    // Function to add event listeners to navigation links
    function addNavigationListeners() {
        console.log('[Workout Goal Persistence] Adding navigation listeners...');
        
        // Add event listeners to all navigation links
        document.querySelectorAll('.sidebar-nav-item, .nav-item').forEach(link => {
            link.addEventListener('click', () => {
                // Save the goal checkboxes state when navigating away
                saveGoalCheckboxesState();
            });
        });
        
        // Save data when the page visibility changes (app is swiped away)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                console.log('[Workout Goal Persistence] Page visibility changed to hidden, saving goal checkboxes state');
                saveGoalCheckboxesState();
            } else if (document.visibilityState === 'visible') {
                console.log('[Workout Goal Persistence] Page visibility changed to visible, restoring goal checkboxes state');
                // Wait a moment for the DOM to settle
                setTimeout(() => {
                    restoreGoalCheckboxesState();
                }, 300);
            }
        });
        
        // Save data when navigating away from the page
        window.addEventListener('beforeunload', () => {
            saveGoalCheckboxesState();
        });
        
        console.log('[Workout Goal Persistence] Added navigation listeners');
    }
    
    // Initialize the module
    function init() {
        console.log('[Workout Goal Persistence] Initializing...');
        
        // Add event listeners to navigation links
        addNavigationListeners();
        
        // Set up the MutationObserver
        setupGoalCheckboxObserver();
        
        // Add event listeners to existing goal checkboxes
        addGoalCheckboxListeners();
        
        // Restore the state of goal checkboxes
        setTimeout(() => {
            restoreGoalCheckboxesState();
        }, 500);
        
        console.log('[Workout Goal Persistence] Initialized');
    }
    
    // Run when the DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
    
    // Export functions to window
    window.saveGoalCheckboxesState = saveGoalCheckboxesState;
    window.restoreGoalCheckboxesState = restoreGoalCheckboxesState;
})();
