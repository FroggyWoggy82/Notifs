/**
 * Navigation Diagnostic Script
 * This script logs information about the bottom navigation bar to help debug styling issues
 */

// Function to log navigation bar information
function logNavigationInfo() {
    console.log('=== NAVIGATION DIAGNOSTIC ===');
    
    // Check if bottom nav exists
    const bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav) {
        console.log('Bottom navigation bar not found!');
        return;
    }
    
    console.log('Bottom Nav Element:', bottomNav);
    console.log('Bottom Nav CSS Classes:', bottomNav.className);
    
    // Get all navigation items
    const navItems = bottomNav.querySelectorAll('.nav-item');
    console.log(`Found ${navItems.length} navigation items`);
    
    // Log information about each nav item
    navItems.forEach((item, index) => {
        const isActive = item.classList.contains('active');
        const href = item.getAttribute('href');
        const text = item.querySelector('span')?.textContent || 'No text';
        const icon = item.querySelector('.nav-icon i');
        const iconClass = icon ? icon.className : 'No icon';
        
        console.log(`Nav Item ${index + 1}:`);
        console.log(`  - Text: ${text}`);
        console.log(`  - Href: ${href}`);
        console.log(`  - Active: ${isActive}`);
        console.log(`  - Icon Class: ${iconClass}`);
        
        // Get computed styles
        const computedStyle = window.getComputedStyle(item);
        console.log(`  - Color: ${computedStyle.color}`);
        
        // Check icon color
        if (icon) {
            const iconStyle = window.getComputedStyle(icon);
            console.log(`  - Icon Color: ${iconStyle.color}`);
        }
        
        // Check if there's a ::before pseudo-element
        const beforeStyle = window.getComputedStyle(item, '::before');
        console.log(`  - ::before opacity: ${beforeStyle.opacity}`);
        console.log(`  - ::before background-color: ${beforeStyle.backgroundColor}`);
    });
    
    // Log all applied stylesheets
    console.log('=== APPLIED STYLESHEETS ===');
    const styleSheets = document.styleSheets;
    for (let i = 0; i < styleSheets.length; i++) {
        try {
            const sheet = styleSheets[i];
            console.log(`Stylesheet ${i + 1}: ${sheet.href || 'Inline Style'}`);
            
            // Try to find rules related to bottom-nav
            if (sheet.cssRules) {
                for (let j = 0; j < sheet.cssRules.length; j++) {
                    const rule = sheet.cssRules[j];
                    if (rule.selectorText && rule.selectorText.includes('bottom-nav')) {
                        console.log(`  - Rule: ${rule.selectorText}`);
                        console.log(`    ${rule.cssText}`);
                    }
                }
            }
        } catch (e) {
            console.log(`Stylesheet ${i + 1}: [Cannot access due to CORS]`);
        }
    }
    
    console.log('=== END NAVIGATION DIAGNOSTIC ===');
}

// Run the diagnostic when the page is fully loaded
window.addEventListener('load', function() {
    // Wait a bit to ensure all styles are applied
    setTimeout(logNavigationInfo, 1000);
});

// Also run when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure all styles are applied
    setTimeout(logNavigationInfo, 1000);
});

// Log a message to confirm the script is loaded
console.log('Navigation diagnostic script loaded');
