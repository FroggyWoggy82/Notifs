/**
 * Recipe View and Edit Dark Fix
 * Ensures the recipe view and edit modal match the dark theme
 */

(function() {
    // Function to fix the recipe view styling
    function fixRecipeViewStyling() {
        console.log('[Recipe View/Edit Dark Fix] Fixing recipe view styling...');
        
        // Find all recipe view containers
        const recipeViews = document.querySelectorAll('.recipe-view, .recipe-view-container, [id*="recipe-view"]');
        recipeViews.forEach(view => {
            // Style the container
            view.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
            view.style.color = '#e0e0e0';
            view.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            view.style.borderRadius = '4px';
            
            // Style the header
            const header = view.querySelector('.recipe-view-header, .recipe-header, header');
            if (header) {
                header.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                header.style.color = '#ffffff';
            }
            
            // Style the title
            const title = view.querySelector('.recipe-view-title, .recipe-title, h1, h2, h3');
            if (title) {
                title.style.color = '#ffffff';
                title.style.fontWeight = '500';
            }
            
            // Style the content
            const content = view.querySelector('.recipe-view-content, .recipe-content, .content');
            if (content) {
                content.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                content.style.color = '#e0e0e0';
            }
            
            // Style the labels
            const labels = view.querySelectorAll('.recipe-view-label, .recipe-label, label');
            labels.forEach(label => {
                label.style.color = '#ffffff';
                label.style.fontWeight = '500';
            });
            
            // Style the values
            const values = view.querySelectorAll('.recipe-view-value, .recipe-value, .value');
            values.forEach(value => {
                value.style.color = '#e0e0e0';
            });
            
            // Style the tables
            const tables = view.querySelectorAll('table');
            tables.forEach(table => {
                table.style.backgroundColor = 'transparent';
                table.style.color = '#e0e0e0';
                
                // Style the table headers
                const headers = table.querySelectorAll('th');
                headers.forEach(header => {
                    header.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    header.style.color = '#ffffff';
                    header.style.fontWeight = '500';
                    header.style.padding = '10px';
                    header.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                });
                
                // Style the table cells
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
    
    // Function to fix the recipe edit modal styling
    function fixRecipeEditModalStyling() {
        console.log('[Recipe View/Edit Dark Fix] Fixing recipe edit modal styling...');
        
        // Find all modals that might be recipe edit modals
        const modals = document.querySelectorAll('.modal, .modal-content, [id*="edit-recipe"], [class*="edit-recipe"]');
        modals.forEach(modal => {
            // Check if this is a recipe edit modal
            if (modal.id && modal.id.includes('edit-recipe') || 
                modal.classList.contains('edit-recipe-modal') || 
                modal.querySelector('[id*="edit-recipe-form"]')) {
                
                console.log('[Recipe View/Edit Dark Fix] Found recipe edit modal:', modal);
                
                // Style the modal
                modal.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                modal.style.color = '#e0e0e0';
                
                // Style the modal content
                const modalContent = modal.querySelector('.modal-content') || modal;
                if (modalContent) {
                    modalContent.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                    modalContent.style.color = '#e0e0e0';
                    modalContent.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }
                
                // Style the modal header
                const modalHeader = modal.querySelector('.modal-header');
                if (modalHeader) {
                    modalHeader.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    modalHeader.style.color = '#e0e0e0';
                    modalHeader.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
                }
                
                // Style the modal title
                const modalTitle = modal.querySelector('.modal-title, .modal-header h3, .modal-header h4, .modal-header h5');
                if (modalTitle) {
                    modalTitle.style.color = '#ffffff';
                }
                
                // Style the modal body
                const modalBody = modal.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                    modalBody.style.color = '#e0e0e0';
                }
                
                // Style the modal footer
                const modalFooter = modal.querySelector('.modal-footer');
                if (modalFooter) {
                    modalFooter.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    modalFooter.style.color = '#e0e0e0';
                    modalFooter.style.borderTop = '1px solid rgba(255, 255, 255, 0.05)';
                }
                
                // Style all form groups
                const formGroups = modal.querySelectorAll('.form-group');
                formGroups.forEach(group => {
                    group.style.marginBottom = '15px';
                });
                
                // Style all form labels
                const formLabels = modal.querySelectorAll('.form-label, label');
                formLabels.forEach(label => {
                    label.style.color = '#e0e0e0';
                    label.style.fontWeight = 'normal';
                    label.style.marginBottom = '5px';
                });
                
                // Style all form inputs
                const formInputs = modal.querySelectorAll('.form-control, input[type="text"], input[type="number"], input[type="email"], input[type="password"], textarea, select');
                formInputs.forEach(input => {
                    input.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    input.style.color = '#e0e0e0';
                    input.style.borderRadius = '4px';
                    input.style.padding = '8px 12px';
                    
                    // Add focus event listeners
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
                
                // Style all primary buttons
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
                    
                    // Add hover effect
                    button.addEventListener('mouseenter', function() {
                        this.style.transform = 'translateY(-2px)';
                        this.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.3)';
                    });
                    
                    button.addEventListener('mouseleave', function() {
                        this.style.transform = 'translateY(0)';
                        this.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
                    });
                });
                
                // Style all secondary buttons
                const secondaryButtons = modal.querySelectorAll('.btn-secondary, .btn-danger, .cancel-btn, .close-btn');
                secondaryButtons.forEach(button => {
                    button.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    button.style.color = '#ffffff';
                    button.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    button.style.borderRadius = '4px';
                    button.style.padding = '8px 16px';
                    button.style.fontWeight = 'normal';
                    button.style.transition = 'all 0.2s ease';
                    
                    // Add hover effect
                    button.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    });
                    
                    button.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    });
                });
                
                // Style all tables
                const tables = modal.querySelectorAll('table');
                tables.forEach(table => {
                    table.style.backgroundColor = 'transparent';
                    table.style.color = '#e0e0e0';
                    
                    // Style the table headers
                    const headers = table.querySelectorAll('th');
                    headers.forEach(header => {
                        header.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        header.style.color = '#ffffff';
                        header.style.fontWeight = '500';
                        header.style.padding = '10px';
                        header.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    });
                    
                    // Style the table cells
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
    
    // Function to fix the edit buttons in the recipe table
    function fixEditButtons() {
        console.log('[Recipe View/Edit Dark Fix] Fixing edit buttons...');
        
        // Find all edit buttons in the recipe table
        const editButtons = document.querySelectorAll('.recipe-table .edit-btn, .recipe-table button[class*="edit"], .recipe-table [id*="edit-btn"]');
        editButtons.forEach(button => {
            button.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
            button.style.color = '#ffffff';
            button.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            button.style.borderRadius = '4px';
            button.style.transition = 'all 0.2s ease';
            
            // Add hover effect
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
    
    // Function to observe DOM changes and fix recipe view and edit modal styling
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for recipe views and edit modals in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is a recipe view or edit modal
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
                            
                            // Also check child nodes
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
        
        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Initialize when the DOM is ready
    function init() {
        console.log('[Recipe View/Edit Dark Fix] Initializing...');
        
        // Fix the recipe view styling
        setTimeout(fixRecipeViewStyling, 500); // Delay to ensure the DOM is fully loaded
        
        // Fix the recipe edit modal styling
        setTimeout(fixRecipeEditModalStyling, 500); // Delay to ensure the DOM is fully loaded
        
        // Fix the edit buttons
        setTimeout(fixEditButtons, 500); // Delay to ensure the DOM is fully loaded
        
        // Observe DOM changes to fix recipe view and edit modal styling for new elements
        observeDOMChanges();
        
        console.log('[Recipe View/Edit Dark Fix] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
