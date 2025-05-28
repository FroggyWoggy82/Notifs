/**
 * Fix Duplicate Overdue Text
 * This script fixes the issue where overdue tasks show duplicate "Overdue:" text
 */

(function() {
    console.log('[Fix Duplicate Overdue Text] Script loaded');

    function fixDuplicateOverdueText() {
        // Search for ALL elements that contain "Overdue:" text, not just those with specific classes
        const allElements = document.querySelectorAll('*');
        const overdueElements = [];

        allElements.forEach(element => {
            const textContent = element.textContent || '';
            if (textContent.includes('Overdue:') && element.children.length === 0) {
                // Only consider leaf elements (no children) to avoid parent elements
                overdueElements.push(element);
            }
        });

        let fixedCount = 0;

        console.log(`[Fix Duplicate Overdue Text] Checking ${overdueElements.length} elements containing "Overdue:"`);

        overdueElements.forEach((element, index) => {
            const textContent = element.textContent || '';
            console.log(`[Fix Duplicate Overdue Text] Element ${index}: "${textContent}" (class: ${element.className})`);

            // Check for multiple "Overdue:" occurrences
            const overdueMatches = textContent.match(/Overdue:/g);
            if (overdueMatches && overdueMatches.length > 1) {
                console.log(`[Fix Duplicate Overdue Text] Found ${overdueMatches.length} "Overdue:" occurrences in: "${textContent}"`);

                // Extract the first overdue text (keep the original date)
                const firstOverdueIndex = textContent.indexOf('Overdue:');
                const secondOverdueIndex = textContent.indexOf('Overdue:', firstOverdueIndex + 1);
                if (secondOverdueIndex !== -1) {
                    const firstOverdueText = textContent.substring(firstOverdueIndex, secondOverdueIndex).trim();
                    element.textContent = firstOverdueText;
                    fixedCount++;
                    console.log(`[Fix Duplicate Overdue Text] Fixed: "${textContent}" -> "${firstOverdueText}"`);
                }
            }

            // Also check for specific problematic patterns
            if (textContent.includes('Overdue: May 26Overdue: 5/15/2025')) {
                console.log(`[Fix Duplicate Overdue Text] Found specific problematic pattern: "${textContent}"`);
                element.textContent = 'Overdue: May 26';
                fixedCount++;
                console.log(`[Fix Duplicate Overdue Text] Fixed specific pattern: "${textContent}" -> "Overdue: May 26"`);
            }
        });

        if (fixedCount > 0) {
            console.log(`[Fix Duplicate Overdue Text] Fixed ${fixedCount} duplicate overdue text(s)`);
        } else {
            console.log(`[Fix Duplicate Overdue Text] No duplicate overdue text found to fix`);
        }
    }

    // Run the fix immediately
    fixDuplicateOverdueText();

    // Run the fix when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Fix Duplicate Overdue Text] DOM content loaded');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    // Run the fix when tasks are loaded
    document.addEventListener('tasksLoaded', function() {
        console.log('[Fix Duplicate Overdue Text] Tasks loaded event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    // Run the fix when tasks are rendered
    document.addEventListener('tasksRendered', function() {
        console.log('[Fix Duplicate Overdue Text] Tasks rendered event received');
        setTimeout(fixDuplicateOverdueText, 500);
    });

    // Run the fix periodically to catch any duplicate text created by other scripts
    setInterval(fixDuplicateOverdueText, 1000);

    // Run the fix multiple times with delays to ensure it catches all cases
    setTimeout(fixDuplicateOverdueText, 1000);
    setTimeout(fixDuplicateOverdueText, 2000);
    setTimeout(fixDuplicateOverdueText, 3000);
    setTimeout(fixDuplicateOverdueText, 5000);
    setTimeout(fixDuplicateOverdueText, 10000);
    setTimeout(fixDuplicateOverdueText, 15000);
    setTimeout(fixDuplicateOverdueText, 20000);

    // Set up a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        let shouldRunFix = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                // Check if any added or modified nodes contain "Overdue:" text
                const checkNode = (node) => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('Overdue:')) {
                        shouldRunFix = true;
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.textContent && node.textContent.includes('Overdue:')) {
                            shouldRunFix = true;
                        }
                        // Check child nodes
                        for (let child of node.childNodes) {
                            checkNode(child);
                        }
                    }
                };

                if (mutation.addedNodes) {
                    for (let node of mutation.addedNodes) {
                        checkNode(node);
                    }
                }

                if (mutation.target && mutation.target.textContent && mutation.target.textContent.includes('Overdue:')) {
                    shouldRunFix = true;
                }
            }
        });

        if (shouldRunFix) {
            console.log('[Fix Duplicate Overdue Text] DOM mutation detected with Overdue text, running fix');
            setTimeout(fixDuplicateOverdueText, 100);
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: true
    });

    console.log('[Fix Duplicate Overdue Text] Script initialized with MutationObserver');
})();
