/**
 * Ingredient Edit Modal Dark Fix
 * Ensures the ingredient edit modal matches the dark theme
 */

(function() {

    function fixIngredientEditModalStyling() {
        console.log('[Ingredient Edit Dark Fix] Fixing ingredient edit modal styling...');

        const modals = document.querySelectorAll('.modal, .modal-content, [id*="edit-ingredient"], [class*="edit-ingredient"]');
        modals.forEach(modal => {

            if (modal.id && modal.id.includes('edit-ingredient') || 
                modal.classList.contains('edit-ingredient-modal') || 
                modal.querySelector('[id*="edit-ingredient-form"]')) {
                
                console.log('[Ingredient Edit Dark Fix] Found ingredient edit modal:', modal);

                modal.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                modal.style.color = '#e0e0e0';

                const modalContent = modal.querySelector('.modal-content') || modal;
                if (modalContent) {
                    modalContent.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                    modalContent.style.color = '#e0e0e0';
                    modalContent.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }

                const modalHeader = modal.querySelector('.modal-header');
                if (modalHeader) {
                    modalHeader.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                    modalHeader.style.color = '#e0e0e0';
                    modalHeader.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
                }

                const modalTitle = modal.querySelector('.modal-title, .modal-header h3, .modal-header h4, .modal-header h5');
                if (modalTitle) {
                    modalTitle.style.color = '#ffffff';
                }

                const modalBody = modal.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                    modalBody.style.color = '#e0e0e0';
                }

                const modalFooter = modal.querySelector('.modal-footer');
                if (modalFooter) {
                    modalFooter.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                    modalFooter.style.color = '#e0e0e0';
                    modalFooter.style.borderTop = '1px solid rgba(255, 255, 255, 0.05)';
                }

                const inputs = modal.querySelectorAll('input[type="text"], input[type="number"], select, textarea');
                inputs.forEach(input => {
                    input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    input.style.color = '#e0e0e0';
                    input.style.borderRadius = '4px';
                    input.style.padding = '8px 12px';

                    input.addEventListener('focus', function() {
                        this.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        this.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.1)';
                    });
                    
                    input.addEventListener('blur', function() {
                        this.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        this.style.boxShadow = 'none';
                    });
                });

                const labels = modal.querySelectorAll('label');
                labels.forEach(label => {
                    label.style.color = '#e0e0e0';
                    label.style.fontWeight = 'normal';
                });

                const sectionHeaders = modal.querySelectorAll('h3, h4, h5, .section-header');
                sectionHeaders.forEach(header => {
                    header.style.color = '#ffffff';
                    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                    header.style.paddingBottom = '5px';
                    header.style.marginBottom = '15px';
                });

                const saveButton = modal.querySelector('#save-changes-btn, .save-changes-btn, .btn-primary, .btn-success, button[type="submit"], .save-btn');
                if (saveButton) {
                    saveButton.style.backgroundColor = '#ffffff';
                    saveButton.style.color = '#121212';
                    saveButton.style.border = 'none';
                    saveButton.style.borderRadius = '4px';
                    saveButton.style.padding = '8px 16px';
                    saveButton.style.fontWeight = 'normal';
                    saveButton.style.transition = 'all 0.2s ease';
                    saveButton.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';

                    saveButton.addEventListener('mouseenter', function() {
                        this.style.transform = 'translateY(-2px)';
                        this.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.3)';
                    });
                    
                    saveButton.addEventListener('mouseleave', function() {
                        this.style.transform = 'translateY(0)';
                        this.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
                    });
                }

                const cancelButton = modal.querySelector('#cancel-btn, .cancel-btn, .btn-secondary, .btn-danger');
                if (cancelButton) {
                    cancelButton.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    cancelButton.style.color = '#ffffff';
                    cancelButton.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    cancelButton.style.borderRadius = '4px';
                    cancelButton.style.padding = '8px 16px';
                    cancelButton.style.fontWeight = 'normal';
                    cancelButton.style.transition = 'all 0.2s ease';

                    cancelButton.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    });
                    
                    cancelButton.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    });
                }

                const categorySections = modal.querySelectorAll('.category-section, .form-section, .nutrient-section, [class*="-section"]');
                categorySections.forEach(section => {
                    section.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    section.style.border = '1px solid rgba(255, 255, 255, 0.05)';
                    section.style.borderRadius = '4px';
                    section.style.padding = '15px';
                    section.style.marginBottom = '15px';
                });

                const categoryHeaders = modal.querySelectorAll('.category-header, .form-section-header, .nutrient-header, [class*="-header"]');
                categoryHeaders.forEach(header => {
                    header.style.color = '#ffffff';
                    header.style.fontWeight = '500';
                    header.style.marginBottom = '10px';
                    header.style.paddingBottom = '5px';
                    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                });
            }
        });
        
        console.log('[Ingredient Edit Dark Fix] Ingredient edit modal styling fixed');
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && (node.classList.contains('modal') || node.id && node.id.includes('edit-ingredient'))) {
                                fixIngredientEditModalStyling();
                            }

                            const modals = node.querySelectorAll('.modal, [id*="edit-ingredient"]');
                            if (modals.length) {
                                fixIngredientEditModalStyling();
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        console.log('[Ingredient Edit Dark Fix] Initializing...');

        setTimeout(fixIngredientEditModalStyling, 500); // Delay to ensure the DOM is fully loaded

        observeDOMChanges();
        
        console.log('[Ingredient Edit Dark Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
