/**
 * Enhanced Auto-Save Functionality for Workout Tracker
 * This module provides robust auto-save functionality to prevent data loss
 * when the app is swiped away or closed unexpectedly.
 */

const AUTO_SAVE = {

    INTERVAL: 5000,

    DEBOUNCE: 1000,

    LAST_SAVE_KEY: 'workout_tracker_last_save',

    isRestoring: false,

    isActive: false,

    timer: null,

    lastSave: 0,

    changedInputs: new Set(),

    saveFunction: null
};

/**
 * Initialize the auto-save functionality
 */
function initAutoSave() {
    console.log('[Auto-Save] Initializing auto-save functionality');

    AUTO_SAVE.saveFunction = typeof saveWorkoutData === 'function' ? saveWorkoutData : saveInputValues;

    const lastSaveStr = localStorage.getItem(AUTO_SAVE.LAST_SAVE_KEY);
    if (lastSaveStr) {
        AUTO_SAVE.lastSave = parseInt(lastSaveStr, 10);
    }

    addInputChangeListeners();

    addVisibilityListeners();

    startAutoSaveTimer();

    addFormSubmitListeners();

    addTouchEventListeners();

    window.performAutoSave = performAutoSave;
    window.startAutoSaveTimer = startAutoSaveTimer;
    window.stopAutoSaveTimer = stopAutoSaveTimer;
}

/**
 * Add event listeners for input changes
 */
function addInputChangeListeners() {

    const exerciseListEl = document.getElementById('current-exercise-list');
    if (!exerciseListEl) {
        console.error('[Auto-Save] Exercise list element not found');
        return;
    }

    exerciseListEl.addEventListener('input', handleInputChange);
    exerciseListEl.addEventListener('change', handleInputChange);

    exerciseListEl.addEventListener('click', (event) => {
        if (event.target.classList.contains('set-complete-toggle')) {

            AUTO_SAVE.changedInputs.add(event.target);
            scheduleAutoSave();
        }
    });
    
    console.log('[Auto-Save] Added input change listeners');
}

/**
 * Handle input change events
 * @param {Event} event - The input change event
 */
function handleInputChange(event) {

    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.tagName === 'SELECT') {

        AUTO_SAVE.changedInputs.add(event.target);
        scheduleAutoSave();
    }
}

/**
 * Add event listeners for page visibility and app state changes
 */
function addVisibilityListeners() {

    document.addEventListener('visibilitychange', () => {
        console.log(`[Auto-Save] Visibility changed to: ${document.visibilityState}`);
        if (document.visibilityState === 'hidden') {

            performAutoSave(true);
        } else if (document.visibilityState === 'visible') {

            startAutoSaveTimer();
        }
    });

    window.addEventListener('beforeunload', () => {
        console.log('[Auto-Save] Page unloading, performing final save');
        performAutoSave(true);

        const start = Date.now();
        while (Date.now() - start < 200) {

        }
    });

    document.addEventListener('pause', () => {
        console.log('[Auto-Save] App paused, performing save');
        performAutoSave(true);
    });

    document.addEventListener('resume', () => {
        console.log('[Auto-Save] App resumed, restarting auto-save timer');
        startAutoSaveTimer();
    });
    
    console.log('[Auto-Save] Added visibility and app state listeners');
}

/**
 * Add event listeners for form submissions
 */
function addFormSubmitListeners() {

    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', () => {
            console.log('[Auto-Save] Form submitted, performing save');
            performAutoSave(true);
        });
    });
    
    console.log('[Auto-Save] Added form submit listeners');
}

/**
 * Add event listeners for touch events (for mobile)
 */
function addTouchEventListeners() {

    let touchStartTime = 0;

    document.addEventListener('touchstart', () => {
        touchStartTime = Date.now();
    });

    document.addEventListener('touchend', () => {

        if (Date.now() - touchStartTime > 500) {
            console.log('[Auto-Save] Long touch detected, performing save');
            performAutoSave();
        }
    });
    
    console.log('[Auto-Save] Added touch event listeners');
}

/**
 * Start the auto-save timer
 */
function startAutoSaveTimer() {

    stopAutoSaveTimer();

    AUTO_SAVE.timer = setInterval(() => {

        if (document.visibilityState === 'visible' && !AUTO_SAVE.isRestoring) {
            performAutoSave();
        }
    }, AUTO_SAVE.INTERVAL);
    
    AUTO_SAVE.isActive = true;
    console.log('[Auto-Save] Auto-save timer started');
}

/**
 * Stop the auto-save timer
 */
function stopAutoSaveTimer() {
    if (AUTO_SAVE.timer) {
        clearInterval(AUTO_SAVE.timer);
        AUTO_SAVE.timer = null;
        AUTO_SAVE.isActive = false;
        console.log('[Auto-Save] Auto-save timer stopped');
    }
}

/**
 * Schedule an auto-save operation with debouncing
 */
function scheduleAutoSave() {

    const now = Date.now();
    if (now - AUTO_SAVE.lastSave < AUTO_SAVE.DEBOUNCE) {

        return;
    }

    setTimeout(() => {
        performAutoSave();
    }, AUTO_SAVE.DEBOUNCE);
}

/**
 * Perform an auto-save operation
 * @param {boolean} force - Whether to force a save regardless of debounce
 */
function performAutoSave(force = false) {

    if (currentPage !== 'active') {
        console.log('[Auto-Save] Not in active workout page, skipping save');
        return;
    }

    const now = Date.now();
    if (!force && now - AUTO_SAVE.lastSave < AUTO_SAVE.DEBOUNCE) {
        console.log('[Auto-Save] Debouncing save operation');
        return;
    }

    if (!force && AUTO_SAVE.changedInputs.size === 0) {
        console.log('[Auto-Save] No changed inputs, skipping save');
        return;
    }
    
    console.log(`[Auto-Save] Performing auto-save (force=${force}, changedInputs=${AUTO_SAVE.changedInputs.size})`);
    
    try {

        if (typeof updateWeightUnitsFromUI === 'function') {
            updateWeightUnitsFromUI();
        }

        if (typeof updateSetCountsFromUI === 'function') {
            updateSetCountsFromUI();
        }

        if (typeof saveWorkoutState === 'function') {
            saveWorkoutState();
        }

        AUTO_SAVE.saveFunction();

        AUTO_SAVE.lastSave = now;
        localStorage.setItem(AUTO_SAVE.LAST_SAVE_KEY, now.toString());

        AUTO_SAVE.changedInputs.clear();
        
        console.log('[Auto-Save] Auto-save completed successfully');
    } catch (error) {
        console.error('[Auto-Save] Error during auto-save:', error);
    }
}

document.addEventListener('DOMContentLoaded', initAutoSave);
