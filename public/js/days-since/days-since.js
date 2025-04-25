// Days Since functionality
// Helper functions
function calculateTimeSince(startDate) {
    // Create date objects for start and now
    const start = new Date(startDate);
    const now = new Date();

    // Calculate the time difference in milliseconds
    let diffMs = now - start;

    // Handle cases where the start date might be slightly in the future due to clock skew
    if (diffMs < 0) {
        diffMs = 0;
    }

    // Calculate days, hours, and minutes
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Return an object instead of a string
    return { days, hours, minutes };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Chicago' // Explicitly use Central Time
    });
}

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status ${type}`;
    setTimeout(() => {
        element.textContent = '';
        element.className = 'status';
    }, 3000);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Render events in the list
function renderEvents(events) {
    const daysSinceList = document.getElementById('daysSinceList');
    console.log('Rendering events:', events); // Debug log
    if (events.length === 0) {
        console.log('No events to display'); // Debug log
        daysSinceList.innerHTML = `
            <div class="empty-state">
                <p>No events added yet. Add your first event to start tracking!</p>
            </div>
        `;
        return;
    }

    const renderedHtml = events.map(event => {
        const timeComponents = calculateTimeSince(event.start_date);

        // Format the time difference descriptively
        let timeSinceFormatted = '';
        if (timeComponents.days > 0) {
            timeSinceFormatted += `${timeComponents.days} ${timeComponents.days === 1 ? 'day' : 'days'}`;
        }
        if (timeComponents.hours > 0) {
            timeSinceFormatted += `${timeSinceFormatted ? ', ' : ''}${timeComponents.hours} ${timeComponents.hours === 1 ? 'hour' : 'hours'}`;
        }
        if (timeComponents.minutes > 0) {
            timeSinceFormatted += `${timeSinceFormatted ? ', ' : ''}${timeComponents.minutes} ${timeComponents.minutes === 1 ? 'minute' : 'minutes'}`;
        }
        // Handle the case where the difference is less than a minute
        if (timeSinceFormatted === '') {
            timeSinceFormatted = 'Less than a minute';
        }

        return `
            <div class="days-since-event" data-id="${event.id}">
                <div class="event-info">
                    <div class="event-name">${escapeHtml(event.event_name)}</div>
                    <div class="event-date">Started: ${formatDate(event.start_date)}</div>
                    <div class="days-count">${timeSinceFormatted}</div>
                </div>
                <div class="event-actions">
                    <button class="edit-btn" onclick="editEvent(${event.id}, '${escapeHtml(event.event_name)}', '${event.start_date}')">Edit</button>
                    <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    console.log('Setting innerHTML:', renderedHtml); // Debug log
    daysSinceList.innerHTML = renderedHtml;

    // Update counters every minute
    setTimeout(() => loadEvents(), 60000);
}

// Define loadEvents function
async function loadEvents() {
    try {
        // Add cache-busting query parameter
        const response = await fetch('/api/days-since?' + new Date().getTime());
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const events = await response.json();
        console.log('Fetched events:', events); // Debug log
        renderEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        showStatus(document.getElementById('daysSinceListStatus'), 'Failed to load events', 'error');
    }
}

// Make functions available globally
window.loadEvents = loadEvents;
window.formatDate = formatDate;
window.showStatus = showStatus;
window.escapeHtml = escapeHtml;

document.addEventListener('DOMContentLoaded', () => {
    const addEventForm = document.getElementById('addEventForm');
    const addEventStatus = document.getElementById('addEventStatus');

    // Set default datetime to now in local timezone
    const now = new Date();
    // Format the date in local timezone
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const nowString = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById('eventStartDate').value = nowString;

    // Load events on page load
    loadEvents();

    // Handle form submission
    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value.trim();
        const startDate = document.getElementById('eventStartDate').value;

        if (!eventName || !startDate) {
            showStatus(addEventStatus, 'Please fill in all fields', 'error');
            return;
        }

        try {
            // Create a Date object in local time and preserve the local time
            // by sending the date string directly without timezone conversion
            const response = await fetch('/api/days-since', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventName,
                    startDate: startDate // Send the datetime-local value directly
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create event');
            }

            showStatus(addEventStatus, 'Event added successfully', 'success');
            addEventForm.reset();
            document.getElementById('eventStartDate').value = nowString; // Reset to current time
            await loadEvents(); // Wait for events to load
        } catch (error) {
            console.error('Error adding event:', error);
            showStatus(addEventStatus, 'Failed to add event', 'error');
        }
    });
});

// Global functions for event actions
window.editEvent = function(id, currentName, currentDate) {
    const eventElement = document.querySelector(`.days-since-event[data-id="${id}"]`);
    if (!eventElement) return;

    // Use current time instead of the event's time
    const now = new Date();

    // Format the current time for datetime-local input (YYYY-MM-DDTHH:MM)
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    const formattedCurrentTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    // Create and show edit form
    const editForm = document.createElement('form');
    editForm.classList.add('edit-form-inline'); // Add a class for potential styling
    editForm.innerHTML = `
        <h4>Editing Event</h4>
        <div class="form-group">
            <label for="editEventName_${id}">Event Name:</label>
            <input type="text" id="editEventName_${id}" value="${currentName}" required>
        </div>
        <div class="form-group">
            <label for="editEventDate_${id}">Start Date:</label>
            <input type="datetime-local" id="editEventDate_${id}" value="${formattedCurrentTime}" required>
        </div>
        <div class="edit-form-actions">
            <button type="submit" class="save-btn">Save</button>
            <button type="button" class="cancel-btn" onclick="cancelEdit(${id})">Cancel</button>
        </div>
        <div id="editStatus_${id}" class="status"></div>
    `;

    // Replace event content with the form
    eventElement.innerHTML = ''; // Clear existing content
    eventElement.appendChild(editForm);

    // Handle form submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedName = document.getElementById(`editEventName_${id}`).value.trim();
        const updatedDate = document.getElementById(`editEventDate_${id}`).value;
        const editStatus = document.getElementById(`editStatus_${id}`);

        if (!updatedName || !updatedDate) {
            showStatus(editStatus, 'Please fill in all fields', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/days-since/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventName: updatedName, startDate: updatedDate })
            });

            if (!response.ok) {
                throw new Error('Failed to update event');
            }

            showStatus(editStatus, 'Event updated!', 'success');
            // Reload events after a short delay to show the success message
            setTimeout(loadEvents, 1000);
        } catch (error) {
            console.error('Error updating event:', error);
            showStatus(editStatus, 'Failed to update event', 'error');
        }
    });
}

window.deleteEvent = async function(id) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }

    try {
        const response = await fetch(`/api/days-since/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete event');
        }

        showStatus(document.getElementById('daysSinceListStatus'), 'Event deleted successfully', 'success');
        loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        showStatus(document.getElementById('daysSinceListStatus'), 'Failed to delete event', 'error');
    }
}

window.cancelEdit = function(id) {
    loadEvents(); // Simplest way is to just reload the list
}