/**
 * Remove Film Icon
 * This script removes the film icon from the Add Video button in the workout options menu
 */

(function() {

    function patchCreateExerciseItem() {

        if (typeof window.createExerciseItem === 'function') {
            const originalCreateExerciseItem = window.createExerciseItem;

            window.createExerciseItem = function(exerciseData, index, isTemplate = false) {

                const element = originalCreateExerciseItem(exerciseData, index, isTemplate);

                if (element) {
                    const viewButton = element.querySelector('.btn-view-exercise');
                    if (viewButton) {

                        const text = viewButton.textContent.trim();

                        if (text.includes('🎬')) {
                            viewButton.textContent = text.replace('🎬', '').trim();
                        }
                    }
                }
                
                return element;
            };
            
            console.log('[Remove Film Icon] Successfully patched createExerciseItem function');
        }
    }

    function modifyTemplateStrings() {

        const scripts = document.querySelectorAll('script');
        
        scripts.forEach(script => {
            if (script.textContent.includes('btn-view-exercise') && script.textContent.includes('🎬')) {

                const originalContent = script.textContent;
                const modifiedContent = originalContent.replace(/🎬\s+/g, '');

                const newScript = document.createElement('script');
                newScript.textContent = modifiedContent;

                if (script.parentNode) {
                    script.parentNode.replaceChild(newScript, script);
                    console.log('[Remove Film Icon] Modified template string in script tag');
                }
            }
        });
    }

    function removeFilmIconFromButtons() {

        const addVideoButtons = document.querySelectorAll('.btn-view-exercise');
        
        addVideoButtons.forEach(button => {

            const text = button.textContent.trim();

            if (text.includes('🎬')) {
                button.textContent = text.replace('🎬', '').trim();
                console.log('[Remove Film Icon] Removed film icon from button');
            }
        });
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && node.classList.contains('btn-view-exercise')) {

                                const text = node.textContent.trim();
                                if (text.includes('🎬')) {
                                    node.textContent = text.replace('🎬', '').trim();
                                    console.log('[Remove Film Icon] Removed film icon from new button');
                                }
                            }

                            const buttons = node.querySelectorAll('.btn-view-exercise');
                            buttons.forEach(button => {
                                const text = button.textContent.trim();
                                if (text.includes('🎬')) {
                                    button.textContent = text.replace('🎬', '').trim();
                                    console.log('[Remove Film Icon] Removed film icon from new button (child)');
                                }
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('[Remove Film Icon] Started observing DOM changes');
    }

    function init() {
        console.log('[Remove Film Icon] Initializing...');

        patchCreateExerciseItem();

        modifyTemplateStrings();

        removeFilmIconFromButtons();

        observeDOMChanges();
        
        console.log('[Remove Film Icon] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
