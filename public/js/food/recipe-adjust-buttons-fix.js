/**
 * Recipe Adjust Buttons Fix
 * Ensures the Set button and adjustment buttons are properly styled
 */

(function() {

    function fixAdjustButtonsStyling() {
        console.log('[Recipe Adjust Buttons Fix] Fixing adjust buttons styling...');

        const setButtons = document.querySelectorAll('button:not([style*="background-color: rgb(255, 255, 255)"]');
        setButtons.forEach(button => {

            if (button.textContent.trim() === 'Set' ||
                button.value === 'Set' ||
                button.id && button.id.includes('set-btn') ||
                button.className && button.className.includes('set-btn')) {

                console.log('[Recipe Adjust Buttons Fix] Found Set button:', button);

                button.style.backgroundColor = '#ffffff';
                button.style.color = '#121212';
                button.style.border = 'none';
                button.style.borderRadius = '4px';
                button.style.padding = '8px 16px';
                button.style.fontWeight = 'normal';
                button.style.transition = 'all 0.2s ease';
                button.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';

                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.3)';
                });

                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
                });
            }
        });

        const adjustButtons = document.querySelectorAll('button');
        adjustButtons.forEach(button => {

            if (button.textContent.includes('-25%') ||
                button.textContent.includes('+25%') ||
                button.textContent.includes('-200') ||
                button.textContent.includes('+200') ||
                button.id && button.id.includes('adjust-btn') ||
                button.className && button.className.includes('adjust-btn')) {

                console.log('[Recipe Adjust Buttons Fix] Found adjustment button:', button);

                button.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                button.style.color = '#ffffff';
                button.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                button.style.borderRadius = '4px';
                button.style.padding = '8px 16px';
                button.style.fontWeight = 'normal';
                button.style.transition = 'all 0.2s ease';

                button.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                });

                button.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                });
            }
        });

        const calInputs = document.querySelectorAll('input[type="text"], input[type="number"], input');
        calInputs.forEach(input => {

            if (input.id && input.id.includes('cal-total') ||
                input.name && input.name.includes('cal-total') ||
                input.placeholder && input.placeholder.includes('Cal')) {

                console.log('[Recipe Adjust Buttons Fix] Found calorie input field:', input);

                input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                input.style.color = '#e0e0e0';
                input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                input.style.borderRadius = '4px';
                input.style.padding = '8px 12px';

                input.addEventListener('focus', function() {
                    this.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    this.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.1)';
                });

                input.addEventListener('blur', function() {
                    this.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    this.style.boxShadow = 'none';
                });
            }
        });

        console.log('[Recipe Adjust Buttons Fix] Adjust buttons styling fixed');
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.tagName === 'BUTTON') {
                                fixAdjustButtonsStyling();
                            }

                            const buttons = node.querySelectorAll('button');
                            if (buttons.length) {
                                fixAdjustButtonsStyling();
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
    }

    function init() {
        console.log('[Recipe Adjust Buttons Fix] Initializing...');

        setTimeout(fixAdjustButtonsStyling, 500); // Delay to ensure the DOM is fully loaded

        observeDOMChanges();

        console.log('[Recipe Adjust Buttons Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('load', function() {
        setTimeout(fixAdjustButtonsStyling, 1000); // Additional delay to catch late-loading elements
    });

    document.addEventListener('click', function(event) {

        if (event.target.textContent.trim() === 'Adjust' ||
            event.target.value === 'Adjust' ||
            event.target.id && event.target.id.includes('adjust') ||
            event.target.className && event.target.className.includes('adjust')) {

            console.log('[Recipe Adjust Buttons Fix] Adjust button clicked, fixing Set button styling...');

            setTimeout(fixAdjustButtonsStyling, 100);
        }
    });
})();
