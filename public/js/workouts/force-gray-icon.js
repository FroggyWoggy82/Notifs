/**
 * Workouts Icon Styling
 * This script ensures the workouts icon has the same styling as other pages
 */

// Function to style the workouts icon
function styleWorkoutsIcon() {
    console.log('Styling workouts icon...');

    // Find the workouts tab
    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);

        // Check if it's active
        const isActive = workoutsTab.classList.contains('active');

        // Set the color based on active state
        workoutsTab.style.color = isActive ? '#FFFFFF' : 'rgba(158, 158, 158, 0.9)';

        // Find the icon
        const icon = workoutsTab.querySelector('.nav-icon i');
        if (icon) {
            console.log('Found icon:', icon);

            // Set the icon color based on active state
            icon.style.color = isActive ? '#FFFFFF' : 'rgba(158, 158, 158, 0.9)';

            // Ensure it's the correct icon
            icon.className = 'fas fa-dumbbell';

            // Force the correct font family and weight
            icon.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
            icon.style.fontWeight = '900';
            icon.style.fontStyle = 'normal';

            console.log('Styled workouts icon');
        }

        // Find the text
        const text = workoutsTab.querySelector('span');
        if (text) {
            console.log('Found text:', text);

            // Set the text color based on active state
            text.style.color = isActive ? '#FFFFFF' : 'rgba(158, 158, 158, 0.9)';

            // Ensure the text is properly cased (only first letter capitalized)
            text.textContent = 'Workouts';

            // Ensure no text-transform is applied
            text.style.textTransform = 'none';

            console.log('Styled workouts text');
        }

        // Add highlight line for active state
        if (isActive) {
            // Check if highlight line already exists
            let highlightLine = workoutsTab.querySelector('.highlight-line');
            if (!highlightLine) {
                highlightLine = document.createElement('div');
                highlightLine.className = 'highlight-line';
                highlightLine.style.position = 'absolute';
                highlightLine.style.bottom = '0';
                highlightLine.style.left = '0';
                highlightLine.style.width = '100%';
                highlightLine.style.height = '2px';
                highlightLine.style.backgroundColor = '#FFFFFF';
                highlightLine.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.5)';
                workoutsTab.appendChild(highlightLine);
            }
        }
    } else {
        console.log('Workouts tab not found');
    }
}

// Run the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Run immediately
    styleWorkoutsIcon();

    // Also run after a delay to ensure it takes effect
    setTimeout(styleWorkoutsIcon, 100);
    setTimeout(styleWorkoutsIcon, 500);
    setTimeout(styleWorkoutsIcon, 1000);
});

// Also run when the window is fully loaded
window.addEventListener('load', function() {
    // Run immediately
    styleWorkoutsIcon();

    // Also run after a delay to ensure it takes effect
    setTimeout(styleWorkoutsIcon, 100);
    setTimeout(styleWorkoutsIcon, 500);
    setTimeout(styleWorkoutsIcon, 1000);
});

// Create a MutationObserver to watch for changes to the DOM
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // If nodes were added, check if the bottom navigation was added
        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.nodeType === 1 && (
                    (node.classList && node.classList.contains('bottom-nav')) ||
                    (node.querySelector && node.querySelector('.bottom-nav'))
                )) {
                    console.log('Bottom navigation was added to the DOM, styling workouts icon...');
                    styleWorkoutsIcon();
                }
            }
        }
    });
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Log a message to confirm the script is loaded
console.log('Workouts icon styling script loaded');
