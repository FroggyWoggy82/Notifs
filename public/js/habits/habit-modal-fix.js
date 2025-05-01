// Habit Modal Fix - Ensures Add Habit and Edit Habit modals work properly with dark theme
document.addEventListener('DOMContentLoaded', function() {
    console.log("Habit modal fix script loaded");
    
    // Get the modal elements
    const addHabitModal = document.getElementById('addHabitModal');
    const editHabitModal = document.getElementById('editHabitModal');
    const addHabitForm = document.getElementById('addHabitForm');
    const editHabitForm = document.getElementById('editHabitForm');
    
    // Get the close buttons
    const closeAddHabitModalBtn = addHabitModal?.querySelector('.close-button');
    const closeEditHabitModalBtn = editHabitModal?.querySelector('.close-button');
    
    // Get form elements
    const editHabitIdInput = document.getElementById('editHabitId');
    const editHabitTitleInput = document.getElementById('editHabitTitle');
    const editHabitRecurrenceTypeInput = document.getElementById('editHabitRecurrenceType');
    const editHabitCompletionsPerDayInput = document.getElementById('editHabitCompletionsPerDay');
    const editHabitStatusDiv = document.getElementById('editHabitStatus');
    
    // Apply dark theme styling to Add Habit modal
    function applyDarkThemeToAddHabitModal() {
        if (!addHabitModal) return;
        
        // Apply styles to modal content
        const modalContent = addHabitModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = '#121212';
            modalContent.style.color = '#e0e0e0';
            modalContent.style.border = '1px solid #333';
            modalContent.style.borderRadius = '8px';
            modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        }
        
        // Style the header
        const modalHeader = addHabitModal.querySelector('.modal-header h2');
        if (modalHeader) {
            modalHeader.style.color = '#00e676';
        }
        
        // Style the close button
        const closeButton = addHabitModal.querySelector('.close-button');
        if (closeButton) {
            closeButton.style.color = '#999';
        }
        
        // Style form inputs
        const inputs = addHabitModal.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.style.backgroundColor = '#1e1e1e';
            input.style.color = '#e0e0e0';
            input.style.border = '1px solid #333';
        });
        
        // Style labels
        const labels = addHabitModal.querySelectorAll('.form-label');
        labels.forEach(label => {
            label.style.color = '#00e676';
        });
        
        // Style the submit button
        const submitBtn = addHabitModal.querySelector('#submitHabitBtn');
        if (submitBtn) {
            submitBtn.style.backgroundColor = '#00e676';
            submitBtn.style.color = '#121212';
            submitBtn.style.fontWeight = 'bold';
            submitBtn.style.textTransform = 'uppercase';
            submitBtn.style.border = 'none';
            submitBtn.style.borderRadius = '4px';
            submitBtn.style.padding = '12px 15px';
        }
    }
    
    // Apply dark theme styling to Edit Habit modal
    function applyDarkThemeToEditHabitModal() {
        if (!editHabitModal) return;
        
        // Apply styles to modal content
        const modalContent = editHabitModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = '#121212';
            modalContent.style.color = '#e0e0e0';
            modalContent.style.border = '1px solid #333';
            modalContent.style.borderRadius = '8px';
            modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        }
        
        // Style the header
        const modalHeader = editHabitModal.querySelector('.modal-header h2');
        if (modalHeader) {
            modalHeader.style.color = '#00e676';
        }
        
        // Style the close button
        const closeButton = editHabitModal.querySelector('.close-button');
        if (closeButton) {
            closeButton.style.color = '#999';
        }
        
        // Style form inputs
        const inputs = editHabitModal.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.style.backgroundColor = '#1e1e1e';
            input.style.color = '#e0e0e0';
            input.style.border = '1px solid #333';
        });
        
        // Style labels
        const labels = editHabitModal.querySelectorAll('.form-label');
        labels.forEach(label => {
            label.style.color = '#00e676';
        });
        
        // Style the submit button
        const submitBtn = editHabitModal.querySelector('#submitEditHabitBtn');
        if (submitBtn) {
            submitBtn.style.backgroundColor = '#00e676';
            submitBtn.style.color = '#121212';
            submitBtn.style.fontWeight = 'bold';
            submitBtn.style.textTransform = 'uppercase';
            submitBtn.style.border = 'none';
            submitBtn.style.borderRadius = '4px';
            submitBtn.style.padding = '12px 15px';
        }
    }
    
    // Create a global function to show the Add Habit modal
    window.showAddHabitModal = function() {
        console.log("showAddHabitModal called");
        
        if (!addHabitModal) {
            console.error("Add Habit modal not found");
            return;
        }
        
        // Reset the form
        if (addHabitForm) {
            addHabitForm.reset();
        }
        
        // Show the modal with dark theme styling
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        addHabitModal.style.removeProperty('display');
        addHabitModal.style.display = 'flex';
        addHabitModal.classList.add('modal-visible');
        
        // Apply dark theme styling
        applyDarkThemeToAddHabitModal();
        
        console.log("Add Habit modal should now be visible with dark theme");
    };
    
    // Create a global function to show the Edit Habit modal
    window.showEditHabitModal = function(habit) {
        console.log("showEditHabitModal called with habit:", habit);
        
        if (!editHabitModal) {
            console.error("Edit Habit modal not found");
            return;
        }
        
        // Populate the form fields
        if (editHabitIdInput) editHabitIdInput.value = habit.id;
        if (editHabitTitleInput) editHabitTitleInput.value = habit.title || '';
        if (editHabitRecurrenceTypeInput) editHabitRecurrenceTypeInput.value = habit.frequency || 'daily';
        if (editHabitCompletionsPerDayInput) editHabitCompletionsPerDayInput.value = habit.completions_per_day || 1;
        
        // Clear status
        if (editHabitStatusDiv) {
            editHabitStatusDiv.textContent = '';
            editHabitStatusDiv.className = 'status';
        }
        
        // Show the modal with dark theme styling
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        editHabitModal.style.removeProperty('display');
        editHabitModal.style.display = 'flex';
        editHabitModal.classList.add('modal-visible');
        
        // Apply dark theme styling
        applyDarkThemeToEditHabitModal();
        
        console.log("Edit Habit modal should now be visible with dark theme");
    };
    
    // Add event listener to all edit habit buttons
    document.addEventListener('click', function(event) {
        // Check if the clicked element is an edit habit button or its child
        const editBtn = event.target.closest('.edit-habit-icon-btn');
        if (editBtn) {
            console.log("Edit habit button clicked via delegation");
            
            // Get the habit ID from the button's parent habit item
            const habitItem = editBtn.closest('.habit-item');
            if (habitItem) {
                const habitId = habitItem.getAttribute('data-habit-id');
                console.log("Habit ID:", habitId);
                
                // Fetch the habit data
                fetch(`/api/habits/${habitId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(habit => {
                        console.log("Habit data fetched:", habit);
                        window.showEditHabitModal(habit);
                    })
                    .catch(error => {
                        console.error("Error fetching habit:", error);
                    });
            }
        }
    });
    
    // Add event listener for the Add Habit button
    const addHabitBtn = document.getElementById('addHabitBtn');
    if (addHabitBtn) {
        addHabitBtn.addEventListener('click', function() {
            window.showAddHabitModal();
        });
    }
    
    // Close Add Habit modal via button
    if (closeAddHabitModalBtn) {
        closeAddHabitModalBtn.addEventListener('click', function() {
            addHabitModal.style.display = 'none';
            addHabitModal.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Close Add Habit modal by clicking outside
    if (addHabitModal) {
        addHabitModal.addEventListener('click', function(event) {
            if (event.target === addHabitModal) {
                addHabitModal.style.display = 'none';
                addHabitModal.classList.remove('modal-visible');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    }
    
    // Close Edit Habit modal via button
    if (closeEditHabitModalBtn) {
        closeEditHabitModalBtn.addEventListener('click', function() {
            editHabitModal.style.display = 'none';
            editHabitModal.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Close Edit Habit modal by clicking outside
    if (editHabitModal) {
        editHabitModal.addEventListener('click', function(event) {
            if (event.target === editHabitModal) {
                editHabitModal.style.display = 'none';
                editHabitModal.classList.remove('modal-visible');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    }
    
    // Handle form submission for Add Habit
    if (addHabitForm) {
        addHabitForm.addEventListener('submit', function(event) {
            // The original form submission handler will be called
            console.log("Add Habit form submitted");
        });
    }
    
    // Handle form submission for Edit Habit
    if (editHabitForm) {
        editHabitForm.addEventListener('submit', function(event) {
            // The original form submission handler will be called
            console.log("Edit Habit form submitted");
        });
    }
    
    // Apply initial styling
    applyDarkThemeToAddHabitModal();
    applyDarkThemeToEditHabitModal();
    
    console.log("Habit modal fix initialization complete");
});
