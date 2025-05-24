
document.addEventListener('DOMContentLoaded', function() {
    console.log("Add Task modal fix script loaded");

    const addTaskModal = document.getElementById('addTaskModal');
    const addTaskForm = document.getElementById('addTaskForm');
    const addTaskFab = document.getElementById('addTaskFab');

    const closeTaskModalBtn = addTaskModal?.querySelector('.close-button');

    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskDurationInput = document.getElementById('taskDuration');
    const taskRecurrenceTypeInput = document.getElementById('taskRecurrenceType');
    const taskRecurrenceIntervalInput = document.getElementById('taskRecurrenceInterval');
    const recurrenceIntervalGroup = document.getElementById('recurrenceIntervalGroup');
    const useLastInputsToggle = document.getElementById('useLastInputs');
    const addTaskStatusDiv = document.getElementById('addTaskStatus');

    function applyDarkThemeToAddTaskModal() {
        if (!addTaskModal) return;

        const modalContent = addTaskModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.backgroundColor = '#121212';
            modalContent.style.color = '#e0e0e0';
            modalContent.style.border = '1px solid #333';
            modalContent.style.borderRadius = '8px';
            modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        }

        const modalHeader = addTaskModal.querySelector('.modal-header h2');
        if (modalHeader) {
            modalHeader.style.color = '#00e676';
        }

        const closeButton = addTaskModal.querySelector('.close-button');
        if (closeButton) {
            closeButton.style.color = '#999';
        }

        const inputs = addTaskModal.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.backgroundColor = '#1e1e1e';
            input.style.color = '#e0e0e0';
            input.style.border = '1px solid #333';
        });

        const labels = addTaskModal.querySelectorAll('.form-label');
        labels.forEach(label => {
            label.style.color = '#00e676';
        });

        const submitBtn = addTaskModal.querySelector('#addTaskBtn');
        if (submitBtn) {
            // Remove any inline styles to let CSS take control
            submitBtn.style.removeProperty('background-color');
            submitBtn.style.removeProperty('color');
            submitBtn.style.removeProperty('font-weight');
            submitBtn.style.removeProperty('text-transform');
            submitBtn.style.removeProperty('border');
            submitBtn.style.removeProperty('border-radius');
            submitBtn.style.removeProperty('padding');
        }

        const toggleContainer = addTaskModal.querySelector('.toggle-container');
        if (toggleContainer) {
            const toggleLabel = toggleContainer.querySelector('.toggle-label');
            if (toggleLabel) {
                toggleLabel.style.color = '#ccc';
            }
        }
    }

    window.showAddTaskModal = function() {
        console.log("showAddTaskModal called");

        if (!addTaskModal) {
            console.error("Add Task modal not found");
            return;
        }

        if (useLastInputsToggle && useLastInputsToggle.checked && window.lastTaskInputs && window.lastTaskInputs.title) {

            if (typeof window.loadLastInputs === 'function') {
                window.loadLastInputs();
            }
        } else {

            if (addTaskForm) {
                addTaskForm.reset();
            }

            if (taskDueDateInput) taskDueDateInput.value = '';

            if (taskDurationInput) taskDurationInput.value = 1;

            if (taskTitleInput) taskTitleInput.value = '';
            if (taskDescriptionInput) taskDescriptionInput.value = '';

            if (recurrenceIntervalGroup) recurrenceIntervalGroup.style.display = 'none';
        }

        if (addTaskStatusDiv) {
            addTaskStatusDiv.textContent = '';
            addTaskStatusDiv.className = 'status';
        }

        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        addTaskModal.style.removeProperty('display');
        addTaskModal.style.display = 'flex';
        addTaskModal.classList.add('modal-visible');

        applyDarkThemeToAddTaskModal();

        console.log("Add Task modal should now be visible with dark theme");
    };

    if (addTaskFab) {
        addTaskFab.addEventListener('click', function() {
            window.showAddTaskModal();
        });
    }

    if (closeTaskModalBtn) {
        closeTaskModalBtn.addEventListener('click', function() {
            addTaskModal.style.display = 'none';
            addTaskModal.classList.remove('modal-visible');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }

    if (addTaskModal) {
        addTaskModal.addEventListener('click', function(event) {
            if (event.target === addTaskModal) {
                addTaskModal.style.display = 'none';
                addTaskModal.classList.remove('modal-visible');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    }

    if (addTaskForm) {
        addTaskForm.addEventListener('submit', function(event) {

            console.log("Add Task form submitted");
        });
    }

    applyDarkThemeToAddTaskModal();

    console.log("Add Task modal fix initialization complete");
});
