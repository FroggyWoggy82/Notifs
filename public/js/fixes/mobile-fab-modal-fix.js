/**
 * Mobile FAB and Modal Fix
 * Ensures FAB works correctly and modal appears properly on mobile devices
 */

// Run immediately to prevent auto-opening
(function() {
    console.log('[Mobile FAB Fix] Early initialization to prevent auto-opening...');

    // Force close modal immediately if it exists
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        modal.classList.remove('modal-visible');
        document.body.style.overflow = '';
        console.log('[Mobile FAB Fix] Modal forced closed early');
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Mobile FAB Fix] Initializing mobile FAB and modal fixes...');

    // Run immediately, don't wait
    const addTaskFab = document.getElementById('addTaskFab');
    const addTaskModal = document.getElementById('addTaskModal');

    console.log('[Mobile FAB Fix] FAB element:', addTaskFab);
    console.log('[Mobile FAB Fix] Modal element:', addTaskModal);

    if (!addTaskFab) {
        console.error('[Mobile FAB Fix] FAB element not found');
        return;
    }

    if (!addTaskModal) {
        console.error('[Mobile FAB Fix] Modal element not found');
        return;
    }

    // Ensure modal starts closed
    addTaskModal.style.setProperty('display', 'none', 'important');
    addTaskModal.classList.remove('modal-visible');
    document.body.style.overflow = '';

    initializeMobileFab(addTaskFab, addTaskModal);

    // Also run after a delay to catch any late auto-opening
    setTimeout(function() {
        const computedStyle = window.getComputedStyle(addTaskModal);
        if (computedStyle.display !== 'none' || addTaskModal.offsetWidth > 0) {
            console.log('[Mobile FAB Fix] Modal was auto-opened, forcing it closed again');
            addTaskModal.style.setProperty('display', 'none', 'important');
            addTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = '';
        }
    }, 1000);
});

function initializeMobileFab(addTaskFab, addTaskModal) {
    
    // Remove any existing event listeners to prevent conflicts
    const newFab = addTaskFab.cloneNode(true);
    addTaskFab.parentNode.replaceChild(newFab, addTaskFab);
    
    // Add single, clean event listener
    newFab.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('[Mobile FAB Fix] FAB clicked, checking modal state...');

        // Check if modal is currently visible - more comprehensive check
        const computedStyle = window.getComputedStyle(addTaskModal);
        const isModalVisible = addTaskModal.style.display === 'flex' ||
                              addTaskModal.style.display === 'block' ||
                              computedStyle.display === 'flex' ||
                              computedStyle.display === 'block' ||
                              (addTaskModal.style.display !== 'none' && computedStyle.display !== 'none') ||
                              addTaskModal.classList.contains('modal-visible') ||
                              (addTaskModal.offsetWidth > 0 && addTaskModal.offsetHeight > 0);

        // Debug logging
        console.log('[Mobile FAB Fix] Modal state debug:');
        console.log('  - style.display:', addTaskModal.style.display);
        console.log('  - computed display:', computedStyle.display);
        console.log('  - has modal-visible class:', addTaskModal.classList.contains('modal-visible'));
        console.log('  - offsetWidth x offsetHeight:', addTaskModal.offsetWidth, 'x', addTaskModal.offsetHeight);
        console.log('  - isModalVisible:', isModalVisible);

        if (isModalVisible) {
            console.log('[Mobile FAB Fix] Modal is already open, closing it...');
            // Close the modal - use setProperty with important to override CSS !important rules
            addTaskModal.style.setProperty('display', 'none', 'important');
            addTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = '';
        } else {
            console.log('[Mobile FAB Fix] Modal is closed, opening it...');
            // Open the modal - use setProperty with important to override CSS rules
            addTaskModal.style.setProperty('display', 'flex', 'important');
            addTaskModal.style.position = 'fixed';
            addTaskModal.style.top = '0';
            addTaskModal.style.left = '0';
            addTaskModal.style.width = '100%';
            addTaskModal.style.height = '100%';
            addTaskModal.style.zIndex = '10000';
            addTaskModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            addTaskModal.style.alignItems = 'center';
            addTaskModal.style.justifyContent = 'center';
            addTaskModal.classList.add('modal-visible');

            // Prevent background scrolling
            document.body.style.overflow = 'hidden';

            // Clear any existing form data
            const form = addTaskModal.querySelector('#addTaskForm');
            if (form) {
                form.reset();
            }

            // Focus on first input for better UX
            setTimeout(() => {
                const firstInput = addTaskModal.querySelector('input[type="text"], textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);

            console.log('[Mobile FAB Fix] Modal should now be visible');
        }
    });
    
    // Handle modal close
    const closeButton = addTaskModal.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            addTaskModal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('[Mobile FAB Fix] Modal closed via close button');
        });
    }
    
    // Handle modal backdrop click
    addTaskModal.addEventListener('click', function(e) {
        if (e.target === addTaskModal) {
            addTaskModal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('[Mobile FAB Fix] Modal closed via backdrop click');
        }
    });
    
    // Ensure FAB is always visible and properly styled
    function ensureFabVisibility() {
        const fab = document.getElementById('addTaskFab');
        if (fab) {
            fab.style.display = 'flex';
            fab.style.visibility = 'visible';
            fab.style.opacity = '1';
            fab.style.pointerEvents = 'auto';
            
            // Ensure icon is visible
            const icon = fab.querySelector('i');
            if (icon) {
                icon.style.display = 'block';
                icon.style.visibility = 'visible';
                icon.style.opacity = '1';
            }
        }
    }
    
    // Apply visibility fixes
    ensureFabVisibility();
    
    // Re-apply on window resize
    window.addEventListener('resize', ensureFabVisibility);
    
    // Re-apply periodically to handle any dynamic changes
    setInterval(ensureFabVisibility, 2000);
    
    console.log('[Mobile FAB Fix] Mobile FAB and modal fixes initialized successfully');
}

// Additional safety check for mobile devices
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    console.log('[Mobile FAB Fix] Mobile device detected, applying additional fixes...');
    
    // Ensure FAB is always clickable on mobile
    document.addEventListener('touchstart', function(e) {
        const fab = document.getElementById('addTaskFab');
        if (fab && fab.contains(e.target)) {
            e.preventDefault();
            fab.click();
        }
    }, { passive: false });
}
