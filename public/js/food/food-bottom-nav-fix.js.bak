/**
 * Food Bottom Navigation Fix
 * Ensures the bottom navigation bar is properly aligned on food.html
 */

(function() {
    // Function to fix the bottom navigation bar
    function fixBottomNav() {
        console.log('[Food Bottom Nav Fix] Fixing bottom navigation bar...');
        
        // Get the bottom navigation bar
        const bottomNav = document.querySelector('.bottom-nav');
        if (!bottomNav) {
            console.log('[Food Bottom Nav Fix] Bottom navigation bar not found');
            return;
        }
        
        // Apply styles to ensure proper alignment
        bottomNav.style.width = '100%';
        bottomNav.style.left = '0';
        bottomNav.style.right = '0';
        bottomNav.style.display = 'flex';
        bottomNav.style.justifyContent = 'space-around';
        bottomNav.style.alignItems = 'center';
        bottomNav.style.padding = '0';
        bottomNav.style.margin = '0';
        
        // Get all navigation items
        const navItems = bottomNav.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            // Apply styles to ensure equal width and proper centering
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
            
            // Get the icon container
            const iconContainer = item.querySelector('.nav-icon');
            if (iconContainer) {
                // Apply styles to center the icon
                iconContainer.style.display = 'flex';
                iconContainer.style.justifyContent = 'center';
                iconContainer.style.alignItems = 'center';
                iconContainer.style.margin = '0 auto 4px auto';
                iconContainer.style.height = '24px';
                iconContainer.style.width = '100%';
                
                // Get the icon
                const icon = iconContainer.querySelector('i');
                if (icon) {
                    // Apply styles to center the icon within the container
                    icon.style.display = 'block';
                    icon.style.margin = '0 auto';
                    icon.style.textAlign = 'center';
                }
            }
            
            // Get the text
            const text = item.querySelector('span');
            if (text) {
                // Apply styles to center the text
                text.style.display = 'block';
                text.style.textAlign = 'center';
                text.style.width = '100%';
                text.style.fontSize = '12px';
                text.style.margin = '0 auto';
            }
        });
        
        console.log('[Food Bottom Nav Fix] Bottom navigation bar fixed');
    }
    
    // Initialize when the DOM is ready
    function init() {
        console.log('[Food Bottom Nav Fix] Initializing...');
        
        // Fix the bottom navigation bar
        fixBottomNav();
        
        // Also fix it after a short delay to ensure all styles are applied
        setTimeout(fixBottomNav, 500);
        
        console.log('[Food Bottom Nav Fix] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
