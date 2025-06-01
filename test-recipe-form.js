/**
 * Simple test script to verify recipe form submission
 * Run this with: node test-recipe-form.js
 */

const http = require('http');

// Test data
const testRecipe = {
    name: "Test Recipe",
    groceryStore: "Test Store",
    ingredients: [
        {
            name: "Test Ingredient",
            calories: 200,
            amount: 100,
            package_amount: 500,
            protein: 10,
            fats: 5,
            carbohydrates: 30,
            price: 2.99
        }
    ]
};

// Function to make HTTP request
function makeRequest(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/recipes',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        data: parsedData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Test function
async function testRecipeSubmission() {
    console.log('Testing recipe form submission...');
    console.log('Test data:', JSON.stringify(testRecipe, null, 2));
    
    try {
        const result = await makeRequest(testRecipe);
        
        console.log('\n--- Response ---');
        console.log('Status Code:', result.statusCode);
        console.log('Response Data:', JSON.stringify(result.data, null, 2));
        
        if (result.statusCode === 201) {
            console.log('\n✅ SUCCESS: Recipe was created successfully!');
        } else if (result.statusCode === 200) {
            console.log('\n✅ SUCCESS: Request completed successfully!');
        } else {
            console.log('\n❌ ERROR: Unexpected status code');
        }
        
    } catch (error) {
        console.error('\n❌ ERROR: Failed to submit recipe');
        console.error('Error details:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Make sure your server is running on http://localhost:3000');
            console.error('   Run: npm start');
        }
    }
}

// Run the test
testRecipeSubmission();
