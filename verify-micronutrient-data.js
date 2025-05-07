/**
 * Verify Micronutrient Data
 * 
 * This script verifies that micronutrient data is being saved to the database.
 * It retrieves the most recently added ingredient and logs all its micronutrient values.
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

async function verifyMicronutrientData() {
  try {
    console.log('=== Verifying Micronutrient Data ===');
    
    // Get the most recently added ingredient
    const ingredientQuery = `
      SELECT *
      FROM ingredients
      ORDER BY id DESC
      LIMIT 1
    `;
    
    const ingredientResult = await pool.query(ingredientQuery);
    
    if (ingredientResult.rows.length === 0) {
      console.log('No ingredients found in the database.');
      return;
    }
    
    const ingredient = ingredientResult.rows[0];
    
    console.log(`Most recently added ingredient: ${ingredient.name} (ID: ${ingredient.id})`);
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
      console.log('\nPossible issues:');
      console.log('1. The Cronometer parser is not extracting micronutrient data correctly.');
      console.log('2. The micronutrient data is not being included in the ingredient data sent to the backend.');
      console.log('3. The backend is not saving the micronutrient data to the database.');
      
      console.log('\nTry the following:');
      console.log('1. Use the Debug Nutrition Data button in the Cronometer parser to check if micronutrient data is being extracted correctly.');
      console.log('2. Check the browser console for any errors when submitting the form.');
      console.log('3. Check the server logs for any errors when saving the ingredient data.');
    } else {
      console.log('\nMicronutrient data is being saved correctly!');
    }
    
    // Get all ingredients with micronutrient data
    console.log('\n=== Ingredients with Micronutrient Data ===');
    
    // Create a query to find ingredients with any micronutrient data
    let query = 'SELECT id, name FROM ingredients WHERE ';
    const conditions = [];
    
    micronutrientColumns.forEach(column => {
      conditions.push(`${column} IS NOT NULL AND ${column} != 0`);
    });
    
    query += conditions.join(' OR ');
    query += ' ORDER BY id DESC';
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('No ingredients with micronutrient data found in the database.');
    } else {
      console.log(`Found ${result.rows.length} ingredients with micronutrient data:`);
      result.rows.forEach(row => {
        console.log(`- ${row.name} (ID: ${row.id})`);
      });
    }
  } catch (error) {
    console.error('Error verifying micronutrient data:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the verification
verifyMicronutrientData();
