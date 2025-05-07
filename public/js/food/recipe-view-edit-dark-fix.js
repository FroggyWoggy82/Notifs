/**
 * Recipe View and Edit Dark Fix
 * Ensures the recipe view and edit modal match the dark theme
 */

(function() {

    function fixRecipeViewStyling() {
        console.log('[Recipe View/Edit Dark Fix] Fixing recipe view styling...');

        const recipeViews = document.querySelectorAll('.recipe-view, .recipe-view-container, [id*="recipe-view"]');
        recipeViews.forEach(view => {

            view.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
            view.style.color = '#e0e0e0';
            view.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            view.style.borderRadius = '4px';

            const header = view.querySelector('.recipe-view-header, .recipe-header, header');
            if (header) {
                header.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                header.style.color = '#ffffff';
            }

            const title = view.querySelector('.recipe-view-title, .recipe-title, h1, h2, h3');
            if (title) {
                title.style.color = '#ffffff';
                title.style.fontWeight = '500';
            }

            const content = view.querySelector('.recipe-view-content, .recipe-content, .content');
            if (content) {
                content.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                content.style.color = '#e0e0e0';
            }

            const labels = view.querySelectorAll('.recipe-view-label, .recipe-label, label');
            labels.forEach(label => {
                label.style.color = '#ffffff';
                label.style.fontWeight = '500';
            });

            const values = view.querySelectorAll('.recipe-view-value, .recipe-value, .value');
            values.forEach(value => {
                value.style.color = '#e0e0e0';
            });

            const tables = view.querySelectorAll('table');
            tables.forEach(table => {
                table.style.backgroundColor = 'transparent';
                table.style.color = '#e0e0e0';

                const headers = table.querySelectorAll('th');
                headers.forEach(header => {
                    header.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    header.style.color = '#ffffff';
                    header.style.fontWeight = '500';
                    header.style.padding = '10px';
                    header.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                });

                const cells = table.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                    cell.style.color = '#e0e0e0';
                    cell.style.padding = '10px';
                    cell.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                });
            });
        });
        
        console.log('[Recipe View/Edit Dark Fix] Recipe view styling fixed');
    }

    function fixRecipeEditModalStyling() {
        console.log('[Recipe View/Edit Dark Fix] Fixing recipe edit modal styling...');

        const modals = document.querySelectorAll('.modal, .modal-content, [id*="edit-recipe"], [class*="edit-recipe"]');
        modals.forEach(modal => {

            if (modal.id && modal.id.includes('edit-recipe') || 
                modal.classList.contains('edit-recipe-modal') || 
                modal.querySelector('[id*="edit-recipe-form"]')) {
                
                console.log('[Recipe View/Edit Dark Fix] Found recipe edit modal:', modal);

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
                    modalHeader.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
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
                    modalFooter.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    modalFooter.style.color = '#e0e0e0';
                    modalFooter.style.borderTop = '1px solid rgba(255, 255, 255, 0.05)';
                }

                const formGroups = modal.querySelectorAll('.form-group');
                formGroups.forEach(group => {
                    group.style.marginBottom = '15px';
                });

                const formLabels = modal.querySelectorAll('.form-label, label');
                formLabels.forEach(label => {
                    label.style.color = '#e0e0e0';
                    label.style.fontWeight = 'normal';
                    label.style.marginBottom = '5px';
                });

                const formInputs = modal.querySelectorAll('.form-control, input[type="text"], input[type="number"], input[type="email"], input[type="password"], textarea, select');
                formInputs.forEach(input => {
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

                const primaryButtons = modal.querySelectorAll('.btn-primary, .btn-success, button[type="submit"], .save-btn, .submit-btn');
                primaryButtons.forEach(button => {
                    button.style.backgroundColor = '#ffffff';
                    button.style.color = '#121212';
                    button.style.border = 'none';
                    button.style.borderRadius = '4px';
                    button.style.padding = '8px 16px';
                    button.style.fontWeight = 'normal';
                    button.style.transition = 'all 0.2s ease';
                    button.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';

                    button.addEventListener('mouseenter', function() {
                        this.style.transform = 'translateY(-2px)';
                        this.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.3)';
                    });
                    
                    button.addEventListener('mouseleave', function() {
                        this.style.transform = 'translateY(0)';
                        this.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
                    });
                });

                const secondaryButtons = modal.querySelectorAll('.btn-secondary, .btn-danger, .cancel-btn, .close-btn');
                secondaryButtons.forEach(button => {
                    button.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    button.style.color = '#ffffff';
                    button.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    button.style.borderRadius = '4px';
                    button.style.padding = '8px 16px';
                    button.style.fontWeight = 'normal';
                    button.style.transition = 'all 0.2s ease';

                    button.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    });
                    
                    button.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    });
                });

                const tables = modal.querySelectorAll('table');
                tables.forEach(table => {
                    table.style.backgroundColor = 'transparent';
                    table.style.color = '#e0e0e0';

                    const headers = table.querySelectorAll('th');
                    headers.forEach(header => {
                        header.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        header.style.color = '#ffffff';
                        header.style.fontWeight = '500';
                        header.style.padding = '10px';
                        header.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    });

                    const cells = table.querySelectorAll('td');
                    cells.forEach(cell => {
                        cell.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                        cell.style.color = '#e0e0e0';
                        cell.style.padding = '10px';
                        cell.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    });
                });
            }
        });
        
        console.log('[Recipe View/Edit Dark Fix] Recipe edit modal styling fixed');
    }

    function fixEditButtons() {
        console.log('[Recipe View/Edit Dark Fix] Fixing edit buttons...');

        const editButtons = document.querySelectorAll('.recipe-table .edit-btn, .recipe-table button[class*="edit"], .recipe-table [id*="edit-btn"]');
        editButtons.forEach(button => {
            button.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
            button.style.color = '#ffffff';
            button.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            button.style.borderRadius = '4px';
            button.style.transition = 'all 0.2s ease';

            button.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            });
        });
        
        console.log('[Recipe View/Edit Dark Fix] Edit buttons fixed');
    }

    function observeDOMChanges() {

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {

                if (mutation.addedNodes.length) {

                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node

                            if (node.classList && (
                                node.classList.contains('recipe-view') || 
                                node.classList.contains('recipe-view-container') || 
                                node.classList.contains('modal') || 
                                node.id && (node.id.includes('recipe-view') || node.id.includes('edit-recipe'))
                            )) {
                                fixRecipeViewStyling();
                                fixRecipeEditModalStyling();
                                fixEditButtons();
                            }

                            const recipeViews = node.querySelectorAll('.recipe-view, .recipe-view-container, [id*="recipe-view"]');
                            const editModals = node.querySelectorAll('.modal, [id*="edit-recipe"]');
                            const editButtons = node.querySelectorAll('.recipe-table .edit-btn, .recipe-table button[class*="edit"], .recipe-table [id*="edit-btn"]');
                            
                            if (recipeViews.length) {
                                fixRecipeViewStyling();
                            }
                            
                            if (editModals.length) {
                                fixRecipeEditModalStyling();
                            }
                            
                            if (editButtons.length) {
                                fixEditButtons();
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
        console.log('[Recipe View/Edit Dark Fix] Initializing...');

        setTimeout(fixRecipeViewStyling, 500); // Delay to ensure the DOM is fully loaded

        setTimeout(fixRecipeEditModalStyling, 500); // Delay to ensure the DOM is fully loaded

        setTimeout(fixEditButtons, 500); // Delay to ensure the DOM is fully loaded

        observeDOMChanges();
        
        console.log('[Recipe View/Edit Dark Fix] Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
