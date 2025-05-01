/**
 * Force Gray Icon
 * This script directly modifies the DOM to ensure the workouts icon is gray
 */

// Function to force the workouts icon to be gray
function forceGrayWorkoutsIcon() {
    console.log('Forcing workouts icon to be gray...');
    
    // Find the workouts tab
    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);
        
        // Force the color to be gray
        workoutsTab.style.color = 'rgba(158, 158, 158, 0.9)';
        
        // Find the icon
        const icon = workoutsTab.querySelector('.nav-icon i');
        if (icon) {
            console.log('Found icon:', icon);
            
            // Force the icon color to be gray
            icon.style.color = 'rgba(158, 158, 158, 0.9)';
            
            // Ensure it's the correct icon
            icon.className = 'fas fa-dumbbell';
            
            // Force the correct font family and weight
            icon.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
            icon.style.fontWeight = '900';
            icon.style.fontStyle = 'normal';
            
            console.log('Forced workouts icon to be gray');
        }
        
        // Find the text
        const text = workoutsTab.querySelector('span');
        if (text) {
            console.log('Found text:', text);
            
            // Force the text color to be gray
            text.style.color = 'rgba(158, 158, 158, 0.9)';
            
            console.log('Forced workouts text to be gray');
        }
    } else {
        console.log('Workouts tab not found');
    }
}

// Run the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Run immediately
    forceGrayWorkoutsIcon();
    
    // Also run after a delay to ensure it takes effect
    setTimeout(forceGrayWorkoutsIcon, 100);
    setTimeout(forceGrayWorkoutsIcon, 500);
    setTimeout(forceGrayWorkoutsIcon, 1000);
});

// Also run when the window is fully loaded
window.addEventListener('load', function() {
    // Run immediately
    forceGrayWorkoutsIcon();
    
    // Also run after a delay to ensure it takes effect
    setTimeout(forceGrayWorkoutsIcon, 100);
    setTimeout(forceGrayWorkoutsIcon, 500);
    setTimeout(forceGrayWorkoutsIcon, 1000);
});

// Create a MutationObserver to watch for changes to the DOM
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // If nodes were added, check if the bottom navigation was added
        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.nodeType === 1 && (node.classList.contains('bottom-nav') || node.querySelector('.bottom-nav'))) {
                    console.log('Bottom navigation was added to the DOM, forcing workouts icon to be gray...');
                    forceGrayWorkoutsIcon();
                }
            }
        }
    });
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Log a message to confirm the script is loaded
console.log('Force gray icon script loaded');
