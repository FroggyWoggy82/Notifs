/**
 * Micronutrient Goals Modal
 * Handles the modal for editing daily micronutrient targets/goals
 */

class MicronutrientGoalsModal {
    constructor() {
        this.currentUserId = 1; // Default user ID
        this.modal = null;
        this.isLoading = false;
        
        // Micronutrient definitions with labels and units
        // Organized to match the comprehensive tracking interface
        this.micronutrients = {
            general: {
                title: 'General',
                nutrients: {
                    energy: { label: 'Energy', unit: 'kcal', placeholder: '2200' },
                    water: { label: 'Water', unit: 'g', placeholder: '3000' },
                    alcohol: { label: 'Alcohol', unit: 'g', placeholder: '0' },
                    caffeine: { label: 'Caffeine', unit: 'mg', placeholder: '400' }
                }
            },
            carbohydrates: {
                title: 'Carbohydrates',
                nutrients: {
                    carbs: { label: 'Carbs', unit: 'g', placeholder: '300' },
                    fiber: { label: 'Fiber', unit: 'g', placeholder: '38' },
                    starch: { label: 'Starch', unit: 'g', placeholder: '130' },
                    sugars: { label: 'Sugars', unit: 'g', placeholder: '50' },
                    added_sugars: { label: 'Added Sugars', unit: 'g', placeholder: '25' },
                    net_carbs: { label: 'Net Carbs', unit: 'g', placeholder: '130' }
                }
            },
            protein: {
                title: 'Protein',
                nutrients: {
                    protein: { label: 'Protein', unit: 'g', placeholder: '200' },
                    histidine: { label: 'Histidine', unit: 'g', placeholder: '0.7' },
                    isoleucine: { label: 'Isoleucine', unit: 'g', placeholder: '1.4' },
                    leucine: { label: 'Leucine', unit: 'g', placeholder: '2.7' },
                    lysine: { label: 'Lysine', unit: 'g', placeholder: '2.1' },
                    methionine: { label: 'Methionine', unit: 'g', placeholder: '0.7' },
                    phenylalanine: { label: 'Phenylalanine', unit: 'g', placeholder: '1.75' },
                    threonine: { label: 'Threonine', unit: 'g', placeholder: '1.05' },
                    tryptophan: { label: 'Tryptophan', unit: 'g', placeholder: '0.28' },
                    valine: { label: 'Valine', unit: 'g', placeholder: '1.82' },
                    cystine: { label: 'Cystine', unit: 'g', placeholder: '0.7' }
                }
            },
            lipids: {
                title: 'Lipids',
                nutrients: {
                    fat: { label: 'Fat', unit: 'g', placeholder: '75' },
                    saturated: { label: 'Saturated', unit: 'g', placeholder: '20' },
                    monounsaturated: { label: 'Monounsaturated', unit: 'g', placeholder: '25' },
                    polyunsaturated: { label: 'Polyunsaturated', unit: 'g', placeholder: '20' },
                    omega3: { label: 'Omega-3', unit: 'g', placeholder: '1.6' },
                    omega6: { label: 'Omega-6', unit: 'g', placeholder: '14' },
                    trans_fat: { label: 'Trans-Fats', unit: 'g', placeholder: '0' },
                    cholesterol: { label: 'Cholesterol', unit: 'mg', placeholder: '300' }
                }
            },
            vitamins: {
                title: 'Vitamins',
                nutrients: {
                    vitamin_a: { label: 'Vitamin A', unit: 'mcg RAE', placeholder: '900' },
                    thiamine: { label: 'B1 (Thiamine)', unit: 'mg', placeholder: '1.2' },
                    riboflavin: { label: 'B2 (Riboflavin)', unit: 'mg', placeholder: '1.3' },
                    niacin: { label: 'B3 (Niacin)', unit: 'mg', placeholder: '16' },
                    pantothenic_acid: { label: 'B5 (Pantothenic Acid)', unit: 'mg', placeholder: '5' },
                    vitamin_b6: { label: 'B6 (Pyridoxine)', unit: 'mg', placeholder: '1.3' },
                    vitamin_b12: { label: 'B12 (Cobalamin)', unit: 'mcg', placeholder: '2.4' },
                    folate: { label: 'Folate', unit: 'mcg DFE', placeholder: '400' },
                    vitamin_c: { label: 'Vitamin C', unit: 'mg', placeholder: '90' },
                    vitamin_d: { label: 'Vitamin D', unit: 'IU', placeholder: '600' },
                    vitamin_e: { label: 'Vitamin E', unit: 'mg', placeholder: '15' },
                    vitamin_k: { label: 'Vitamin K', unit: 'mcg', placeholder: '120' }
                }
            },
            minerals: {
                title: 'Minerals',
                nutrients: {
                    calcium: { label: 'Calcium', unit: 'mg', placeholder: '1000' },
                    copper: { label: 'Copper', unit: 'mg', placeholder: '0.9' },
                    iron: { label: 'Iron', unit: 'mg', placeholder: '8' },
                    magnesium: { label: 'Magnesium', unit: 'mg', placeholder: '400' },
                    manganese: { label: 'Manganese', unit: 'mg', placeholder: '2.3' },
                    phosphorus: { label: 'Phosphorus', unit: 'mg', placeholder: '700' },
                    potassium: { label: 'Potassium', unit: 'mg', placeholder: '4700' },
                    selenium: { label: 'Selenium', unit: 'mcg', placeholder: '55' },
                    sodium: { label: 'Sodium', unit: 'mg', placeholder: '2300' },
                    zinc: { label: 'Zinc', unit: 'mg', placeholder: '11' }
                }
            }
        };
        
        this.init();
    }

    init() {
        // Get current user ID from the user selector
        const userSelector = document.getElementById('user-selector');
        if (userSelector) {
            this.currentUserId = parseInt(userSelector.value) || 1;
            
            // Listen for user changes
            userSelector.addEventListener('change', (e) => {
                this.currentUserId = parseInt(e.target.value) || 1;
            });
        }

        // Add event listener to the edit button
        const editButton = document.getElementById('edit-micronutrient-goals-btn');
        if (editButton) {
            editButton.addEventListener('click', () => this.openModal());
        }
    }

    async openModal() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            await this.createModal();
            await this.loadCurrentGoals();
            this.showModal();
        } catch (error) {
            console.error('Error opening micronutrient goals modal:', error);
            this.showStatus('Error opening modal: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    createModal() {
        // Remove existing modal if it exists
        if (this.modal) {
            this.modal.remove();
        }

        // Create modal HTML
        const modalHTML = `
            <div class="micronutrient-goals-modal-overlay">
                <div class="micronutrient-goals-modal">
                    <div class="micronutrient-goals-modal-header">
                        <h2 class="micronutrient-goals-modal-title">
                            <i class="fas fa-pills"></i> Edit Micronutrient Goals
                        </h2>
                        <button type="button" class="micronutrient-goals-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="micronutrient-goals-modal-content">
                        <form id="micronutrient-goals-form">
                            ${this.generateFormSections()}
                        </form>
                        
                        <div id="micronutrient-status" class="micronutrient-status"></div>
                    </div>
                    
                    <div class="micronutrient-goals-modal-actions">
                        <button type="button" class="micronutrient-reset-btn">
                            <i class="fas fa-undo"></i> Reset to Defaults
                        </button>
                        <button type="button" class="micronutrient-cancel-btn">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button type="button" class="micronutrient-save-btn">
                            <i class="fas fa-save"></i> Save Goals
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Create modal element
        this.modal = document.createElement('div');
        this.modal.innerHTML = modalHTML;
        this.modal = this.modal.firstElementChild;

        // Add event listeners
        this.addModalEventListeners();

        // Append to body
        document.body.appendChild(this.modal);
    }

    generateFormSections() {
        let html = '';
        
        for (const [sectionKey, section] of Object.entries(this.micronutrients)) {
            html += `
                <div class="micronutrient-section">
                    <h3 class="micronutrient-section-title">${section.title}</h3>
                    <div class="micronutrient-form-grid">
            `;
            
            for (const [nutrientKey, nutrient] of Object.entries(section.nutrients)) {
                html += `
                    <div class="micronutrient-form-group">
                        <label for="${nutrientKey}">
                            ${nutrient.label}
                            <span class="micronutrient-unit">(${nutrient.unit})</span>
                        </label>
                        <input 
                            type="number" 
                            id="${nutrientKey}" 
                            name="${nutrientKey}"
                            placeholder="${nutrient.placeholder}"
                            step="0.1"
                            min="0"
                        >
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    addModalEventListeners() {
        // Close button
        const closeBtn = this.modal.querySelector('.micronutrient-goals-modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());

        // Cancel button
        const cancelBtn = this.modal.querySelector('.micronutrient-cancel-btn');
        cancelBtn.addEventListener('click', () => this.closeModal());

        // Save button
        const saveBtn = this.modal.querySelector('.micronutrient-save-btn');
        saveBtn.addEventListener('click', () => this.saveGoals());

        // Reset button
        const resetBtn = this.modal.querySelector('.micronutrient-reset-btn');
        resetBtn.addEventListener('click', () => this.resetToDefaults());

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Prevent form submission
        const form = this.modal.querySelector('#micronutrient-goals-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGoals();
        });
    }

    async loadCurrentGoals() {
        try {
            const response = await fetch(`/api/micronutrient-goals/${this.currentUserId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.populateForm(data);
            
        } catch (error) {
            console.error('Error loading current goals:', error);
            // Load defaults if there's an error
            await this.resetToDefaults();
        }
    }

    populateForm(data) {
        for (const [sectionKey, section] of Object.entries(this.micronutrients)) {
            for (const nutrientKey of Object.keys(section.nutrients)) {
                const input = this.modal.querySelector(`#${nutrientKey}`);
                if (input && data[nutrientKey] !== null && data[nutrientKey] !== undefined) {
                    input.value = data[nutrientKey];
                }
            }
        }
    }

    async resetToDefaults() {
        try {
            const response = await fetch('/api/micronutrient-goals/defaults');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.populateForm(data.goals);
            this.showStatus('Reset to default RDA values', 'success');
            
        } catch (error) {
            console.error('Error loading defaults:', error);
            this.showStatus('Error loading defaults: ' + error.message, 'error');
        }
    }

    async saveGoals() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showStatus('Saving goals...', 'success');
            
            // Collect form data
            const formData = { user_id: this.currentUserId };
            
            for (const [sectionKey, section] of Object.entries(this.micronutrients)) {
                for (const nutrientKey of Object.keys(section.nutrients)) {
                    const input = this.modal.querySelector(`#${nutrientKey}`);
                    if (input && input.value.trim() !== '') {
                        formData[nutrientKey] = parseFloat(input.value);
                    }
                }
            }
            
            const response = await fetch('/api/micronutrient-goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            this.showStatus('Micronutrient goals saved successfully!', 'success');
            
            // Close modal after a short delay
            setTimeout(() => {
                this.closeModal();
            }, 1500);
            
        } catch (error) {
            console.error('Error saving goals:', error);
            this.showStatus('Error saving goals: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    showStatus(message, type) {
        const statusDiv = this.modal.querySelector('#micronutrient-status');
        statusDiv.textContent = message;
        statusDiv.className = `micronutrient-status ${type}`;
        statusDiv.style.display = 'block';
        
        // Hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    showModal() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        document.body.style.overflow = '';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.micronutrientGoalsModal = new MicronutrientGoalsModal();
});
