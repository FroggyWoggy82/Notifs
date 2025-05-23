/**
 * Compact Modal Layout
 * Reorganizes the add task and edit task modals to be more compact
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the DOM to be fully loaded
    setTimeout(initCompactLayout, 500);
});

/**
 * Initialize the compact layout
 */
function initCompactLayout() {
    // Reorganize the add task modal
    reorganizeAddTaskModal();
    
    // Reorganize the edit task modal
    reorganizeEditTaskModal();
    
    console.log('Compact modal layout initialized');
}

/**
 * Reorganize the add task modal
 */
function reorganizeAddTaskModal() {
    const addTaskModal = document.getElementById('addTaskModal');
    if (!addTaskModal) return;
    
    const modalContent = addTaskModal.querySelector('.modal-content');
    if (!modalContent) return;
    
    // Get the form elements
    const form = addTaskModal.querySelector('#addTaskForm');
    if (!form) return;
    
    // Get all form groups
    const formGroups = form.querySelectorAll('.form-group');
    if (!formGroups.length) return;
    
    // Get the button container
    const buttonContainer = form.querySelector('.button-container');
    if (!buttonContainer) return;
    
    // Create a new container for the form groups
    const formContainer = document.createElement('div');
    formContainer.className = 'compact-form-container';
    formContainer.style.display = 'flex';
    formContainer.style.flexWrap = 'wrap';
    formContainer.style.gap = '10px';
    
    // Move the title and description to the top
    const titleGroup = form.querySelector('.form-group:nth-child(1)');
    const descriptionGroup = form.querySelector('.form-group:nth-child(2)');
    
    if (titleGroup && descriptionGroup) {
        // Make sure we're not trying to insert before a non-child node
        if (form.contains(titleGroup)) {
            formContainer.appendChild(titleGroup);
        }
        
        if (form.contains(descriptionGroup)) {
            formContainer.appendChild(descriptionGroup);
        }
        
        // Insert the form container at the beginning of the form
        if (form.firstChild) {
            form.insertBefore(formContainer, form.firstChild);
        } else {
            form.appendChild(formContainer);
        }
    }
}

/**
 * Reorganize the edit task modal
 */
function reorganizeEditTaskModal() {
    const editTaskModal = document.getElementById('editTaskModal');
    if (!editTaskModal) return;
    
    const modalContent = editTaskModal.querySelector('.modal-content');
    if (!modalContent) return;
    
    // Get the form elements
    const form = editTaskModal.querySelector('#editTaskForm');
    if (!form) return;
    
    // Get all form groups
    const formGroups = form.querySelectorAll('.form-group');
    if (!formGroups.length) return;
    
    // Get the button container
    const buttonContainer = form.querySelector('button[type="submit"]');
    if (!buttonContainer) return;
    
    // Create a new container for the form groups
    const formContainer = document.createElement('div');
    formContainer.className = 'compact-form-container';
    formContainer.style.display = 'flex';
    formContainer.style.flexWrap = 'wrap';
    formContainer.style.gap = '10px';
    
    // Move the title and description to the top
    const titleGroup = form.querySelector('.form-group:nth-child(1)');
    const descriptionGroup = form.querySelector('.form-group:nth-child(2)');
    
    if (titleGroup && descriptionGroup) {
        // Make sure we're not trying to insert before a non-child node
        if (form.contains(titleGroup)) {
            formContainer.appendChild(titleGroup);
        }
        
        if (form.contains(descriptionGroup)) {
            formContainer.appendChild(descriptionGroup);
        }
        
        // Insert the form container at the beginning of the form
        if (form.firstChild) {
            form.insertBefore(formContainer, form.firstChild);
        } else {
            form.appendChild(formContainer);
        }
    }
}

// Initialize after a delay to ensure all other scripts have loaded
setTimeout(initCompactLayout, 1000);
