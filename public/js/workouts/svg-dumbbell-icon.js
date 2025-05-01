/**
 * SVG Dumbbell Icon
 * This script replaces the dumbbell icon with an SVG icon
 */

// Function to replace the dumbbell icon with an SVG
function replaceDumbbellWithSVG() {
    console.log('Replacing dumbbell icon with SVG...');
    
    // Find the workouts tab
    const workoutsTab = document.querySelector('.bottom-nav .nav-item[href*="workouts.html"]');
    if (workoutsTab) {
        console.log('Found workouts tab:', workoutsTab);
        
        // Find the icon container
        const iconContainer = workoutsTab.querySelector('.nav-icon');
        if (iconContainer) {
            console.log('Found icon container:', iconContainer);
            
            // Create an SVG dumbbell icon
            const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svgIcon.setAttribute('viewBox', '0 0 640 512');
            svgIcon.setAttribute('width', '20');
            svgIcon.setAttribute('height', '20');
            svgIcon.style.fill = 'currentColor';
            
            // Create the path for the dumbbell icon
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M96 64c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32V224v64V448c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V288 224 64zm448 0v160 64V448c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32V288 224 64c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32zM224 160c0-17.7 14.3-32 32-32h32 32 32c17.7 0 32 14.3 32 32v64 64c0 17.7-14.3 32-32 32H352 320 288c-17.7 0-32-14.3-32-32V224 160z');
            
            // Add the path to the SVG
            svgIcon.appendChild(path);
            
            // Replace the icon container content with the SVG
            iconContainer.innerHTML = '';
            iconContainer.appendChild(svgIcon);
            
            console.log('Replaced dumbbell icon with SVG');
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
    replaceDumbbellWithSVG();
    
    // Also run after a delay to ensure it takes effect
    setTimeout(replaceDumbbellWithSVG, 100);
    setTimeout(replaceDumbbellWithSVG, 500);
    setTimeout(replaceDumbbellWithSVG, 1000);
});

// Also run when the window is fully loaded
window.addEventListener('load', function() {
    // Run immediately
    replaceDumbbellWithSVG();
    
    // Also run after a delay to ensure it takes effect
    setTimeout(replaceDumbbellWithSVG, 100);
    setTimeout(replaceDumbbellWithSVG, 500);
    setTimeout(replaceDumbbellWithSVG, 1000);
    setTimeout(replaceDumbbellWithSVG, 2000);
});

// Create a MutationObserver to watch for changes to the DOM
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // If nodes were added, check if the bottom navigation was added
        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.nodeType === 1 && (node.classList.contains('bottom-nav') || node.querySelector('.bottom-nav'))) {
                    console.log('Bottom navigation was added to the DOM, replacing dumbbell icon with SVG...');
                    replaceDumbbellWithSVG();
                }
            }
        }
    });
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Run the replacement every second for 10 seconds to ensure it takes effect
for (let i = 1; i <= 10; i++) {
    setTimeout(replaceDumbbellWithSVG, i * 1000);
}
