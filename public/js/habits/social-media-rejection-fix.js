/**
 * Social Media Rejection Habit Fix
 *
 * This script fixes issues with the "Social Media Rejection" habit level
 * not being saved properly. It ensures that:
 * 1. When the counter is incremented, a completion is properly recorded
 * 2. The level is correctly updated and displayed
 */

(function() {
    // Configuration
    const config = {
        // Set to true for verbose logging, false for minimal logging
        debug: false,
        // Interval in milliseconds between periodic checks (10 seconds)
        checkInterval: 10000,
        // Debounce time in milliseconds to prevent multiple executions
        debounceTime: 500,
        // Cache time in milliseconds (30 seconds)
        cacheTime: 30000
    };

    // Cache for habit data
    const habitDataCache = {
        data: null,
        timestamp: 0,
        habitId: null
    };

    // Debounce mechanism
    let debounceTimer = null;
    let isProcessing = false;

    // Wait for the document to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSocialMediaRejectionFix);
    } else {
        initSocialMediaRejectionFix();
    }

    function initSocialMediaRejectionFix() {
        if (config.debug) console.log('[Social Media Rejection Fix] Initializing...');

        // Run the fix immediately
        fixSocialMediaRejectionHabit();

        // Set up periodic check with a longer interval
        setInterval(fixSocialMediaRejectionHabit, config.checkInterval);

        // Add event listeners with debouncing
        document.addEventListener('tasksLoaded', debouncedFixHabit);
        document.addEventListener('tasksRendered', debouncedFixHabit);
    }

    // Debounced version of the fix function
    function debouncedFixHabit() {
        if (isProcessing) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fixSocialMediaRejectionHabit();
        }, config.debounceTime);
    }

    async function fixSocialMediaRejectionHabit() {
        // Prevent concurrent executions
        if (isProcessing) return;
        isProcessing = true;

        try {
            // Find the Social Media Rejection habit element
            const habitElements = document.querySelectorAll('.habit-item');

            for (const habitElement of habitElements) {
                const titleEl = habitElement.querySelector('.habit-title');
                if (!titleEl || !titleEl.textContent.includes('Social Media Rejection')) continue;

                // Found the Social Media Rejection habit
                if (config.debug) console.log('[Social Media Rejection Fix] Found habit element');

                const habitId = habitElement.getAttribute('data-habit-id');
                if (!habitId) {
                    if (config.debug) console.log('[Social Media Rejection Fix] No habit ID found');
                    continue;
                }

                // Get the current level element
                const levelEl = habitElement.querySelector('.habit-level');
                if (!levelEl) {
                    if (config.debug) console.log('[Social Media Rejection Fix] No level element found');
                    continue;
                }

                // Get the current level text
                const levelText = levelEl.textContent || '';
                const levelMatch = levelText.match(/Level (\d+)/);

                // Check if we have a valid cached data
                const now = Date.now();
                let habitData;

                if (habitDataCache.habitId === habitId &&
                    habitDataCache.data &&
                    now - habitDataCache.timestamp < config.cacheTime) {
                    // Use cached data
                    habitData = habitDataCache.data;
                    if (config.debug) console.log('[Social Media Rejection Fix] Using cached habit data');
                } else {
                    // Get the current habit data from the server
                    try {
                        const response = await fetch(`/api/habits/${habitId}?_=${now}`);
                        if (!response.ok) {
                            if (config.debug) console.log(`[Social Media Rejection Fix] Failed to fetch habit data: ${response.status}`);
                            continue;
                        }

                        habitData = await response.json();

                        // Update cache
                        habitDataCache.data = habitData;
                        habitDataCache.timestamp = now;
                        habitDataCache.habitId = habitId;
                    } catch (error) {
                        console.error('[Social Media Rejection Fix] Error fetching habit data:', error);
                        continue;
                    }
                }

                // Update the level display if it doesn't match the total_completions
                if (levelMatch) {
                    const currentLevel = parseInt(levelMatch[1], 10);
                    const correctLevel = habitData.total_completions;

                    if (currentLevel !== correctLevel) {
                        console.log(`[Social Media Rejection Fix] Updating level from ${currentLevel} to ${correctLevel}`);

                        // Update the level text
                        levelEl.textContent = `Level ${correctLevel}`;
                        levelEl.title = `${correctLevel} total completions`;

                        // Update the level class
                        levelEl.classList.remove('level-1', 'level-3', 'level-5', 'level-10');
                        let newLevelClass = 'level-1';
                        if (correctLevel >= 10) {
                            newLevelClass = 'level-10';
                        } else if (correctLevel >= 5) {
                            newLevelClass = 'level-5';
                        } else if (correctLevel >= 3) {
                            newLevelClass = 'level-3';
                        }
                        levelEl.classList.add(newLevelClass);
                    }
                }

                // Add a special event listener for the increment button
                const incrementBtn = habitElement.querySelector('.habit-increment-btn');
                if (incrementBtn && !incrementBtn.dataset.smrFixApplied) {
                    incrementBtn.dataset.smrFixApplied = 'true';

                    // Add a new event listener that will run after the original one
                    incrementBtn.addEventListener('click', async function(event) {
                        // Wait for the original handler to complete
                        setTimeout(async () => {
                            try {
                                if (config.debug) console.log('[Social Media Rejection Fix] Increment button clicked');

                                // Explicitly record a completion
                                const completionResponse = await fetch(`/api/habits/${habitId}/complete`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ isCounterHabit: true })
                                });

                                if (!completionResponse.ok) {
                                    // If we get a 409 (Conflict), it means the habit has already reached its max completions for today
                                    // This is expected and not an error
                                    if (completionResponse.status !== 409 && config.debug) {
                                        console.log(`[Social Media Rejection Fix] Failed to record completion: ${completionResponse.status}`);
                                    }
                                    return;
                                }

                                const completionData = await completionResponse.json();

                                // Update cache with new data
                                habitDataCache.data = {
                                    ...habitDataCache.data,
                                    total_completions: completionData.total_completions
                                };
                                habitDataCache.timestamp = Date.now();

                                // Update the level display
                                if (levelEl && completionData.total_completions) {
                                    levelEl.textContent = `Level ${completionData.total_completions}`;
                                    levelEl.title = `${completionData.total_completions} total completions`;
                                }
                            } catch (error) {
                                console.error('[Social Media Rejection Fix] Error recording completion:', error);
                            }
                        }, 500);
                    });
                }
            }
        } catch (error) {
            console.error('[Social Media Rejection Fix] Error:', error);
        } finally {
            // Reset processing flag
            isProcessing = false;
        }
    }
})();
