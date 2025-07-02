/**
 * Simple Edit Task Modal Fix
 * Just prevents auto-opening and makes the close button work
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Edit Task Modal Simple Fix] Starting...');
    
    const editTaskModal = document.getElementById('editTaskModal');
    if (!editTaskModal) return;
    
    // Force close on page load
    editTaskModal.style.setProperty('display', 'none', 'important');
    editTaskModal.classList.remove('modal-visible');
    document.body.style.overflow = '';
    
    // Find and fix the close button
    const closeBtn = editTaskModal.querySelector('i, .close, .close-button, [class*="close"]');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Edit Task Modal Simple Fix] Close button clicked');
            editTaskModal.style.setProperty('display', 'none', 'important');
            editTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = '';
        });
    }
    
    // Close on backdrop click
    editTaskModal.addEventListener('click', function(e) {
        if (e.target === editTaskModal) {
            editTaskModal.style.setProperty('display', 'none', 'important');
            editTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = '';
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && window.getComputedStyle(editTaskModal).display !== 'none') {
            editTaskModal.style.setProperty('display', 'none', 'important');
            editTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = '';
        }
    });
    
    console.log('[Edit Task Modal Simple Fix] Complete');
});
