/**
 * Exact Icon Replacement
 * This script replaces the workouts icon with the exact same icon used in the other pages
 */

// Function to replace the workouts icon
function replaceWorkoutsIcon() {
    console.log('Replacing workouts icon with exact match...');
    
    // Find the workouts tab
    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);
        
        // Find the icon container
        const iconContainer = workoutsTab.querySelector('.nav-icon');
        if (iconContainer) {
            console.log('Found icon container:', iconContainer);
            
            // Replace the entire icon container content with the exact same HTML as the other pages
            iconContainer.innerHTML = '<i class="fas fa-dumbbell"></i>';
            
            // Get the icon element
            const iconElement = iconContainer.querySelector('i');
            if (iconElement) {
                // Apply inline styles to ensure it displays correctly
                iconElement.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
                iconElement.style.fontWeight = '900';
                iconElement.style.fontStyle = 'normal';
                iconElement.style.display = 'inline-block';
                iconElement.style.fontSize = '20px';
                
                // Force the icon to use the correct Unicode character
                iconElement.setAttribute('data-icon', 'f44b');
                
                console.log('Replaced workouts icon with exact match');
            }
        } else {
            console.log('Icon container not found');
        }
    } else {
        console.log('Workouts tab not found');
    }
}

// Run the replacement when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Run immediately
    replaceWorkoutsIcon();
    
    // Also run after a delay to ensure it takes effect
    setTimeout(replaceWorkoutsIcon, 100);
    setTimeout(replaceWorkoutsIcon, 500);
    setTimeout(replaceWorkoutsIcon, 1000);
});

// Also run when the window is fully loaded
window.addEventListener('load', function() {
    // Run immediately
    replaceWorkoutsIcon();
    
    // Also run after a delay to ensure it takes effect
    setTimeout(replaceWorkoutsIcon, 100);
    setTimeout(replaceWorkoutsIcon, 500);
    setTimeout(replaceWorkoutsIcon, 1000);
    setTimeout(replaceWorkoutsIcon, 2000);
});

// Create a MutationObserver to watch for changes to the DOM
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // If nodes were added, check if the bottom navigation was added
        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.nodeType === 1 && (node.classList.contains('bottom-nav') || node.querySelector('.bottom-nav'))) {
                    console.log('Bottom navigation was added to the DOM, replacing workouts icon...');
                    replaceWorkoutsIcon();
                }
            }
        }
    });
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Run the replacement every second for 10 seconds to ensure it takes effect
for (let i = 1; i <= 10; i++) {
    setTimeout(replaceWorkoutsIcon, i * 1000);
}
