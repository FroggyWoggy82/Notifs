// Add Task Modal Fix - Ensures Add Task modal works properly with dark theme
document.addEventListener('DOMContentLoaded', function() {
    console.log("Add Task modal fix script loaded");
    
    // Get the modal elements
    const addTaskModal = document.getElementById('addTaskModal');
    const addTaskForm = document.getElementById('addTaskForm');
    const addTaskFab = document.getElementById('addTaskFab');
    
    // Get the close button
    const closeTaskModalBtn = addTaskModal?.querySelector('.close-button');
    
    // Get form elements
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskDurationInput = document.getElementById('taskDuration');
    const taskRecurrenceTypeInput = document.getElementById('taskRecurrenceType');
    const taskRecurrenceIntervalInput = document.getElementById('taskRecurrenceInterval');
    const recurrenceIntervalGroup = document.getElementById('recurrenceIntervalGroup');
    const useLastInputsToggle = document.getElementById('useLastInputs');
    const addTaskStatusDiv = document.getElementById('addTaskStatus');
    
    // Apply dark theme styling to Add Task modal
    function applyDarkThemeToAddTaskModal() {
        if (!addTaskModal) return;
        
        // Apply styles to modal content
        const modalContent = addTaskModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = '#121212';
            modalContent.style.color = '#e0e0e0';
            modalContent.style.border = '1px solid #333';
            modalContent.style.borderRadius = '8px';
            modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        }
        
        // Style the header
        const modalHeader = addTaskModal.querySelector('.modal-header h2');
        if (modalHeader) {
            modalHeader.style.color = '#00e676';
        }
        
        // Style the close button
        const closeButton = addTaskModal.querySelector('.close-button');
        if (closeButton) {
            closeButton.style.color = '#999';
        }
        
        // Style form inputs
        const inputs = addTaskModal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.backgroundColor = '#1e1e1e';
            input.style.color = '#e0e0e0';
            input.style.border = '1px solid #333';
        });
        
        // Style labels
        const labels = addTaskModal.querySelectorAll('.form-label');
        labels.forEach(label => {
            label.style.color = '#00e676';
        });
        
        // Style the submit button
        const submitBtn = addTaskModal.querySelector('#addTaskBtn');
        if (submitBtn) {
            submitBtn.style.backgroundColor = '#00e676';
            submitBtn.style.color = '#121212';
            submitBtn.style.fontWeight = 'bold';
            submitBtn.style.textTransform = 'uppercase';
            submitBtn.style.border = 'none';
            submitBtn.style.borderRadius = '4px';
            submitBtn.style.padding = '12px 15px';
        }
        
        // Style the toggle switch
        const toggleContainer = addTaskModal.querySelector('.toggle-container');
        if (toggleContainer) {
            const toggleLabel = toggleContainer.querySelector('.toggle-label');
            if (toggleLabel) {
                toggleLabel.style.color = '#ccc';
            }
        }
    }
    
    // Create a global function to show the Add Task modal
    window.showAddTaskModal = function() {
        console.log("showAddTaskModal called");
        
        if (!addTaskModal) {
            console.error("Add Task modal not found");
            return;
        }
        
        // Check if we should use last inputs
        if (useLastInputsToggle && useLastInputsToggle.checked && window.lastTaskInputs && window.lastTaskInputs.title) {
            // Load the last saved inputs
            if (typeof window.loadLastInputs === 'function') {
                window.loadLastInputs();
            }
        } else {
            // Reset the form
            if (addTaskForm) {
                addTaskForm.reset();
            }
            
            // No default due date - leave it unassigned
            if (taskDueDateInput) taskDueDateInput.value = '';
            
            // Set duration to 1 by default
            if (taskDurationInput) taskDurationInput.value = 1;
            
            // Reset other form fields
            if (taskTitleInput) taskTitleInput.value = '';
            if (taskDescriptionInput) taskDescriptionInput.value = '';
            
            // Hide recurrence interval group
            if (recurrenceIntervalGroup) recurrenceIntervalGroup.style.display = 'none';
        }
        
        // Clear status
        if (addTaskStatusDiv) {
            addTaskStatusDiv.textContent = '';
            addTaskStatusDiv.className = 'status';
        }
        
        // Show the modal with dark theme styling
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        addTaskModal.style.removeProperty('display');
        addTaskModal.style.display = 'flex';
        addTaskModal.classList.add('modal-visible');
        
        // Apply dark theme styling
        applyDarkThemeToAddTaskModal();
        
        console.log("Add Task modal should now be visible with dark theme");
    };
    
    // Add event listener for the Add Task FAB
    if (addTaskFab) {
        addTaskFab.addEventListener('click', function() {
            window.showAddTaskModal();
        });
    }
    
    // Close Add Task modal via button
    if (closeTaskModalBtn) {
        closeTaskModalBtn.addEventListener('click', function() {
            addTaskModal.style.display = 'none';
            addTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Close Add Task modal by clicking outside
    if (addTaskModal) {
        addTaskModal.addEventListener('click', function(event) {
            if (event.target === addTaskModal) {
                addTaskModal.style.display = 'none';
                addTaskModal.classList.remove('modal-visible');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    }
    
    // Handle form submission for Add Task
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', function(event) {
            // The original form submission handler will be called
            console.log("Add Task form submitted");
        });
    }
    
    // Apply initial styling
    applyDarkThemeToAddTaskModal();
    
    console.log("Add Task modal fix initialization complete");
});
