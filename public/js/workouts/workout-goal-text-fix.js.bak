/**
 * Workout Goal Text Fix
 * This script ensures that goal text is properly saved and restored when navigating between pages
 */

(function() {
    // Storage key for goal text
    const GOAL_TEXT_KEY = 'workout_goal_text_state';
    
    // Function to save the goal text for all exercises
    function saveGoalTextState() {
        console.log('[Workout Goal Text Fix] Saving goal text state...');
        
        // Get all goal text spans
        const goalTextSpans = document.querySelectorAll('.goal-target');
        if (!goalTextSpans || goalTextSpans.length === 0) {
            console.log('[Workout Goal Text Fix] No goal text spans found to save');
            return;
        }
        
        // Create an object to store the text of each goal
        const goalTextState = {};
        
        goalTextSpans.forEach((span, index) => {
            // Find the parent set row
            const setRow = span.closest('.set-row');
            if (!setRow) return;
            
            // Get the exercise item
            const exerciseItem = setRow.closest('.exercise-item');
            if (!exerciseItem) return;
            
            // Get the exercise index
            const exerciseIndex = Array.from(document.querySelectorAll('.exercise-item')).indexOf(exerciseItem);
            if (exerciseIndex === -1) return;
            
            // Get the set index
            const setIndex = Array.from(exerciseItem.querySelectorAll('.set-row')).indexOf(setRow);
            if (setIndex === -1) return;
            
            // Create a unique key for this goal text
            const key = `${exerciseIndex}-${setIndex}`;
            
            // Store the goal text
            goalTextState[key] = span.textContent;
        });
        
        // Save to localStorage
        localStorage.setItem(GOAL_TEXT_KEY, JSON.stringify(goalTextState));
        console.log('[Workout Goal Text Fix] Saved goal text state:', goalTextState);
    }
    
    // Function to restore the goal text for all exercises
    function restoreGoalTextState() {
        console.log('[Workout Goal Text Fix] Restoring goal text state...');
        
        // Get the saved state from localStorage
        const savedState = localStorage.getItem(GOAL_TEXT_KEY);
        if (!savedState) {
            console.log('[Workout Goal Text Fix] No saved goal text state found');
            return;
        }
        
        // Parse the saved state
        const goalTextState = JSON.parse(savedState);
        
        // Get all exercise items
        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems || exerciseItems.length === 0) {
            console.log('[Workout Goal Text Fix] No exercise items found to restore');
            return;
        }
        
        // Restore the goal text for each exercise
        exerciseItems.forEach((exerciseItem, exerciseIndex) => {
            // Get all set rows for this exercise
            const setRows = exerciseItem.querySelectorAll('.set-row');
            
            // Restore the goal text for each set
            setRows.forEach((setRow, setIndex) => {
                // Get the goal text span
                const goalTextSpan = setRow.querySelector('.goal-target');
                if (!goalTextSpan) return;
                
                // Create the key for this goal text
                const key = `${exerciseIndex}-${setIndex}`;
                
                // Restore the goal text if it exists
                if (goalTextState[key]) {
                    goalTextSpan.textContent = goalTextState[key];
                }
            });
        });
        
        console.log('[Workout Goal Text Fix] Restored goal text state');
    }
    
    // Function to add event listeners to navigation links
    function addNavigationListeners() {
        console.log('[Workout Goal Text Fix] Adding navigation listeners...');
        
        // Add event listeners to all navigation links
        document.querySelectorAll('a').forEach(link => {
            // Skip links that don't navigate away from the page
            if (link.getAttribute('href') === '#' || link.getAttribute('href') === 'javascript:void(0)') {
                return;
            }
            
            // Add click event listener
            link.addEventListener('click', () => {
                console.log('[Workout Goal Text Fix] Navigation link clicked, saving goal text state');
                saveGoalTextState();
            });
        });
        
        // Save data when the page visibility changes (app is swiped away)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                console.log('[Workout Goal Text Fix] Page visibility changed to hidden, saving goal text state');
                saveGoalTextState();
            } else if (document.visibilityState === 'visible') {
                console.log('[Workout Goal Text Fix] Page visibility changed to visible, restoring goal text state');
                // Wait a moment for the DOM to settle
                setTimeout(() => {
                    restoreGoalTextState();
                }, 300);
            }
        });
        
        // Save data when navigating away from the page
        window.addEventListener('beforeunload', () => {
            saveGoalTextState();
        });
        
        console.log('[Workout Goal Text Fix] Added navigation listeners');
    }
    
    // Function to set up a MutationObserver to detect when new goal text spans are added to the DOM
    function setupGoalTextObserver() {
        console.log('[Workout Goal Text Fix] Setting up MutationObserver...');
        
        // Get the exercise list element
        const exerciseListEl = document.getElementById('current-exercise-list');
        if (!exerciseListEl) {
            console.log('[Workout Goal Text Fix] Exercise list element not found');
            return;
        }
        
        // Create a MutationObserver to detect when new goal text spans are added
        const observer = new MutationObserver((mutations) => {
            let shouldRestore = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1 && (
                            node.classList.contains('exercise-item') || 
                            node.querySelector('.exercise-item')
                        )) {
                            shouldRestore = true;
                            break;
                        }
                    }
                }
            });
            
            if (shouldRestore) {
                // Wait a moment for the DOM to settle
                setTimeout(() => {
                    restoreGoalTextState();
                }, 500);
            }
        });
        
        // Start observing the exercise list
        observer.observe(exerciseListEl, { 
            childList: true,
            subtree: true
        });
        
        console.log('[Workout Goal Text Fix] MutationObserver set up');
    }
    
    // Initialize the module
    function init() {
        console.log('[Workout Goal Text Fix] Initializing...');
        
        // Add event listeners to navigation links
        addNavigationListeners();
        
        // Set up the MutationObserver
        setupGoalTextObserver();
        
        // Restore the goal text state
        setTimeout(() => {
            restoreGoalTextState();
        }, 500);
        
        // Make functions available globally
        window.saveGoalTextState = saveGoalTextState;
        window.restoreGoalTextState = restoreGoalTextState;
        
        console.log('[Workout Goal Text Fix] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
