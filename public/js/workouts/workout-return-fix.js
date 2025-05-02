/**
 * Workout Return Fix
 * This script ensures that when returning to the workouts page from another page,
 * the user is automatically taken back to their active workout if one exists.
 */

(function() {
    // Storage keys
    const STORAGE_KEYS = {
        CURRENT_WORKOUT: 'workout_tracker_current_workout',
        CURRENT_PAGE: 'workout_tracker_current_page',
        WORKOUT_START_TIME: 'workout_tracker_start_time',
        WORKOUT_DATA: 'workout_tracker_data'
    };

    // Function to check if there's an active workout and redirect to it
    function checkForActiveWorkoutAndRedirect() {
        console.log('[Workout Return Fix] Checking for active workout...');

        // Check if we have a saved workout
        const savedWorkout = localStorage.getItem(STORAGE_KEYS.CURRENT_WORKOUT);
        const savedPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);

        if (savedWorkout && savedPage === 'active') {
            console.log('[Workout Return Fix] Found active workout, redirecting...');

            // Wait for the page to fully load and the workout module to initialize
            setTimeout(() => {
                try {
                    // Parse the saved workout
                    const workoutData = JSON.parse(savedWorkout);

                    // Make sure the workout data is properly loaded into the global currentWorkout variable
                    if (typeof window.currentWorkout !== 'undefined') {
                        window.currentWorkout = workoutData;
                        console.log('[Workout Return Fix] Updated currentWorkout with saved data');
                    }

                    // Make sure the workout name is displayed
                    const currentWorkoutNameEl = document.getElementById('current-workout-name');
                    if (currentWorkoutNameEl && workoutData.name) {
                        currentWorkoutNameEl.textContent = workoutData.name;
                        console.log('[Workout Return Fix] Updated workout name display');
                    }

                    // Restore the timer if needed
                    const savedStartTime = localStorage.getItem(STORAGE_KEYS.WORKOUT_START_TIME);
                    if (savedStartTime && typeof window.workoutStartTime !== 'undefined') {
                        window.workoutStartTime = parseInt(savedStartTime);
                        console.log('[Workout Return Fix] Restored workout start time');

                        // Update the timer display
                        const workoutTimerEl = document.getElementById('workout-timer');
                        if (workoutTimerEl && typeof window.updateTimer === 'function') {
                            window.updateTimer();
                            console.log('[Workout Return Fix] Updated timer display');
                        }
                    }

                    // Render the workout exercises if the function exists
                    if (typeof window.renderCurrentWorkout === 'function') {
                        console.log('[Workout Return Fix] Rendering current workout exercises');
                        window.renderCurrentWorkout();
                    } else {
                        console.log('[Workout Return Fix] renderCurrentWorkout function not found');
                    }

                    // Check if the switchPage function exists
                    if (typeof window.switchPage === 'function') {
                        console.log('[Workout Return Fix] Using global switchPage function');
                        window.switchPage('active');

                        // After switching to the active page, restore the workout data
                        setTimeout(() => {
                            if (typeof window.restoreWorkoutData === 'function') {
                                console.log('[Workout Return Fix] Restoring workout data');
                                window.restoreWorkoutData();
                            }
                        }, 500);
                    } else {
                        console.log('[Workout Return Fix] Looking for switchPage function in scope');

                        // Try to find the workout pages
                        const workoutLandingPage = document.getElementById('workout-landing-page');
                        const activeWorkoutPage = document.getElementById('active-workout-page');

                        if (workoutLandingPage && activeWorkoutPage) {
                            console.log('[Workout Return Fix] Found workout pages, switching manually');

                            // Hide landing page
                            workoutLandingPage.classList.remove('active');

                            // Show active workout page
                            activeWorkoutPage.classList.add('active');

                            // Show FAB if it exists
                            const addExerciseFab = document.getElementById('add-exercise-fab');
                            if (addExerciseFab) {
                                addExerciseFab.style.display = 'flex';
                            }

                            // Restore workout data if the function exists
                            if (typeof window.restoreWorkoutData === 'function') {
                                setTimeout(() => {
                                    window.restoreWorkoutData();
                                }, 500);
                            }
                        } else {
                            console.error('[Workout Return Fix] Could not find workout pages');
                        }
                    }
                } catch (error) {
                    console.error('[Workout Return Fix] Error processing workout data:', error);
                }
            }, 500); // Wait for page to load
        } else {
            console.log('[Workout Return Fix] No active workout found or not on active page');
        }
    }

    // Function to modify navigation links to preserve workout state
    function modifyNavigationLinks() {
        console.log('[Workout Return Fix] Modifying navigation links...');

        // Get all navigation links
        const navLinks = document.querySelectorAll('.sidebar-nav-item, .nav-item');

        navLinks.forEach(link => {
            // Skip the workouts link
            if (link.getAttribute('href')?.includes('workouts.html')) {
                return;
            }

            // Add a click event listener
            link.addEventListener('click', function(event) {
                // Check if we're on the active workout page
                const savedPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
                const savedWorkout = localStorage.getItem(STORAGE_KEYS.CURRENT_WORKOUT);

                if (savedPage === 'active' && savedWorkout) {
                    console.log('[Workout Return Fix] Navigating away from active workout, ensuring state is saved...');

                    // Ensure workout state is saved
                    if (typeof window.saveWorkoutData === 'function') {
                        window.saveWorkoutData();
                    }

                    // Make sure the current page is still set to 'active'
                    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, 'active');
                }
            });
        });
    }

    // Run when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Workout Return Fix] DOM loaded');

        // Check if we're on the workouts page
        if (window.location.pathname.includes('workouts.html')) {
            console.log('[Workout Return Fix] On workouts page, checking for active workout');
            checkForActiveWorkoutAndRedirect();
        }

        // Modify navigation links
        modifyNavigationLinks();
    });

    // Also run when the window is fully loaded
    window.addEventListener('load', function() {
        console.log('[Workout Return Fix] Window loaded');

        // Check if we're on the workouts page
        if (window.location.pathname.includes('workouts.html')) {
            console.log('[Workout Return Fix] On workouts page, checking for active workout');
            checkForActiveWorkoutAndRedirect();
        }

        // Modify navigation links
        modifyNavigationLinks();
    });
})();
