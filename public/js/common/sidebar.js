
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;

    function openSidebar(e) {
        if (e) {
            e.stopPropagation(); // Prevent event bubbling
        }
        sidebar.classList.add('active');
        overlay.classList.add('active');
        body.classList.add('sidebar-active');
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('sidebar-active');
    }

    menuButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        openSidebar();
    });

    overlay.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        closeSidebar();
    });



    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });

    const currentPath = window.location.pathname;
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });

    sidebar.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
});