/**
 * Redesigned Ingredient Form
 * Modern, intuitive interface with improved user experience
 */

(function() {
    'use strict';

    // Enhanced ingredient row HTML with modern structure
    function createRedesignedIngredientRowHtml() {
        return `
            <div class="ingredient-item">
                <!-- Header Section -->
                <div class="ingredient-header">
                    <div class="ingredient-type-selector">
                        <div class="ingredient-type-option active" data-type="new">
                            <input type="radio" name="ingredient-selection-type-${Date.now()}" value="new" class="ingredient-selection-radio" checked>
                            <span>✨ Create New</span>
                        </div>
                        <div class="ingredient-type-option" data-type="existing">
                            <input type="radio" name="ingredient-selection-type-${Date.now()}" value="existing" class="ingredient-selection-radio">
                            <span>📋 Use Existing</span>
                        </div>
                    </div>
                    <div class="ingredient-header-actions">
                        <button type="button" class="action-btn action-btn-danger remove-ingredient-btn" title="Remove Ingredient">
                            <span>🗑️</span>
                        </button>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="ingredient-content">
                    <!-- Left Column: Primary Inputs -->
                    <div class="ingredient-primary-inputs">
                        <!-- Search Section (hidden by default) -->
                        <div class="ingredient-search-section">
                            <div class="search-input-wrapper">
                                <input type="text" class="ingredient-search-input" placeholder="Search existing ingredients...">
                            </div>
                        </div>

                        <!-- Input Grid -->
                        <div class="ingredient-inputs-grid">
                            <div class="input-group">
                                <label class="input-label">Ingredient Name</label>
                                <input type="text" class="form-input ingredient-name" placeholder="Enter ingredient name" required>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Amount (g)</label>
                                <input type="number" class="form-input ingredient-amount" placeholder="0" step="0.01" required>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Package Price</label>
                                <input type="number" class="form-input ingredient-price" placeholder="0.00" step="0.01" required>
                            </div>
                        </div>

                        <!-- Additional Fields Row -->
                        <div class="ingredient-inputs-grid">
                            <div class="input-group">
                                <label class="input-label">Package Amount (g)</label>
                                <input type="number" class="form-input ingredient-package-amount" placeholder="Optional" step="0.01">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Grocery Store</label>
                                <input type="text" class="form-input grocery-store-input" placeholder="Optional">
                            </div>
                            <div class="input-group">
                                <!-- Spacer for alignment -->
                            </div>
                        </div>

                        <!-- Cronometer Section -->
                        <div class="cronometer-section">
                            <div class="cronometer-header">
                                <span class="cronometer-icon">📊</span>
                                <span class="cronometer-title">Nutrition Data Parser</span>
                            </div>
                            <textarea class="cronometer-textarea cronometer-text-paste-area" 
                                     placeholder="Paste Cronometer nutrition data here for automatic parsing..."></textarea>
                            <button type="button" class="cronometer-parse-btn cronometer-parse-button">
                                Parse Nutrition Data
                            </button>
                            <div class="cronometer-parse-status"></div>
                        </div>

                        <!-- Hidden fields for form submission -->
                        <input type="hidden" class="ingredient-calories" required>
                        <input type="hidden" class="ingredient-protein" required>
                        <input type="hidden" class="ingredient-fat" required>
                        <input type="hidden" class="ingredient-carbs" required>
                    </div>

                    <!-- Right Column: Actions & Nutrition -->
                    <div class="ingredient-sidebar">
                        <!-- Action Buttons -->
                        <div class="action-buttons-section">
                            <div class="action-buttons-grid">
                                <button type="button" class="action-btn action-btn-secondary toggle-detailed-nutrition">
                                    <span>📋</span> Nutrition Panel
                                </button>
                                <button type="button" class="action-btn action-btn-primary add-ingredient-btn-inline">
                                    <span>➕</span> Add Ingredient
                                </button>
                            </div>
                        </div>

                        <!-- Nutrition Panel -->
                        <div class="nutrition-panel detailed-nutrition-panel" style="display: none;">
                            <div class="nutrition-panel-header">
                                <span class="nutrition-panel-title">Detailed Nutrition</span>
                                <button type="button" class="action-btn action-btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="this.closest('.nutrition-panel').style.display='none'">
                                    ✕
                                </button>
                            </div>
                            <div class="nutrition-panel-content">
                                <!-- Nutrition content will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Enhanced interaction handlers
    function setupRedesignedInteractions() {
        // Handle ingredient type selection
        document.addEventListener('click', function(event) {
            if (event.target.closest('.ingredient-type-option')) {
                const option = event.target.closest('.ingredient-type-option');
                const radio = option.querySelector('input[type="radio"]');
                const ingredientItem = option.closest('.ingredient-item');

                // Update visual state
                option.parentElement.querySelectorAll('.ingredient-type-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');

                // Update radio button
                radio.checked = true;

                // Show/hide search section
                const searchSection = ingredientItem.querySelector('.ingredient-search-section');
                const inputsGrids = ingredientItem.querySelectorAll('.ingredient-inputs-grid');

                if (radio.value === 'existing') {
                    searchSection.classList.add('active');
                    inputsGrids.forEach(grid => {
                        grid.style.opacity = '0.5';
                        grid.style.pointerEvents = 'none';
                    });
                } else {
                    searchSection.classList.remove('active');
                    inputsGrids.forEach(grid => {
                        grid.style.opacity = '1';
                        grid.style.pointerEvents = 'auto';
                    });
                }
            }
        });

        // Handle remove ingredient button
        document.addEventListener('click', function(event) {
            if (event.target.closest('.remove-ingredient-btn')) {
                const ingredientItem = event.target.closest('.ingredient-item');
                const ingredientsList = document.getElementById('ingredients-list');

                if (ingredientsList && ingredientsList.children.length > 1) {
                    ingredientItem.remove();
                } else {
                    // Show a styled notification instead of alert
                    showNotification('A recipe must have at least one ingredient.', 'warning');
                }
            }
        });

        // Handle add ingredient button - DISABLED to prevent duplicate modals
        // This functionality is now handled by unified-add-ingredient-handler.js
        /*
        document.addEventListener('click', function(event) {
            if (event.target.closest('.add-ingredient-btn-inline')) {
                event.preventDefault();
                event.stopPropagation();

                // Call the existing addIngredientRow function or create new ingredient
                if (typeof window.addIngredientRow === 'function') {
                    window.addIngredientRow();
                } else {
                    addNewIngredientRow();
                }
            }
        });
        */

        // Enhanced nutrition panel toggle
        document.addEventListener('click', function(event) {
            if (event.target.closest('.toggle-detailed-nutrition')) {
                const button = event.target.closest('.toggle-detailed-nutrition');
                const panel = button.closest('.ingredient-sidebar').querySelector('.nutrition-panel');
                
                if (panel) {
                    const isVisible = panel.style.display !== 'none';
                    panel.style.display = isVisible ? 'none' : 'block';
                    
                    // Update button text and icon
                    const span = button.querySelector('span');
                    const text = button.childNodes[button.childNodes.length - 1];
                    
                    if (isVisible) {
                        span.textContent = '📋';
                        text.textContent = ' Nutrition Panel';
                        button.classList.remove('active');
                    } else {
                        span.textContent = '📊';
                        text.textContent = ' Hide Panel';
                        button.classList.add('active');
                        
                        // Ensure nutrition content is populated
                        populateNutritionPanel(panel);
                    }
                }
            }
        });

        // Enhanced input focus effects
        document.addEventListener('focus', function(event) {
            if (event.target.classList.contains('form-input')) {
                event.target.closest('.input-group')?.classList.add('focused');
            }
        }, true);

        document.addEventListener('blur', function(event) {
            if (event.target.classList.contains('form-input')) {
                event.target.closest('.input-group')?.classList.remove('focused');
            }
        }, true);
    }

    // Populate nutrition panel with enhanced structure
    function populateNutritionPanel(panel) {
        const content = panel.querySelector('.nutrition-panel-content');
        if (!content || content.dataset.populated === 'true') return;

        content.innerHTML = `
            <div class="nutrition-sections">
                <!-- Basic Nutrition -->
                <div class="nutrition-section">
                    <h4 style="color: #3498db; font-size: 0.85rem; margin-bottom: 12px; font-weight: 600;">Basic Nutrition</h4>
                    <div class="nutrition-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div class="nutrition-item">
                            <label style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">Calories:</label>
                            <input type="number" class="nutrition-calories form-input" style="padding: 6px 8px; font-size: 0.8rem;" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">Protein (g):</label>
                            <input type="number" class="nutrition-protein form-input" style="padding: 6px 8px; font-size: 0.8rem;" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">Fat (g):</label>
                            <input type="number" class="nutrition-fat form-input" style="padding: 6px 8px; font-size: 0.8rem;" step="0.1">
                        </div>
                        <div class="nutrition-item">
                            <label style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">Carbs (g):</label>
                            <input type="number" class="nutrition-carbs form-input" style="padding: 6px 8px; font-size: 0.8rem;" step="0.1">
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div style="margin-top: 16px; display: flex; gap: 8px;">
                    <button type="button" class="action-btn action-btn-primary save-nutrition" style="flex: 1; padding: 8px 12px; font-size: 0.8rem;">
                        💾 Save
                    </button>
                    <button type="button" class="action-btn action-btn-secondary cancel-nutrition" style="flex: 1; padding: 8px 12px; font-size: 0.8rem;">
                        ❌ Cancel
                    </button>
                </div>
            </div>
        `;
        
        content.dataset.populated = 'true';
    }

    // Replace existing ingredient row creation
    function replaceIngredientRowCreation() {
        // Override the global createIngredientRowHtml function if it exists
        if (window.createIngredientRowHtml) {
            window.createIngredientRowHtml = createRedesignedIngredientRowHtml;
        }
        
        // Also update the food.js function directly
        if (window.addIngredientRow) {
            const originalAddIngredientRow = window.addIngredientRow;
            window.addIngredientRow = function() {
                const ingredientsList = document.getElementById('ingredients-list');
                if (!ingredientsList) return;
                
                const ingredientItem = document.createElement('div');
                ingredientItem.innerHTML = createRedesignedIngredientRowHtml();
                ingredientsList.appendChild(ingredientItem.firstElementChild);
                
                // Trigger the ingredient added event
                const event = new CustomEvent('ingredientAdded', {
                    detail: { ingredientItem: ingredientItem.firstElementChild }
                });
                document.dispatchEvent(event);
            };
        }
    }

    // Initialize the redesigned form
    function initializeRedesignedForm() {
        console.log('[Redesigned Ingredient Form] Initializing...');
        
        setupRedesignedInteractions();
        replaceIngredientRowCreation();
        
        // Apply redesign to existing ingredient items - DISABLED to prevent errors
        // The Add Ingredient functionality works without this initialization
        /*
        const existingItems = document.querySelectorAll('.ingredient-item');
        existingItems.forEach((item, index) => {
            if (!item.classList.contains('redesigned')) {
                try {
                    const newItem = document.createElement('div');
                    newItem.innerHTML = createRedesignedIngredientRowHtml();

                    // Store reference to the element before moving it
                    const newElement = newItem.firstElementChild;
                    if (newElement && item.parentNode) {
                        item.parentNode.replaceChild(newElement, item);
                        // Check if newElement still exists after replacement
                        if (newElement && newElement.classList) {
                            newElement.classList.add('redesigned');
                        }
                    } else {
                        console.warn(`[Redesigned Ingredient Form] Could not replace item ${index}: newElement=${!!newElement}, parentNode=${!!item.parentNode}`);
                    }
                } catch (error) {
                    console.error(`[Redesigned Ingredient Form] Error applying redesign to item ${index}:`, error);
                }
            }
        });
        */
        
        console.log('[Redesigned Ingredient Form] Initialization complete');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeRedesignedForm);
    } else {
        initializeRedesignedForm();
    }

    // Utility functions
    function addNewIngredientRow() {
        const ingredientsList = document.getElementById('ingredients-list');
        if (!ingredientsList) return;

        const ingredientItem = document.createElement('div');
        ingredientItem.innerHTML = createRedesignedIngredientRowHtml();

        // Store reference to the element before moving it
        const newIngredientElement = ingredientItem.firstElementChild;
        if (!newIngredientElement) {
            console.error('[Redesigned Ingredient Form] No element created from HTML');
            return;
        }

        ingredientsList.appendChild(newIngredientElement);

        // Trigger the ingredient added event
        const event = new CustomEvent('ingredientAdded', {
            detail: { ingredientItem: newIngredientElement }
        });
        document.dispatchEvent(event);

        // Scroll to new ingredient
        setTimeout(() => {
            if (newIngredientElement && typeof newIngredientElement.scrollIntoView === 'function') {
                newIngredientElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }

    function showNotification(message, type = 'info') {
        // Create a modern notification
        const notification = document.createElement('div');
        notification.className = `redesigned-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, ${type === 'warning' ? '#f39c12, #e67e22' : '#3498db, #2980b9'});
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 0.9rem;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Enhanced form validation
    function validateIngredientForm(ingredientItem) {
        const requiredFields = ingredientItem.querySelectorAll('input[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
                isValid = false;
            } else {
                field.style.borderColor = '';
                field.style.boxShadow = '';
            }
        });

        return isValid;
    }

    // Re-initialize when new ingredients are added
    document.addEventListener('ingredientAdded', function(event) {
        setTimeout(() => {
            setupRedesignedInteractions();
        }, 100);
    });

    // Make functions globally available
    window.createRedesignedIngredientRowHtml = createRedesignedIngredientRowHtml;
    window.addNewIngredientRow = addNewIngredientRow;
    window.validateIngredientForm = validateIngredientForm;

})();
