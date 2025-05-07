/**
 * Disable SVG Dumbbell Icon
 * This script prevents the svg-dumbbell-icon.js script from running
 */

window.disableSvgDumbbellIcon = true;

if (typeof window.replaceDumbbellWithSVG === 'function') {
    console.log('Overriding replaceDumbbellWithSVG function...');

    const originalReplaceDumbbellWithSVG = window.replaceDumbbellWithSVG;

    window.replaceDumbbellWithSVG = function() {
        console.log('replaceDumbbellWithSVG function called but disabled');
        return;
    };
    
    console.log('Overrode replaceDumbbellWithSVG function');
}

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
