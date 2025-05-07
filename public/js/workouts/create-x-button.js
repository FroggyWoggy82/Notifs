/**
 * Create X Button
 * This script creates a proper X button using a different approach
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCreateX);
    } else {
        initCreateX();
    }

    function initCreateX() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const deleteButtons = node.querySelectorAll('.btn-delete-exercise');

                            if (deleteButtons.length > 0) {
                                deleteButtons.forEach(createXButton);
                            }

                            if (node.classList && node.classList.contains('btn-delete-exercise')) {
                                createXButton(node);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        document.querySelectorAll('.btn-delete-exercise').forEach(createXButton);

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    document.querySelectorAll('.btn-delete-exercise').forEach(createXButton);
                }, 100);
            }
        });
    }

    function createXButton(button) {

        const originalClickHandler = button.onclick;

        const workoutIndex = button.dataset.workoutIndex;

        button.innerHTML = '';

        const xContainer = document.createElement('div');
        xContainer.style.position = 'relative';
        xContainer.style.width = '16px';
        xContainer.style.height = '16px';

        const line1 = document.createElement('div');
        line1.style.position = 'absolute';
        line1.style.width = '16px';
        line1.style.height = '2px';
        line1.style.backgroundColor = '#f44336';
        line1.style.top = '50%';
        line1.style.left = '0';
        line1.style.transform = 'translateY(-50%) rotate(45deg)';
        line1.style.pointerEvents = 'none'; // Ensure clicks pass through to the button

        const line2 = document.createElement('div');
        line2.style.position = 'absolute';
        line2.style.width = '16px';
        line2.style.height = '2px';
        line2.style.backgroundColor = '#f44336';
        line2.style.top = '50%';
        line2.style.left = '0';
        line2.style.transform = 'translateY(-50%) rotate(-45deg)';
        line2.style.pointerEvents = 'none'; // Ensure clicks pass through to the button

        xContainer.appendChild(line1);
        xContainer.appendChild(line2);
        xContainer.style.pointerEvents = 'none'; // Ensure clicks pass through to the button

        button.appendChild(xContainer);

        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.backgroundColor = 'transparent';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.padding = '4px';

        if (workoutIndex) {
            button.dataset.workoutIndex = workoutIndex;
        }

        button.title = 'Remove Exercise';

        button.addEventListener('mouseover', function() {
            line1.style.backgroundColor = '#d32f2f';
            line2.style.backgroundColor = '#d32f2f';
        });

        button.addEventListener('mouseout', function() {
            line1.style.backgroundColor = '#f44336';
            line2.style.backgroundColor = '#f44336';
        });

        button.onclick = function(event) {

            if (typeof window.handleDeleteExercise === 'function') {
                window.handleDeleteExercise(event);
            } else if (typeof originalClickHandler === 'function') {
                originalClickHandler(event);
            }
        };
    }
})();
