/**
 * X Button SVG Fix
 * This script replaces the X character with an SVG icon as a last resort
 */

(function() {

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSvgFix);
    } else {
        initSvgFix();
    }

    function initSvgFix() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE) {

                            const deleteButtons = node.querySelectorAll('.btn-delete-exercise');

                            if (deleteButtons.length > 0) {
                                deleteButtons.forEach(replaceSvg);
                            }

                            if (node.classList && node.classList.contains('btn-delete-exercise')) {
                                replaceSvg(node);
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

        document.querySelectorAll('.btn-delete-exercise').forEach(replaceSvg);

        document.addEventListener('click', event => {
            if (event.target.classList.contains('btn-exercise-options')) {

                setTimeout(() => {
                    document.querySelectorAll('.btn-delete-exercise').forEach(replaceSvg);
                }, 100);
            }
        });
    }

    function replaceSvg(button) {

        const originalClickHandler = button.onclick;
        const workoutIndex = button.dataset.workoutIndex;

        button.innerHTML = '&#10005;'; // HTML entity for "✕" (U+2715 MULTIPLICATION X)

        button.style.fontSize = '0.9rem';
        button.style.fontWeight = 'bold';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.color = '#f44336';
        button.style.backgroundColor = 'transparent';
        button.style.border = '1px solid #f44336';
        button.style.borderRadius = '4px';
        button.style.padding = '2px 6px';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.cursor = 'pointer';
        button.style.textTransform = 'uppercase';
        button.style.minWidth = '30px';
        button.style.height = '24px';
        button.style.lineHeight = '1';

        if (workoutIndex) {
            button.dataset.workoutIndex = workoutIndex;
        }

        button.title = 'Remove Exercise';

        button.addEventListener('mouseover', function() {
            button.style.backgroundColor = '#f44336';
            button.style.color = 'white';
        });

        button.addEventListener('mouseout', function() {
            button.style.backgroundColor = 'transparent';
            button.style.color = '#f44336';
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
