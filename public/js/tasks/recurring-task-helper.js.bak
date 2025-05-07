/**
 * Helper functions for recurring tasks
 */

/**
 * Creates the next occurrence of a recurring task
 * @param {number} taskId - The ID of the task to create the next occurrence for
 * @returns {Promise<Object|null>} The newly created task or null if creation failed
 */
window.createNextOccurrence = async function(taskId) {
    console.log(`Creating next occurrence for task ${taskId}...`);
    try {
        // Get the task details first to ensure we have the correct data
        const taskDetailsResponse = await fetch(`/api/tasks/${taskId}`);
        if (!taskDetailsResponse.ok) {
            console.error(`Failed to get task details: ${taskDetailsResponse.status}`);
            // Try to create the next occurrence using the API endpoint directly
            try {
                const nextOccurrenceResponse = await fetch(`/api/tasks/${taskId}/next-occurrence`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (nextOccurrenceResponse.ok) {
                    const nextOccurrence = await nextOccurrenceResponse.json();
                    console.log(`Next occurrence created via API endpoint: ${nextOccurrence.id}`);
                    return nextOccurrence;
                } else {
                    console.error(`Failed to create next occurrence via API: ${nextOccurrenceResponse.status}`);
                    return null;
                }
            } catch (apiError) {
                console.error('Error calling next-occurrence API:', apiError);
                return null;
            }
        }

        const taskDetails = await taskDetailsResponse.json();
        console.log(`Got task details:`, taskDetails);

        // Only proceed if this is a recurring task
        if (taskDetails.recurrence_type && taskDetails.recurrence_type !== 'none') {
            // Calculate the next due date
            const dueDate = new Date(taskDetails.due_date);
            const interval = taskDetails.recurrence_interval || 1;
            let nextDueDate = new Date(dueDate);

            // Calculate the next occurrence based on recurrence type
            switch (taskDetails.recurrence_type) {
                case 'daily':
                    nextDueDate.setDate(nextDueDate.getDate() + interval);
                    break;
                case 'weekly':
                    nextDueDate.setDate(nextDueDate.getDate() + (interval * 7));
                    break;
                case 'monthly':
                    nextDueDate.setMonth(nextDueDate.getMonth() + interval);
                    break;
                case 'yearly':
                    nextDueDate.setFullYear(nextDueDate.getFullYear() + interval);
                    break;
            }

            // Format the date as YYYY-MM-DD
            const formattedDate = nextDueDate.toISOString().split('T')[0];

            // Create a new task with the same details but a new due date
            // IMPORTANT: Set both assignedDate and dueDate to ensure it appears on the calendar
            const createResponse = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: taskDetails.title,
                    description: taskDetails.description,
                    assignedDate: formattedDate, // Set assigned date to ensure it appears on calendar
                    dueDate: formattedDate,
                    recurrenceType: taskDetails.recurrence_type,
                    recurrenceInterval: taskDetails.recurrence_interval
                })
            });

            if (createResponse.ok) {
                const nextOccurrence = await createResponse.json();
                console.log(`Next occurrence created: Task ${nextOccurrence.id} due on ${nextOccurrence.due_date}`);
                return nextOccurrence;
            } else {
                console.warn(`Failed to create next occurrence: ${createResponse.status}`);
                return null;
            }
        } else {
            console.log(`Task ${taskId} is not recurring, no next occurrence needed`);
            return null;
        }
    } catch (error) {
        console.error('Error creating next occurrence:', error);
        return null;
    }
}

/**
 * Shows a notification that the next occurrence was created
 * @param {string} taskTitle - The title of the task
 * @param {string} dueDate - The due date of the next occurrence
 */
window.showNextOccurrenceNotification = function(taskTitle, dueDate) {
    const notification = document.createElement('div');
    notification.className = 'status success';
    notification.textContent = `Next occurrence of "${taskTitle}" created for ${new Date(dueDate).toLocaleDateString()}`;
    document.body.appendChild(notification);

    // Remove the notification after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
