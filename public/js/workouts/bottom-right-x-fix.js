/**
 * Bottom Right X Fix
 * This script specifically positions the X button in the bottom right corner of the Weight Increment section
 */

(function() {

    fixBottomRightXButton();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixBottomRightXButton);
    } else {
        fixBottomRightXButton();
    }

    setInterval(fixBottomRightXButton, 500);
    
    function fixBottomRightXButton() {

        const containers = document.querySelectorAll('.weight-increment-container');
        
        containers.forEach(container => {

            const buttons = container.querySelectorAll('button');

            buttons.forEach(button => {

                button.style.position = 'absolute';
                button.style.bottom = '10px';
                button.style.right = '10px';
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
                button.style.backgroundColor = '#f44336';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.borderRadius = '4px';
                button.style.width = '28px';
                button.style.height = '28px';
                button.style.fontSize = '1.5rem';
                button.style.fontWeight = 'bold';
                button.style.cursor = 'pointer';
                button.style.zIndex = '1000';
                button.style.visibility = 'visible';
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';

                button.innerHTML = '×';
            });

            container.style.position = 'relative';
            container.style.minHeight = '80px';
            container.style.paddingBottom = '40px';

            if (buttons.length === 0) {
                const newButton = document.createElement('button');
                newButton.type = 'button';
                newButton.className = 'weight-increment-x-button';
                newButton.textContent = '×';

                newButton.style.position = 'absolute';
                newButton.style.bottom = '10px';
                newButton.style.right = '10px';
                newButton.style.display = 'flex';
                newButton.style.alignItems = 'center';
                newButton.style.justifyContent = 'center';
                newButton.style.backgroundColor = '#f44336';
                newButton.style.color = 'white';
                newButton.style.border = 'none';
                newButton.style.borderRadius = '4px';
                newButton.style.width = '28px';
                newButton.style.height = '28px';
                newButton.style.fontSize = '1.5rem';
                newButton.style.fontWeight = 'bold';
                newButton.style.cursor = 'pointer';
                newButton.style.zIndex = '1000';

                newButton.addEventListener('click', function() {
                    const input = container.querySelector('input');
                    if (input) {
                        input.value = '';
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });

                container.appendChild(newButton);
            }
        });
    }
})();
