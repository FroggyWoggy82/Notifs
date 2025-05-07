/**
 * Unified Bottom Navigation
 * Ensures consistent bottom navigation with Font Awesome icons across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Define the standard navigation items with Font Awesome icons
    const standardNavItems = [
        { href: '/index.html', icon: 'fas fa-check', text: 'Tasks', dataPage: 'home-page' },
        { href: '/pages/goals.html', icon: 'fas fa-star', text: 'Goals', dataPage: 'goal-page' },
        { href: '/pages/workouts.html', icon: 'fas fa-dumbbell', text: 'Workouts', dataPage: 'workout-page' },
        { href: '/pages/calendar.html', icon: 'fas fa-calendar-alt', text: 'Calendar', dataPage: 'calendar-page' },
        { href: '/pages/food.html', icon: 'fas fa-utensils', text: 'Food', dataPage: 'food-page' }
    ];

    // Get the current page path
    const currentPath = window.location.pathname;

    // First, remove any existing bottom navigation
    const existingBottomNav = document.querySelector('.bottom-nav');
    if (existingBottomNav) {
        existingBottomNav.remove();
    }

    // Create a new bottom navigation element
    const bottomNav = document.createElement('div');
    bottomNav.className = 'bottom-nav';
    document.body.appendChild(bottomNav);

    // Add the standard navigation items
    standardNavItems.forEach(item => {
        // Check if current page matches this nav item
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
});
