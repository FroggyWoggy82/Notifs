/**
 * Recipe Model
 * Handles data operations for recipes and ingredients
 */

const db = require('../utils/db');

/**
 * Get all recipes (basic info)
 * @returns {Promise<Array>} - Promise resolving to an array of recipes
 */
async function getAllRecipes() {
    console.log('=== getAllRecipes called ===');
    try {
        // First, check if the recipes table exists
        console.log('Checking if recipes table exists...');
        const tableCheckResult = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'recipes'
            );
        `);

        const tableExists = tableCheckResult.rows[0].exists;
        console.log(`Recipes table exists: ${tableExists}`);

        if (!tableExists) {
            console.error('Recipes table does not exist!');
            return [];
        }

        // Check if the table has any data
        console.log('Checking if recipes table has data...');
        const countResult = await db.query('SELECT COUNT(*) FROM recipes');
        const recipeCount = parseInt(countResult.rows[0].count);
        console.log(`Recipe count: ${recipeCount}`);

        if (recipeCount === 0) {
            console.log('No recipes found in the database');
            return [];
        }

        // Now fetch all recipes
        console.log('Executing query to get all recipes...');
        const result = await db.query('SELECT id, name, total_calories FROM recipes ORDER BY name ASC');
        console.log(`Query returned ${result.rowCount} recipes`);
        console.log('Recipes:', result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error in getAllRecipes:', error);
        console.error('Error stack:', error.stack);

        // Return empty array instead of throwing error
        console.log('Returning empty array due to error');
        return [];
    }
}

/**
 * Get a recipe by ID with its ingredients
 * @param {number} id - The recipe ID
 * @returns {Promise<Object>} - Promise resolving to the recipe with ingredients
 */
async function getRecipeById(id) {
    console.log('=== getRecipeById called ===');
    console.log('id:', id);

    // Fetch recipe details
    const recipeResult = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (recipeResult.rowCount === 0) {
        throw new Error('Recipe not found');
    }
    const recipe = recipeResult.rows[0];
    console.log('Recipe from database:', recipe);

    // CRITICAL FIX: Use a simpler query to fetch ingredients
    const ingredientsResult = await db.query(
        'SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC',
        [id]
    );

    // Log the ingredients data
    console.log(`Found ${ingredientsResult.rowCount} ingredients for recipe ${id}`);

    // Process each ingredient to ensure package_amount is properly formatted
    const ingredients = ingredientsResult.rows.map(ing => {
        console.log(`Ingredient ${ing.id} (${ing.name}) package_amount:`, ing.package_amount, typeof ing.package_amount);

        // CRITICAL FIX: Ensure package_amount is properly formatted
        // No need to convert - PostgreSQL driver handles this correctly

        console.log(`Processed ingredient ${ing.id} (${ing.name}) package_amount:`, ing.package_amount, typeof ing.package_amount);
        return ing;
    });

    recipe.ingredients = ingredients;
    return recipe;
}

/**
 * Create a new recipe with ingredients
 * @param {string} name - The recipe name
 * @param {Array} ingredients - Array of ingredient objects
 * @param {string} groceryStore - Optional grocery store name
 * @returns {Promise<Object>} - Promise resolving to the created recipe with ingredients
 */
async function createRecipe(name, ingredients, groceryStore = null) {
    console.log('=== createRecipe called ===');
    console.log('Recipe name:', name);
    console.log('Ingredients count:', ingredients ? ingredients.length : 0);

    if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        console.error('Validation error: Recipe name and at least one ingredient are required');
        throw new Error('Recipe name and at least one ingredient are required');
    }

    // Calculate total calories from ingredients
    let calculatedTotalCalories = 0;
    for (const ing of ingredients) {
        console.log(`Processing ingredient: ${ing.name}, calories: ${ing.calories}`);
        // Ensure calories is a number (default to 0 if missing or invalid)
        ing.calories = typeof ing.calories === 'number' && ing.calories >= 0 ? ing.calories : 0;
        calculatedTotalCalories += ing.calories;
    }
    console.log(`Total calculated calories: ${calculatedTotalCalories}`);

    console.log('Getting database client for transaction...');
    const client = await db.getClient(); // Use client for transaction

    try {
        console.log('Beginning database transaction...');
        await client.query('BEGIN'); // Start transaction

        // Insert the recipe
        console.log(`Inserting recipe: ${name.trim()} with total calories: ${calculatedTotalCalories}, grocery store: ${groceryStore || 'none'}`);
        const recipeInsertResult = await client.query(
            'INSERT INTO recipes (name, total_calories, grocery_store) VALUES ($1, $2, $3) RETURNING id',
            [name.trim(), calculatedTotalCalories, groceryStore]
        );

        if (!recipeInsertResult.rows || recipeInsertResult.rows.length === 0) {
            console.error('Recipe insert failed: No ID returned');
            throw new Error('Failed to insert recipe: No ID returned');
        }

        const newRecipeId = recipeInsertResult.rows[0].id;
        console.log(`Recipe inserted successfully with ID: ${newRecipeId}`);

        // Insert ingredients
        const ingredientInsertPromises = ingredients.map(async ing => {
            // Validate required ingredient fields (only name, amount, and price are required)
            if (!ing.name || typeof ing.amount !== 'number' || typeof ing.price !== 'number' || ing.amount <= 0) {
                throw new Error('Invalid data for ingredient: ' + (ing.name || '[Missing Name]'));
            }

            // Ensure nutritional values are numbers (default to 0 if missing)
            ing.calories = typeof ing.calories === 'number' ? ing.calories : 0;
            ing.protein = typeof ing.protein === 'number' ? ing.protein : 0;
            ing.fats = typeof ing.fats === 'number' ? ing.fats : 0;
            ing.carbohydrates = typeof ing.carbohydrates === 'number' ? ing.carbohydrates : 0;

            // Log the ingredient data being inserted
            console.log('Inserting ingredient with package_amount:', ing.package_amount);
            console.log('Full ingredient data:', JSON.stringify(ing, null, 2));

            // Check for micronutrient data
            const micronutrientFields = Object.keys(ing).filter(key =>
                !['name', 'calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount', 'has_micronutrients'].includes(key)
            );

            console.log(`Ingredient ${ing.name} has ${micronutrientFields.length} micronutrient fields:`, micronutrientFields);

            // Build a dynamic query to insert all fields that are present in the ingredient data
            const columns = ['recipe_id', 'name', 'calories', 'amount', 'package_amount', 'protein', 'fats', 'carbohydrates', 'price'];
            const values = [newRecipeId, ing.name.trim(), ing.calories, ing.amount, ing.package_amount || null, ing.protein, ing.fats, ing.carbohydrates, ing.price];
            const placeholders = ['$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9'];
            let paramIndex = 10;

            // Helper function to add a field to the insert query if it exists in the ingredient data
            const addFieldIfExists = (fieldName, dbFieldName = fieldName) => {
                console.log(`Checking if field exists: ${fieldName} -> ${dbFieldName}`);
                if (ing[fieldName] !== undefined && ing[fieldName] !== null) {
                    columns.push(dbFieldName);
                    placeholders.push(`$${paramIndex}`);

                    // Convert string numbers to actual numbers
                    let value = ing[fieldName];
                    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                        value = parseFloat(value);
                        console.log(`Converted string to number: ${fieldName} = ${ing[fieldName]} -> ${value}`);
                    }

                    values.push(value);
                    paramIndex++;
                    console.log(`Added field to insert query: ${fieldName} -> ${dbFieldName} = ${value}`);
                    return true;
                }
                console.log(`Field not found: ${fieldName}`);
                return false;
            };

            // Add General section fields
            addFieldIfExists('alcohol');
            addFieldIfExists('caffeine');
            addFieldIfExists('water');

            // Add Carbohydrates section fields
            addFieldIfExists('fiber');
            addFieldIfExists('starch');
            addFieldIfExists('sugars');
            addFieldIfExists('addedSugars', 'added_sugars');
            addFieldIfExists('added_sugars');
            addFieldIfExists('netCarbs', 'net_carbs');
            addFieldIfExists('net_carbs');

            // Add Lipids section fields
            addFieldIfExists('saturated');
            addFieldIfExists('monounsaturated');
            addFieldIfExists('polyunsaturated');
            addFieldIfExists('omega3', 'omega3');
            addFieldIfExists('omega_3', 'omega3');
            addFieldIfExists('omega6', 'omega6');
            addFieldIfExists('omega_6', 'omega6');
            addFieldIfExists('transFat', 'trans');
            addFieldIfExists('trans_fat', 'trans');
            addFieldIfExists('cholesterol');

            // Add Protein section fields
            addFieldIfExists('histidine');
            addFieldIfExists('isoleucine');
            addFieldIfExists('leucine');
            addFieldIfExists('lysine');
            addFieldIfExists('methionine');
            addFieldIfExists('phenylalanine');
            addFieldIfExists('threonine');
            addFieldIfExists('tryptophan');
            addFieldIfExists('valine');
            addFieldIfExists('tyrosine');
            addFieldIfExists('cystine');

            // Add Vitamins section fields
            addFieldIfExists('thiamine');
            addFieldIfExists('riboflavin');
            addFieldIfExists('niacin');
            addFieldIfExists('vitaminB6', 'vitamin_b6');
            addFieldIfExists('vitamin_b6');
            addFieldIfExists('folate');
            addFieldIfExists('vitaminB12', 'vitamin_b12');
            addFieldIfExists('vitamin_b12');
            addFieldIfExists('vitaminB5', 'pantothenic_acid');
            addFieldIfExists('pantothenic_acid');
            addFieldIfExists('biotin');
            addFieldIfExists('vitaminA', 'vitamin_a');
            addFieldIfExists('vitamin_a');
            addFieldIfExists('vitaminC', 'vitamin_c');
            addFieldIfExists('vitamin_c');
            addFieldIfExists('vitaminD', 'vitamin_d');
            addFieldIfExists('vitamin_d');
            addFieldIfExists('vitaminE', 'vitamin_e');
            addFieldIfExists('vitamin_e');
            addFieldIfExists('vitaminK', 'vitamin_k');
            addFieldIfExists('vitamin_k');

            // Add Minerals section fields
            addFieldIfExists('calcium');
            addFieldIfExists('copper');
            addFieldIfExists('iron');
            addFieldIfExists('magnesium');
            addFieldIfExists('manganese');
            addFieldIfExists('phosphorus');
            addFieldIfExists('potassium');
            addFieldIfExists('selenium');
            addFieldIfExists('sodium');
            addFieldIfExists('zinc');

            // Build and execute the query
            const insertQuery = `
                INSERT INTO ingredients (${columns.join(', ')})
                VALUES (${placeholders.join(', ')})
                RETURNING id
            `;

            console.log('Executing dynamic insert query with columns:', columns);
            console.log('Values:', values);

            // Execute the query
            const result = await client.query(insertQuery, values);

            // Log the result
            console.log(`Inserted ingredient with ID: ${result.rows[0].id}`);

            // Verify the data was saved correctly
            const verifyResult = await client.query('SELECT * FROM ingredients WHERE id = $1', [result.rows[0].id]);
            console.log('Verified ingredient data:', JSON.stringify(verifyResult.rows[0], null, 2));

            // Check specific micronutrient fields
            const fields = [
                'fiber', 'sugars', 'saturated', 'monounsaturated', 'polyunsaturated',
                'omega3', 'omega6', 'cholesterol', 'vitamin_a', 'vitamin_c', 'vitamin_d',
                'vitamin_e', 'vitamin_k', 'calcium', 'iron', 'magnesium', 'phosphorus',
                'potassium', 'sodium', 'zinc', 'water'
            ];

            console.log('Checking micronutrient fields:');
            fields.forEach(field => {
                console.log(`${field}: ${verifyResult.rows[0][field]}`);
            });

            return result;
        });
        console.log('Waiting for all ingredient inserts to complete...');
        await Promise.all(ingredientInsertPromises);
        console.log('All ingredients inserted successfully');

        console.log('Committing transaction...');
        await client.query('COMMIT'); // Commit transaction
        console.log('Transaction committed successfully');

        // Fetch the newly created recipe with ingredients to return it
        console.log(`Fetching complete recipe with ID: ${newRecipeId}`);
        const finalResult = await db.query('SELECT * FROM recipes WHERE id = $1', [newRecipeId]);

        if (!finalResult.rows || finalResult.rows.length === 0) {
            console.error(`Failed to fetch newly created recipe with ID: ${newRecipeId}`);
            throw new Error('Failed to fetch newly created recipe');
        }

        console.log(`Fetching ingredients for recipe ID: ${newRecipeId}`);
        const finalIngredients = await db.query('SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC', [newRecipeId]);
        console.log(`Found ${finalIngredients.rowCount} ingredients for recipe ID: ${newRecipeId}`);

        const newRecipe = finalResult.rows[0];
        newRecipe.ingredients = finalIngredients.rows;

        console.log('Recipe creation completed successfully');
        return newRecipe;
    } catch (error) {
        console.error('Error in createRecipe:', error);
        console.error('Error stack:', error.stack);

        console.log('Rolling back transaction...');
        try {
            await client.query('ROLLBACK'); // Rollback transaction on error
            console.log('Transaction rolled back successfully');
        } catch (rollbackError) {
            console.error('Error rolling back transaction:', rollbackError);
        }

        throw error;
    } finally {
        console.log('Releasing database client...');
        try {
            client.release(); // Release client back to the pool
            console.log('Database client released successfully');
        } catch (releaseError) {
            console.error('Error releasing database client:', releaseError);
        }
    }
}

/**
 * Update a recipe's calories and scale ingredients
 * @param {number} id - The recipe ID
 * @param {string} name - The updated recipe name (optional)
 * @param {number} targetCalories - The target total calories
 * @returns {Promise<Object>} - Promise resolving to the updated recipe with ingredients
 */
async function updateRecipeCalories(id, name, targetCalories) {
    if (typeof targetCalories !== 'number' || targetCalories <= 0) {
        throw new Error('Invalid targetCalories value');
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // 1. Get current recipe and ingredients
        const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [id]);
        if (recipeResult.rowCount === 0) {
            throw new Error('Recipe not found');
        }
        const currentRecipe = recipeResult.rows[0];
        const currentTotalCalories = currentRecipe.total_calories;

        if (currentTotalCalories <= 0) {
            throw new Error('Cannot scale recipe with zero or negative current calories');
        }

        const ingredientsResult = await client.query('SELECT * FROM ingredients WHERE recipe_id = $1', [id]);
        const currentIngredients = ingredientsResult.rows;

        // 2. Calculate scaling factor
        const scalingFactor = targetCalories / currentTotalCalories;

        // 3. Update recipe total calories and name if provided
        if (name) {
            await client.query('UPDATE recipes SET name = $1, total_calories = $2 WHERE id = $3', [name.trim(), targetCalories, id]);
        } else {
            await client.query('UPDATE recipes SET total_calories = $1 WHERE id = $2', [targetCalories, id]);
        }

        // 4. Update each ingredient proportionally
        const updatePromises = currentIngredients.map(ing => {
            const newAmount = ing.amount * scalingFactor;
            const newCalories = ing.calories * scalingFactor;
            const newProtein = ing.protein * scalingFactor;
            const newFats = ing.fats * scalingFactor;
            const newCarbohydrates = ing.carbohydrates * scalingFactor;
            const newPrice = ing.price * scalingFactor;

            // Note: We don't scale package_amount as it's a fixed property of the ingredient package
            return client.query(
                'UPDATE ingredients SET amount = $1, calories = $2, protein = $3, fats = $4, carbohydrates = $5, price = $6 WHERE id = $7',
                [newAmount, newCalories, newProtein, newFats, newCarbohydrates, newPrice, ing.id]
            );
        });
        await Promise.all(updatePromises);

        await client.query('COMMIT');

        // Fetch updated recipe and ingredients to return
        const updatedRecipeResult = await db.query('SELECT * FROM recipes WHERE id = $1', [id]);
        const updatedIngredientsResult = await db.query('SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC', [id]);
        const updatedRecipe = updatedRecipeResult.rows[0];
        updatedRecipe.ingredients = updatedIngredientsResult.rows;

        return updatedRecipe;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Delete a recipe and its ingredients
 * @param {number} id - The recipe ID
 * @returns {Promise<Object>} - Promise resolving to the deleted recipe ID and name
 */
async function deleteRecipe(id) {
    // Note: ON DELETE CASCADE in the ingredients table should handle deleting ingredients automatically.
    const result = await db.query('DELETE FROM recipes WHERE id = $1 RETURNING id, name', [id]);

    if (result.rowCount === 0) {
        throw new Error('Recipe not found');
    }

    return {
        id: parseInt(id),
        name: result.rows[0].name
    };
}

/**
 * Update a single ingredient in a recipe
 * @param {number} recipeId - The recipe ID
 * @param {number} ingredientId - The ingredient ID
 * @param {Object} ingredientData - The updated ingredient data
 * @returns {Promise<Object>} - Promise resolving to the updated recipe with ingredients
 */
async function updateIngredient(recipeId, ingredientId, ingredientData) {
    console.log('=== DIRECT updateIngredient called ===');
    console.log('recipeId:', recipeId);
    console.log('ingredientId:', ingredientId);
    console.log('ingredientData:', JSON.stringify(ingredientData, null, 2));

    // Validate inputs
    if (!recipeId || !ingredientId) {
        throw new Error('Recipe ID and ingredient ID are required');
    }

    if (!ingredientData || typeof ingredientData !== 'object') {
        throw new Error('Ingredient data is required');
    }

    // Process package_amount (will be handled by the field mapping)

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Check if ingredient exists and belongs to the recipe
        const ingredientResult = await client.query(
            'SELECT * FROM ingredients WHERE id = $1 AND recipe_id = $2',
            [ingredientId, recipeId]
        );
        if (ingredientResult.rowCount === 0) {
            throw new Error('Ingredient not found or does not belong to this recipe');
        }

        const oldIngredient = ingredientResult.rows[0];

        // Build a dynamic query to update all fields that are present in ingredientData
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        // Map of JavaScript property names to database column names
        const fieldMappings = {
            // Basic fields
            name: 'name',
            calories: 'calories',
            amount: 'amount',
            protein: 'protein',
            fats: 'fats',
            carbohydrates: 'carbohydrates',
            price: 'price',
            package_amount: 'package_amount',

            // General
            alcohol: 'alcohol',
            caffeine: 'caffeine',
            water: 'water',

            // Carbohydrates breakdown
            fiber: 'fiber',
            starch: 'starch',
            sugars: 'sugars',
            addedSugars: 'added_sugars',
            added_sugars: 'added_sugars', // Alias
            netCarbs: 'net_carbs',
            net_carbs: 'net_carbs', // Alias

            // Lipids
            fat: 'fats', // Alias for fats
            saturated: 'saturated',
            monounsaturated: 'monounsaturated',
            polyunsaturated: 'polyunsaturated',
            omega3: 'omega3', // Map to actual database column
            omega_3: 'omega3', // Alias for omega3
            omega6: 'omega6', // Map to actual database column
            omega_6: 'omega6', // Alias for omega6
            transFat: 'trans',
            trans_fat: 'trans', // Map to trans column
            cholesterol: 'cholesterol',

            // Vitamins
            vitaminA: 'vitamin_a',
            vitamin_a: 'vitamin_a', // Alias
            vitaminB1: 'vitamin_b1',
            thiamine: 'vitamin_b1', // Alias - map to actual database column
            vitamin_b1: 'vitamin_b1', // Direct mapping
            vitaminB2: 'vitamin_b2',
            riboflavin: 'vitamin_b2', // Alias - map to actual database column
            vitamin_b2: 'vitamin_b2', // Direct mapping
            vitaminB3: 'vitamin_b3',
            niacin: 'vitamin_b3', // Alias - map to actual database column
            vitamin_b3: 'vitamin_b3', // Direct mapping
            vitaminB5: 'vitamin_b5',
            pantothenic_acid: 'vitamin_b5', // Alias - map to actual database column
            vitamin_b5: 'vitamin_b5', // Direct mapping
            vitaminB6: 'vitamin_b6',
            vitamin_b6: 'vitamin_b6', // Alias
            vitaminB12: 'vitamin_b12',
            vitamin_b12: 'vitamin_b12', // Alias
            vitaminC: 'vitamin_c',
            vitamin_c: 'vitamin_c', // Alias
            vitaminD: 'vitamin_d',
            vitamin_d: 'vitamin_d', // Alias
            vitaminE: 'vitamin_e',
            vitamin_e: 'vitamin_e', // Alias
            vitaminK: 'vitamin_k',
            vitamin_k: 'vitamin_k', // Alias
            folate: 'folate',
            biotin: 'biotin',

            // Minerals
            calcium: 'calcium',
            copper: 'copper',
            iron: 'iron',
            magnesium: 'magnesium',
            manganese: 'manganese',
            phosphorus: 'phosphorus',
            potassium: 'potassium',
            selenium: 'selenium',
            sodium: 'sodium',
            zinc: 'zinc',

            // Amino acids (all exist in database schema)
            histidine: 'histidine',
            isoleucine: 'isoleucine',
            leucine: 'leucine',
            lysine: 'lysine',
            methionine: 'methionine',
            phenylalanine: 'phenylalanine',
            threonine: 'threonine',
            tryptophan: 'tryptophan',
            tyrosine: 'tyrosine',
            valine: 'valine',
            cystine: 'cystine'
        };

        // Process all fields from ingredientData
        const processedFields = new Set(); // To track which database fields we've already processed

        console.log('=== DEBUGGING FIELD PROCESSING ===');
        console.log('ingredientData keys:', Object.keys(ingredientData));
        console.log('ingredientData:', JSON.stringify(ingredientData, null, 2));

        for (const [key, value] of Object.entries(ingredientData)) {
            console.log(`Processing field: ${key} = ${value} (${typeof value})`);

            // Skip undefined values
            if (value === undefined) {
                console.log(`  Skipping ${key}: undefined value`);
                continue;
            }

            // Get the corresponding database column name
            const columnName = fieldMappings[key];
            console.log(`  Field mapping: ${key} -> ${columnName}`);

            // Skip if no mapping exists
            if (!columnName) {
                console.log(`  Skipping ${key}: no mapping exists`);
                continue;
            }

            // Skip duplicate fields (e.g., if both omega3 and omega_3 are present)
            if (processedFields.has(columnName)) {
                console.log(`  Skipping ${key}: duplicate field (${columnName} already processed)`);
                continue;
            }

            // Mark this field as processed
            processedFields.add(columnName);

            // Add to update fields
            updateFields.push(`${columnName} = $${paramIndex}`);

            // Convert string numbers to actual numbers
            let finalValue = value;
            if (typeof finalValue === 'string' && !isNaN(parseFloat(finalValue))) {
                finalValue = parseFloat(finalValue);
                console.log(`  Converted string to number: ${value} -> ${finalValue}`);
            }

            updateValues.push(finalValue);
            console.log(`  Added to update: ${columnName} = ${finalValue} (param $${paramIndex})`);
            paramIndex++;
        }

        console.log('=== FINAL UPDATE QUERY INFO ===');
        console.log('updateFields:', updateFields);
        console.log('updateValues:', updateValues);

        // Add the WHERE clause
        updateValues.push(ingredientId);

        // Build and execute the query if there are fields to update
        if (updateFields.length > 0) {
            const updateQuery = `
                UPDATE ingredients SET
                    ${updateFields.join(',\n                    ')}
                WHERE id = $${paramIndex}
            `;

            console.log('Executing dynamic update query with fields:', updateFields);
            await client.query(updateQuery, updateValues);
        } else {
            console.log('No fields to update');
        }

        // All fields are now handled by the dynamic field mapping above
        // No need for separate updates for package_amount, trans_fat, omega3, or omega6

        // Verify the update
        const verifyResult = await client.query(
            'SELECT * FROM ingredients WHERE id = $1',
            [ingredientId]
        );

        console.log('Verified updated ingredient:', verifyResult.rows[0]);
        console.log('Verified package_amount:', verifyResult.rows[0].package_amount);
        // Use correct database column names
        console.log('Verified omega3:', verifyResult.rows[0].omega3);
        console.log('Verified omega6:', verifyResult.rows[0].omega6);
        console.log('Verified trans:', verifyResult.rows[0].trans);

        // Calculate the difference in calories
        const caloriesDifference = ingredientData.calories - oldIngredient.calories;

        // Update recipe total calories if ingredient calories changed
        if (caloriesDifference !== 0) {
            await client.query(
                'UPDATE recipes SET total_calories = total_calories + $1 WHERE id = $2',
                [caloriesDifference, recipeId]
            );
        }

        await client.query('COMMIT');

        // Fetch updated recipe and ingredients to return
        const updatedRecipe = await getRecipeById(recipeId);
        return updatedRecipe;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Get a single ingredient by ID
 * @param {number} recipeId - The recipe ID
 * @param {number} ingredientId - The ingredient ID
 * @returns {Promise<Object>} - Promise resolving to the ingredient
 */
async function getIngredientById(recipeId, ingredientId) {
    // Validate inputs
    if (!recipeId || !ingredientId) {
        throw new Error('Recipe ID and ingredient ID are required');
    }

    try {
        // Check if ingredient exists and belongs to the recipe
        const ingredientResult = await db.query(
            'SELECT * FROM ingredients WHERE id = $1 AND recipe_id = $2',
            [ingredientId, recipeId]
        );

        if (ingredientResult.rowCount === 0) {
            throw new Error('Ingredient not found or does not belong to this recipe');
        }

        const ingredient = ingredientResult.rows[0];
        console.log('Ingredient data from database:', ingredient);
        return ingredient;
    } catch (error) {
        throw error;
    }
}

/**
 * Update only the package_amount of an ingredient
 * @param {number} recipeId - The recipe ID
 * @param {number} ingredientId - The ingredient ID
 * @param {number|null} packageAmount - The package amount value
 * @returns {Promise<Object>} - Promise resolving to the updated ingredient
 */
async function updateIngredientPackageAmount(recipeId, ingredientId, packageAmount) {
    console.log('=== updateIngredientPackageAmount called ===');
    console.log('recipeId:', recipeId);
    console.log('ingredientId:', ingredientId);
    console.log('packageAmount:', packageAmount, typeof packageAmount);

    // Validate inputs
    if (!recipeId || !ingredientId) {
        throw new Error('Recipe ID and ingredient ID are required');
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Check if ingredient exists and belongs to the recipe
        const ingredientResult = await client.query(
            'SELECT * FROM ingredients WHERE id = $1 AND recipe_id = $2',
            [ingredientId, recipeId]
        );

        if (ingredientResult.rowCount === 0) {
            throw new Error('Ingredient not found or does not belong to this recipe');
        }

        // Log the current package_amount
        console.log('Current package_amount:', ingredientResult.rows[0].package_amount, typeof ingredientResult.rows[0].package_amount);

        // Ensure package_amount is properly formatted
        let finalPackageAmount = null;
        if (packageAmount !== null && packageAmount !== undefined && packageAmount !== '') {
            // Force to number
            finalPackageAmount = Number(packageAmount);

            // If conversion failed, set to null
            if (isNaN(finalPackageAmount)) {
                finalPackageAmount = null;
            }
        }

        console.log('Final package_amount to save:', finalPackageAmount, typeof finalPackageAmount);

        // Use the updateIngredient function to update the package_amount
        // This will use our field mapping approach
        const updateResult = await client.query(
            'UPDATE ingredients SET package_amount = $1 WHERE id = $2 RETURNING *',
            [finalPackageAmount, ingredientId]
        );

        if (updateResult.rowCount === 0) {
            throw new Error('Failed to update package_amount');
        }

        console.log('Update result:', updateResult.rows[0]);
        console.log('Updated package_amount:', updateResult.rows[0].package_amount, typeof updateResult.rows[0].package_amount);

        // Verify the update with a separate query
        const verifyResult = await client.query(
            'SELECT id, name, package_amount FROM ingredients WHERE id = $1',
            [ingredientId]
        );

        console.log('Verified result:', verifyResult.rows[0]);
        console.log('Verified package_amount:', verifyResult.rows[0].package_amount, typeof verifyResult.rows[0].package_amount);

        await client.query('COMMIT');

        // Get the full recipe to return
        const recipe = await getRecipeById(recipeId);
        return recipe;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Update only the omega3 and omega6 values of an ingredient
 * @param {number} recipeId - The recipe ID
 * @param {number} ingredientId - The ingredient ID
 * @param {Object} omegaData - Object containing omega3/omega_3 and/or omega6/omega_6 values
 * @returns {Promise<Object>} - Promise resolving to the updated recipe
 */
async function updateIngredientOmegaValues(recipeId, ingredientId, omegaData) {
    console.log('=== updateIngredientOmegaValues called ===');
    console.log('recipeId:', recipeId);
    console.log('ingredientId:', ingredientId);
    console.log('omegaData:', omegaData);

    // Validate inputs
    if (!recipeId || !ingredientId) {
        throw new Error('Recipe ID and ingredient ID are required');
    }

    // CRITICAL FIX: Check for both naming conventions
    if (!omegaData || (
        omegaData.omega3 === undefined &&
        omegaData.omega_3 === undefined &&
        omegaData.omega6 === undefined &&
        omegaData.omega_6 === undefined
    )) {
        throw new Error('At least one omega value is required');
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Check if ingredient exists and belongs to the recipe
        const ingredientResult = await client.query(
            'SELECT * FROM ingredients WHERE id = $1 AND recipe_id = $2',
            [ingredientId, recipeId]
        );

        if (ingredientResult.rowCount === 0) {
            throw new Error('Ingredient not found or does not belong to this recipe');
        }

        // Log the current omega values using correct database column names
        console.log('Current omega3:', ingredientResult.rows[0].omega3);
        console.log('Current omega6:', ingredientResult.rows[0].omega6);

        // Use the updateIngredient function to update omega values
        // This will use our field mapping approach
        await client.query('COMMIT');
        return await updateIngredient(recipeId, ingredientId, omegaData);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Add a new ingredient to an existing recipe
 * @param {number} recipeId - The recipe ID
 * @param {Object} ingredientData - The ingredient data
 * @returns {Promise<Object>} - Promise resolving to the updated recipe with ingredients
 */
async function addIngredientToRecipe(recipeId, ingredientData) {
    console.log('=== addIngredientToRecipe called ===');
    console.log('recipeId:', recipeId);
    console.log('ingredientData:', JSON.stringify(ingredientData, null, 2));

    // Validate inputs
    if (!recipeId) {
        console.error('Recipe ID is required');
        throw new Error('Recipe ID is required');
    }

    if (!ingredientData || typeof ingredientData !== 'object') {
        console.error('Ingredient data is required or invalid format');
        throw new Error('Ingredient data is required');
    }

    // Log all the fields for debugging
    console.log('Ingredient fields present:');
    Object.keys(ingredientData).forEach(key => {
        console.log(`- ${key}: ${ingredientData[key]} (${typeof ingredientData[key]})`);
    });

    // Convert numeric string values to numbers
    ['calories', 'amount', 'protein', 'fats', 'carbohydrates', 'price', 'package_amount'].forEach(field => {
        if (typeof ingredientData[field] === 'string' && !isNaN(parseFloat(ingredientData[field]))) {
            ingredientData[field] = parseFloat(ingredientData[field]);
            console.log(`Converted ${field} from string to number: ${ingredientData[field]}`);
        }
    });

    // Validate required ingredient fields
    if (!ingredientData.name || typeof ingredientData.calories !== 'number' ||
        typeof ingredientData.amount !== 'number' || typeof ingredientData.protein !== 'number' ||
        typeof ingredientData.fats !== 'number' || typeof ingredientData.carbohydrates !== 'number' ||
        typeof ingredientData.price !== 'number' || ingredientData.amount <= 0) {
        console.error('Invalid data for ingredient:', ingredientData.name || '[Missing Name]');
        console.error('Validation details:');
        console.error(`- name: ${ingredientData.name} (${typeof ingredientData.name})`);
        console.error(`- calories: ${ingredientData.calories} (${typeof ingredientData.calories})`);
        console.error(`- amount: ${ingredientData.amount} (${typeof ingredientData.amount})`);
        console.error(`- protein: ${ingredientData.protein} (${typeof ingredientData.protein})`);
        console.error(`- fats: ${ingredientData.fats} (${typeof ingredientData.fats})`);
        console.error(`- carbohydrates: ${ingredientData.carbohydrates} (${typeof ingredientData.carbohydrates})`);
        console.error(`- price: ${ingredientData.price} (${typeof ingredientData.price})`);
        throw new Error('Invalid data for ingredient: ' + (ingredientData.name || '[Missing Name]'));
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Check if recipe exists
        const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
        if (recipeResult.rowCount === 0) {
            console.error(`Recipe with ID ${recipeId} not found`);
            throw new Error('Recipe not found');
        }

        const recipe = recipeResult.rows[0];
        console.log(`Found recipe: ${recipe.name} (ID: ${recipe.id})`);
        const currentTotalCalories = recipe.total_calories;

        // Build a dynamic query to insert all fields that are present in the ingredient data
        const columns = ['recipe_id', 'name', 'calories', 'amount', 'package_amount', 'protein', 'fats', 'carbohydrates', 'price'];
        const values = [recipeId, ingredientData.name.trim(), ingredientData.calories, ingredientData.amount,
                        ingredientData.package_amount || null, ingredientData.protein, ingredientData.fats,
                        ingredientData.carbohydrates, ingredientData.price];
        const placeholders = ['$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9'];
        let paramIndex = 10;

        // Helper function to add a field to the insert query if it exists in the ingredient data
        const addFieldIfExists = (fieldName, dbFieldName = fieldName) => {
            console.log(`Checking if field exists: ${fieldName} -> ${dbFieldName}`);
            if (ingredientData[fieldName] !== undefined && ingredientData[fieldName] !== null) {
                columns.push(dbFieldName);
                placeholders.push(`$${paramIndex}`);

                // Convert string numbers to actual numbers
                let value = ingredientData[fieldName];
                if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                    value = parseFloat(value);
                    console.log(`Converted string to number: ${fieldName} = ${ingredientData[fieldName]} -> ${value}`);
                }

                values.push(value);
                paramIndex++;
                console.log(`Added field to insert query: ${fieldName} -> ${dbFieldName} = ${value}`);
                return true;
            }
            console.log(`Field not found: ${fieldName}`);
            return false;
        };

        // Add General section fields
        addFieldIfExists('alcohol');
        addFieldIfExists('caffeine');
        addFieldIfExists('water');

        // Add Carbohydrates section fields
        addFieldIfExists('fiber');
        addFieldIfExists('starch');
        addFieldIfExists('sugars');
        addFieldIfExists('addedSugars', 'added_sugars');
        addFieldIfExists('added_sugars');
        addFieldIfExists('netCarbs', 'net_carbs');
        addFieldIfExists('net_carbs');

        // Add Lipids section fields
        addFieldIfExists('saturated');
        addFieldIfExists('monounsaturated');
        addFieldIfExists('polyunsaturated');
        addFieldIfExists('omega3', 'omega3'); // Map to actual database column
        addFieldIfExists('omega_3', 'omega3'); // Alias for omega3
        addFieldIfExists('omega6', 'omega6'); // Map to actual database column
        addFieldIfExists('omega_6', 'omega6'); // Alias for omega6
        addFieldIfExists('transFat', 'trans');
        addFieldIfExists('trans_fat', 'trans');
        addFieldIfExists('cholesterol');

        // Add Protein section fields (all exist in database schema)
        addFieldIfExists('histidine');
        addFieldIfExists('isoleucine');
        addFieldIfExists('leucine');
        addFieldIfExists('lysine');
        addFieldIfExists('methionine');
        addFieldIfExists('phenylalanine');
        addFieldIfExists('threonine');
        addFieldIfExists('tryptophan');
        addFieldIfExists('valine');
        addFieldIfExists('tyrosine');
        addFieldIfExists('cystine');

        // Add Vitamins section fields
        addFieldIfExists('thiamine', 'vitamin_b1'); // Map to actual database column
        addFieldIfExists('vitamin_b1', 'vitamin_b1'); // Direct mapping
        addFieldIfExists('riboflavin', 'vitamin_b2'); // Map to actual database column
        addFieldIfExists('vitamin_b2', 'vitamin_b2'); // Direct mapping
        addFieldIfExists('niacin', 'vitamin_b3'); // Map to actual database column
        addFieldIfExists('vitamin_b3', 'vitamin_b3'); // Direct mapping
        addFieldIfExists('vitaminB6', 'vitamin_b6');
        addFieldIfExists('vitamin_b6');
        addFieldIfExists('folate');
        addFieldIfExists('vitaminB12', 'vitamin_b12');
        addFieldIfExists('vitamin_b12');
        addFieldIfExists('vitaminB5', 'vitamin_b5'); // Map to actual database column
        addFieldIfExists('vitamin_b5', 'vitamin_b5'); // Direct mapping
        addFieldIfExists('pantothenic_acid', 'vitamin_b5'); // Map to actual database column
        addFieldIfExists('biotin');
        addFieldIfExists('vitaminA', 'vitamin_a');
        addFieldIfExists('vitamin_a');
        addFieldIfExists('vitaminC', 'vitamin_c');
        addFieldIfExists('vitamin_c');
        addFieldIfExists('vitaminD', 'vitamin_d');
        addFieldIfExists('vitamin_d');
        addFieldIfExists('vitaminE', 'vitamin_e');
        addFieldIfExists('vitamin_e');
        addFieldIfExists('vitaminK', 'vitamin_k');
        addFieldIfExists('vitamin_k');

        // Add Minerals section fields
        addFieldIfExists('calcium');
        addFieldIfExists('copper');
        addFieldIfExists('iron');
        addFieldIfExists('magnesium');
        addFieldIfExists('manganese');
        addFieldIfExists('phosphorus');
        addFieldIfExists('potassium');
        addFieldIfExists('selenium');
        addFieldIfExists('sodium');
        addFieldIfExists('zinc');

        // Build and execute the query
        const insertQuery = `
            INSERT INTO ingredients (${columns.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING id
        `;

        console.log('Executing dynamic insert query with columns:', columns);
        console.log('Values:', values);

        // Execute the query
        const result = await client.query(insertQuery, values);
        const newIngredientId = result.rows[0].id;
        console.log(`Inserted ingredient with ID: ${newIngredientId}`);

        // Verify the ingredient was inserted correctly
        const verifyResult = await client.query('SELECT * FROM ingredients WHERE id = $1', [newIngredientId]);
        if (verifyResult.rowCount === 0) {
            console.error(`Failed to verify ingredient with ID ${newIngredientId}`);
            throw new Error('Failed to verify ingredient insertion');
        }

        console.log('Verified ingredient data:', JSON.stringify(verifyResult.rows[0], null, 2));

        // Update the recipe's total calories
        const newTotalCalories = currentTotalCalories + ingredientData.calories;
        await client.query('UPDATE recipes SET total_calories = $1 WHERE id = $2', [newTotalCalories, recipeId]);

        // Verify the recipe was updated correctly
        const verifyRecipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
        if (verifyRecipeResult.rowCount === 0) {
            console.error(`Failed to verify recipe update with ID ${recipeId}`);
            throw new Error('Failed to verify recipe update');
        }

        console.log('Verified recipe data:', JSON.stringify(verifyRecipeResult.rows[0], null, 2));

        // Commit the transaction
        await client.query('COMMIT');
        console.log('Transaction committed successfully');

        // Fetch the updated recipe with ingredients using the same client to avoid connection issues
        console.log(`Fetching complete recipe with ID: ${recipeId}`);
        const finalRecipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
        if (finalRecipeResult.rowCount === 0) {
            throw new Error('Recipe not found after update');
        }

        const ingredientsResult = await client.query(
            'SELECT * FROM ingredients WHERE recipe_id = $1 ORDER BY id ASC',
            [recipeId]
        );

        const updatedRecipe = finalRecipeResult.rows[0];
        updatedRecipe.ingredients = ingredientsResult.rows;

        // Verify the ingredients were fetched correctly
        console.log(`Recipe has ${updatedRecipe.ingredients ? updatedRecipe.ingredients.length : 0} ingredients`);
        if (updatedRecipe.ingredients && updatedRecipe.ingredients.length > 0) {
            console.log('Last ingredient:', JSON.stringify(updatedRecipe.ingredients[updatedRecipe.ingredients.length - 1], null, 2));
        }

        return updatedRecipe;
    } catch (error) {
        console.error('Error in addIngredientToRecipe:', error);
        console.error('Error stack:', error.stack);

        // Rollback the transaction
        console.log('Rolling back transaction...');
        try {
            await client.query('ROLLBACK');
            console.log('Transaction rolled back successfully');
        } catch (rollbackError) {
            console.error('Error rolling back transaction:', rollbackError);
        }

        throw error;
    } finally {
        // Release the client
        console.log('Releasing database client...');
        try {
            client.release();
            console.log('Database client released successfully');
        } catch (releaseError) {
            console.error('Error releasing database client:', releaseError);
        }
    }
}

/**
 * Delete an ingredient from a recipe
 * @param {number} recipeId - The recipe ID
 * @param {number} ingredientId - The ingredient ID
 * @returns {Promise<Object>} - Promise resolving to the updated recipe with ingredients
 */
async function deleteIngredientFromRecipe(recipeId, ingredientId) {
    console.log('=== deleteIngredientFromRecipe called ===');
    console.log('recipeId:', recipeId);
    console.log('ingredientId:', ingredientId);

    // Validate inputs
    if (!recipeId || !ingredientId) {
        throw new Error('Recipe ID and ingredient ID are required');
    }

    // Use pool.connect() directly to avoid db.getClient() issues
    const { pool } = require('../utils/db');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if recipe exists
        const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
        if (recipeResult.rowCount === 0) {
            throw new Error('Recipe not found');
        }

        // Debug: Check what ingredients exist for this recipe
        const allIngredientsResult = await client.query(
            'SELECT id, name FROM ingredients WHERE recipe_id = $1',
            [recipeId]
        );
        console.log(`Recipe ${recipeId} has ingredients:`, allIngredientsResult.rows.map(r => `${r.id}: ${r.name}`));

        // Check if ingredient exists and belongs to the recipe
        const ingredientResult = await client.query(
            'SELECT * FROM ingredients WHERE id = $1 AND recipe_id = $2',
            [ingredientId, recipeId]
        );
        if (ingredientResult.rowCount === 0) {
            console.log(`Ingredient ${ingredientId} not found in recipe ${recipeId} - treating as already deleted`);
            // Don't throw error - just return success since ingredient is already gone
            await client.query('COMMIT');
            return getRecipeById(recipeId);
        }

        const deletedIngredient = ingredientResult.rows[0];
        console.log('Deleting ingredient:', deletedIngredient.name);

        // Delete the ingredient
        await client.query('DELETE FROM ingredients WHERE id = $1', [ingredientId]);

        // Recalculate recipe calories
        const remainingIngredientsResult = await client.query(
            'SELECT * FROM ingredients WHERE recipe_id = $1',
            [recipeId]
        );

        const totalCalories = remainingIngredientsResult.rows.reduce((sum, ingredient) => {
            return sum + (parseFloat(ingredient.calories) || 0);
        }, 0);

        // Update recipe total calories
        await client.query(
            'UPDATE recipes SET total_calories = $1 WHERE id = $2',
            [totalCalories, recipeId]
        );

        await client.query('COMMIT');
        console.log(`Ingredient ${ingredientId} deleted from recipe ${recipeId} successfully`);

        // Return the updated recipe (this will use its own database connection)
        return getRecipeById(recipeId);

    } catch (error) {
        console.error('Error in deleteIngredientFromRecipe:', error);
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Error during rollback:', rollbackError);
        }
        throw error;
    } finally {
        // Always release the client in the finally block
        try {
            client.release();
        } catch (releaseError) {
            console.error('Error releasing client:', releaseError);
        }
    }
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipeCalories,
    deleteRecipe,
    updateIngredient,
    getIngredientById,
    updateIngredientPackageAmount,
    updateIngredientOmegaValues,
    addIngredientToRecipe,
    deleteIngredientFromRecipe
};
