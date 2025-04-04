// Status bar color management
let currentPage = 'unknown';

// Function to update status bar color based on current page
function updateStatusBarColor() {
    let color = '#ffffff'; // Default white
    
    // Get the background color of the current page
    switch(currentPage) {
        case 'tasks':
            color = '#ffffff'; // White background for tasks page
            break;
        case 'goals':
            color = '#ffffff'; // White background for goals page
            break;
        case 'workouts':
            color = '#f5f5f5'; // Light gray background for workouts page
            break;
        case 'calendar':
            color = '#ffffff'; // White background for calendar page
            break;
        case 'food':
            color = '#ffffff'; // White background for food page
            break;
        case 'days-since':
            color = '#ffffff'; // White background for days-since page
            break;
        default:
            color = '#ffffff'; // Default white
    }
    
    // Get the actual background color of the body or main container
    try {
        // Try to get the computed background color of the body
        const bodyColor = window.getComputedStyle(document.body).backgroundColor;
        if (bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)' && bodyColor !== 'transparent') {
            color = bodyColor;
        } else {
            // Try to get the background color of the main container
            const mainContainer = document.querySelector('main') || document.querySelector('.container');
            if (mainContainer) {
                const mainColor = window.getComputedStyle(mainContainer).backgroundColor;
                if (mainColor && mainColor !== 'rgba(0, 0, 0, 0)' && mainColor !== 'transparent') {
                    color = mainColor;
                }
            }
        }
    } catch (error) {
        console.error('Error getting computed background color:', error);
    }
    
    // Update the theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', color);
    }
    
    // For iOS
    const metaAppleStatusBar = document.querySelector('meta[name=apple-mobile-web-app-status-bar-style]');
    if (metaAppleStatusBar) {
        // For iOS, we can use 'black-translucent' to make the status bar transparent
        // and then the background color will show through
        metaAppleStatusBar.setAttribute('content', 'black-translucent');
    }
    
    console.log('Updated status bar color to:', color);
}

// Initialize status bar color management
document.addEventListener('DOMContentLoaded', () => {
    // Set the current page based on the URL
    const path = window.location.pathname;
    if (path.includes('/pages/goals.html')) {
        currentPage = 'goals';
    } else if (path.includes('/pages/workouts.html')) {
        currentPage = 'workouts';
    } else if (path.includes('/pages/calendar.html')) {
        currentPage = 'calendar';
    } else if (path.includes('/pages/food.html')) {
        currentPage = 'food';
    } else if (path.includes('/pages/days-since.html')) {
        currentPage = 'days-since';
    } else {
        currentPage = 'tasks'; // Default to tasks page
    }
    
    // Update the status bar color based on the current page
    updateStatusBarColor();
    
    // Add event listeners to navigation items to update status bar color
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update currentPage based on the clicked nav item
            const dataPage = item.getAttribute('data-page');
            if (dataPage === 'home-page') {
                currentPage = 'tasks';
            } else if (dataPage === 'goal-page') {
                currentPage = 'goals';
            } else if (dataPage === 'workout-page') {
                currentPage = 'workouts';
            } else if (dataPage === 'calendar-page') {
                currentPage = 'calendar';
            } else if (dataPage === 'food-page') {
                currentPage = 'food';
            }
            
            // Update the status bar color
            updateStatusBarColor();
        });
    });
});
