/**
 * Goals Bottom Navigation Fix
 * Ensures the bottom navigation bar is properly aligned on goals.html
 */

(function() {

    function fixBottomNav() {
        console.log('[Goals Bottom Nav Fix] Fixing bottom navigation bar...');

        const bottomNav = document.querySelector('.bottom-nav');
        if (!bottomNav) {
            console.log('[Goals Bottom Nav Fix] Bottom navigation bar not found');
            return;
        }

        bottomNav.style.width = '100%';
        bottomNav.style.left = '0';
        bottomNav.style.right = '0';
        bottomNav.style.display = 'flex';
        bottomNav.style.justifyContent = 'space-around';
        bottomNav.style.alignItems = 'center';
        bottomNav.style.padding = '0';
        bottomNav.style.margin = '0';

        const navItems = bottomNav.querySelectorAll('.nav-item');
        navItems.forEach(item => {

            item.style.flex = '1 1 20%'; // 5 items = 20% each
            item.style.display = 'flex';
            item.style.flexDirection = 'column';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'center';
            item.style.textAlign = 'center';
            item.style.padding = '8px 0';
            item.style.margin = '0';
            item.style.width = '20%';
            item.style.boxSizing = 'border-box';

            const iconContainer = item.querySelector('.nav-icon');
            if (iconContainer) {

                iconContainer.style.display = 'flex';
                iconContainer.style.justifyContent = 'center';
                iconContainer.style.alignItems = 'center';
                iconContainer.style.margin = '0 auto 4px auto';
                iconContainer.style.height = '24px';
                iconContainer.style.width = '100%';

                const icon = iconContainer.querySelector('i');
                if (icon) {

                    icon.style.display = 'block';
                    icon.style.margin = '0 auto';
                    icon.style.textAlign = 'center';
                }
            }

            const text = item.querySelector('span');
            if (text) {

                text.style.display = 'block';
                text.style.textAlign = 'center';
                text.style.width = '100%';
                text.style.fontSize = '12px';
                text.style.margin = '0 auto';
            }
        });
        
        console.log('[Goals Bottom Nav Fix] Bottom navigation bar fixed');
    }

    function init() {
        console.log('[Goals Bottom Nav Fix] Initializing...');

        fixBottomNav();

        setTimeout(fixBottomNav, 500);
        
        console.log('[Goals Bottom Nav Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
