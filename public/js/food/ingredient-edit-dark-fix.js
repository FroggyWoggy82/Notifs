/**
 * Ingredient Edit Modal Dark Fix
 * Ensures the ingredient edit modal matches the dark theme
 */

(function() {
    // Function to fix the ingredient edit modal styling
    function fixIngredientEditModalStyling() {
        console.log('[Ingredient Edit Dark Fix] Fixing ingredient edit modal styling...');
        
        // Find all modals that might be ingredient edit modals
        const modals = document.querySelectorAll('.modal, .modal-content, [id*="edit-ingredient"], [class*="edit-ingredient"]');
        modals.forEach(modal => {
            // Check if this is an ingredient edit modal
            if (modal.id && modal.id.includes('edit-ingredient') || 
                modal.classList.contains('edit-ingredient-modal') || 
                modal.querySelector('[id*="edit-ingredient-form"]')) {
                
                console.log('[Ingredient Edit Dark Fix] Found ingredient edit modal:', modal);
                
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
                    modalHeader.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
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
                    modalFooter.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                    modalFooter.style.color = '#e0e0e0';
                    modalFooter.style.borderTop = '1px solid rgba(255, 255, 255, 0.05)';
                }
                
                // Style all input fields
                const inputs = modal.querySelectorAll('input[type="text"], input[type="number"], select, textarea');
                inputs.forEach(input => {
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
                
                // Style all labels
                const labels = modal.querySelectorAll('label');
                labels.forEach(label => {
                    label.style.color = '#e0e0e0';
                    label.style.fontWeight = 'normal';
                });
                
                // Style all section headers
                const sectionHeaders = modal.querySelectorAll('h3, h4, h5, .section-header');
                sectionHeaders.forEach(header => {
                    header.style.color = '#ffffff';
                    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                    header.style.paddingBottom = '5px';
                    header.style.marginBottom = '15px';
                });
                
                // Style the Save Changes button
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
                    
                    // Add hover effect
                    saveButton.addEventListener('mouseenter', function() {
                        this.style.transform = 'translateY(-2px)';
                        this.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.3)';
                    });
                    
                    saveButton.addEventListener('mouseleave', function() {
                        this.style.transform = 'translateY(0)';
                        this.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
                    });
                }
                
                // Style the Cancel button
                const cancelButton = modal.querySelector('#cancel-btn, .cancel-btn, .btn-secondary, .btn-danger');
                if (cancelButton) {
                    cancelButton.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    cancelButton.style.color = '#ffffff';
                    cancelButton.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    cancelButton.style.borderRadius = '4px';
                    cancelButton.style.padding = '8px 16px';
                    cancelButton.style.fontWeight = 'normal';
                    cancelButton.style.transition = 'all 0.2s ease';
                    
                    // Add hover effect
                    cancelButton.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    });
                    
                    cancelButton.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    });
                }
                
                // Style all category sections
                const categorySections = modal.querySelectorAll('.category-section, .form-section, .nutrient-section, [class*="-section"]');
                categorySections.forEach(section => {
                    section.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    section.style.border = '1px solid rgba(255, 255, 255, 0.05)';
                    section.style.borderRadius = '4px';
                    section.style.padding = '15px';
                    section.style.marginBottom = '15px';
                });
                
                // Style all category headers
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
    
    // Function to observe DOM changes and fix ingredient edit modal styling
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for modals in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is a modal
                            if (node.classList && (node.classList.contains('modal') || node.id && node.id.includes('edit-ingredient'))) {
                                fixIngredientEditModalStyling();
                            }
                            
                            // Also check child nodes
                            const modals = node.querySelectorAll('.modal, [id*="edit-ingredient"]');
                            if (modals.length) {
                                fixIngredientEditModalStyling();
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
        console.log('[Ingredient Edit Dark Fix] Initializing...');
        
        // Fix ingredient edit modal styling
        setTimeout(fixIngredientEditModalStyling, 500); // Delay to ensure the DOM is fully loaded
        
        // Observe DOM changes to fix ingredient edit modal styling for new modals
        observeDOMChanges();
        
        console.log('[Ingredient Edit Dark Fix] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
