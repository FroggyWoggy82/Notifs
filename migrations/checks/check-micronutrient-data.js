/**
 * Check Micronutrient Data Script
 * 
 * This script checks if micronutrient data is being properly saved to the database.
 * It retrieves a sample ingredient and logs all its micronutrient values.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// List of all micronutrient columns to check
const micronutrientColumns = [
  // Carbohydrates
  'fiber', 'starch', 'sugars', 'added_sugars', 'net_carbs',
  
  // Lipids
  'saturated', 'monounsaturated', 'polyunsaturated', 
  'omega3', 'omega6', 'trans', 'cholesterol',
  
  // Protein/Amino Acids
  'histidine', 'isoleucine', 'leucine', 'lysine', 'methionine',
  'phenylalanine', 'threonine', 'tryptophan', 'tyrosine', 'valine', 'cystine',
  
  // Vitamins
  'vitamin_a', 'thiamine', 'riboflavin', 'niacin', 'pantothenic_acid',
  'vitamin_b6', 'vitamin_b12', 'folate', 'vitamin_c', 'vitamin_d',
  'vitamin_e', 'vitamin_k',
  
  // Minerals
  'calcium', 'copper', 'iron', 'magnesium', 'manganese',
  'phosphorus', 'potassium', 'selenium', 'sodium', 'zinc',
  
  // General
  'alcohol', 'caffeine', 'water'
];

async function checkMicronutrientData() {
  try {
    // First, check if all columns exist in the ingredients table
    console.log('Checking database schema for micronutrient columns...');
    
    const schemaQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ingredients'
    `;
    
    const schemaResult = await pool.query(schemaQuery);
    const existingColumns = schemaResult.rows.map(row => row.column_name);
    
    console.log('Existing columns in ingredients table:');
    console.log(existingColumns);
    
    // Check which micronutrient columns are missing
    const missingColumns = micronutrientColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('Missing micronutrient columns:');
      console.log(missingColumns);
      console.log('You need to add these columns to the ingredients table.');
    } else {
      console.log('All micronutrient columns exist in the database schema.');
    }
    
    // Now check a sample ingredient to see if it has micronutrient data
    console.log('\nChecking sample ingredient data...');
    
    // Get the most recently updated ingredient
    const ingredientQuery = `
      SELECT * FROM ingredients 
      ORDER BY updated_at DESC 
      LIMIT 1
    `;
    
    const ingredientResult = await pool.query(ingredientQuery);
    
    if (ingredientResult.rows.length === 0) {
      console.log('No ingredients found in the database.');
      return;
    }
    
    const ingredient = ingredientResult.rows[0];
    
    console.log(`Sample ingredient: ${ingredient.name} (ID: ${ingredient.id})`);
    console.log('Basic nutrition data:');
    console.log(`- Calories: ${ingredient.calories}`);
    console.log(`- Protein: ${ingredient.protein}g`);
    console.log(`- Fat: ${ingredient.fats}g`);
    console.log(`- Carbs: ${ingredient.carbohydrates}g`);
    
    console.log('\nMicronutrient data:');
    let hasAnyMicronutrientData = false;
    
    micronutrientColumns.forEach(column => {
      const value = ingredient[column];
      if (value !== null && value !== undefined && value !== 0) {
        console.log(`- ${column}: ${value}`);
        hasAnyMicronutrientData = true;
      }
    });
    
    if (!hasAnyMicronutrientData) {
      console.log('No micronutrient data found for this ingredient.');
      console.log('This suggests that micronutrient data is not being saved properly.');
    }
    
    // Check the handleEditIngredientSubmit function in food.js
    console.log('\nNext steps:');
    console.log('1. Check if the handleEditIngredientSubmit function in food.js is collecting all micronutrient data');
    console.log('2. Check if the updateIngredient function in recipeModel.js is saving all micronutrient data');
    console.log('3. Make sure the form fields for micronutrients are properly named and mapped to database columns');
    
  } catch (error) {
    console.error('Error checking micronutrient data:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkMicronutrientData();
