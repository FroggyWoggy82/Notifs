/**
 * Workout Return Fix
 * This script ensures that when returning to the workouts page from another page,
 * the user is automatically taken back to their active workout if one exists.
 */

(function() {

    const STORAGE_KEYS = {
        CURRENT_WORKOUT: 'workout_tracker_current_workout',
        CURRENT_PAGE: 'workout_tracker_current_page',
        WORKOUT_START_TIME: 'workout_tracker_start_time',
        WORKOUT_DATA: 'workout_tracker_data'
    };

    function checkForActiveWorkoutAndRedirect() {
        console.log('[Workout Return Fix] Checking for active workout...');

        const savedWorkout = localStorage.getItem(STORAGE_KEYS.CURRENT_WORKOUT);
        const savedPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);

        if (savedWorkout && savedPage === 'active') {
            console.log('[Workout Return Fix] Found active workout, redirecting...');

            setTimeout(() => {
                try {

                    const workoutData = JSON.parse(savedWorkout);

                    if (typeof window.currentWorkout !== 'undefined') {
                        window.currentWorkout = workoutData;
                        console.log('[Workout Return Fix] Updated currentWorkout with saved data');
                    }

                    const currentWorkoutNameEl = document.getElementById('current-workout-name');
                    if (currentWorkoutNameEl && workoutData.name) {
                        currentWorkoutNameEl.textContent = workoutData.name;
                        console.log('[Workout Return Fix] Updated workout name display');
                    }

                    const savedStartTime = localStorage.getItem(STORAGE_KEYS.WORKOUT_START_TIME);
                    if (savedStartTime && typeof window.workoutStartTime !== 'undefined') {
                        window.workoutStartTime = parseInt(savedStartTime);
                        console.log('[Workout Return Fix] Restored workout start time');

                        const workoutTimerEl = document.getElementById('workout-timer');
                        if (workoutTimerEl && typeof window.updateTimer === 'function') {
                            window.updateTimer();
                            console.log('[Workout Return Fix] Updated timer display');
                        }
                    }

                    if (typeof window.renderCurrentWorkout === 'function') {
                        console.log('[Workout Return Fix] Rendering current workout exercises');
                        window.renderCurrentWorkout();
                    } else {
                        console.log('[Workout Return Fix] renderCurrentWorkout function not found');
                    }

                    if (typeof window.switchPage === 'function') {
                        console.log('[Workout Return Fix] Using global switchPage function');
                        window.switchPage('active');

                        setTimeout(() => {
                            if (typeof window.restoreWorkoutData === 'function') {
                                console.log('[Workout Return Fix] Restoring workout data');
                                window.restoreWorkoutData();
                            }
                        }, 500);
                    } else {
                        console.log('[Workout Return Fix] Looking for switchPage function in scope');

                        const workoutLandingPage = document.getElementById('workout-landing-page');
                        const activeWorkoutPage = document.getElementById('active-workout-page');

                        if (workoutLandingPage && activeWorkoutPage) {
                            console.log('[Workout Return Fix] Found workout pages, switching manually');

                            workoutLandingPage.classList.remove('active');

                            activeWorkoutPage.classList.add('active');

                            const addExerciseFab = document.getElementById('add-exercise-fab');
                            if (addExerciseFab) {
                                addExerciseFab.style.display = 'flex';
                            }

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

    function modifyNavigationLinks() {
        console.log('[Workout Return Fix] Modifying navigation links...');

        const navLinks = document.querySelectorAll('.sidebar-nav-item, .nav-item');

        navLinks.forEach(link => {

            if (link.getAttribute('href')?.includes('workouts.html')) {
                return;
            }

            link.addEventListener('click', function(event) {

                const savedPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
                const savedWorkout = localStorage.getItem(STORAGE_KEYS.CURRENT_WORKOUT);

                if (savedPage === 'active' && savedWorkout) {
                    console.log('[Workout Return Fix] Navigating away from active workout, ensuring state is saved...');

                    if (typeof window.saveWorkoutData === 'function') {
                        window.saveWorkoutData();
                    }

                    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, 'active');
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Workout Return Fix] DOM loaded');

        if (window.location.pathname.includes('workouts.html')) {
            console.log('[Workout Return Fix] On workouts page, checking for active workout');
            checkForActiveWorkoutAndRedirect();
        }

        modifyNavigationLinks();
    });

    window.addEventListener('load', function() {
        console.log('[Workout Return Fix] Window loaded');

        if (window.location.pathname.includes('workouts.html')) {
            console.log('[Workout Return Fix] On workouts page, checking for active workout');
            checkForActiveWorkoutAndRedirect();
        }

        modifyNavigationLinks();
    });
})();
