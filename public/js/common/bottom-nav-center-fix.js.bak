/**
 * Bottom Navigation Center Fix
 * Ensures icons in the bottom navigation bar are perfectly centered
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the bottom navigation bar
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (!bottomNav) return;
    
    // Get all navigation items
    const navItems = bottomNav.querySelectorAll('.nav-item');
    
    // Apply equal width to all navigation items
    navItems.forEach(item => {
        // Set equal width for each item
        item.style.flex = '1 1 0';
        
        // Center the icon
        const icon = item.querySelector('.nav-icon');
        if (icon) {
            icon.style.display = 'flex';
            icon.style.justifyContent = 'center';
            icon.style.alignItems = 'center';
            icon.style.margin = '0 auto 4px auto';
        }
        
        // Center the text
        const text = item.querySelector('span:not(.nav-icon)');
        if (text) {
            text.style.textAlign = 'center';
            text.style.width = '100%';
        }
    });
    
    // Add resize observer to ensure centering is maintained
    const resizeObserver = new ResizeObserver(() => {
        // Recenter icons when window is resized
        navItems.forEach(item => {
            const icon = item.querySelector('.nav-icon');
            if (icon) {
                icon.style.display = 'flex';
                icon.style.justifyContent = 'center';
                icon.style.alignItems = 'center';
            }
        });
    });
    
    resizeObserver.observe(bottomNav);
});
