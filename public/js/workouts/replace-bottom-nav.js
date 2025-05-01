/**
 * Replace Bottom Navigation
 * This script completely replaces the bottom navigation with a new one
 */

// Wait for the page to fully load
window.addEventListener('load', function() {
    // Function to replace the bottom navigation
    function replaceBottomNav() {
        console.log('Replacing bottom navigation...');
        
        // First, remove any existing bottom navigation
        const existingBottomNav = document.querySelector('.bottom-nav');
        if (existingBottomNav) {
            existingBottomNav.remove();
        }
        
        // Create a new bottom navigation element
        const bottomNav = document.createElement('div');
        bottomNav.className = 'bottom-nav';
        bottomNav.style.position = 'fixed';
        bottomNav.style.bottom = '0';
        bottomNav.style.left = '0';
        bottomNav.style.width = 'calc(100% - 15px)';
        bottomNav.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
        bottomNav.style.display = 'flex';
        bottomNav.style.justifyContent = 'space-around';
        bottomNav.style.alignItems = 'center';
        bottomNav.style.padding = '0';
        bottomNav.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.5)';
        bottomNav.style.zIndex = '1030';
        bottomNav.style.borderTop = '1px solid rgba(255, 255, 255, 0.03)';
        bottomNav.style.height = '60px';
        bottomNav.style.boxSizing = 'border-box';
        bottomNav.style.margin = '0';
        bottomNav.style.right = '15px';
        
        // Define the navigation items
        const navItems = [
            { href: '/index.html', icon: 'fas fa-check', text: 'Tasks', dataPage: 'home-page', active: false },
            { href: '/pages/goals.html', icon: 'fas fa-star', text: 'Goals', dataPage: 'goal-page', active: false },
            { href: '/pages/workouts.html', icon: 'fas fa-dumbbell', text: 'Workouts', dataPage: 'workout-page', active: true },
            { href: '/pages/calendar.html', icon: 'fas fa-calendar-alt', text: 'Calendar', dataPage: 'calendar-page', active: false },
            { href: '/pages/food.html', icon: 'fas fa-utensils', text: 'Food', dataPage: 'food-page', active: false }
        ];
        
        // Add the navigation items
        navItems.forEach(item => {
            const navItem = document.createElement('a');
            navItem.href = item.href;
            navItem.className = `nav-item${item.active ? ' active' : ''}`;
            navItem.setAttribute('data-page', item.dataPage);
            navItem.style.display = 'flex';
            navItem.style.flexDirection = 'column';
            navItem.style.alignItems = 'center';
            navItem.style.justifyContent = 'center';
            navItem.style.color = item.active ? '#FFFFFF' : 'rgba(158, 158, 158, 0.9)';
            navItem.style.textDecoration = 'none';
            navItem.style.padding = '5px 0';
            navItem.style.transition = 'all 0.2s ease';
            navItem.style.height = '100%';
            navItem.style.boxSizing = 'border-box';
            navItem.style.position = 'relative';
            navItem.style.flex = '1';
            navItem.style.textAlign = 'center';
            navItem.style.margin = '0';
            navItem.style.width = '20%';
            navItem.style.overflow = 'hidden';
            
            const navIcon = document.createElement('div');
            navIcon.className = 'nav-icon';
            navIcon.style.fontSize = '20px';
            navIcon.style.marginBottom = '2px';
            navIcon.style.lineHeight = '1';
            navIcon.style.display = 'flex';
            navIcon.style.justifyContent = 'center';
            navIcon.style.alignItems = 'center';
            navIcon.style.width = '100%';
            
            const icon = document.createElement('i');
            icon.className = item.icon;
            icon.style.fontStyle = 'normal';
            icon.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
            icon.style.fontWeight = '900';
            icon.style.display = 'inline-block';
            icon.style.color = 'inherit';
            
            const navText = document.createElement('span');
            navText.textContent = item.text;
            navText.style.fontSize = '0.75rem';
            navText.style.lineHeight = '1.2';
            navText.style.textAlign = 'center';
            navText.style.width = '100%';
            navText.style.display = 'block';
            navText.style.color = 'inherit';
            navText.style.textTransform = 'none';
            navText.style.fontWeight = 'normal';
            navText.style.letterSpacing = 'normal';
            
            // Add highlight line for active item
            if (item.active) {
                const highlightLine = document.createElement('div');
                highlightLine.style.position = 'absolute';
                highlightLine.style.bottom = '0';
                highlightLine.style.left = '0';
                highlightLine.style.width = '100%';
                highlightLine.style.height = '2px';
                highlightLine.style.backgroundColor = '#FFFFFF';
                highlightLine.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.5)';
                navItem.appendChild(highlightLine);
            }
            
            navIcon.appendChild(icon);
            navItem.appendChild(navIcon);
            navItem.appendChild(navText);
            bottomNav.appendChild(navItem);
        });
        
        // Add the bottom navigation to the page
        document.body.appendChild(bottomNav);
    }
    
    // Run the replacement immediately
    replaceBottomNav();
    
    // Also run after a short delay to ensure it takes effect
    setTimeout(replaceBottomNav, 100);
    setTimeout(replaceBottomNav, 500);
    setTimeout(replaceBottomNav, 1000);
});

// Also run when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Run the replacement immediately
    setTimeout(function() {
        // Function to replace the bottom navigation
        function replaceBottomNav() {
            console.log('Replacing bottom navigation (DOMContentLoaded)...');
            
            // First, remove any existing bottom navigation
            const existingBottomNav = document.querySelector('.bottom-nav');
            if (existingBottomNav) {
                existingBottomNav.remove();
            }
            
            // Create a new bottom navigation element
            const bottomNav = document.createElement('div');
            bottomNav.className = 'bottom-nav';
            bottomNav.style.position = 'fixed';
            bottomNav.style.bottom = '0';
            bottomNav.style.left = '0';
            bottomNav.style.width = 'calc(100% - 15px)';
            bottomNav.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
            bottomNav.style.display = 'flex';
            bottomNav.style.justifyContent = 'space-around';
            bottomNav.style.alignItems = 'center';
            bottomNav.style.padding = '0';
            bottomNav.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.5)';
            bottomNav.style.zIndex = '1030';
            bottomNav.style.borderTop = '1px solid rgba(255, 255, 255, 0.03)';
            bottomNav.style.height = '60px';
            bottomNav.style.boxSizing = 'border-box';
            bottomNav.style.margin = '0';
            bottomNav.style.right = '15px';
            
            // Define the navigation items
            const navItems = [
                { href: '/index.html', icon: 'fas fa-check', text: 'Tasks', dataPage: 'home-page', active: false },
                { href: '/pages/goals.html', icon: 'fas fa-star', text: 'Goals', dataPage: 'goal-page', active: false },
                { href: '/pages/workouts.html', icon: 'fas fa-dumbbell', text: 'Workouts', dataPage: 'workout-page', active: true },
                { href: '/pages/calendar.html', icon: 'fas fa-calendar-alt', text: 'Calendar', dataPage: 'calendar-page', active: false },
                { href: '/pages/food.html', icon: 'fas fa-utensils', text: 'Food', dataPage: 'food-page', active: false }
            ];
            
            // Add the navigation items
            navItems.forEach(item => {
                const navItem = document.createElement('a');
                navItem.href = item.href;
                navItem.className = `nav-item${item.active ? ' active' : ''}`;
                navItem.setAttribute('data-page', item.dataPage);
                navItem.style.display = 'flex';
                navItem.style.flexDirection = 'column';
                navItem.style.alignItems = 'center';
                navItem.style.justifyContent = 'center';
                navItem.style.color = item.active ? '#FFFFFF' : 'rgba(158, 158, 158, 0.9)';
                navItem.style.textDecoration = 'none';
                navItem.style.padding = '5px 0';
                navItem.style.transition = 'all 0.2s ease';
                navItem.style.height = '100%';
                navItem.style.boxSizing = 'border-box';
                navItem.style.position = 'relative';
                navItem.style.flex = '1';
                navItem.style.textAlign = 'center';
                navItem.style.margin = '0';
                navItem.style.width = '20%';
                navItem.style.overflow = 'hidden';
                
                const navIcon = document.createElement('div');
                navIcon.className = 'nav-icon';
                navIcon.style.fontSize = '20px';
                navIcon.style.marginBottom = '2px';
                navIcon.style.lineHeight = '1';
                navIcon.style.display = 'flex';
                navIcon.style.justifyContent = 'center';
                navIcon.style.alignItems = 'center';
                navIcon.style.width = '100%';
                
                const icon = document.createElement('i');
                icon.className = item.icon;
                icon.style.fontStyle = 'normal';
                icon.style.fontFamily = '"Font Awesome 6 Free", "FontAwesome", sans-serif';
                icon.style.fontWeight = '900';
                icon.style.display = 'inline-block';
                icon.style.color = 'inherit';
                
                const navText = document.createElement('span');
                navText.textContent = item.text;
                navText.style.fontSize = '0.75rem';
                navText.style.lineHeight = '1.2';
                navText.style.textAlign = 'center';
                navText.style.width = '100%';
                navText.style.display = 'block';
                navText.style.color = 'inherit';
                navText.style.textTransform = 'none';
                navText.style.fontWeight = 'normal';
                navText.style.letterSpacing = 'normal';
                
                // Add highlight line for active item
                if (item.active) {
                    const highlightLine = document.createElement('div');
                    highlightLine.style.position = 'absolute';
                    highlightLine.style.bottom = '0';
                    highlightLine.style.left = '0';
                    highlightLine.style.width = '100%';
                    highlightLine.style.height = '2px';
                    highlightLine.style.backgroundColor = '#FFFFFF';
                    highlightLine.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.5)';
                    navItem.appendChild(highlightLine);
                }
                
                navIcon.appendChild(icon);
                navItem.appendChild(navIcon);
                navItem.appendChild(navText);
                bottomNav.appendChild(navItem);
            });
            
            // Add the bottom navigation to the page
            document.body.appendChild(bottomNav);
        }
        
        // Run the replacement immediately
        replaceBottomNav();
        
        // Also run after a short delay to ensure it takes effect
        setTimeout(replaceBottomNav, 100);
        setTimeout(replaceBottomNav, 500);
        setTimeout(replaceBottomNav, 1000);
    }, 0);
});
