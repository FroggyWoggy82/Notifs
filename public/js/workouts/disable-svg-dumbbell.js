/**
 * Disable SVG Dumbbell Icon
 * This script prevents the svg-dumbbell-icon.js script from running
 */

// Define a global flag to indicate that we don't want to use the SVG dumbbell icon
window.disableSvgDumbbellIcon = true;

// Override the replaceDumbbellWithSVG function if it exists
if (typeof window.replaceDumbbellWithSVG === 'function') {
    console.log('Overriding replaceDumbbellWithSVG function...');
    
    // Save the original function
    const originalReplaceDumbbellWithSVG = window.replaceDumbbellWithSVG;
    
    // Override the function to do nothing
    window.replaceDumbbellWithSVG = function() {
        console.log('replaceDumbbellWithSVG function called but disabled');
        return;
    };
    
    console.log('Overrode replaceDumbbellWithSVG function');
}

// Also try to find and remove any script tags that load svg-dumbbell-icon.js
document.addEventListener('DOMContentLoaded', function() {
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.src && script.src.includes('svg-dumbbell-icon.js')) {
            console.log('Found svg-dumbbell-icon.js script, removing it...');
            script.remove();
            console.log('Removed svg-dumbbell-icon.js script');
        }
    });
});

console.log('Disable SVG dumbbell icon script loaded');
