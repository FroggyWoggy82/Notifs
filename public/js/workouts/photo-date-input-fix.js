/**
 * Photo Date Input Fix
 * Replaces the default date input with a custom implementation to remove the calendar icon
 */

document.addEventListener('DOMContentLoaded', function() {

    function setupPhotoDateInput() {
        const dateInput = document.getElementById('modal-photo-date');
        if (!dateInput) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-date-wrapper';

        const currentValue = dateInput.value || new Date().toISOString().split('T')[0];

        const customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.id = 'custom-photo-date';
        customInput.value = currentValue;
        customInput.placeholder = 'YYYY-MM-DD';
        customInput.className = 'custom-date-text-input';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'date';
        hiddenInput.value = currentValue;
        hiddenInput.required = true;

        const calendarIcon = document.createElement('i');
        calendarIcon.className = 'fas fa-calendar-alt calendar-icon';

        wrapper.appendChild(customInput);
        wrapper.appendChild(calendarIcon);
        wrapper.appendChild(hiddenInput);

        dateInput.parentNode.replaceChild(wrapper, dateInput);

        function openDatePicker(event) {



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

            wrapper.appendChild(tempDateInput);

            tempDateInput.focus();
            setTimeout(() => {
                try {
                    tempDateInput.showPicker();
                } catch (e) {
                    console.log('Could not show picker:', e);
                }
            }, 10);

            tempDateInput.addEventListener('change', function() {
                customInput.value = this.value;
                hiddenInput.value = this.value;
                wrapper.removeChild(this);
            });

            tempDateInput.addEventListener('blur', function() {
                setTimeout(() => {
                    if (wrapper.contains(this)) {
                        wrapper.removeChild(this);
                    }
                }, 100);
            });

            if (event) event.stopPropagation();
        }

        customInput.addEventListener('change', function() {

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(this.value)) {
                hiddenInput.value = this.value;
            } else {

                try {
                    const date = new Date(this.value);
                    if (!isNaN(date.getTime())) {
                        const formattedDate = date.toISOString().split('T')[0];
                        this.value = formattedDate;
                        hiddenInput.value = formattedDate;
                    } else {

                        const today = new Date().toISOString().split('T')[0];
                        this.value = today;
                        hiddenInput.value = today;
                    }
                } catch (e) {

                    const today = new Date().toISOString().split('T')[0];
                    this.value = today;
                    hiddenInput.value = today;
                }
            }
        });

        customInput.addEventListener('click', openDatePicker);

        calendarIcon.addEventListener('click', function(event) {
            openDatePicker(event);
        });
    }

    const addPhotoBtn = document.getElementById('add-photo-btn');
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', function() {

            setTimeout(setupPhotoDateInput, 100);
        });
    }
});
