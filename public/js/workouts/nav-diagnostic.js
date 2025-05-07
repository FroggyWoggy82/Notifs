/**
 * Navigation Diagnostic Script
 * This script logs information about the bottom navigation bar to help debug styling issues
 */

function logNavigationInfo() {
    console.log('=== NAVIGATION DIAGNOSTIC ===');

    const bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav) {
        console.log('Bottom navigation bar not found!');
        return;
    }
    
    console.log('Bottom Nav Element:', bottomNav);
    console.log('Bottom Nav CSS Classes:', bottomNav.className);

    const navItems = bottomNav.querySelectorAll('.nav-item');
    console.log(`Found ${navItems.length} navigation items`);

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

        const computedStyle = window.getComputedStyle(item);
        console.log(`  - Color: ${computedStyle.color}`);

        if (icon) {
            const iconStyle = window.getComputedStyle(icon);
            console.log(`  - Icon Color: ${iconStyle.color}`);
        }

        const beforeStyle = window.getComputedStyle(item, '::before');
        console.log(`  - ::before opacity: ${beforeStyle.opacity}`);
        console.log(`  - ::before background-color: ${beforeStyle.backgroundColor}`);
    });

    console.log('=== APPLIED STYLESHEETS ===');
    const styleSheets = document.styleSheets;
    for (let i = 0; i < styleSheets.length; i++) {
        try {
            const sheet = styleSheets[i];
            console.log(`Stylesheet ${i + 1}: ${sheet.href || 'Inline Style'}`);

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

window.addEventListener('load', function() {

    setTimeout(logNavigationInfo, 1000);
});

document.addEventListener('DOMContentLoaded', function() {

    setTimeout(logNavigationInfo, 1000);
});

console.log('Navigation diagnostic script loaded');
