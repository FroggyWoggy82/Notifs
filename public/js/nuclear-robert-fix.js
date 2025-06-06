/**
 * Nuclear Robert Fix
 * Aggressively replaces any occurrence of 5/15/2025 with 6/5/2025
 */

(function() {
    'use strict';
    
    console.log('[NUCLEAR ROBERT FIX] Script loaded');
    
    function nuclearReplace() {
        try {
            let replacedCount = 0;
            
            // Find ALL elements on the page
            const allElements = document.querySelectorAll('*');
            
            allElements.forEach(el => {
                // Check text content
                if (el.textContent && el.textContent.includes('5/15/2025')) {
                    console.log('[NUCLEAR] Found 5/15/2025 in:', el.textContent);
                    
                    // Method 1: Direct text replacement
                    if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                        el.textContent = el.textContent.replace(/5\/15\/2025/g, '6/5/2025');
                        replacedCount++;
                        console.log('[NUCLEAR] Replaced via textContent');
                    }
                    
                    // Method 2: innerHTML replacement
                    if (el.innerHTML && el.innerHTML.includes('5/15/2025')) {
                        el.innerHTML = el.innerHTML.replace(/5\/15\/2025/g, '6/5/2025');
                        replacedCount++;
                        console.log('[NUCLEAR] Replaced via innerHTML');
                    }
                    
                    // Method 3: Walk through all text nodes
                    function replaceInTextNodes(node) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            if (node.textContent.includes('5/15/2025')) {
                                node.textContent = node.textContent.replace(/5\/15\/2025/g, '6/5/2025');
                                replacedCount++;
                                console.log('[NUCLEAR] Replaced via text node');
                            }
                        } else {
                            for (let child of node.childNodes) {
                                replaceInTextNodes(child);
                            }
                        }
                    }
                    replaceInTextNodes(el);
                }
            });
            
            if (replacedCount > 0) {
                console.log(`[NUCLEAR] Replaced ${replacedCount} occurrences of 5/15/2025`);
            }
            
        } catch (error) {
            console.error('[NUCLEAR] Error:', error);
        }
    }
    
    // Run immediately
    nuclearReplace();
    
    // Run when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[NUCLEAR] DOM loaded, running fix...');
        nuclearReplace();
    });
    
    // Run when tasks are loaded
    document.addEventListener('tasksLoaded', function() {
        console.log('[NUCLEAR] Tasks loaded, running fix...');
        nuclearReplace();
    });
    
    // Set up aggressive mutation observer
    const observer = new MutationObserver(function(mutations) {
        let shouldFix = false;
        
        mutations.forEach(function(mutation) {
            // Check for any changes
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                shouldFix = true;
            }
            
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                const target = mutation.target;
                if (target.textContent && target.textContent.includes('5/15/2025')) {
                    shouldFix = true;
                    console.log('[NUCLEAR] Detected 5/15/2025 in mutation');
                }
            }
        });
        
        if (shouldFix) {
            setTimeout(nuclearReplace, 10); // Very fast response
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });
    
    // Run the fix every 500ms for the first 30 seconds
    for (let i = 1; i <= 60; i++) {
        setTimeout(nuclearReplace, i * 500);
    }
    
    // Also run it every 5 seconds indefinitely
    setInterval(nuclearReplace, 5000);
    
    console.log('[NUCLEAR] All observers and intervals set up');
})();
