/**
 * Bottom Navigation Fix
 * Ensures consistent bottom navigation with Font Awesome icons across all pages
 */

function createUnifiedBottomNav() {

    const standardNavItems = [
        { href: '/index.html', icon: 'fas fa-check', text: 'Tasks', dataPage: 'home-page' },
        { href: '/pages/goals.html', icon: 'fas fa-star', text: 'Goals', dataPage: 'goal-page' },
        { href: '/pages/workouts.html', icon: 'fas fa-dumbbell', text: 'Workouts', dataPage: 'workout-page' },
        { href: '/pages/calendar.html', icon: 'fas fa-calendar-alt', text: 'Calendar', dataPage: 'calendar-page' },
        { href: '/pages/food.html', icon: 'fas fa-utensils', text: 'Food', dataPage: 'food-page' }
    ];

    const currentPath = window.location.pathname;

    const existingBottomNav = document.querySelector('.bottom-nav');
    if (existingBottomNav) {
        existingBottomNav.remove();
    }

    const bottomNav = document.createElement('div');
    bottomNav.className = 'bottom-nav';
    bottomNav.id = 'unified-bottom-nav';
    document.body.appendChild(bottomNav);

    standardNavItems.forEach(item => {

        const isActive = currentPath === item.href ||
                         (currentPath.endsWith('/') && item.href === '/index.html') ||
                         (currentPath !== '/' && currentPath !== '/index.html' && item.href !== '/index.html' && currentPath.includes(item.href));

        const navItem = document.createElement('a');
        navItem.href = item.href;
        navItem.className = `nav-item${isActive ? ' active' : ''}`;
        navItem.setAttribute('data-page', item.dataPage);

        const navIcon = document.createElement('div');
        navIcon.className = 'nav-icon';
        navIcon.innerHTML = `<i class="${item.icon}"></i>`;

        const navText = document.createElement('span');
        navText.textContent = item.text;

        navItem.appendChild(navIcon);
        navItem.appendChild(navText);
        bottomNav.appendChild(navItem);
    });
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
