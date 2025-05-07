/**
 * Workout Goal Text Fix
 * This script ensures that goal text is properly saved and restored when navigating between pages
 */

(function() {

    const GOAL_TEXT_KEY = 'workout_goal_text_state';

    function saveGoalTextState() {
        console.log('[Workout Goal Text Fix] Saving goal text state...');

        const goalTextSpans = document.querySelectorAll('.goal-target');
        if (!goalTextSpans || goalTextSpans.length === 0) {
            console.log('[Workout Goal Text Fix] No goal text spans found to save');
            return;
        }

        const goalTextState = {};
        
        goalTextSpans.forEach((span, index) => {

            const setRow = span.closest('.set-row');
            if (!setRow) return;

            const exerciseItem = setRow.closest('.exercise-item');
            if (!exerciseItem) return;

            const exerciseIndex = Array.from(document.querySelectorAll('.exercise-item')).indexOf(exerciseItem);
            if (exerciseIndex === -1) return;

            const setIndex = Array.from(exerciseItem.querySelectorAll('.set-row')).indexOf(setRow);
            if (setIndex === -1) return;

            const key = `${exerciseIndex}-${setIndex}`;

            goalTextState[key] = span.textContent;
        });

        localStorage.setItem(GOAL_TEXT_KEY, JSON.stringify(goalTextState));
        console.log('[Workout Goal Text Fix] Saved goal text state:', goalTextState);
    }

    function restoreGoalTextState() {
        console.log('[Workout Goal Text Fix] Restoring goal text state...');

        const savedState = localStorage.getItem(GOAL_TEXT_KEY);
        if (!savedState) {
            console.log('[Workout Goal Text Fix] No saved goal text state found');
            return;
        }

        const goalTextState = JSON.parse(savedState);

        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (!exerciseItems || exerciseItems.length === 0) {
            console.log('[Workout Goal Text Fix] No exercise items found to restore');
            return;
        }

        exerciseItems.forEach((exerciseItem, exerciseIndex) => {

            const setRows = exerciseItem.querySelectorAll('.set-row');

            setRows.forEach((setRow, setIndex) => {

                const goalTextSpan = setRow.querySelector('.goal-target');
                if (!goalTextSpan) return;

                const key = `${exerciseIndex}-${setIndex}`;

                if (goalTextState[key]) {
                    goalTextSpan.textContent = goalTextState[key];
                }
            });
        });
        
        console.log('[Workout Goal Text Fix] Restored goal text state');
    }

    function addNavigationListeners() {
        console.log('[Workout Goal Text Fix] Adding navigation listeners...');

        document.querySelectorAll('a').forEach(link => {

            if (link.getAttribute('href') === '#' || link.getAttribute('href') === 'javascript:void(0)') {
                return;
            }

            link.addEventListener('click', () => {
                console.log('[Workout Goal Text Fix] Navigation link clicked, saving goal text state');
                saveGoalTextState();
            });
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                console.log('[Workout Goal Text Fix] Page visibility changed to hidden, saving goal text state');
                saveGoalTextState();
            } else if (document.visibilityState === 'visible') {
                console.log('[Workout Goal Text Fix] Page visibility changed to visible, restoring goal text state');

                setTimeout(() => {
                    restoreGoalTextState();
                }, 300);
            }
        });

        window.addEventListener('beforeunload', () => {
            saveGoalTextState();
        });
        
        console.log('[Workout Goal Text Fix] Added navigation listeners');
    }

    function setupGoalTextObserver() {
        console.log('[Workout Goal Text Fix] Setting up MutationObserver...');

        const exerciseListEl = document.getElementById('current-exercise-list');
        if (!exerciseListEl) {
            console.log('[Workout Goal Text Fix] Exercise list element not found');
            return;
        }

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

                setTimeout(() => {
                    restoreGoalTextState();
                }, 500);
            }
        });

        observer.observe(exerciseListEl, { 
            childList: true,
            subtree: true
        });
        
        console.log('[Workout Goal Text Fix] MutationObserver set up');
    }

    function init() {
        console.log('[Workout Goal Text Fix] Initializing...');

        addNavigationListeners();

        setupGoalTextObserver();

        setTimeout(() => {
            restoreGoalTextState();
        }, 500);

        window.saveGoalTextState = saveGoalTextState;
        window.restoreGoalTextState = restoreGoalTextState;
        
        console.log('[Workout Goal Text Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
