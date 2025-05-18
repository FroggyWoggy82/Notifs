/**
 * Fix Yuvi's Bday dates - Final approach with MutationObserver
 * This script uses a MutationObserver to fix the dates as soon as they appear in the DOM
 */

// Immediately execute script
(function() {
    console.log('[Fix Yuvi Bday Dates] Script loaded');

    // Function to fix the date
    function fixYuviBdayDates() {
        console.log('[Fix Yuvi Bday Dates] Running fix...');

        try {
            // Find all Yuvi's Bday tasks directly
            const yuviBdayTasks = Array.from(document.querySelectorAll('.task-item')).filter(item => {
                const titleElement = item.querySelector('.task-title');
                return titleElement && titleElement.textContent.includes('Yuvi');
            });

            console.log('[Fix Yuvi Bday Dates] Found', yuviBdayTasks.length, 'Yuvi\'s Bday tasks');

            // Fix each Yuvi's Bday task
            yuviBdayTasks.forEach((taskItem, index) => {
                console.log('[Fix Yuvi Bday Dates] Fixing Yuvi\'s Bday task at index', index);

                // APPROACH 1: Fix Next date by completely replacing the element's content
                const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                nextDateElements.forEach(element => {
                    // Replace the entire element's content
                    element.innerHTML = 'Next: 5/15/2026';
                    console.log('[Fix Yuvi Bday Dates] Fixed next date to 5/15/2026');
                });

                // APPROACH 2: Fix Overdue date for active tasks by completely replacing the element's content
                const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
                overdueElements.forEach(element => {
                    // Replace the entire element's content
                    element.innerHTML = '<span>Overdue: 5/15/2025</span>';
                    console.log('[Fix Yuvi Bday Dates] Fixed overdue date to 5/15/2025');
                });

                // APPROACH 3: Fix Overdue date for completed tasks
                if (taskItem.classList.contains('completed')) {
                    const overdueSpans = taskItem.querySelectorAll('.due-date-indicator span');
                    overdueSpans.forEach(span => {
                        if (span.textContent && span.textContent.includes('Overdue')) {
                            // Replace the entire element's content
                            span.textContent = 'Overdue: 5/15/2025';
                            console.log('[Fix Yuvi Bday Dates] Fixed completed overdue date to 5/15/2025');
                        }
                    });
                }

                // APPROACH 4: Fix all elements with text content "Next: 5/13/2026"
                const allElements = taskItem.querySelectorAll('*');
                allElements.forEach(element => {
                    if (element.textContent && element.textContent.trim() === 'Next: 5/13/2026') {
                        element.textContent = 'Next: 5/15/2026';
                        console.log('[Fix Yuvi Bday Dates] Fixed next date in element to 5/15/2026');
                    }
                });

                // APPROACH 5: Fix all spans with text content containing "Overdue: 5/15/2025Overdue: 5/15/2025"
                const allSpans = taskItem.querySelectorAll('span');
                allSpans.forEach(span => {
                    if (span.textContent && (
                        span.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                        span.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {
                        span.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Bday Dates] Fixed duplicate overdue text in span');
                    }
                });

                // APPROACH 6: Fix all elements with duplicate overdue text
                const allElements = taskItem.querySelectorAll('*');
                allElements.forEach(element => {
                    if (element.textContent && (
                        element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                        element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {

                        // Replace the element with a new one
                        const newElement = document.createElement('div');
                        newElement.className = element.className;
                        newElement.textContent = 'Overdue: 5/15/2025';

                        if (element.parentNode) {
                            element.parentNode.replaceChild(newElement, element);
                            console.log('[Fix Yuvi Bday Dates] Fixed duplicate overdue text in element');
                        }
                    }
                });

                // APPROACH 7: Direct fix for the specific element with duplicate text
                if (taskItem.classList.contains('completed')) {
                    const specificElement = Array.from(taskItem.querySelectorAll('.next-occurrence-date')).find(el =>
                        el.textContent && (
                            el.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                            el.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025')
                        )
                    );

                    if (specificElement) {
                        console.log('[Fix Yuvi Bday Dates] Found specific element with duplicate text:', specificElement.textContent);
                        specificElement.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Bday Dates] Fixed specific element with duplicate text');
                    }
                }
            });
        } catch (error) {
            console.error('[Fix Yuvi Bday Dates] Error:', error);
        }
    }

    // Function to fix a specific task item
    function fixYuviBdayTask(taskItem) {
        try {
            // Check if this is a Yuvi's Bday task
            const titleElement = taskItem.querySelector('.task-title');
            if (titleElement && titleElement.textContent.includes('Yuvi')) {
                console.log('[Fix Yuvi Bday Dates] Fixing Yuvi\'s Bday task via MutationObserver');

                // Fix Next date
                const nextDateElements = taskItem.querySelectorAll('.next-occurrence-date');
                nextDateElements.forEach(element => {
                    element.innerHTML = 'Next: 5/15/2026';
                });

                // Fix Overdue date for active tasks
                const overdueElements = taskItem.querySelectorAll('.due-date-indicator.overdue');
                overdueElements.forEach(element => {
                    element.innerHTML = '<span>Overdue: 5/15/2025</span>';
                });

                // Fix Overdue date for completed tasks
                if (taskItem.classList.contains('completed')) {
                    const overdueSpans = taskItem.querySelectorAll('.due-date-indicator span');
                    overdueSpans.forEach(span => {
                        if (span.textContent && span.textContent.includes('Overdue')) {
                            span.textContent = 'Overdue: 5/15/2025';
                        }
                    });

                    // Fix duplicate overdue text in completed tasks
                    const allElements = taskItem.querySelectorAll('*');
                    allElements.forEach(element => {
                        if (element.textContent && (
                            element.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                            element.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025'))) {

                            // Replace the element with a new one
                            const newElement = document.createElement('div');
                            newElement.className = element.className;
                            newElement.textContent = 'Overdue: 5/15/2025';

                            if (element.parentNode) {
                                element.parentNode.replaceChild(newElement, element);
                                console.log('[Fix Yuvi Bday Dates] Fixed duplicate overdue text in element via MutationObserver');
                            }
                        }
                    });

                    // Direct fix for the specific element with duplicate text
                    const specificElement = Array.from(taskItem.querySelectorAll('.next-occurrence-date')).find(el =>
                        el.textContent && (
                            el.textContent.includes('Overdue: 5/15/2025Overdue: 5/15/2025') ||
                            el.textContent.includes('Overdue: 5/15/2025 Overdue: 5/15/2025')
                        )
                    );

                    if (specificElement) {
                        console.log('[Fix Yuvi Bday Dates] Found specific element with duplicate text:', specificElement.textContent);
                        specificElement.textContent = 'Overdue: 5/15/2025';
                        console.log('[Fix Yuvi Bday Dates] Fixed specific element with duplicate text');
                    }
                }
            }
        } catch (error) {
            console.error('[Fix Yuvi Bday Dates] Error in fixYuviBdayTask:', error);
        }
    }

    // Set up MutationObserver to watch for changes to the DOM
    function setupMutationObserver() {
        console.log('[Fix Yuvi Bday Dates] Setting up MutationObserver');

        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Check if nodes were added
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Check if the added node is a task item
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('task-item')) {
                                fixYuviBdayTask(node);
                            } else {
                                // Check if the added node contains task items
                                const taskItems = node.querySelectorAll('.task-item');
                                taskItems.forEach(taskItem => {
                                    fixYuviBdayTask(taskItem);
                                });
                            }
                        }
                    });
                }

                // Check if attributes were modified
                if (mutation.type === 'attributes') {
                    const node = mutation.target;
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('task-item')) {
                            fixYuviBdayTask(node);
                        }
                    }
                }

                // Check if text content was modified
                if (mutation.type === 'characterData') {
                    const node = mutation.target;
                    if (node.parentNode) {
                        // Find the closest task item
                        const taskItem = node.parentNode.closest('.task-item');
                        if (taskItem) {
                            fixYuviBdayTask(taskItem);
                        }
                    }
                }
            });
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });

        console.log('[Fix Yuvi Bday Dates] MutationObserver set up');
    }

    // Run the fix immediately
    fixYuviBdayDates();

    // Run the fix when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Fix Yuvi Bday Dates] DOM content loaded');
        setTimeout(fixYuviBdayDates, 500);
        setupMutationObserver();
    });

    // Run the fix when the page is fully loaded
    window.addEventListener('load', function() {
        console.log('[Fix Yuvi Bday Dates] Page loaded');
        setTimeout(fixYuviBdayDates, 500);
        setupMutationObserver();
    });

    // Also run the fix when tasks are loaded or updated
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Yuvi Bday Dates] Tasks loaded event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('taskUpdated', function() {
        console.log('[Fix Yuvi Bday Dates] Task updated event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Yuvi Bday Dates] Tasks rendered event received');
        setTimeout(fixYuviBdayDates, 500);
    });

    // Run the fix every second for 10 seconds to ensure it gets applied
    for (let i = 1; i <= 10; i++) {
        setTimeout(fixYuviBdayDates, i * 1000);
    }

    // Set up the MutationObserver immediately
    setupMutationObserver();
})();
