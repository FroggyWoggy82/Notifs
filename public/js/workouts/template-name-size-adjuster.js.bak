/**
 * Template Name Size Adjuster
 *
 * This script automatically adjusts the font size of template names
 * if the completion badge would overlap with the edit button.
 */

(function() {
    // Function to check and adjust template name text size
    function adjustTemplateNameSize() {
        // Get all template cards
        const templateCards = document.querySelectorAll('.workout-template-card');

        templateCards.forEach(card => {
            const titleElement = card.querySelector('h3');
            const editButton = card.querySelector('.card-corner-actions');

            if (!titleElement || !editButton) return;

            // Get the template name text
            const templateName = titleElement.textContent.trim();

            // Check if this is "Ghost of the Goon" template which has a known issue
            if (templateName.includes("Ghost of the Goon")) {
                // Apply a special class to the entire card for CSS targeting
                const card = titleElement.closest('.workout-template-card');
                if (card) {
                    card.classList.add('ghost-of-the-goon-template');

                    // Force a reflow to ensure the CSS is applied immediately
                    card.offsetHeight;

                    // Also apply inline styles as a backup
                    titleElement.style.fontSize = "0.65rem";
                    titleElement.style.maxWidth = "60%";
                    titleElement.style.paddingRight = "50px";

                    // If there's an author/edition span, reduce its size too
                    const authorEdition = titleElement.querySelector('.template-author-edition');
                    if (authorEdition) {
                        authorEdition.style.fontSize = "0.5rem";
                    }

                    // Get the completion badge if it exists
                    const completionBadge = titleElement.querySelector('.completion-count-badge');
                    if (completionBadge) {
                        // Make the badge smaller
                        completionBadge.style.width = "14px";
                        completionBadge.style.height = "14px";
                        completionBadge.style.fontSize = "0.5rem";
                        completionBadge.style.marginLeft = "1px";
                        completionBadge.style.position = "relative";
                        completionBadge.style.top = "-1px";
                    }

                    // Try to directly modify the edit button position for this specific template
                    const editButton = card.querySelector('.card-corner-actions');
                    if (editButton) {
                        // Move the edit button slightly to the left
                        editButton.style.right = "12px";
                    }
                }

                console.log(`Applied special class and styles for "Ghost of the Goon" template`);
                return; // Skip the rest of the processing for this template
            }

            // Get the completion badge if it exists
            const completionBadge = titleElement.querySelector('.completion-count-badge');

            // Only proceed if there's a completion badge
            if (completionBadge) {
                // Apply a fixed size reduction for all templates with badges
                titleElement.style.fontSize = "0.9rem";

                // If there's an author/edition span, reduce its size too
                const authorEdition = titleElement.querySelector('.template-author-edition');
                if (authorEdition) {
                    authorEdition.style.fontSize = "0.65rem";
                }

                console.log(`Applied fixed size reduction for template with badge: ${templateName}`);
            }
        });
    }

    // Run the adjustment when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initial adjustment
        setTimeout(adjustTemplateNameSize, 300);
    });

    // Also run when templates are rendered
    // We need to hook into the existing code that renders templates
    const originalRenderWorkoutTemplates = window.renderWorkoutTemplates;

    if (typeof originalRenderWorkoutTemplates === 'function') {
        window.renderWorkoutTemplates = function(...args) {
            // Call the original function
            originalRenderWorkoutTemplates.apply(this, args);

            // After rendering, adjust the template names
            setTimeout(adjustTemplateNameSize, 100);
        };
    }

    // Also run when window is resized
    window.addEventListener('resize', function() {
        adjustTemplateNameSize();
    });

    // Expose the function globally for manual triggering if needed
    window.adjustTemplateNameSize = adjustTemplateNameSize;
})();
