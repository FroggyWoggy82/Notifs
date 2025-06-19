/**
 * Hide Top-Level Nutrition Fields
 * Hides the top-level Calories, Protein, Fat, and Carbs fields in the edit ingredient modal
 * since they are now part of the detailed micronutrients section
 */

(function() {
    'use strict';

    console.log('[Hide Top-Level Nutrition Fields] Initializing...');

    function hideTopLevelNutritionFields() {
        console.log('[Hide Top-Level Nutrition Fields] Running hide function...');

        // Try multiple approaches to find and hide the nutrition fields
        let hiddenCount = 0;

        // Approach 1: Find all divs and look for the one that contains all 4 nutrition fields
        const allDivs = document.querySelectorAll('div');

        for (let div of allDivs) {
            // Check if this div has exactly 4 direct child divs
            const directChildDivs = Array.from(div.children).filter(child => child.tagName === 'DIV');

            if (directChildDivs.length === 4) {
                // Check if these children contain our nutrition fields
                const childTexts = directChildDivs.map(child => child.textContent.trim());

                // Look for the pattern of nutrition fields
                const hasCalories = childTexts.some(text => text.includes('Calories'));
                const hasProtein = childTexts.some(text => text.includes('Protein (g)'));
                const hasFat = childTexts.some(text => text.includes('Fat (g)'));
                const hasCarbs = childTexts.some(text => text.includes('Carbs (g)'));

                if (hasCalories && hasProtein && hasFat && hasCarbs) {
                    console.log('[Hide Top-Level Nutrition Fields] Found nutrition container with 4 fields, hiding it...');
                    div.style.display = 'none';
                    hiddenCount++;
                    break;
                }
            }
        }

        // Approach 2: If approach 1 didn't work, try finding by input values
        if (hiddenCount === 0) {
            console.log('[Hide Top-Level Nutrition Fields] Trying approach 2: finding by input values...');

            const inputs = document.querySelectorAll('input[type="number"]');
            const nutritionInputs = [];

            inputs.forEach(input => {
                const parentDiv = input.closest('div');
                if (parentDiv) {
                    const labelDiv = parentDiv.querySelector('div');
                    if (labelDiv) {
                        const labelText = labelDiv.textContent.trim();
                        if (labelText === 'Calories' || labelText === 'Protein (g)' ||
                            labelText === 'Fat (g)' || labelText === 'Carbs (g)') {
                            nutritionInputs.push(input);
                        }
                    }
                }
            });

            if (nutritionInputs.length === 4) {
                // Find their common parent
                let commonParent = nutritionInputs[0].parentElement;
                while (commonParent) {
                    const containsAll = nutritionInputs.every(input => commonParent.contains(input));
                    if (containsAll) {
                        const directChildren = Array.from(commonParent.children).filter(child => child.tagName === 'DIV');
                        if (directChildren.length === 4) {
                            console.log('[Hide Top-Level Nutrition Fields] Found nutrition container via inputs! Hiding it...');
                            commonParent.style.display = 'none';
                            hiddenCount++;
                            break;
                        }
                    }
                    commonParent = commonParent.parentElement;
                }
            }
        }

        // Approach 3: Hide individual nutrition field containers
        if (hiddenCount === 0) {
            console.log('[Hide Top-Level Nutrition Fields] Trying approach 3: hiding individual containers...');

            const nutritionLabels = ['Calories', 'Protein (g)', 'Fat (g)', 'Carbs (g)'];

            nutritionLabels.forEach(labelText => {
                // Find all elements that contain this exact text
                const allElements = document.querySelectorAll('*');

                for (let element of allElements) {
                    if (element.textContent.trim() === labelText && element.children.length === 0) {
                        // This is a label element, find its container with the input
                        let container = element.parentElement;

                        // Look for the container that has both the label and an input
                        while (container && container !== document.body) {
                            const hasInput = container.querySelector('input[type="number"]');
                            const hasLabel = container.textContent.includes(labelText);

                            if (hasInput && hasLabel) {
                                container.style.display = 'none';
                                hiddenCount++;
                                console.log(`[Hide Top-Level Nutrition Fields] Hidden container for: ${labelText}`);
                                break;
                            }
                            container = container.parentElement;
                        }
                        break; // Only process the first matching label
                    }
                }
            });
        }

        console.log(`[Hide Top-Level Nutrition Fields] Hidden ${hiddenCount} nutrition field containers`);
        return hiddenCount;
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideTopLevelNutritionFields);
    } else {
        hideTopLevelNutritionFields();
    }

    // Also run immediately to catch any existing fields
    setTimeout(hideTopLevelNutritionFields, 100);
    setTimeout(hideTopLevelNutritionFields, 500);
    setTimeout(hideTopLevelNutritionFields, 1000);

    // Also run when new modals are created or when styles change
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check for new nodes
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if this is an edit ingredient modal
                        const modalTitle = node.querySelector ? node.querySelector('h3') : null;
                        if (modalTitle && modalTitle.textContent.includes('Edit Ingredient')) {
                            console.log('[Hide Top-Level Nutrition Fields] New edit ingredient modal detected');
                            setTimeout(hideTopLevelNutritionFields, 100);
                        }

                        // Also check for modals with display block
                        if (node.style && node.style.display === 'block') {
                            setTimeout(hideTopLevelNutritionFields, 100);
                        }

                        // Check for edit ingredient forms
                        if (node.classList && node.classList.contains('edit-ingredient-form')) {
                            setTimeout(hideTopLevelNutritionFields, 100);
                        } else if (node.querySelector && node.querySelector('.edit-ingredient-form')) {
                            setTimeout(hideTopLevelNutritionFields, 100);
                        }
                    }
                });
            }

            // Check for style changes
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.style.display === 'block') {
                    const modalTitle = target.querySelector('h3');
                    if (modalTitle && modalTitle.textContent.includes('Edit Ingredient')) {
                        console.log('[Hide Top-Level Nutrition Fields] Edit ingredient modal style changed to visible');
                        setTimeout(hideTopLevelNutritionFields, 100);
                    }
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });

    // Also listen for click events on edit buttons
    document.addEventListener('click', function(event) {
        const button = event.target.closest('button');
        if (button && (button.textContent.includes('Edit') || button.textContent === 'Edit')) {
            console.log('[Hide Top-Level Nutrition Fields] Edit button clicked, will check for modal');
            setTimeout(hideTopLevelNutritionFields, 200); // Delay to allow modal to open
            setTimeout(hideTopLevelNutritionFields, 500); // Additional delay in case modal takes longer
        }
    });

    // Run the hide function periodically to catch any missed modals
    setInterval(function() {
        const modal = document.querySelector('[style*="display: block"]');
        if (modal) {
            const modalTitle = modal.querySelector('h3');
            if (modalTitle && modalTitle.textContent.includes('Edit Ingredient')) {
                hideTopLevelNutritionFields();
            }
        }
    }, 2000);

    console.log('[Hide Top-Level Nutrition Fields] Initialized');
})();
