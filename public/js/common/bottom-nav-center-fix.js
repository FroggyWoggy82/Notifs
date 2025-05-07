/**
 * Bottom Navigation Center Fix
 * Ensures icons in the bottom navigation bar are perfectly centered
 */

document.addEventListener('DOMContentLoaded', function() {

    const bottomNav = document.querySelector('.bottom-nav');
    
    if (!bottomNav) return;

    const navItems = bottomNav.querySelectorAll('.nav-item');

    navItems.forEach(item => {

        item.style.flex = '1 1 0';

        const icon = item.querySelector('.nav-icon');
        if (icon) {
            icon.style.display = 'flex';
            icon.style.justifyContent = 'center';
            icon.style.alignItems = 'center';
            icon.style.margin = '0 auto 4px auto';
        }

        const text = item.querySelector('span:not(.nav-icon)');
        if (text) {
            text.style.textAlign = 'center';
            text.style.width = '100%';
        }
    });

    const resizeObserver = new ResizeObserver(() => {

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
