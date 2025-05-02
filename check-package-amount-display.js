// check-package-amount-display.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkPackageAmountDisplay() {
    const client = await pool.connect();
    
    try {
        console.log('=== Checking Package Amount Display ===');
        
        // Get all ingredients with package_amount
        const ingredientsResult = await client.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE package_amount IS NOT NULL
            ORDER BY id;
        `);
        
        console.log(`Found ${ingredientsResult.rows.length} ingredients with package_amount:`);
        ingredientsResult.rows.forEach(ing => {
            console.log(`ID: ${ing.id}, Name: ${ing.name}, Package Amount: ${ing.package_amount}, Type: ${typeof ing.package_amount}`);
        });
        
        // Check the data type of package_amount
        const schemaResult = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'ingredients' AND column_name = 'package_amount';
        `);
        
        console.log('package_amount column data type:', schemaResult.rows[0].data_type);
        
        // Check if the package_amount is being returned correctly in the API
        console.log('Checking API response...');
        
        // Get a recipe with ingredients that have package_amount
        const recipeResult = await client.query(`
            SELECT DISTINCT r.id, r.name
            FROM recipes r
            JOIN ingredients i ON r.id = i.recipe_id
            WHERE i.package_amount IS NOT NULL
            LIMIT 1;
        `);
        
        if (recipeResult.rows.length === 0) {
            console.log('No recipes found with ingredients that have package_amount');
            return;
        }
        
        const recipeId = recipeResult.rows[0].id;
        console.log(`Found recipe with ID ${recipeId} that has ingredients with package_amount`);
        
        // Get the ingredients for this recipe
        const recipeIngredientsResult = await client.query(`
            SELECT id, name, package_amount
            FROM ingredients
            WHERE recipe_id = $1 AND package_amount IS NOT NULL
            ORDER BY id;
        `, [recipeId]);
        
        console.log(`Found ${recipeIngredientsResult.rows.length} ingredients with package_amount in recipe ${recipeId}:`);
        recipeIngredientsResult.rows.forEach(ing => {
            console.log(`ID: ${ing.id}, Name: ${ing.name}, Package Amount: ${ing.package_amount}, Type: ${typeof ing.package_amount}`);
        });
        
        // Create a simple HTML file to check if the package_amount is being displayed correctly
        console.log('Creating HTML file to check package_amount display...');
        
        const fs = require('fs');
        const path = require('path');
        
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Package Amount Display Check</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #121212;
            color: #e0e0e0;
        }
        h1, h2 {
            color: #ffffff;
        }
        pre {
            background-color: #222;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        .success {
            color: #4caf50;
        }
        .error {
            color: #f44336;
        }
    </style>
</head>
<body>
    <h1>Package Amount Display Check</h1>
    
    <h2>Recipe ID: ${recipeId}</h2>
    <div id="recipe-data"></div>
    
    <h2>Raw API Response</h2>
    <pre id="raw-response"></pre>
    
    <script>
        document.addEventListener('DOMContentLoaded', async function() {
            const recipeDataDiv = document.getElementById('recipe-data');
            const rawResponsePre = document.getElementById('raw-response');
            
            try {
                const response = await fetch('/api/recipes/${recipeId}');
                const data = await response.json();
                
                // Display raw response
                rawResponsePre.textContent = JSON.stringify(data, null, 2);
                
                // Display recipe data
                let html = '<h3>' + data.name + '</h3>';
                
                if (data.ingredients && data.ingredients.length > 0) {
                    html += '<h4>Ingredients with Package Amount:</h4>';
                    html += '<ul>';
                    
                    data.ingredients.forEach(ing => {
                        if (ing.package_amount !== null && ing.package_amount !== undefined) {
                            html += '<li>';
                            html += '<strong>' + ing.name + '</strong> (ID: ' + ing.id + ')<br>';
                            html += 'Package Amount: ' + ing.package_amount + ' (Type: ' + typeof ing.package_amount + ')<br>';
                            html += 'Raw Value: <code>' + JSON.stringify(ing.package_amount) + '</code>';
                            html += '</li>';
                        }
                    });
                    
                    html += '</ul>';
                } else {
                    html += '<p class="error">No ingredients found</p>';
                }
                
                recipeDataDiv.innerHTML = html;
            } catch (error) {
                rawResponsePre.innerHTML = '<span class="error">Error: ' + error.message + '</span>';
            }
        });
    </script>
</body>
</html>
        `;
        
        fs.writeFileSync(path.join(__dirname, 'public', 'package-amount-display-check.html'), htmlContent);
        console.log('HTML file created: public/package-amount-display-check.html');
        
        console.log('Check completed successfully');
    } catch (err) {
        console.error('Error checking package amount display:', err);
    } finally {
        client.release();
        process.exit();
    }
}

checkPackageAmountDisplay();
