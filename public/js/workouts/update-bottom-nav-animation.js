/**
 * Update Bottom Navigation Animation for Workouts Page
 * This script ensures the workouts page has the same bottom navigation styling as other pages
 */

function updateWorkoutsBottomNav() {
    console.log('Updating workouts bottom navigation...');

    const existingBottomNav = document.querySelector('.bottom-nav');
    if (existingBottomNav) {
        existingBottomNav.remove();
    }

    const bottomNav = document.createElement('div');
    bottomNav.className = 'bottom-nav';

    const standardNavItems = [
        { href: '/index.html', icon: 'fas fa-check', text: 'Tasks', dataPage: 'home-page', active: false },
        { href: '/pages/goals.html', icon: 'fas fa-star', text: 'Goals', dataPage: 'goal-page', active: false },
        { href: '/pages/workouts.html', icon: 'fas fa-dumbbell', text: 'Workouts', dataPage: 'workout-page', active: true },
        { href: '/pages/calendar.html', icon: 'fas fa-calendar-alt', text: 'Calendar', dataPage: 'calendar-page', active: false },
        { href: '/pages/food.html', icon: 'fas fa-utensils', text: 'Food', dataPage: 'food-page', active: false }
    ];

    standardNavItems.forEach(item => {
        const navItem = document.createElement('a');
        navItem.href = item.href;
        navItem.className = `nav-item${item.active ? ' active' : ''}`;
        navItem.setAttribute('data-page', item.dataPage);
        
        const navIcon = document.createElement('div');
        navIcon.className = 'nav-icon';
        
        const icon = document.createElement('i');
        icon.className = item.icon;
        
        const navText = document.createElement('span');
        navText.textContent = item.text;
        
        navIcon.appendChild(icon);
        navItem.appendChild(navIcon);
        navItem.appendChild(navText);
        bottomNav.appendChild(navItem);
    });

    document.body.appendChild(bottomNav);
    
    console.log('Workouts bottom navigation updated successfully');
}

document.addEventListener('DOMContentLoaded', function() {

    updateWorkoutsBottomNav();

    setTimeout(updateWorkoutsBottomNav, 100);
});

window.addEventListener('load', function() {

    updateWorkoutsBottomNav();

    setTimeout(updateWorkoutsBottomNav, 500);

    setTimeout(updateWorkoutsBottomNav, 1000);
});

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {

        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.nodeType === 1 && (
                    (node.classList && node.classList.contains('bottom-nav')) || 
                    (node.querySelector && node.querySelector('.bottom-nav'))
                )) {
                    console.log('Bottom navigation was added to the DOM, updating...');
                    updateWorkoutsBottomNav();
                }
            }
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

console.log('Update bottom nav animation script loaded');
