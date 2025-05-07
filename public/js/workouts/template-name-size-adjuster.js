/**
 * Template Name Size Adjuster
 *
 * This script automatically adjusts the font size of template names
 * if the completion badge would overlap with the edit button.
 */

(function() {

    function adjustTemplateNameSize() {

        const templateCards = document.querySelectorAll('.workout-template-card');

        templateCards.forEach(card => {
            const titleElement = card.querySelector('h3');
            const editButton = card.querySelector('.card-corner-actions');

            if (!titleElement || !editButton) return;

            const templateName = titleElement.textContent.trim();

            if (templateName.includes("Ghost of the Goon")) {

                const card = titleElement.closest('.workout-template-card');
                if (card) {
                    card.classList.add('ghost-of-the-goon-template');

                    card.offsetHeight;

                    titleElement.style.fontSize = "0.65rem";
                    titleElement.style.maxWidth = "60%";
                    titleElement.style.paddingRight = "50px";

                    const authorEdition = titleElement.querySelector('.template-author-edition');
                    if (authorEdition) {
                        authorEdition.style.fontSize = "0.5rem";
                    }

                    const completionBadge = titleElement.querySelector('.completion-count-badge');
                    if (completionBadge) {

                        completionBadge.style.width = "14px";
                        completionBadge.style.height = "14px";
                        completionBadge.style.fontSize = "0.5rem";
                        completionBadge.style.marginLeft = "1px";
                        completionBadge.style.position = "relative";
                        completionBadge.style.top = "-1px";
                    }

                    const editButton = card.querySelector('.card-corner-actions');
                    if (editButton) {

                        editButton.style.right = "12px";
                    }
                }

                console.log(`Applied special class and styles for "Ghost of the Goon" template`);
                return; // Skip the rest of the processing for this template
            }

            const completionBadge = titleElement.querySelector('.completion-count-badge');

            if (completionBadge) {

                titleElement.style.fontSize = "0.9rem";

                const authorEdition = titleElement.querySelector('.template-author-edition');
                if (authorEdition) {
                    authorEdition.style.fontSize = "0.65rem";
                }

                console.log(`Applied fixed size reduction for template with badge: ${templateName}`);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {

        setTimeout(adjustTemplateNameSize, 300);
    });


    const originalRenderWorkoutTemplates = window.renderWorkoutTemplates;

    if (typeof originalRenderWorkoutTemplates === 'function') {
        window.renderWorkoutTemplates = function(...args) {

            originalRenderWorkoutTemplates.apply(this, args);

            setTimeout(adjustTemplateNameSize, 100);
        };
    }

    window.addEventListener('resize', function() {
        adjustTemplateNameSize();
    });

    window.adjustTemplateNameSize = adjustTemplateNameSize;
})();
