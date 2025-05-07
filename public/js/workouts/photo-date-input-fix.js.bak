/**
 * Photo Date Input Fix
 * Replaces the default date input with a custom implementation to remove the calendar icon
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to handle the photo upload modal
    function setupPhotoDateInput() {
        const dateInput = document.getElementById('modal-photo-date');
        if (!dateInput) return;

        // Create a wrapper for our custom implementation
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-date-wrapper';

        // Get the current value or set today's date
        const currentValue = dateInput.value || new Date().toISOString().split('T')[0];

        // Create a text input that looks like a date input
        const customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.id = 'custom-photo-date';
        customInput.value = currentValue;
        customInput.placeholder = 'YYYY-MM-DD';
        customInput.className = 'custom-date-text-input';

        // Create a hidden date input that will be submitted with the form
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'date';
        hiddenInput.value = currentValue;
        hiddenInput.required = true;

        // Add a calendar icon
        const calendarIcon = document.createElement('i');
        calendarIcon.className = 'fas fa-calendar-alt calendar-icon';

        // Add elements to the wrapper
        wrapper.appendChild(customInput);
        wrapper.appendChild(calendarIcon);
        wrapper.appendChild(hiddenInput);

        // Replace the original date input with our custom implementation
        dateInput.parentNode.replaceChild(wrapper, dateInput);

        // Function to open the date picker
        function openDatePicker(event) {
            // Instead of creating a hidden date input, let's modify the original input directly
            // This approach will use the browser's native positioning for the date picker

            // First, let's create a real date input that will replace our custom input temporarily
            const tempDateInput = document.createElement('input');
            tempDateInput.type = 'date';
            tempDateInput.value = hiddenInput.value;
            tempDateInput.style.position = 'absolute';
            tempDateInput.style.top = '0';
            tempDateInput.style.left = '0';
            tempDateInput.style.width = '100%';
            tempDateInput.style.height = '100%';
            tempDateInput.style.opacity = '0';
            tempDateInput.style.zIndex = '2';

            // Add it to the wrapper, directly on top of our custom input
            wrapper.appendChild(tempDateInput);

            // Focus and open the date picker
            tempDateInput.focus();
            setTimeout(() => {
                try {
                    tempDateInput.showPicker();
                } catch (e) {
                    console.log('Could not show picker:', e);
                }
            }, 10);

            // Handle date selection
            tempDateInput.addEventListener('change', function() {
                customInput.value = this.value;
                hiddenInput.value = this.value;
                wrapper.removeChild(this);
            });

            // Handle cancel
            tempDateInput.addEventListener('blur', function() {
                setTimeout(() => {
                    if (wrapper.contains(this)) {
                        wrapper.removeChild(this);
                    }
                }, 100);
            });

            // Prevent event propagation
            if (event) event.stopPropagation();
        }

        // Handle input changes
        customInput.addEventListener('change', function() {
            // Validate the date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(this.value)) {
                hiddenInput.value = this.value;
            } else {
                // Try to parse the date
                try {
                    const date = new Date(this.value);
                    if (!isNaN(date.getTime())) {
                        const formattedDate = date.toISOString().split('T')[0];
                        this.value = formattedDate;
                        hiddenInput.value = formattedDate;
                    } else {
                        // Invalid date, reset to today
                        const today = new Date().toISOString().split('T')[0];
                        this.value = today;
                        hiddenInput.value = today;
                    }
                } catch (e) {
                    // Invalid date, reset to today
                    const today = new Date().toISOString().split('T')[0];
                    this.value = today;
                    hiddenInput.value = today;
                }
            }
        });

        // Open date picker when clicking on the input field
        customInput.addEventListener('click', openDatePicker);

        // Open a date picker when clicking the calendar icon
        calendarIcon.addEventListener('click', function(event) {
            openDatePicker(event);
        });
    }

    // Set up the date input when the modal is opened
    const addPhotoBtn = document.getElementById('add-photo-btn');
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', function() {
            // Wait for the modal to be displayed
            setTimeout(setupPhotoDateInput, 100);
        });
    }
});
