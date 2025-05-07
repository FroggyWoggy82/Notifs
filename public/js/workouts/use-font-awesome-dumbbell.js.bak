/**
 * Use Font Awesome Dumbbell
 * This script ensures the workouts tab uses the Font Awesome dumbbell icon instead of an SVG
 */

// Function to replace any SVG icon with the Font Awesome dumbbell icon
function useFontAwesomeDumbbell() {
    console.log('Replacing any SVG with Font Awesome dumbbell icon...');
    
    // Find the workouts tab
    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);
        
        // Find the icon container
        const iconContainer = workoutsTab.querySelector('.nav-icon');
        if (iconContainer) {
            console.log('Found icon container:', iconContainer);
            
            // Check if there's an SVG in the icon container
            const svg = iconContainer.querySelector('svg');
            if (svg) {
                // Replace the SVG with a Font Awesome icon
                iconContainer.innerHTML = '<i class="fas fa-dumbbell"></i>';
                console.log('Replaced SVG with Font Awesome icon');
            }
            
            // Ensure the Font Awesome icon is properly styled
            const icon = iconContainer.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-dumbbell';
                icon.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
                icon.style.fontWeight = '900';
                icon.style.fontStyle = 'normal';
                icon.style.display = 'inline-block';
                icon.style.fontSize = '20px';
                console.log('Styled Font Awesome icon');
            }
        } else {
            console.log('Icon container not found');
        }
    } else {
        console.log('Workouts tab not found');
    }
}

// Run the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Run immediately
    useFontAwesomeDumbbell();
    
    // Also run after a delay to ensure it takes effect
    setTimeout(useFontAwesomeDumbbell, 100);
    setTimeout(useFontAwesomeDumbbell, 500);
    setTimeout(useFontAwesomeDumbbell, 1000);
});

// Also run when the window is fully loaded
window.addEventListener('load', function() {
    // Run immediately
    useFontAwesomeDumbbell();
    
    // Also run after a delay to ensure it takes effect
    setTimeout(useFontAwesomeDumbbell, 100);
    setTimeout(useFontAwesomeDumbbell, 500);
    setTimeout(useFontAwesomeDumbbell, 1000);
    setTimeout(useFontAwesomeDumbbell, 2000);
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
                    console.log('Bottom navigation was added to the DOM, replacing any SVG with Font Awesome icon...');
                    useFontAwesomeDumbbell();
                }
            }
        }
    });
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Run the function every second for 10 seconds to ensure it takes effect
for (let i = 1; i <= 10; i++) {
    setTimeout(useFontAwesomeDumbbell, i * 1000);
}

console.log('Use Font Awesome dumbbell script loaded');
