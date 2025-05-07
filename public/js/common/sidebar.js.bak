// Sidebar functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;

    // Function to open sidebar
    function openSidebar(e) {
        if (e) {
            e.stopPropagation(); // Prevent event bubbling
        }
        sidebar.classList.add('active');
        overlay.classList.add('active');
        body.classList.add('sidebar-active');
    }

    // Function to close sidebar
    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('sidebar-active');
    }

    // Event listeners with proper event handling
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        openSidebar();
    });

    // Make sure overlay click works properly
    overlay.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        closeSidebar();
    });

    // Remove the document click handler that was causing issues
    // Instead, rely on the overlay to handle clicks outside the sidebar

    // Close sidebar when clicking a nav item (on mobile)
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });

    // Set active nav item based on current page
    const currentPath = window.location.pathname;
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });

    // Prevent clicks inside the sidebar from closing it
    sidebar.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
    });

    // Add escape key to close sidebar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
});