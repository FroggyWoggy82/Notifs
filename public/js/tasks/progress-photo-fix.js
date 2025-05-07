/**
 * Special fix for Progress Photo task
 * Removes the Weekly indicator and green dot from the Progress Photo task
 */

document.addEventListener('DOMContentLoaded', function() {

    function fixProgressPhotoTask() {

        const taskTitles = document.querySelectorAll('.task-title');
        
        taskTitles.forEach(title => {
            if (title.textContent === 'Progress Photo') {
                console.log('Found Progress Photo task, applying fix');

                const taskItem = title.closest('.task-item');
                if (taskItem) {
                    taskItem.classList.add('progress-photo-task');
                }

                title.classList.add('progress-photo-title');

                const titleContainer = title.closest('.task-title-container');
                if (titleContainer) {
                    titleContainer.classList.remove('recurring', 'weekly', 'daily', 'monthly', 'yearly');
                }

                title.classList.remove('recurring');

                title.removeAttribute('data-recurrence-text');
            }
        });
    }

    fixProgressPhotoTask();

    document.addEventListener('tasksLoaded', fixProgressPhotoTask);
    document.addEventListener('taskUpdated', fixProgressPhotoTask);

    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {

                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node

                        if (node.classList && node.classList.contains('task-item') || 
                            node.querySelector && node.querySelector('.task-item')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            fixProgressPhotoTask();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
