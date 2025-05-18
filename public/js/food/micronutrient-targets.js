/**
 * Micronutrient Targets
 *
 * This file contains recommended daily intake values for micronutrients.
 * These values are used to calculate the percentage of daily targets met by selected recipes.
 *
 * Values are based on standard recommended daily allowances (RDAs) for adults.
 * The energy/calories target is dynamically updated based on the user's daily calorie target.
 */

// Default values that will be updated dynamically
let userCalorieTarget = 2200; // Default to 2200 kcal, will be updated from user settings
let userProteinTarget = null; // Will be set from user settings or calculated based on calories
let userFatTarget = null; // Will be set from user settings or calculated based on calories

const MICRONUTRIENT_TARGETS = {
    // General
    energy: userCalorieTarget, // kcal - dynamically set from user's daily calorie target
    calories: userCalorieTarget, // kcal - alias for energy
    alcohol: 0, // g - no recommended intake
    caffeine: 400, // mg - upper limit
    water: 3000, // g - approximately 3 liters

    // Macronutrients
    carbs: 275, // g - based on 55% of 2000 kcal
    carbohydrates: 275, // g - alias for carbs
    protein: 50, // g - based on 0.8g/kg for 62.5kg person
    fats: 65, // g - based on 30% of 2000 kcal
    fat: 65, // g - alias for fats

    // Carbohydrates breakdown
    fiber: 28, // g
    starch: 130, // g - approximate minimum needed
    sugars: 50, // g - upper limit recommendation
    added_sugars: 25, // g - upper limit recommendation
    net_carbs: 130, // g - approximate minimum needed

    // Lipids
    saturated: 20, // g - upper limit (10% of calories)
    monounsaturated: 25, // g - approximate target
    polyunsaturated: 20, // g - approximate target
    omega3: 1.6, // g
    omega_3: 1.6, // g // alias for omega3
    omega6: 14, // g
    omega_6: 14, // g // alias for omega6
    trans: 0, // g - recommended to avoid
    cholesterol: 300, // mg - upper limit

    // Vitamins
    vitamin_a: 900, // μg
    thiamine: 1.2, // mg - Vitamin B1
    vitamin_b1: 1.2, // mg - alias for thiamine
    riboflavin: 1.3, // mg - Vitamin B2
    vitamin_b2: 1.3, // mg - alias for riboflavin
    niacin: 16, // mg - Vitamin B3
    vitamin_b3: 16, // mg - alias for niacin
    pantothenic_acid: 5, // mg - Vitamin B5
    vitamin_b5: 5, // mg - alias for pantothenic_acid
    vitamin_b6: 1.7, // mg
    vitamin_b12: 2.4, // μg
    folate: 400, // μg
    vitamin_c: 90, // mg
    vitamin_d: 600, // IU (15 μg)
    vitamin_e: 15, // mg
    vitamin_k: 120, // μg

    // Minerals
    calcium: 1000, // mg
    copper: 0.9, // mg
    iron: 8, // mg (higher for menstruating women: 18mg)
    magnesium: 400, // mg
    manganese: 2.3, // mg
    phosphorus: 700, // mg
    potassium: 3500, // mg
    selenium: 55, // μg
    sodium: 2300, // mg - upper limit
    zinc: 11, // mg

    // Amino acids (protein components)
    histidine: 0.7, // g
    isoleucine: 1.4, // g
    leucine: 2.7, // g
    lysine: 2.1, // g
    methionine: 0.7, // g
    phenylalanine: 1.75, // g
    threonine: 1.05, // g
    tryptophan: 0.28, // g
    valine: 1.82, // g
    cystine: 0.7 // g
};

// Group micronutrients by category for easier display
const MICRONUTRIENT_CATEGORIES = {
    general: [
        { key: 'calories', label: 'Energy', unit: 'kcal' },
        { key: 'water', label: 'Water', unit: 'g' }
    ],
    carbohydrates: [
        { key: 'carbohydrates', label: 'Carbs', unit: 'g' },
        { key: 'fiber', label: 'Fiber', unit: 'g' },
        { key: 'starch', label: 'Starch', unit: 'g' },
        { key: 'sugars', label: 'Sugars', unit: 'g' },
        { key: 'added_sugars', label: 'Added Sugars', unit: 'g' },
        { key: 'net_carbs', label: 'Net Carbs', unit: 'g' }
    ],
    lipids: [
        { key: 'fat', label: 'Fats', unit: 'g' },
        { key: 'saturated', label: 'Saturated', unit: 'g' },
        { key: 'monounsaturated', label: 'Monounsaturated', unit: 'g' },
        { key: 'polyunsaturated', label: 'Polyunsaturated', unit: 'g' },
        { key: 'omega3', label: 'Omega-3', unit: 'g' }, // Use omega3 as primary key (matches migration)
        { key: 'omega6', label: 'Omega-6', unit: 'g' }, // Use omega6 as primary key (matches migration)
        { key: 'trans', label: 'Trans', unit: 'g' },
        { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' }
    ],
    vitamins: [
        { key: 'vitamin_a', label: 'Vitamin A', unit: 'μg' },
        // Try both database column names for B vitamins
        { key: 'thiamine', label: 'B1 (Thiamine)', unit: 'mg' },
        { key: 'vitamin_b1', label: 'B1 (Thiamine)', unit: 'mg' },
        { key: 'riboflavin', label: 'B2 (Riboflavin)', unit: 'mg' },
        { key: 'vitamin_b2', label: 'B2 (Riboflavin)', unit: 'mg' },
        { key: 'niacin', label: 'B3 (Niacin)', unit: 'mg' },
        { key: 'vitamin_b3', label: 'B3 (Niacin)', unit: 'mg' },
        { key: 'pantothenic_acid', label: 'B5 (Pantothenic Acid)', unit: 'mg' },
        { key: 'vitamin_b5', label: 'B5 (Pantothenic Acid)', unit: 'mg' },
        { key: 'vitamin_b6', label: 'B6 (Pyridoxine)', unit: 'mg' },
        { key: 'vitamin_b12', label: 'B12 (Cobalamin)', unit: 'μg' },
        { key: 'folate', label: 'Folate', unit: 'μg' },
        { key: 'vitamin_c', label: 'Vitamin C', unit: 'mg' },
        { key: 'vitamin_d', label: 'Vitamin D', unit: 'IU' },
        { key: 'vitamin_e', label: 'Vitamin E', unit: 'mg' },
        { key: 'vitamin_k', label: 'Vitamin K', unit: 'μg' }
    ],
    minerals: [
        { key: 'calcium', label: 'Calcium', unit: 'mg' },
        { key: 'copper', label: 'Copper', unit: 'mg' },
        { key: 'iron', label: 'Iron', unit: 'mg' },
        { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
        { key: 'manganese', label: 'Manganese', unit: 'mg' },
        { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
        { key: 'potassium', label: 'Potassium', unit: 'mg' },
        { key: 'selenium', label: 'Selenium', unit: 'μg' },
        { key: 'sodium', label: 'Sodium', unit: 'mg' },
        { key: 'zinc', label: 'Zinc', unit: 'mg' }
    ],
    protein: [
        { key: 'protein', label: 'Protein', unit: 'g' },
        { key: 'histidine', label: 'Histidine', unit: 'g' },
        { key: 'isoleucine', label: 'Isoleucine', unit: 'g' },
        { key: 'leucine', label: 'Leucine', unit: 'g' },
        { key: 'lysine', label: 'Lysine', unit: 'g' },
        { key: 'methionine', label: 'Methionine', unit: 'g' },
        { key: 'phenylalanine', label: 'Phenylalanine', unit: 'g' },
        { key: 'threonine', label: 'Threonine', unit: 'g' },
        { key: 'tryptophan', label: 'Tryptophan', unit: 'g' },
        { key: 'valine', label: 'Valine', unit: 'g' },
        { key: 'cystine', label: 'Cystine', unit: 'g' }
    ]
};

/**
 * Update the energy/calories target based on the user's daily calorie target
 * @param {number} calorieTarget - The user's daily calorie target
 */
function updateMicronutrientCalorieTarget(calorieTarget) {
    if (calorieTarget && !isNaN(calorieTarget) && calorieTarget > 0) {
        // Update the global variable
        userCalorieTarget = calorieTarget;

        // Update the targets in the MICRONUTRIENT_TARGETS object
        MICRONUTRIENT_TARGETS.energy = calorieTarget;
        MICRONUTRIENT_TARGETS.calories = calorieTarget;

        // Optionally adjust macronutrient targets based on the new calorie target
        // For example, carbs are typically 45-65% of calories, protein 10-35%, and fats 20-35%
        // Here we use 55% for carbs, 15% for protein, and 30% for fats

        // 1g of carbs = 4 calories, so carbs in grams = (calorieTarget * 0.55) / 4
        const carbsTarget = Math.round((calorieTarget * 0.55) / 4);
        MICRONUTRIENT_TARGETS.carbs = carbsTarget;
        MICRONUTRIENT_TARGETS.carbohydrates = carbsTarget;

        // If user hasn't set a custom protein target, calculate based on calories
        // 1g of protein = 4 calories, so protein in grams = (calorieTarget * 0.15) / 4
        if (!userProteinTarget) {
            const proteinTarget = Math.round((calorieTarget * 0.15) / 4);
            MICRONUTRIENT_TARGETS.protein = proteinTarget;
        }

        // 1g of fat = 9 calories, so fat in grams = (calorieTarget * 0.30) / 9
        const fatTarget = Math.round((calorieTarget * 0.30) / 9);
        MICRONUTRIENT_TARGETS.fats = fatTarget;
        MICRONUTRIENT_TARGETS.fat = fatTarget;

        console.log(`Updated micronutrient calorie target to ${calorieTarget} kcal`);
        console.log(`Updated carbs target to ${carbsTarget}g, protein target to ${MICRONUTRIENT_TARGETS.protein}g, fat target to ${fatTarget}g`);
    } else {
        console.warn(`Invalid calorie target: ${calorieTarget}. Using default value.`);
    }
}

/**
 * Update calorie, protein, and fat targets
 * @param {number} calorieTarget - The user's daily calorie target
 * @param {number} proteinTarget - The user's daily protein target in grams
 * @param {number} fatTarget - The user's daily fat target in grams
 */
function updateMicronutrientTargets(calorieTarget, proteinTarget, fatTarget) {
    // First update the calorie target and related macros
    updateMicronutrientCalorieTarget(calorieTarget);

    // Then update the protein target if provided
    if (proteinTarget && !isNaN(proteinTarget) && proteinTarget > 0) {
        // Update the global variable
        userProteinTarget = proteinTarget;

        // Update the protein target in the MICRONUTRIENT_TARGETS object
        MICRONUTRIENT_TARGETS.protein = proteinTarget;

        console.log(`Updated protein target to ${proteinTarget}g (user-defined)`);
    } else if (proteinTarget === null) {
        // Reset to default calculation based on calories
        userProteinTarget = null;
        const defaultProteinTarget = Math.round((calorieTarget * 0.15) / 4);
        MICRONUTRIENT_TARGETS.protein = defaultProteinTarget;
        console.log(`Reset to default protein target: ${defaultProteinTarget}g (calculated from calories)`);
    } else {
        console.warn(`Invalid protein target: ${proteinTarget}. Using calculated value.`);
    }

    // Update the fat target if provided
    if (fatTarget && !isNaN(fatTarget) && fatTarget > 0) {
        // Update the global variable
        userFatTarget = fatTarget;

        // Update the fat target in the MICRONUTRIENT_TARGETS object
        MICRONUTRIENT_TARGETS.fats = fatTarget;
        MICRONUTRIENT_TARGETS.fat = fatTarget;

        console.log(`Updated fat target to ${fatTarget}g (user-defined)`);
    } else if (fatTarget === null) {
        // Reset to default calculation based on calories
        userFatTarget = null;
        const defaultFatTarget = Math.round((calorieTarget * 0.30) / 9);
        MICRONUTRIENT_TARGETS.fats = defaultFatTarget;
        MICRONUTRIENT_TARGETS.fat = defaultFatTarget;
        console.log(`Reset to default fat target: ${defaultFatTarget}g (calculated from calories)`);
    } else {
        console.warn(`Invalid fat target: ${fatTarget}. Using calculated value.`);
    }
}

// Make the functions globally accessible
window.updateMicronutrientCalorieTarget = updateMicronutrientCalorieTarget;
window.updateMicronutrientTargets = updateMicronutrientTargets;
