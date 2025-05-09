/**
 * Run Micronutrient Migration
 * 
 * This script runs the migration to ensure all micronutrient columns exist in the database.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('Running micronutrient migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '020_ensure_micronutrient_columns.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Run the migration
    await pool.query(migrationSql);
    
    console.log('Migration completed successfully.');
    
    // Verify the columns
    const schemaQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ingredients'
    `;
    
    const schemaResult = await pool.query(schemaQuery);
    const existingColumns = schemaResult.rows.map(row => row.column_name);
    
    console.log('Columns in ingredients table:');
    console.log(existingColumns);
    
    // List of micronutrient columns to check
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
    
    // Check which micronutrient columns are missing
    const missingColumns = micronutrientColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('Missing micronutrient columns:');
      console.log(missingColumns);
      console.log('Migration failed to add all columns.');
    } else {
      console.log('All micronutrient columns exist in the database schema.');
    }
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration();
