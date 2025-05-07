/**
 * Workout Goal Persistence Fix
 * This script ensures that goal checkboxes are properly saved and restored when navigating between pages
 */

(function() {

    const GOAL_CHECKBOXES_KEY = 'workout_goal_checkboxes_state';

    function saveGoalCheckboxesState() {
        console.log('[Workout Goal Persistence] Saving goal checkboxes state...');

        const goalCheckboxes = document.querySelectorAll('.goal-checkbox');
        if (!goalCheckboxes || goalCheckboxes.length === 0) {
            console.log('[Workout Goal Persistence] No goal checkboxes found to save');
            return;
        }

        const checkboxesState = {};
        
        goalCheckboxes.forEach(checkbox => {

            const exerciseId = checkbox.getAttribute('data-exercise-id');
            const setIndex = checkbox.getAttribute('data-set-index');
            
            if (exerciseId && setIndex) {

                const key = `${exerciseId}-${setIndex}`;

                checkboxesState[key] = checkbox.checked;
            }
        });

        localStorage.setItem(GOAL_CHECKBOXES_KEY, JSON.stringify(checkboxesState));
        console.log('[Workout Goal Persistence] Saved goal checkboxes state:', checkboxesState);
    }

    function restoreGoalCheckboxesState() {
        console.log('[Workout Goal Persistence] Restoring goal checkboxes state...');

        const savedState = localStorage.getItem(GOAL_CHECKBOXES_KEY);
        if (!savedState) {
            console.log('[Workout Goal Persistence] No saved goal checkboxes state found');
            return;
        }

        const checkboxesState = JSON.parse(savedState);

        const goalCheckboxes = document.querySelectorAll('.goal-checkbox');
        if (!goalCheckboxes || goalCheckboxes.length === 0) {
            console.log('[Workout Goal Persistence] No goal checkboxes found to restore');
            return;
        }

        goalCheckboxes.forEach(checkbox => {

            const exerciseId = checkbox.getAttribute('data-exercise-id');
            const setIndex = checkbox.getAttribute('data-set-index');
            
            if (exerciseId && setIndex) {

                const key = `${exerciseId}-${setIndex}`;

                if (checkboxesState.hasOwnProperty(key)) {
                    checkbox.checked = checkboxesState[key];

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

    function addGoalCheckboxListeners() {
        console.log('[Workout Goal Persistence] Adding goal checkbox listeners...');

        const goalCheckboxes = document.querySelectorAll('.goal-checkbox');
        if (!goalCheckboxes || goalCheckboxes.length === 0) {
            console.log('[Workout Goal Persistence] No goal checkboxes found to add listeners to');
            return;
        }

        goalCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {

                saveGoalCheckboxesState();

                if (checkbox.checked) {
                    checkbox.classList.add('completed');
                } else {
                    checkbox.classList.remove('completed');
                }
            });
        });
        
        console.log('[Workout Goal Persistence] Added goal checkbox listeners');
    }

    function setupGoalCheckboxObserver() {
        console.log('[Workout Goal Persistence] Setting up goal checkbox observer...');

        const exerciseList = document.getElementById('current-exercise-list');
        if (!exerciseList) {
            console.log('[Workout Goal Persistence] Exercise list not found');
            return;
        }

        const observer = new MutationObserver(function(mutations) {

            const shouldAddListeners = mutations.some(mutation => {

                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    return true;
                }
                
                return false;
            });

            if (shouldAddListeners) {

                setTimeout(() => {
                    addGoalCheckboxListeners();
                    restoreGoalCheckboxesState();
                }, 300);
            }
        });

        observer.observe(exerciseList, {
            childList: true,
            subtree: true
        });
        
        console.log('[Workout Goal Persistence] Set up goal checkbox observer');
    }

    function addNavigationListeners() {
        console.log('[Workout Goal Persistence] Adding navigation listeners...');

        document.querySelectorAll('.sidebar-nav-item, .nav-item').forEach(link => {
            link.addEventListener('click', () => {

                saveGoalCheckboxesState();
            });
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                console.log('[Workout Goal Persistence] Page visibility changed to hidden, saving goal checkboxes state');
                saveGoalCheckboxesState();
            } else if (document.visibilityState === 'visible') {
                console.log('[Workout Goal Persistence] Page visibility changed to visible, restoring goal checkboxes state');

                setTimeout(() => {
                    restoreGoalCheckboxesState();
                }, 300);
            }
        });

        window.addEventListener('beforeunload', () => {
            saveGoalCheckboxesState();
        });
        
        console.log('[Workout Goal Persistence] Added navigation listeners');
    }

    function init() {
        console.log('[Workout Goal Persistence] Initializing...');

        addNavigationListeners();

        setupGoalCheckboxObserver();

        addGoalCheckboxListeners();

        setTimeout(() => {
            restoreGoalCheckboxesState();
        }, 500);
        
        console.log('[Workout Goal Persistence] Initialized');
    }

    document.addEventListener('DOMContentLoaded', init);

    window.saveGoalCheckboxesState = saveGoalCheckboxesState;
    window.restoreGoalCheckboxesState = restoreGoalCheckboxesState;
})();
