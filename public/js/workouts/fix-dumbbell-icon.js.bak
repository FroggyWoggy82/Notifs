/**
 * Fix Dumbbell Icon
 * This script specifically targets and replaces the dumbbell icon in the workouts tab
 */

// Function to fix the dumbbell icon
function fixDumbbellIcon() {
    console.log('Fixing dumbbell icon...');

    // Find the workouts tab
    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);

        // Find the icon container
        const iconContainer = workoutsTab.querySelector('.nav-icon');
        if (iconContainer) {
            console.log('Found icon container:', iconContainer);

            // Replace the entire icon container content with a new icon
            // First, remove any existing icon
            iconContainer.innerHTML = '';

            // Create a new icon element
            const newIcon = document.createElement('i');
            newIcon.className = 'fas fa-dumbbell';
            newIcon.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
            newIcon.style.fontWeight = '900';
            newIcon.style.fontStyle = 'normal';
            newIcon.style.display = 'inline-block';
            newIcon.style.fontSize = '20px';

            // Add the new icon to the container
            iconContainer.appendChild(newIcon);
            console.log('Replaced icon container content with new element');
        } else {
            console.log('Icon container not found');
        }
    } else {
        console.log('Workouts tab not found');
    }
}

// Run the fix when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Run immediately
    fixDumbbellIcon();

    // Also run after a delay to ensure it takes effect
    setTimeout(fixDumbbellIcon, 100);
    setTimeout(fixDumbbellIcon, 500);
    setTimeout(fixDumbbellIcon, 1000);
});

// Also run when the window is fully loaded
window.addEventListener('load', function() {
    // Run immediately
    fixDumbbellIcon();

    // Also run after a delay to ensure it takes effect
    setTimeout(fixDumbbellIcon, 100);
    setTimeout(fixDumbbellIcon, 500);
    setTimeout(fixDumbbellIcon, 1000);
    setTimeout(fixDumbbellIcon, 2000);
});

// Create a MutationObserver to watch for changes to the DOM
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // If nodes were added, check if the bottom navigation was added
        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.nodeType === 1 && (node.classList.contains('bottom-nav') || node.querySelector('.bottom-nav'))) {
                    console.log('Bottom navigation was added to the DOM, fixing dumbbell icon...');
                    fixDumbbellIcon();
                }
            }
        }
    });
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Run the fix every second for 10 seconds to ensure it takes effect
for (let i = 1; i <= 10; i++) {
    setTimeout(fixDumbbellIcon, i * 1000);
}
