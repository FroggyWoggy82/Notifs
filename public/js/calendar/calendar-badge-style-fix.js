


document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar badge style fix loaded');

    function overrideBadgeStyles() {

        const badgeSpans = document.querySelectorAll('#selectedTaskList span[style*="background-color"]');

        badgeSpans.forEach(badge => {

            badge.style.removeProperty('background-color');
            badge.style.removeProperty('color');
            badge.style.removeProperty('box-shadow');

            badge.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            badge.style.color = 'white';
            badge.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        });
    }

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {

            if (mutation.addedNodes.length) {

                mutation.addedNodes.forEach(node => {

                    if (node.nodeType === 1) {

                        if (node.tagName === 'SPAN' && node.style && node.style.backgroundColor) {
                            overrideBadgeStyles();
                        }

                        else if (node.querySelectorAll) {
                            const spans = node.querySelectorAll('span[style*="background-color"]');
                            if (spans.length) {
                                overrideBadgeStyles();
                            }
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    overrideBadgeStyles();
});
