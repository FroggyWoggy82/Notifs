/**
 * Sidebar Updater
 * This script updates the sidebar on all pages to match the index.html sidebar
 */

document.addEventListener('DOMContentLoaded', function() {
    // Prevent multiple executions
    if (window.sidebarUpdaterInitialized) {
        console.log('[Sidebar Updater] Already initialized, skipping...');
        return;
    }
    window.sidebarUpdaterInitialized = true;

    // Determine if we're in a subdirectory (pages folder) or root
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes('/pages/');

    // For pages in the pages folder: use '../' to go to root, no prefix for other pages in same folder
    // For pages in root: no prefix to stay in root, 'pages/' prefix for pages folder
    const rootPrefix = isInPagesFolder ? '../' : '';
    const pagesPrefix = isInPagesFolder ? '' : 'pages/';

    console.log('[Sidebar Updater] Current path:', currentPath);
    console.log('[Sidebar Updater] Is in pages folder:', isInPagesFolder);
    console.log('[Sidebar Updater] Root prefix:', rootPrefix);
    console.log('[Sidebar Updater] Pages prefix:', pagesPrefix);

    const standardSidebar = `
    <div class="sidebar-header">
        <h2>Dashboard</h2>
    </div>
    <nav class="sidebar-nav">
        <a href="${rootPrefix}index.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-check"></i></span>
            <span>Tasks</span>
        </a>
        <a href="${pagesPrefix}goals.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-star"></i></span>
            <span>Goals</span>
        </a>
        <a href="${pagesPrefix}workouts.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-dumbbell"></i></span>
            <span>Workouts</span>
        </a>
        <a href="${pagesPrefix}calendar.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-calendar-alt"></i></span>
            <span>Calendar</span>
        </a>
        <a href="${pagesPrefix}days-since.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-stopwatch"></i></span>
            <span>Days Since</span>
        </a>
        <a href="${pagesPrefix}food.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-utensils"></i></span>
            <span>Food</span>
        </a>
        <a href="${pagesPrefix}journal-redesign.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-book"></i></span>
            <span>Journal</span>
        </a>
        <a href="${pagesPrefix}product-tracking.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-flask"></i></span>
            <span>Product Tracking</span>
        </a>
        <a href="${pagesPrefix}settings.html" class="sidebar-nav-item">
            <span class="nav-icon"><i class="fas fa-cog"></i></span>
            <span>Settings</span>
        </a>
    </nav>`;

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

        // Re-attach sidebar event listeners after updating HTML
        console.log('[Sidebar Updater] Re-attaching sidebar event listeners...');

        const menuButton = document.querySelector('.menu-button');
        const overlay = document.querySelector('.sidebar-overlay');
        const body = document.body;

        if (menuButton && sidebar && overlay) {
            // Define functions that will be used for event listeners
            window.sidebarFunctions = window.sidebarFunctions || {};

            window.sidebarFunctions.openSidebar = function(e) {
                if (e) {
                    e.stopPropagation();
                }
                sidebar.classList.add('active');
                overlay.classList.add('active');
                body.classList.add('sidebar-active');
                console.log('[Sidebar Updater] Sidebar opened');
            };

            window.sidebarFunctions.closeSidebar = function() {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                body.classList.remove('sidebar-active');
                console.log('[Sidebar Updater] Sidebar closed');
            };

            window.sidebarFunctions.menuButtonClick = function(e) {
                e.stopPropagation();
                console.log('[Sidebar Updater] Menu button clicked');
                window.sidebarFunctions.openSidebar();
            };

            window.sidebarFunctions.overlayClick = function(e) {
                e.stopPropagation();
                console.log('[Sidebar Updater] Overlay clicked');
                window.sidebarFunctions.closeSidebar();
            };

            window.sidebarFunctions.sidebarClick = function(e) {
                // Don't stop propagation for navigation links - let them navigate
                if (!e.target.closest('.sidebar-nav-item')) {
                    e.stopPropagation();
                }
            };

            window.sidebarFunctions.keydownHandler = function(e) {
                if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                    window.sidebarFunctions.closeSidebar();
                }
            };

            // Remove any existing listeners using the stored function references
            if (window.sidebarFunctions.menuButtonClickBound) {
                menuButton.removeEventListener('click', window.sidebarFunctions.menuButtonClickBound);
            }
            if (window.sidebarFunctions.overlayClickBound) {
                overlay.removeEventListener('click', window.sidebarFunctions.overlayClickBound);
            }
            if (window.sidebarFunctions.sidebarClickBound) {
                sidebar.removeEventListener('click', window.sidebarFunctions.sidebarClickBound);
            }
            if (window.sidebarFunctions.keydownHandlerBound) {
                document.removeEventListener('keydown', window.sidebarFunctions.keydownHandlerBound);
            }

            // Create bound versions for removal later
            window.sidebarFunctions.menuButtonClickBound = window.sidebarFunctions.menuButtonClick.bind(window.sidebarFunctions);
            window.sidebarFunctions.overlayClickBound = window.sidebarFunctions.overlayClick.bind(window.sidebarFunctions);
            window.sidebarFunctions.sidebarClickBound = window.sidebarFunctions.sidebarClick.bind(window.sidebarFunctions);
            window.sidebarFunctions.keydownHandlerBound = window.sidebarFunctions.keydownHandler.bind(window.sidebarFunctions);

            // Attach new listeners
            menuButton.addEventListener('click', window.sidebarFunctions.menuButtonClickBound);
            overlay.addEventListener('click', window.sidebarFunctions.overlayClickBound);
            sidebar.addEventListener('click', window.sidebarFunctions.sidebarClickBound);
            document.addEventListener('keydown', window.sidebarFunctions.keydownHandlerBound);

            // Handle navigation items
            const updatedNavItems = document.querySelectorAll('.sidebar-nav-item');
            updatedNavItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    // Allow navigation to proceed normally
                    console.log('[Sidebar Updater] Navigation item clicked:', item.getAttribute('href'));

                    // Close sidebar on mobile after a short delay to allow navigation
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            window.sidebarFunctions.closeSidebar();
                        }, 100);
                    }
                });
            });

            console.log('[Sidebar Updater] Event listeners re-attached successfully');
        } else {
            console.error('[Sidebar Updater] Missing sidebar elements for event attachment');
            console.error('[Sidebar Updater] menuButton:', !!menuButton, 'sidebar:', !!sidebar, 'overlay:', !!overlay);
        }
    }
});
