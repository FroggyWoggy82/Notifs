


document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar heading fix loaded');

    function overrideHeadingStyles() {

        const headings = document.querySelectorAll('#selectedTaskList h4');

        headings.forEach(heading => {

            heading.style.removeProperty('color');
            heading.style.removeProperty('margin-top');

            console.log('Found heading:', heading.textContent);
        });
    }

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {

            if (mutation.addedNodes.length) {

                mutation.addedNodes.forEach(node => {

                    if (node.nodeType === 1) {

                        if (node.tagName === 'H4') {
                            overrideHeadingStyles();
                        }

                        else if (node.querySelectorAll) {
                            const headings = node.querySelectorAll('h4');
                            if (headings.length) {
                                overrideHeadingStyles();
                            }
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    overrideHeadingStyles();
});
