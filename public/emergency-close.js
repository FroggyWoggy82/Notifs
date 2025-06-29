// EMERGENCY MODAL CLOSE - Copy and paste this into browser console
function emergencyCloseAllModals() {
    console.log('EMERGENCY CLOSE: Starting...');
    
    // Find all possible modal elements
    const modalSelectors = [
        '#editTaskModal',
        '#addTaskModal', 
        '#addHabitModal',
        '#editHabitModal',
        '.modal',
        '[id*="modal"]',
        '[id*="Modal"]',
        '[class*="modal"]'
    ];

    modalSelectors.forEach(selector => {
        const modals = document.querySelectorAll(selector);
        modals.forEach(modal => {
            if (modal) {
                // Nuclear destruction
                modal.style.setProperty('display', 'none', 'important');
                modal.style.setProperty('visibility', 'hidden', 'important');
                modal.style.setProperty('opacity', '0', 'important');
                modal.style.setProperty('pointer-events', 'none', 'important');
                modal.style.setProperty('z-index', '-9999', 'important');
                modal.style.setProperty('position', 'fixed', 'important');
                modal.style.setProperty('top', '-9999px', 'important');
                modal.style.setProperty('left', '-9999px', 'important');
                
                // Remove all classes
                modal.className = '';
                
                // Clear content if it's a form
                const forms = modal.querySelectorAll('form');
                forms.forEach(form => form.reset());
                
                console.log('EMERGENCY CLOSE: Closed modal:', modal.id || modal.className);
            }
        });
    });

    // Restore body
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.height = '';
    document.body.style.setProperty('overflow', 'auto', 'important');
    
    // Remove any modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop, .backdrop, [class*="backdrop"]');
    backdrops.forEach(backdrop => backdrop.remove());
    
    console.log('EMERGENCY CLOSE: Complete!');
}

// Make it globally available
window.emergencyCloseAllModals = emergencyCloseAllModals;

// Run it immediately
emergencyCloseAllModals();
