
let currentPage = 'unknown';

function updateStatusBarColor() {
    let color = '#ffffff'; // Default white

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
        case 'product-tracking':
            color = '#ffffff'; // White background for product-tracking page
            break;
        default:
            color = '#ffffff'; // Default white
    }

    try {

        const bodyColor = window.getComputedStyle(document.body).backgroundColor;
        if (bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)' && bodyColor !== 'transparent') {
            color = bodyColor;
        } else {

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

    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', color);
    }

    const metaAppleStatusBar = document.querySelector('meta[name=apple-mobile-web-app-status-bar-style]');
    if (metaAppleStatusBar) {


        metaAppleStatusBar.setAttribute('content', 'black-translucent');
    }

    console.log('Updated status bar color to:', color);
}

document.addEventListener('DOMContentLoaded', () => {

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
    } else if (path.includes('/pages/product-tracking.html')) {
        currentPage = 'product-tracking';
    } else {
        currentPage = 'tasks'; // Default to tasks page
    }

    updateStatusBarColor();

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {

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

            updateStatusBarColor();
        });
    });
});
