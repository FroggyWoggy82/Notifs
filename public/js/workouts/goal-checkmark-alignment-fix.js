/**
 * Goal Checkmark Alignment Fix
 * This script ensures the checkmark in the GOAL column is properly aligned with the checkboxes
 */

(function() {

    function alignCheckmarks() {
        console.log('[Goal Checkmark Alignment] Aligning checkmarks with checkboxes...');

        const checkboxes = document.querySelectorAll('.set-complete-toggle');

        const goalCheckmarks = document.querySelectorAll('.column-headers span:last-child');

        const columnHeaders = document.querySelectorAll('.column-headers span');

        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'flex';
            checkbox.style.alignItems = 'center';
            checkbox.style.justifyContent = 'center';
            checkbox.style.margin = '0 auto';
            checkbox.style.position = 'relative';

            if (checkbox.classList.contains('completed')) {

                checkbox.innerHTML = '';

                const checkmark = document.createElement('span');
                checkmark.textContent = '✓';
                checkmark.style.position = 'absolute';
                checkmark.style.top = '50%';
                checkmark.style.left = '50%';
                checkmark.style.transform = 'translate(-50%, -50%)';
                checkmark.style.fontSize = '16px';
                checkmark.style.lineHeight = '1';
                checkbox.appendChild(checkmark);
            }
        });

        columnHeaders.forEach(header => {
            header.style.display = 'flex';
            header.style.alignItems = 'center';
            header.style.justifyContent = 'center';
            header.style.height = '100%';
        });

        goalCheckmarks.forEach(checkmark => {
            checkmark.style.display = 'flex';
            checkmark.style.alignItems = 'center';
            checkmark.style.justifyContent = 'center';
            checkmark.style.height = '25px';
            checkmark.style.verticalAlign = 'middle';
        });

        const goalTargets = document.querySelectorAll('.goal-target');

        goalTargets.forEach(target => {
            target.style.display = 'flex';
            target.style.alignItems = 'center';
            target.style.justifyContent = 'center';
            target.style.height = '25px';
        });
    }

    function setupObserver() {

        const observer = new MutationObserver(function(mutations) {

            const shouldRealign = mutations.some(mutation => {

                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    return true;
                }

                if (mutation.type === 'attributes' &&
                    (mutation.target.classList.contains('set-complete-toggle') ||
                     mutation.target.classList.contains('goal-target'))) {
                    return true;
                }

                return false;
            });

            if (shouldRealign) {
                alignCheckmarks();
            }
        });

        const exerciseList = document.getElementById('current-exercise-list');
        if (exerciseList) {
            observer.observe(exerciseList, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
            console.log('[Goal Checkmark Alignment] Observer set up for exercise list');
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Goal Checkmark Alignment] DOM loaded');
        alignCheckmarks();
        setupObserver();
    });

    window.addEventListener('load', function() {
        console.log('[Goal Checkmark Alignment] Window loaded');
        alignCheckmarks();
    });

    setTimeout(alignCheckmarks, 500);
    setTimeout(alignCheckmarks, 1000);
    setTimeout(alignCheckmarks, 2000);
})();
