/**
 * Run Revert Vitamin B Columns
 * 
 * This script reverts the vitamin B column consolidation by:
 * 1. Moving data from standard columns back to vitamin_b* columns
 * 2. Dropping the standard columns
 */

const fs = require('fs');
const path = require('path');
const db = require('./utils/db');

async function runRevertMigration() {
  try {
    console.log('Running revert vitamin B columns migration...');
    
    // First, check the current state
    await checkCurrentState();
    
    // Run the migration
    console.log('\nReverting vitamin B column consolidation...');
    const migrationPath = path.join(__dirname, 'migrations', '023_revert_vitamin_b_columns.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await db.query(migrationSql);
    console.log('Vitamin B column consolidation reverted successfully.');
    
    // Check the final state
    console.log('\nFinal state after reversion:');
    await checkCurrentState();
    
    console.log('\nVitamin B column reversion completed successfully.');
  } catch (error) {
    console.error('Error reverting vitamin B columns:', error);
  } finally {
    process.exit();
  }
}

async function checkCurrentState() {
  // Check which columns exist
  const schemaQuery = `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'ingredients' AND column_name IN (
      'thiamine', 'riboflavin', 'niacin', 'pantothenic_acid', 'vitamin_b6',
      'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b5'
    )
  `;
  
  const schemaResult = await db.query(schemaQuery);
  const existingColumns = schemaResult.rows.map(row => row.column_name);
  
  console.log('Vitamin B columns found in ingredients table:');
  console.log(existingColumns);
  
  // Build a dynamic query to check data in all existing columns
  let dataQuery = `
    SELECT 
      COUNT(*) as total_ingredients
  `;
  
  // Add standard columns if they exist
  if (existingColumns.includes('thiamine')) {
    dataQuery += `,
      COUNT(CASE WHEN thiamine > 0 THEN 1 END) as thiamine_count`;
  }
  
  if (existingColumns.includes('riboflavin')) {
    dataQuery += `,
      COUNT(CASE WHEN riboflavin > 0 THEN 1 END) as riboflavin_count`;
  }
  
  if (existingColumns.includes('niacin')) {
    dataQuery += `,
      COUNT(CASE WHEN niacin > 0 THEN 1 END) as niacin_count`;
  }
  
  if (existingColumns.includes('pantothenic_acid')) {
    dataQuery += `,
      COUNT(CASE WHEN pantothenic_acid > 0 THEN 1 END) as pantothenic_acid_count`;
  }
  
  if (existingColumns.includes('vitamin_b6')) {
    dataQuery += `,
      COUNT(CASE WHEN vitamin_b6 > 0 THEN 1 END) as vitamin_b6_count`;
  }
  
  // Add vitamin_b* columns if they exist
  if (existingColumns.includes('vitamin_b1')) {
    dataQuery += `,
      COUNT(CASE WHEN vitamin_b1 > 0 THEN 1 END) as vitamin_b1_count`;
  }
  
  if (existingColumns.includes('vitamin_b2')) {
    dataQuery += `,
      COUNT(CASE WHEN vitamin_b2 > 0 THEN 1 END) as vitamin_b2_count`;
  }
  
  if (existingColumns.includes('vitamin_b3')) {
    dataQuery += `,
      COUNT(CASE WHEN vitamin_b3 > 0 THEN 1 END) as vitamin_b3_count`;
  }
  
  if (existingColumns.includes('vitamin_b5')) {
    dataQuery += `,
      COUNT(CASE WHEN vitamin_b5 > 0 THEN 1 END) as vitamin_b5_count`;
  }
  
  dataQuery += `
    FROM ingredients
  `;
  
  const dataResult = await db.query(dataQuery);
  console.log('Data counts in vitamin B columns:');
  console.log(dataResult.rows[0]);
}

runRevertMigration();
