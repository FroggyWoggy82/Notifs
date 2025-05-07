/**
 * Enhanced Auto-Save Functionality for Workout Tracker
 * This module provides robust auto-save functionality to prevent data loss
 * when the app is swiped away or closed unexpectedly.
 */

// Configuration
const AUTO_SAVE = {
    // Save interval in milliseconds (5 seconds)
    INTERVAL: 5000,
    
    // Minimum time between saves to prevent excessive saving
    DEBOUNCE: 1000,
    
    // Key for storing the last save timestamp
    LAST_SAVE_KEY: 'workout_tracker_last_save',
    
    // Flag to prevent saving during restoration
    isRestoring: false,
    
    // Flag to track if auto-save is active
    isActive: false,
    
    // Timer reference for interval
    timer: null,
    
    // Last save timestamp
    lastSave: 0,
    
    // Input change tracking
    changedInputs: new Set(),
    
    // Reference to the save function
    saveFunction: null
};

/**
 * Initialize the auto-save functionality
 */
function initAutoSave() {
    console.log('[Auto-Save] Initializing auto-save functionality');
    
    // Set the save function based on availability
    AUTO_SAVE.saveFunction = typeof saveWorkoutData === 'function' ? saveWorkoutData : saveInputValues;
    
    // Load the last save timestamp
    const lastSaveStr = localStorage.getItem(AUTO_SAVE.LAST_SAVE_KEY);
    if (lastSaveStr) {
        AUTO_SAVE.lastSave = parseInt(lastSaveStr, 10);
    }
    
    // Add event listeners for input changes
    addInputChangeListeners();
    
    // Add event listeners for page visibility and app state changes
    addVisibilityListeners();
    
    // Start the auto-save timer
    startAutoSaveTimer();
    
    // Add event listeners for form submissions
    addFormSubmitListeners();
    
    // Add event listeners for touch events (for mobile)
    addTouchEventListeners();
    
    // Export functions to window
    window.performAutoSave = performAutoSave;
    window.startAutoSaveTimer = startAutoSaveTimer;
    window.stopAutoSaveTimer = stopAutoSaveTimer;
}

/**
 * Add event listeners for input changes
 */
function addInputChangeListeners() {
    // Get the exercise list element
    const exerciseListEl = document.getElementById('current-exercise-list');
    if (!exerciseListEl) {
        console.error('[Auto-Save] Exercise list element not found');
        return;
    }
    
    // Use event delegation to catch all input changes
    exerciseListEl.addEventListener('input', handleInputChange);
    exerciseListEl.addEventListener('change', handleInputChange);
    
    // Also listen for clicks on set completion toggles
    exerciseListEl.addEventListener('click', (event) => {
        if (event.target.classList.contains('set-complete-toggle')) {
            // Mark as changed and schedule a save
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
    // Only process if the target is an input, textarea, or select
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.tagName === 'SELECT') {
        
        // Mark as changed and schedule a save
        AUTO_SAVE.changedInputs.add(event.target);
        scheduleAutoSave();
    }
}

/**
 * Add event listeners for page visibility and app state changes
 */
function addVisibilityListeners() {
    // Save when the page visibility changes (app is swiped away)
    document.addEventListener('visibilitychange', () => {
        console.log(`[Auto-Save] Visibility changed to: ${document.visibilityState}`);
        if (document.visibilityState === 'hidden') {
            // Force an immediate save when the page is hidden
            performAutoSave(true);
        } else if (document.visibilityState === 'visible') {
            // Restart the timer when the page becomes visible again
            startAutoSaveTimer();
        }
    });
    
    // Save when navigating away from the page
    window.addEventListener('beforeunload', () => {
        console.log('[Auto-Save] Page unloading, performing final save');
        performAutoSave(true);
        
        // Add a small delay to ensure the save completes
        const start = Date.now();
        while (Date.now() - start < 200) {
            // Busy wait to ensure the save completes
        }
    });
    
    // Save when the app is paused (mobile)
    document.addEventListener('pause', () => {
        console.log('[Auto-Save] App paused, performing save');
        performAutoSave(true);
    });
    
    // Save when the app is resumed (mobile)
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
    // Get all forms in the document
    const forms = document.querySelectorAll('form');
    
    // Add submit event listeners to all forms
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
    // Track touch start time
    let touchStartTime = 0;
    
    // Listen for touch start events
    document.addEventListener('touchstart', () => {
        touchStartTime = Date.now();
    });
    
    // Listen for touch end events
    document.addEventListener('touchend', () => {
        // If the touch lasted more than 500ms, it might be a swipe
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
    // Clear any existing timer
    stopAutoSaveTimer();
    
    // Start a new timer
    AUTO_SAVE.timer = setInterval(() => {
        // Only save if the page is visible and we're not restoring
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
    // Check if we need to debounce
    const now = Date.now();
    if (now - AUTO_SAVE.lastSave < AUTO_SAVE.DEBOUNCE) {
        // Too soon since last save, don't schedule another one yet
        return;
    }
    
    // Schedule a save operation
    setTimeout(() => {
        performAutoSave();
    }, AUTO_SAVE.DEBOUNCE);
}

/**
 * Perform an auto-save operation
 * @param {boolean} force - Whether to force a save regardless of debounce
 */
function performAutoSave(force = false) {
    // Check if we're in the active workout page
    if (currentPage !== 'active') {
        console.log('[Auto-Save] Not in active workout page, skipping save');
        return;
    }
    
    // Check if we need to debounce and not forcing
    const now = Date.now();
    if (!force && now - AUTO_SAVE.lastSave < AUTO_SAVE.DEBOUNCE) {
        console.log('[Auto-Save] Debouncing save operation');
        return;
    }
    
    // Check if we have changed inputs
    if (!force && AUTO_SAVE.changedInputs.size === 0) {
        console.log('[Auto-Save] No changed inputs, skipping save');
        return;
    }
    
    console.log(`[Auto-Save] Performing auto-save (force=${force}, changedInputs=${AUTO_SAVE.changedInputs.size})`);
    
    try {
        // Update weight units from UI before saving
        if (typeof updateWeightUnitsFromUI === 'function') {
            updateWeightUnitsFromUI();
        }
        
        // Update set counts from UI before saving
        if (typeof updateSetCountsFromUI === 'function') {
            updateSetCountsFromUI();
        }
        
        // Save the workout state
        if (typeof saveWorkoutState === 'function') {
            saveWorkoutState();
        }
        
        // Call the appropriate save function
        AUTO_SAVE.saveFunction();
        
        // Update the last save timestamp
        AUTO_SAVE.lastSave = now;
        localStorage.setItem(AUTO_SAVE.LAST_SAVE_KEY, now.toString());
        
        // Clear the changed inputs set
        AUTO_SAVE.changedInputs.clear();
        
        console.log('[Auto-Save] Auto-save completed successfully');
    } catch (error) {
        console.error('[Auto-Save] Error during auto-save:', error);
    }
}

// Initialize auto-save when the document is ready
document.addEventListener('DOMContentLoaded', initAutoSave);
