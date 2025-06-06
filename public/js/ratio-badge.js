/**
 * General Ratio Badge System
 * Adds ratio badges to various elements based on data attributes
 */

/**
 * Add ratio badges to elements with data-ratio attributes
 */
function addRatioBadges() {
    console.log('[Ratio Badge] Starting addRatioBadges function...');
    
    // Find all elements with data-ratio attributes
    const elementsWithRatio = document.querySelectorAll('[data-ratio]');
    console.log(`[Ratio Badge] Found ${elementsWithRatio.length} elements with data-ratio attributes`);
    
    elementsWithRatio.forEach((element, index) => {
        const ratioData = element.getAttribute('data-ratio');
        console.log(`[Ratio Badge] Processing element ${index + 1}: ratio="${ratioData}"`);
        
        if (ratioData) {
            // Check if ratio badge already exists
            const existingBadge = element.querySelector('.ratio-badge');
            if (existingBadge) {
                console.log(`[Ratio Badge] Element ${index + 1} already has a ratio badge, skipping`);
                return;
            }
            
            // Create ratio badge
            const ratioBadge = document.createElement('div');
            ratioBadge.className = 'ratio-badge';
            ratioBadge.textContent = ratioData;
            ratioBadge.title = `Ratio: ${ratioData}`;
            
            // Add some basic styling
            ratioBadge.style.cssText = `
                display: inline-block;
                background: #4CAF50;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: bold;
                margin-left: 5px;
                vertical-align: middle;
            `;
            
            // Append to element
            element.appendChild(ratioBadge);
            console.log(`[Ratio Badge] Added ratio badge "${ratioData}" to element ${index + 1}`);
        }
    });
    
    // Also check for elements with specific ratio classes or IDs
    const ratioElements = document.querySelectorAll('.ratio-item, #ratio-container, [class*="ratio"]');
    console.log(`[Ratio Badge] Found ${ratioElements.length} additional ratio-related elements`);
    
    ratioElements.forEach((element, index) => {
        // Skip if already processed or already has a badge
        if (element.hasAttribute('data-ratio') || element.querySelector('.ratio-badge')) {
            return;
        }
        
        // Look for ratio data in text content or other attributes
        const textContent = element.textContent.trim();
        const ratioMatch = textContent.match(/(\d+):(\d+)/);
        
        if (ratioMatch) {
            const ratioText = ratioMatch[0];
            console.log(`[Ratio Badge] Found ratio pattern "${ratioText}" in element text`);
            
            // Create ratio badge
            const ratioBadge = document.createElement('div');
            ratioBadge.className = 'ratio-badge';
            ratioBadge.textContent = ratioText;
            ratioBadge.title = `Ratio: ${ratioText}`;
            
            // Add styling
            ratioBadge.style.cssText = `
                display: inline-block;
                background: #FF9800;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: bold;
                margin-left: 5px;
                vertical-align: middle;
            `;
            
            element.appendChild(ratioBadge);
            console.log(`[Ratio Badge] Added ratio badge "${ratioText}" to ratio element ${index + 1}`);
        }
    });
    
    console.log('[Ratio Badge] Finished processing all elements');
}

/**
 * Update existing ratio badges
 */
function updateRatioBadges() {
    console.log('[Ratio Badge] Updating existing ratio badges...');
    
    const existingBadges = document.querySelectorAll('.ratio-badge');
    console.log(`[Ratio Badge] Found ${existingBadges.length} existing ratio badges`);
    
    existingBadges.forEach((badge, index) => {
        const parent = badge.parentElement;
        if (parent && parent.hasAttribute('data-ratio')) {
            const newRatio = parent.getAttribute('data-ratio');
            if (badge.textContent !== newRatio) {
                badge.textContent = newRatio;
                badge.title = `Ratio: ${newRatio}`;
                console.log(`[Ratio Badge] Updated badge ${index + 1} to "${newRatio}"`);
            }
        }
    });
}

/**
 * Remove all ratio badges
 */
function removeRatioBadges() {
    console.log('[Ratio Badge] Removing all ratio badges...');
    
    const badges = document.querySelectorAll('.ratio-badge');
    badges.forEach(badge => badge.remove());
    
    console.log(`[Ratio Badge] Removed ${badges.length} ratio badges`);
}

/**
 * Initialize ratio badge system
 */
function initializeRatioBadges() {
    console.log('[Ratio Badge] Initializing ratio badge system...');
    
    // Add ratio badges on page load
    addRatioBadges();
    
    // Set up mutation observer to handle dynamic content
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any added nodes have ratio data
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.hasAttribute && node.hasAttribute('data-ratio')) {
                            shouldUpdate = true;
                        }
                        // Check descendants
                        if (node.querySelectorAll && node.querySelectorAll('[data-ratio]').length > 0) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            console.log('[Ratio Badge] DOM changes detected, updating ratio badges...');
            setTimeout(addRatioBadges, 100); // Small delay to ensure DOM is stable
        }
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('[Ratio Badge] Ratio badge system initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRatioBadges);
} else {
    initializeRatioBadges();
}

// Export functions to global scope
window.addRatioBadges = addRatioBadges;
window.updateRatioBadges = updateRatioBadges;
window.removeRatioBadges = removeRatioBadges;
window.initializeRatioBadges = initializeRatioBadges;

console.log('[Ratio Badge] ratio-badge.js loaded successfully');
