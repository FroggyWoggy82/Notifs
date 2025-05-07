/**
 * Sidebar Updater
 * This script updates the sidebar on all pages to match the index.html sidebar
 */

document.addEventListener('DOMContentLoaded', function() {

    const standardSidebar = `
    <div class="sidebar-header">
        <h2>Dashboard</h2>
    </div>
    <nav class="sidebar-nav">
        <a href="/index.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-check"></i></span>
            <span>Tasks</span>
        </a>
        <a href="/pages/goals.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-star"></i></span>
            <span>Goals</span>
        </a>
        <a href="/pages/workouts.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-dumbbell"></i></span>
            <span>Workouts</span>
        </a>
        <a href="/pages/calendar.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-calendar-alt"></i></span>
            <span>Calendar</span>
        </a>
        <a href="/pages/days-since.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-stopwatch"></i></span>
            <span>Days Since</span>
        </a>
        <a href="/pages/food.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-utensils"></i></span>
            <span>Food</span>
        </a>
        <a href="/pages/journal.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-book"></i></span>
            <span>Journal</span>
        </a>
        <a href="/pages/product-tracking.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-flask"></i></span>
            <span>Product Tracking</span>
        </a>
        <a href="/pages/settings.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-cog"></i></span>
            <span>Settings</span>
        </a>
    </nav>`;

    const currentPath = window.location.pathname;

    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {

        sidebar.innerHTML = standardSidebar;

        const navItems = sidebar.querySelectorAll('.sidebar-nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (currentPath.endsWith(href) || 
                (currentPath === '/' && href === '/index.html') ||
                (currentPath.includes(href) && href !== '/index.html')) {
                item.classList.add('active');
            }
        });
    }
});
