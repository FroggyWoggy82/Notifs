
document.addEventListener('DOMContentLoaded', function() {
    console.log("Habit modal fix script loaded");

    const addHabitModal = document.getElementById('addHabitModal');
    const editHabitModal = document.getElementById('editHabitModal');
    const addHabitForm = document.getElementById('addHabitForm');
    const editHabitForm = document.getElementById('editHabitForm');

    const closeAddHabitModalBtn = addHabitModal?.querySelector('.close-button');
    const closeEditHabitModalBtn = editHabitModal?.querySelector('.close-button');

    const editHabitIdInput = document.getElementById('editHabitId');
    const editHabitTitleInput = document.getElementById('editHabitTitle');
    const editHabitRecurrenceTypeInput = document.getElementById('editHabitRecurrenceType');
    const editHabitCompletionsPerDayInput = document.getElementById('editHabitCompletionsPerDay');
    const editHabitStatusDiv = document.getElementById('editHabitStatus');

    function applyDarkThemeToAddHabitModal() {
        if (!addHabitModal) return;

        const modalContent = addHabitModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = '#121212';
            modalContent.style.color = '#e0e0e0';
            modalContent.style.border = '1px solid #333';
            modalContent.style.borderRadius = '8px';
            modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        }

        const modalHeader = addHabitModal.querySelector('.modal-header h2');
        if (modalHeader) {
            modalHeader.style.color = '#00e676';
        }

        const closeButton = addHabitModal.querySelector('.close-button');
        if (closeButton) {
            closeButton.style.color = '#999';
        }

        const inputs = addHabitModal.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.style.backgroundColor = '#1e1e1e';
            input.style.color = '#e0e0e0';
            input.style.border = '1px solid #333';
        });

        const labels = addHabitModal.querySelectorAll('.form-label');
        labels.forEach(label => {
            label.style.color = '#00e676';
        });

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

    function applyDarkThemeToEditHabitModal() {
        if (!editHabitModal) return;

        const modalContent = editHabitModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = '#121212';
            modalContent.style.color = '#e0e0e0';
            modalContent.style.border = '1px solid #333';
            modalContent.style.borderRadius = '8px';
            modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        }

        const modalHeader = editHabitModal.querySelector('.modal-header h2');
        if (modalHeader) {
            modalHeader.style.color = '#00e676';
        }

        const closeButton = editHabitModal.querySelector('.close-button');
        if (closeButton) {
            closeButton.style.color = '#999';
        }

        const inputs = editHabitModal.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.style.backgroundColor = '#1e1e1e';
            input.style.color = '#e0e0e0';
            input.style.border = '1px solid #333';
        });

        const labels = editHabitModal.querySelectorAll('.form-label');
        labels.forEach(label => {
            label.style.color = '#00e676';
        });

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

    window.showAddHabitModal = function() {
        console.log("showAddHabitModal called");
        
        if (!addHabitModal) {
            console.error("Add Habit modal not found");
            return;
        }

        if (addHabitForm) {
            addHabitForm.reset();
        }

        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        addHabitModal.style.removeProperty('display');
        addHabitModal.style.display = 'flex';
        addHabitModal.classList.add('modal-visible');

        applyDarkThemeToAddHabitModal();
        
        console.log("Add Habit modal should now be visible with dark theme");
    };

    window.showEditHabitModal = function(habit) {
        console.log("showEditHabitModal called with habit:", habit);
        
        if (!editHabitModal) {
            console.error("Edit Habit modal not found");
            return;
        }

        if (editHabitIdInput) editHabitIdInput.value = habit.id;
        if (editHabitTitleInput) editHabitTitleInput.value = habit.title || '';
        if (editHabitRecurrenceTypeInput) editHabitRecurrenceTypeInput.value = habit.frequency || 'daily';
        if (editHabitCompletionsPerDayInput) editHabitCompletionsPerDayInput.value = habit.completions_per_day || 1;

        if (editHabitStatusDiv) {
            editHabitStatusDiv.textContent = '';
            editHabitStatusDiv.className = 'status';
        }

        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        editHabitModal.style.removeProperty('display');
        editHabitModal.style.display = 'flex';
        editHabitModal.classList.add('modal-visible');

        applyDarkThemeToEditHabitModal();
        
        console.log("Edit Habit modal should now be visible with dark theme");
    };

    document.addEventListener('click', function(event) {

        const editBtn = event.target.closest('.edit-habit-icon-btn');
        if (editBtn) {
            console.log("Edit habit button clicked via delegation");

            const habitItem = editBtn.closest('.habit-item');
            if (habitItem) {
                const habitId = habitItem.getAttribute('data-habit-id');
                console.log("Habit ID:", habitId);

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

    const addHabitBtn = document.getElementById('addHabitBtn');
    if (addHabitBtn) {
        addHabitBtn.addEventListener('click', function() {
            window.showAddHabitModal();
        });
    }

    if (closeAddHabitModalBtn) {
        closeAddHabitModalBtn.addEventListener('click', function() {
            addHabitModal.style.display = 'none';
            addHabitModal.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }

    if (addHabitModal) {
        addHabitModal.addEventListener('click', function(event) {
            if (event.target === addHabitModal) {
                addHabitModal.style.display = 'none';
                addHabitModal.classList.remove('modal-visible');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    }

    if (closeEditHabitModalBtn) {
        closeEditHabitModalBtn.addEventListener('click', function() {
            editHabitModal.style.display = 'none';
            editHabitModal.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }

    if (editHabitModal) {
        editHabitModal.addEventListener('click', function(event) {
            if (event.target === editHabitModal) {
                editHabitModal.style.display = 'none';
                editHabitModal.classList.remove('modal-visible');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    }

    if (addHabitForm) {
        addHabitForm.addEventListener('submit', function(event) {

            console.log("Add Habit form submitted");
        });
    }

    if (editHabitForm) {
        editHabitForm.addEventListener('submit', function(event) {

            console.log("Edit Habit form submitted");
        });
    }

    applyDarkThemeToAddHabitModal();
    applyDarkThemeToEditHabitModal();
    
    console.log("Habit modal fix initialization complete");
});
