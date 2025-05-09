/**
 * Force Mobile Layout
 * This script applies inline styles directly to workout elements to ensure
 * they have the correct size on mobile devices, overriding any conflicting CSS.
 */

document.addEventListener('DOMContentLoaded', function() {

    if (window.innerWidth <= 599) {
        console.log('Applying forced mobile layout styles');

        // Debounce function to prevent excessive style applications
        function debounce(func, wait) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }

        // Apply styles in batches using requestAnimationFrame for better performance
        function applyForcedStyles() {
            if (!document.getElementById('current-exercise-list')) {
                return; // Exit early if the element doesn't exist
            }

            // Use requestAnimationFrame to align with browser rendering
            requestAnimationFrame(() => {
                // Cache selectors to reduce DOM queries
                const setRows = document.querySelectorAll('#current-exercise-list .set-row');
                const columnHeaders = document.querySelectorAll('.column-headers');
                
                // Apply styles to rows
                setRows.forEach(row => {
                    // Reset positions only if needed
                    if (row.children.length > 0 && (!row.dataset.mobileStylesApplied || row.dataset.mobileStylesApplied !== 'true')) {
                        Array.from(row.children).forEach(child => {
                            child.style.position = '';
                            child.style.left = '';
                            child.style.top = '';
                        });

                        row.style.display = 'grid';
                        row.style.gridTemplateColumns = '25px 65px 30px 30px 65px 25px';
                        row.style.alignItems = 'center';
                        row.style.width = '100%';
                        row.style.gap = '0';
                        row.style.justifyContent = 'space-between';
                        
                        // Mark as processed to avoid redundant operations
                        row.dataset.mobileStylesApplied = 'true';
                    }
                });

                // Apply styles to column headers
                columnHeaders.forEach(header => {
                    if (!header.dataset.mobileStylesApplied || header.dataset.mobileStylesApplied !== 'true') {
                        header.style.display = 'grid';
                        header.style.gridTemplateColumns = '25px 65px 30px 30px 65px 25px';
                        header.style.alignItems = 'center';
                        header.style.width = '100%';
                        header.style.gap = '0';
                        header.style.justifyContent = 'space-between';
                        
                        header.dataset.mobileStylesApplied = 'true';
                    }
                });

                // Process specific elements in scheduled chunks to prevent UI freezing
                applyStylesToElements('.set-row .set-number', el => {
                    el.style.width = '25px';
                    el.style.textAlign = 'center';
                    el.style.fontSize = '0.7rem';
                    el.style.gridColumn = '1';
                });

                applyStylesToElements('.set-row .previous-log', el => {
                    el.style.width = '65px';
                    el.style.fontSize = '0.7rem';
                    el.style.textAlign = 'center';
                    el.style.whiteSpace = 'nowrap';
                    el.style.overflow = 'visible';
                    el.style.textOverflow = 'ellipsis';
                    el.style.gridColumn = '2';
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                });

                applyStylesToElements('.set-row .weight-input', el => {
                    el.style.width = '30px';
                    el.style.padding = '0';
                    el.style.textAlign = 'center';
                    el.style.fontSize = '0.7rem';
                    el.style.justifySelf = 'center';
                    el.style.gridColumn = '3';
                });

                applyStylesToElements('.set-row .reps-input', el => {
                    el.style.width = '30px';
                    el.style.padding = '0';
                    el.style.textAlign = 'center';
                    el.style.fontSize = '0.7rem';
                    el.style.justifySelf = 'center';
                    el.style.gridColumn = '4';
                });

                applyStylesToElements('.set-row .goal-target', el => {
                    el.style.width = '65px';
                    el.style.fontSize = '0.7rem';
                    el.style.textAlign = 'center';
                    el.style.whiteSpace = 'nowrap';
                    el.style.overflow = 'visible';
                    el.style.textOverflow = 'ellipsis';
                    el.style.gridColumn = '5';
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                });

                applyStylesToElements('.set-row .set-complete-toggle', el => {
                    el.style.width = '25px';
                    el.style.height = '25px';
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                    el.style.justifySelf = 'center';
                    el.style.gridColumn = '6';
                });

                // Process header spans with simplified text
                const headerSpans = document.querySelectorAll('.column-headers span');
                headerSpans.forEach((span, index) => {
                    if (!span.dataset.mobileStylesApplied || span.dataset.mobileStylesApplied !== 'true') {
                        span.style.textAlign = 'center';
                        span.style.fontSize = '0.65rem';
                        span.style.fontWeight = 'bold';
                        span.style.justifySelf = 'center';
                        span.style.gridColumn = (index + 1).toString();
                        span.style.display = 'flex';
                        span.style.alignItems = 'center';
                        span.style.justifyContent = 'center';

                        if (index === 1 && span.textContent === 'Previous') {
                            span.textContent = 'Prev';
                        } else if (index === 2 && span.textContent === 'Weight') {
                            span.textContent = 'Wt';
                        }
                        
                        span.dataset.mobileStylesApplied = 'true';
                    }
                });

                console.log('Forced mobile layout styles applied');
            });
        }

        // Helper function to process elements in smaller batches
        function applyStylesToElements(selector, styleCallback) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!el.dataset.mobileStylesApplied || el.dataset.mobileStylesApplied !== 'true') {
                    styleCallback(el);
                    el.dataset.mobileStylesApplied = 'true';
                }
            });
        }

        // Initial application of styles
        applyForcedStyles();

        // Apply styles after a short delay to ensure all DOM elements are ready
        setTimeout(applyForcedStyles, 500);

        // Use a debounced version for the observer to prevent excessive callbacks
        const debouncedApplyStyles = debounce(applyForcedStyles, 100);

        // Observe changes with a more efficient configuration
        const exerciseList = document.getElementById('current-exercise-list');
        if (exerciseList) {
            const observer = new MutationObserver(debouncedApplyStyles);
            
            observer.observe(exerciseList, {
                childList: true,
                subtree: true,
                attributes: false,  // Don't observe attribute changes
                characterData: false // Don't observe text changes
            });
        }
        
        // Cleanup observer when navigating away
        window.addEventListener('beforeunload', () => {
            if (observer) {
                observer.disconnect();
            }
        });
    }
});
