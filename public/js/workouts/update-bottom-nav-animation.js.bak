/**
 * Update Bottom Navigation Animation for Workouts Page
 * This script ensures the workouts page has the same bottom navigation styling as other pages
 */

// Function to update the bottom navigation
function updateWorkoutsBottomNav() {
    console.log('Updating workouts bottom navigation...');
    
    // First, remove any existing bottom navigation
    const existingBottomNav = document.querySelector('.bottom-nav');
    if (existingBottomNav) {
        existingBottomNav.remove();
    }
    
    // Create a new bottom navigation element
    const bottomNav = document.createElement('div');
    bottomNav.className = 'bottom-nav';
    
    // Define the standard navigation items with Font Awesome icons
    const standardNavItems = [
        { href: '/index.html', icon: 'fas fa-check', text: 'Tasks', dataPage: 'home-page', active: false },
        { href: '/pages/goals.html', icon: 'fas fa-star', text: 'Goals', dataPage: 'goal-page', active: false },
        { href: '/pages/workouts.html', icon: 'fas fa-dumbbell', text: 'Workouts', dataPage: 'workout-page', active: true },
        { href: '/pages/calendar.html', icon: 'fas fa-calendar-alt', text: 'Calendar', dataPage: 'calendar-page', active: false },
        { href: '/pages/food.html', icon: 'fas fa-utensils', text: 'Food', dataPage: 'food-page', active: false }
    ];
    
    // Add the navigation items
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
    
    // Add the bottom navigation to the page
    document.body.appendChild(bottomNav);
    
    console.log('Workouts bottom navigation updated successfully');
}

// Run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Initial creation
    updateWorkoutsBottomNav();
    
    // Also run after a short delay to ensure it runs after any other scripts
    setTimeout(updateWorkoutsBottomNav, 100);
});

// Run again when the window is fully loaded
window.addEventListener('load', function() {
    // Run after window load
    updateWorkoutsBottomNav();
    
    // And again after a short delay
    setTimeout(updateWorkoutsBottomNav, 500);
    
    // And one more time after a longer delay
    setTimeout(updateWorkoutsBottomNav, 1000);
});

// Create a MutationObserver to watch for changes to the DOM
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // If nodes were added, check if the bottom navigation was added
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

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

console.log('Update bottom nav animation script loaded');
