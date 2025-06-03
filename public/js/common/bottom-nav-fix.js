/**
 * Bottom Navigation Fix
 * Ensures consistent bottom navigation with Font Awesome icons across all pages
 */

function createUnifiedBottomNav() {
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes('/pages/');

    // Determine correct relative paths based on current location
    let standardNavItems;
    if (isInPagesFolder) {
        // We're in a pages subfolder, so go up one level for index.html and stay in current folder for other pages
        standardNavItems = [
            { href: '../index.html', icon: 'fas fa-check', text: 'Tasks', dataPage: 'home-page' },
            { href: 'goals.html', icon: 'fas fa-star', text: 'Goals', dataPage: 'goal-page' },
            { href: 'workouts.html', icon: 'fas fa-dumbbell', text: 'Workouts', dataPage: 'workout-page' },
            { href: 'calendar.html', icon: 'fas fa-calendar-alt', text: 'Calendar', dataPage: 'calendar-page' },
            { href: 'food.html', icon: 'fas fa-utensils', text: 'Food', dataPage: 'food-page' }
        ];
    } else {
        // We're in the root folder
        standardNavItems = [
            { href: 'index.html', icon: 'fas fa-check', text: 'Tasks', dataPage: 'home-page' },
            { href: 'pages/goals.html', icon: 'fas fa-star', text: 'Goals', dataPage: 'goal-page' },
            { href: 'pages/workouts.html', icon: 'fas fa-dumbbell', text: 'Workouts', dataPage: 'workout-page' },
            { href: 'pages/calendar.html', icon: 'fas fa-calendar-alt', text: 'Calendar', dataPage: 'calendar-page' },
            { href: 'pages/food.html', icon: 'fas fa-utensils', text: 'Food', dataPage: 'food-page' }
        ];
    }

    const existingBottomNav = document.querySelector('.bottom-nav');
    if (existingBottomNav) {
        existingBottomNav.remove();
    }

    const bottomNav = document.createElement('div');
    bottomNav.className = 'bottom-nav';
    bottomNav.id = 'unified-bottom-nav';
    document.body.appendChild(bottomNav);

    standardNavItems.forEach(item => {
        // Determine if this nav item is active based on current path
        let isActive = false;

        if (item.dataPage === 'home-page') {
            // Tasks page - active for index.html or root
            isActive = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html');
        } else {
            // Other pages - check if current path contains the page name
            // Map dataPage to actual filename
            const pageFileMap = {
                'goal-page': 'goals.html',
                'workout-page': 'workouts.html',
                'calendar-page': 'calendar.html',
                'food-page': 'food.html'
            };
            const fileName = pageFileMap[item.dataPage];
            isActive = fileName && currentPath.includes(fileName);
        }

        const navItem = document.createElement('a');
        navItem.href = item.href;
        navItem.className = `nav-item${isActive ? ' active' : ''}`;
        navItem.setAttribute('data-page', item.dataPage);

        // Add click handler to ensure navigation works even if other scripts interfere
        // Use capture phase to ensure this runs before other handlers
        navItem.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            window.location.href = item.href;
        }, true);

        const navIcon = document.createElement('div');
        navIcon.className = 'nav-icon';
        navIcon.innerHTML = `<i class="${item.icon}"></i>`;

        const navText = document.createElement('span');
        navText.textContent = item.text;

        navItem.appendChild(navIcon);
        navItem.appendChild(navText);
        bottomNav.appendChild(navItem);
    });

    // Add global click handler for bottom navigation as a fallback
    document.addEventListener('click', function(event) {
        const navItem = event.target.closest('.bottom-nav .nav-item');
        if (navItem && navItem.href) {
            event.preventDefault();
            event.stopPropagation();
            // Use setTimeout to bypass any interference from other scripts
            setTimeout(function() {
                window.location.href = navItem.href;
            }, 10);
        }
    }, true);
}

// Prevent multiple executions
let bottomNavCreated = false;

function ensureBottomNavExists() {
    if (bottomNavCreated) {
        console.log('[Bottom Nav Fix] Already created, skipping...');
        return;
    }

    console.log('[Bottom Nav Fix] Creating bottom navigation...');
    createUnifiedBottomNav();
    bottomNavCreated = true;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Bottom Nav Fix] DOM loaded');
    ensureBottomNavExists();

    // Try again after delays to ensure it's created
    setTimeout(ensureBottomNavExists, 100);
    setTimeout(ensureBottomNavExists, 500);
    setTimeout(ensureBottomNavExists, 1000);
});

window.addEventListener('load', function() {
    console.log('[Bottom Nav Fix] Window loaded');
    ensureBottomNavExists();

    setTimeout(ensureBottomNavExists, 500);
});

// Expose global function for manual creation
window.createBottomNav = function() {
    bottomNavCreated = false;
    ensureBottomNavExists();
};
