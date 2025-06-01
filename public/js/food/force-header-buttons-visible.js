/**
 * Force Header Buttons Visible
 * Ensures both Show Detailed Nutrition and Remove buttons are visible in the header
 * AGGRESSIVE VERSION - Prevents any script from hiding the buttons
 */

(function() {
    'use strict';

    // console.log('[Force Header Buttons] AGGRESSIVE MODE Loading...');

    // Inject CSS immediately to prevent any hiding
    const style = document.createElement('style');
    style.textContent = `
        .ingredient-header-buttons {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            margin: 12px 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        .ingredient-header-buttons .header-buttons-grid {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            gap: 12px !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
        }

        .ingredient-header-buttons .header-buttons-grid .action-btn {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            flex: 1 !important;
            width: calc(50% - 6px) !important;
            min-width: 0 !important;
            max-width: none !important;
            height: 38px !important;
            padding: 8px 12px !important;
            margin: 0 !important;
            font-size: 0.9em !important;
            border-radius: 4px !important;
            border: 1px solid #444 !important;
            cursor: pointer !important;
            text-align: center !important;
            line-height: 1.2 !important;
            font-weight: normal !important;
            box-sizing: border-box !important;
            transition: all 0.2s ease !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            align-items: center !important;
            justify-content: center !important;
            background-color: #2a2a2a !important;
            color: #ffffff !important;
            position: static !important;
            z-index: auto !important;
            pointer-events: auto !important;
        }

        .ingredient-header-buttons .header-buttons-grid .action-btn:hover {
            background-color: #3a3a3a !important;
            color: #ffffff !important;
        }
    `;
    document.head.appendChild(style);

    function forceHeaderButtonsVisible() {
        // console.log('[Force Header Buttons] AGGRESSIVE MODE Running...');

        // Find all ingredient header button containers
        const headerButtonContainers = document.querySelectorAll('.ingredient-header-buttons');
        // console.log(`[Force Header Buttons] Found ${headerButtonContainers.length} header button containers`);

        headerButtonContainers.forEach((container, index) => {
            // console.log(`[Force Header Buttons] Processing container ${index + 1}`);

            // Force container to be visible with inline styles
            container.style.setProperty('display', 'block', 'important');
            container.style.setProperty('visibility', 'visible', 'important');
            container.style.setProperty('opacity', '1', 'important');
            container.style.setProperty('position', 'static', 'important');
            container.style.setProperty('z-index', 'auto', 'important');

            // Find the grid inside
            const grid = container.querySelector('.header-buttons-grid');
            if (grid) {
                // console.log(`[Force Header Buttons] Found grid in container ${index + 1}`);

                // Force grid to be visible and use flex layout
                grid.style.setProperty('display', 'flex', 'important');
                grid.style.setProperty('visibility', 'visible', 'important');
                grid.style.setProperty('opacity', '1', 'important');
                grid.style.setProperty('gap', '12px', 'important');
                grid.style.setProperty('justify-content', 'space-between', 'important');
                grid.style.setProperty('width', '100%', 'important');
                grid.style.setProperty('position', 'static', 'important');
                grid.style.setProperty('z-index', 'auto', 'important');

                // Find all buttons in the grid
                const buttons = grid.querySelectorAll('.action-btn');
                // console.log(`[Force Header Buttons] Found ${buttons.length} buttons in grid`);

                buttons.forEach((button, btnIndex) => {
                    // console.log(`[Force Header Buttons] Processing button ${btnIndex + 1}: ${button.textContent.trim()}`);

                    // Force button to be visible with setProperty for maximum override
                    button.style.setProperty('display', 'flex', 'important');
                    button.style.setProperty('visibility', 'visible', 'important');
                    button.style.setProperty('opacity', '1', 'important');
                    button.style.setProperty('flex', '1', 'important');
                    button.style.setProperty('width', 'calc(50% - 6px)', 'important');
                    button.style.setProperty('min-width', '0', 'important');
                    button.style.setProperty('max-width', 'none', 'important');
                    button.style.setProperty('height', '38px', 'important');
                    button.style.setProperty('background-color', '#2a2a2a', 'important');
                    button.style.setProperty('color', '#ffffff', 'important');
                    button.style.setProperty('border', '1px solid #444', 'important');
                    button.style.setProperty('border-radius', '4px', 'important');
                    button.style.setProperty('padding', '8px 12px', 'important');
                    button.style.setProperty('margin', '0', 'important');
                    button.style.setProperty('align-items', 'center', 'important');
                    button.style.setProperty('justify-content', 'center', 'important');
                    button.style.setProperty('text-align', 'center', 'important');
                    button.style.setProperty('cursor', 'pointer', 'important');
                    button.style.setProperty('box-sizing', 'border-box', 'important');
                    button.style.setProperty('position', 'static', 'important');
                    button.style.setProperty('z-index', 'auto', 'important');
                    button.style.setProperty('pointer-events', 'auto', 'important');
                });
            } else {
                // console.log(`[Force Header Buttons] No grid found in container ${index + 1}, creating one...`);

                // If no grid exists, create one and move buttons into it
                const newGrid = document.createElement('div');
                newGrid.className = 'header-buttons-grid';
                newGrid.style.cssText = `
                    display: flex !important;
                    gap: 12px !important;
                    justify-content: space-between !important;
                    width: 100% !important;
                    margin: 12px 0 !important;
                `;

                // Find buttons in the container and move them to the grid
                const toggleBtn = container.querySelector('.toggle-detailed-nutrition');
                const removeBtn = container.querySelector('.remove-ingredient-btn');

                if (toggleBtn) {
                    newGrid.appendChild(toggleBtn);
                    // console.log('[Force Header Buttons] Moved toggle button to new grid');
                }
                if (removeBtn) {
                    newGrid.appendChild(removeBtn);
                    // console.log('[Force Header Buttons] Moved remove button to new grid');
                }

                container.appendChild(newGrid);
                // console.log('[Force Header Buttons] Created new grid with buttons');
            }
        });

        // If no header button containers exist, create them
        if (headerButtonContainers.length === 0) {
            // console.log('[Force Header Buttons] No header button containers found, looking for loose buttons...');

            // Find all toggle and remove buttons that aren't in header containers
            const allToggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');
            const allRemoveButtons = document.querySelectorAll('.remove-ingredient-btn');

            // console.log(`[Force Header Buttons] Found ${allToggleButtons.length} toggle buttons total`);
            // console.log(`[Force Header Buttons] Found ${allRemoveButtons.length} remove buttons total`);

            // Group buttons by their parent ingredient item
            const ingredientItems = document.querySelectorAll('.ingredient-item');
            ingredientItems.forEach((item, itemIndex) => {
                const toggleBtn = item.querySelector('.toggle-detailed-nutrition');
                const removeBtn = item.querySelector('.remove-ingredient-btn');

                if (toggleBtn || removeBtn) {
                    // console.log(`[Force Header Buttons] Creating header container for ingredient item ${itemIndex + 1}`);

                    // Create header button container
                    const headerContainer = document.createElement('div');
                    headerContainer.className = 'ingredient-header-buttons';
                    headerContainer.style.cssText = `
                        display: block !important;
                        margin: 12px 0 !important;
                        width: 100% !important;
                    `;

                    // Create grid
                    const grid = document.createElement('div');
                    grid.className = 'header-buttons-grid';
                    grid.style.cssText = `
                        display: flex !important;
                        gap: 12px !important;
                        justify-content: space-between !important;
                        width: 100% !important;
                    `;

                    // Move buttons to grid
                    if (toggleBtn) {
                        grid.appendChild(toggleBtn);
                        // console.log(`[Force Header Buttons] Moved toggle button to new container for item ${itemIndex + 1}`);
                    }
                    if (removeBtn) {
                        grid.appendChild(removeBtn);
                        // console.log(`[Force Header Buttons] Moved remove button to new container for item ${itemIndex + 1}`);
                    }

                    headerContainer.appendChild(grid);

                    // Insert after radio buttons if they exist
                    const typeSelector = item.querySelector('.ingredient-type-selector');
                    if (typeSelector) {
                        typeSelector.insertAdjacentElement('afterend', headerContainer);
                        // console.log(`[Force Header Buttons] Inserted header container after type selector for item ${itemIndex + 1}`);
                    } else {
                        // Fallback: insert at the beginning of the item
                        item.insertBefore(headerContainer, item.firstChild);
                        // console.log(`[Force Header Buttons] Inserted header container at beginning of item ${itemIndex + 1}`);
                    }
                }
            });
        }

        // Force all buttons to be visible regardless of location
        const allToggleButtons = document.querySelectorAll('.toggle-detailed-nutrition');
        const allRemoveButtons = document.querySelectorAll('.remove-ingredient-btn');

        [...allToggleButtons, ...allRemoveButtons].forEach((button, index) => {
            button.style.setProperty('display', 'flex', 'important');
            button.style.setProperty('visibility', 'visible', 'important');
            button.style.setProperty('opacity', '1', 'important');
            button.style.setProperty('position', 'static', 'important');
            button.style.setProperty('z-index', 'auto', 'important');
            button.style.setProperty('pointer-events', 'auto', 'important');
            button.style.setProperty('flex', '1', 'important');
            button.style.setProperty('width', 'calc(50% - 6px)', 'important');
            button.style.setProperty('height', '38px', 'important');
            button.style.setProperty('background-color', '#2a2a2a', 'important');
            button.style.setProperty('color', '#ffffff', 'important');
            button.style.setProperty('border', '1px solid #444', 'important');
            button.style.setProperty('border-radius', '4px', 'important');
            button.style.setProperty('padding', '8px 12px', 'important');
            button.style.setProperty('margin', '0', 'important');
            button.style.setProperty('align-items', 'center', 'important');
            button.style.setProperty('justify-content', 'center', 'important');
            button.style.setProperty('text-align', 'center', 'important');
            button.style.setProperty('cursor', 'pointer', 'important');
            button.style.setProperty('box-sizing', 'border-box', 'important');
            // Reduced logging to prevent spam
            // if (index < 2) console.log(`[Force Header Buttons] Forced button ${index + 1} visible: ${button.textContent.trim()}`);
        });
    }

    // Run immediately
    forceHeaderButtonsVisible();

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceHeaderButtonsVisible);
    } else {
        forceHeaderButtonsVisible();
    }

    // Run after multiple delays to catch any late-loading content
    setTimeout(forceHeaderButtonsVisible, 100);
    setTimeout(forceHeaderButtonsVisible, 300);
    setTimeout(forceHeaderButtonsVisible, 500);
    setTimeout(forceHeaderButtonsVisible, 1000);
    setTimeout(forceHeaderButtonsVisible, 2000);
    setTimeout(forceHeaderButtonsVisible, 3000);

    // Continuous monitoring - run every 2 seconds to prevent any hiding (reduced spam)
    setInterval(forceHeaderButtonsVisible, 2000);

    // Set up mutation observer to catch dynamic changes
    const observer = new MutationObserver(function(mutations) {
        let shouldRun = false;

        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && (
                        node.classList?.contains('ingredient-item') ||
                        node.classList?.contains('ingredient-header-buttons') ||
                        node.querySelector?.('.ingredient-header-buttons')
                    )) {
                        shouldRun = true;
                    }
                });
            }

            // Also check for style changes that might hide buttons
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.classList?.contains('ingredient-header-buttons') ||
                    target.classList?.contains('header-buttons-grid') ||
                    target.classList?.contains('toggle-detailed-nutrition') ||
                    target.classList?.contains('remove-ingredient-btn')) {
                    shouldRun = true;
                }
            }
        });

        if (shouldRun) {
            setTimeout(forceHeaderButtonsVisible, 50);
        }
    });

    // Only observe if document.body exists
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    } else {
        // Wait for body to be available
        document.addEventListener('DOMContentLoaded', function() {
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            }
        });
    }

    // console.log('[Force Header Buttons] AGGRESSIVE MODE Initialized with continuous monitoring');
})();
