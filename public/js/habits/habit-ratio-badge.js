/**
 * Habit Ratio Badge
 * Handles the display of ratio badges for specific habits (like Gooning)
 */

// Global variable to store reset counts
let eventResetCounts = {};

/**
 * Fetch reset counts from the API
 */
async function fetchEventResetCounts() {
    try {
        const response = await fetch('/api/days-since/reset-counts');
        if (response.ok) {
            const resetCounts = await response.json();
            console.log('Fetched event reset counts:', resetCounts);
            
            // Convert array to object for easier lookup
            eventResetCounts = {};
            resetCounts.forEach(item => {
                eventResetCounts[item.event_name] = item.reset_count;
            });
            
            return eventResetCounts;
        } else {
            console.error('Failed to fetch reset counts:', response.status);
            return {};
        }
    } catch (error) {
        console.error('Error fetching reset counts:', error);
        return {};
    }
}

/**
 * Get reset count for a specific event
 */
async function getResetCountForEvent(eventName) {
    try {
        const response = await fetch(`/api/days-since/reset-count/${encodeURIComponent(eventName)}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`Reset count for ${eventName}:`, data.resetCount);
            return data.resetCount;
        } else {
            console.error(`Failed to fetch reset count for ${eventName}:`, response.status);
            return 0;
        }
    } catch (error) {
        console.error(`Error fetching reset count for ${eventName}:`, error);
        return 0;
    }
}

/**
 * Calculate ratio for a habit
 * NOTE: We no longer simplify the ratio - we show actual level:reset count
 */
function calculateHabitRatio(habitLevel, resetCount) {
    // Return the actual values without simplification
    return {
        level: habitLevel,
        resets: resetCount
    };
}

/**
 * Create ratio badge HTML
 */
function createRatioBadgeHTML(habitLevel, resetCount) {
    // Show the actual level and reset count without simplifying
    const displayText = `${habitLevel}:${resetCount}`;

    return `
        <div class="habit-ratio-badge" title="Level to Reset Ratio: ${habitLevel} level : ${resetCount} resets (no simplification)">
            ${displayText}
        </div>
    `;
}

/**
 * Check if a habit should have a ratio badge
 */
function shouldShowRatioBadge(habitTitle) {
    return habitTitle.toLowerCase().includes('gooning');
}

/**
 * Add ratio badge to habit element
 */
async function addRatioBadgeToHabit(habitElement, habit) {
    if (!shouldShowRatioBadge(habit.title)) {
        return;
    }

    const habitLevel = habit.total_completions || 0;
    const resetCount = await getResetCountForEvent('The Last Goon');

    // Find the habit-progress-container to place the badge before it
    const progressContainer = habitElement.querySelector('.habit-progress-container');
    if (progressContainer) {
        // Add ratio badge before the progress container
        const ratioBadgeHTML = createRatioBadgeHTML(habitLevel, resetCount);
        progressContainer.insertAdjacentHTML('beforebegin', `
            <div class="habit-ratio-container">
                ${ratioBadgeHTML}
            </div>
        `);

        console.log(`Added ratio badge to ${habit.title}: ${habitLevel}:${resetCount} (unsimplified)`);
    }
}

/**
 * Update ratio badge for a specific habit
 */
async function updateRatioBadgeForHabit(habitElement, habit) {
    if (!shouldShowRatioBadge(habit.title)) {
        return;
    }

    const ratioContainer = habitElement.querySelector('.habit-ratio-container');
    if (ratioContainer) {
        const habitLevel = habit.total_completions || 0;
        const resetCount = await getResetCountForEvent('The Last Goon');
        
        const ratioBadgeHTML = createRatioBadgeHTML(habitLevel, resetCount);
        ratioContainer.innerHTML = ratioBadgeHTML;
        
        console.log(`Updated ratio badge for ${habit.title}: ${habitLevel}:${resetCount} (unsimplified)`);
    }
}

/**
 * Initialize ratio badges for all habits
 */
async function initializeRatioBadges() {
    console.log('Initializing ratio badges...');
    await fetchEventResetCounts();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeRatioBadges();
});

// Export functions for use in other scripts
window.habitRatioBadge = {
    addRatioBadgeToHabit,
    updateRatioBadgeForHabit,
    shouldShowRatioBadge,
    fetchEventResetCounts,
    initializeRatioBadges
};
