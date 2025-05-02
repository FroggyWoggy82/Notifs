/**
 * Recipe Table Dark Fix
 * Ensures the recipe table and edit button match the dark theme
 */

(function() {
    // Function to fix the recipe table styling
    function fixRecipeTableStyling() {
        console.log('[Recipe Table Dark Fix] Fixing recipe table styling...');
        
        // Find all tables that might be recipe tables
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            // Check if this is a recipe table
            if (table.classList.contains('recipe-table') || 
                table.id === 'recipe-table' || 
                table.closest('.recipe-list') || 
                table.closest('#recipe-list')) {
                
                console.log('[Recipe Table Dark Fix] Found recipe table:', table);
                
                // Style the table
                table.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                table.style.color = '#e0e0e0';
                table.style.borderCollapse = 'collapse';
                table.style.width = '100%';
                
                // Style the table header
                const headers = table.querySelectorAll('th');
                headers.forEach(header => {
                    header.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
                    header.style.color = '#ffffff';
                    header.style.padding = '10px';
                    header.style.textAlign = 'left';
                    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                });
                
                // Style the table rows
                const rows = table.querySelectorAll('tr');
                rows.forEach((row, index) => {
                    // Skip the header row
                    if (index === 0 && row.querySelector('th')) return;
                    
                    // Apply alternating row colors
                    if (index % 2 === 0) {
                        row.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                    } else {
                        row.style.backgroundColor = 'rgba(25, 25, 25, 0.95)';
                    }
                    
                    // Style the cells
                    const cells = row.querySelectorAll('td');
                    cells.forEach(cell => {
                        cell.style.padding = '8px';
                        cell.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
                        cell.style.color = '#e0e0e0';
                        
                        // Check for numeric values and align them right
                        if (cell.textContent.trim() && !isNaN(parseFloat(cell.textContent))) {
                            cell.style.textAlign = 'right';
                        }
                    });
                    
                    // Add hover effect
                    row.addEventListener('mouseenter', () => {
                        cells.forEach(cell => {
                            cell.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
                        });
                    });
                    
                    row.addEventListener('mouseleave', () => {
                        cells.forEach(cell => {
                            if (index % 2 === 0) {
                                cell.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
                            } else {
                                cell.style.backgroundColor = 'rgba(25, 25, 25, 0.95)';
                            }
                        });
                    });
                });
                
                // Style the edit buttons
                const editButtons = table.querySelectorAll('button.edit, button[class*="edit"], .edit-btn');
                editButtons.forEach(button => {
                    button.style.backgroundColor = '#ffffff';
                    button.style.color = '#121212';
                    button.style.border = 'none';
                    button.style.borderRadius = '4px';
                    button.style.padding = '5px 15px';
                    button.style.cursor = 'pointer';
                    button.style.fontWeight = 'normal';
                    button.style.transition = 'all 0.2s ease';
                    button.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
                    
                    // Add hover effect
                    button.addEventListener('mouseenter', () => {
                        button.style.transform = 'translateY(-2px)';
                        button.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.3)';
                    });
                    
                    button.addEventListener('mouseleave', () => {
                        button.style.transform = 'translateY(0)';
                        button.style.boxShadow = '0 2px 5px rgba(255, 255, 255, 0.2)';
                    });
                });
                
                // Style the action buttons (Hide, Adjust, Delete)
                const actionButtons = table.querySelectorAll('button:not(.edit):not([class*="edit"]):not(.edit-btn)');
                actionButtons.forEach(button => {
                    // Skip if it's an edit button
                    if (button.textContent.toLowerCase().includes('edit')) return;
                    
                    button.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                    button.style.color = '#ffffff';
                    button.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    button.style.borderRadius = '4px';
                    button.style.padding = '5px 15px';
                    button.style.margin = '0 5px';
                    button.style.cursor = 'pointer';
                    button.style.transition = 'all 0.2s ease';
                    
                    // Add hover effect
                    button.addEventListener('mouseenter', () => {
                        button.style.backgroundColor = 'rgba(50, 50, 50, 0.9)';
                        button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    });
                    
                    button.addEventListener('mouseleave', () => {
                        button.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
                        button.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    });
                });
            }
        });
        
        console.log('[Recipe Table Dark Fix] Recipe table styling fixed');
    }
    
    // Function to observe DOM changes and fix recipe table styling
    function observeDOMChanges() {
        // Create a mutation observer
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Look for tables in the added nodes
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if this node is a table
                            if (node.tagName === 'TABLE') {
                                fixRecipeTableStyling();
                            }
                            
                            // Also check child nodes
                            const tables = node.querySelectorAll('table');
                            if (tables.length) {
                                fixRecipeTableStyling();
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
        console.log('[Recipe Table Dark Fix] Initializing...');
        
        // Fix recipe table styling
        setTimeout(fixRecipeTableStyling, 500); // Delay to ensure the DOM is fully loaded
        
        // Observe DOM changes to fix recipe table styling for new tables
        observeDOMChanges();
        
        console.log('[Recipe Table Dark Fix] Initialized');
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
