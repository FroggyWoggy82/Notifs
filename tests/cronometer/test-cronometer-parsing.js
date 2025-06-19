/**
 * Test Cronometer Data Parsing
 * Tests the Cronometer data parsing functionality without requiring a browser
 */

// Sample Cronometer data for testing
const sampleCronometerData = `
General
Energy	152.8 kcal
Alcohol	-
Caffeine	-
Water	-

Carbohydrates
Carbs	4.7 g
Fiber	0.7 g
Starch	-
Sugars	3.9 g
Added Sugars	-
Net Carbs	4.0 g

Lipids
Fat	13.8 g
Monounsaturated	-
Polyunsaturated	-
Omega-3	-
Omega-6	-
Saturated	-
Trans-Fats	-
Cholesterol	-

Protein
Protein	4.7 g
Alanine	-
Arginine	-
Aspartic Acid	-
Cysteine	-
Glutamic Acid	-
Glycine	-
Histidine	-
Isoleucine	-
Leucine	-
Lysine	-
Methionine	-
Phenylalanine	-
Proline	-
Serine	-
Threonine	-
Tryptophan	-
Tyrosine	-
Valine	-

Vitamins
B1 (Thiamine)	0.0 mg
B2 (Riboflavin)	0.1 mg
B3 (Niacin)	0.1 mg
B5 (Pantothenic Acid)	0.1 mg
B6 (Pyridoxine)	0.0 mg
B12 (Cobalamin)	0.1 μg
Folate	7.0 μg
Vit.A	49.0 μg
Vit.C	0.1 mg
Vit.D	0.0 μg
Vit.E	0.2 mg
Vit.K	2.1 μg

Minerals
Calcium	24.0 mg
Copper	0.0 mg
Iron	0.1 mg
Magnesium	3.0 mg
Manganese	0.0 mg
Phosphorus	28.0 mg
Potassium	37.0 mg
Selenium	4.1 μg
Sodium	6.0 mg
Zinc	0.1 mg
`;

// Simple parsing function (similar to what we implemented)
function parseCronometerData(text) {
    console.log('Parsing Cronometer data...');
    
    if (!text || text.trim().length === 0) {
        console.log('No data to parse');
        return {};
    }

    const lines = text.split('\n');
    const data = {};

    // Parse each line for nutrition data
    for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length >= 2) {
            const nutrient = parts[0].trim();
            const value = parts[1].trim();
            
            // Skip empty values or dashes
            if (!value || value === '-') continue;
            
            // Extract numeric value
            const numericMatch = value.match(/([0-9]+\.?[0-9]*)/);
            const numericValue = numericMatch ? parseFloat(numericMatch[1]) : 0;
            
            // Map nutrients to expected field names
            const fieldMapping = {
                'Energy': 'energy',
                'Protein': 'protein', 
                'Fat': 'fats',
                'Carbs': 'carbs',
                'Fiber': 'fiber',
                'Calcium': 'calcium',
                'Iron': 'iron',
                'Vit.A': 'vitamin_a',
                'Vit.C': 'vitamin_c',
                'Vit.D': 'vitamin_d',
                'B12 (Cobalamin)': 'vitamin_b12',
                'Folate': 'folate',
                'Potassium': 'potassium',
                'Sodium': 'sodium',
                'Magnesium': 'magnesium',
                'Zinc': 'zinc'
            };

            const fieldName = fieldMapping[nutrient];
            if (fieldName) {
                data[fieldName] = numericValue;
                console.log(`Mapped ${nutrient} -> ${fieldName} = ${numericValue}`);
            }
        }
    }

    return data;
}

// Test the parsing function
function runTest() {
    console.log('=== Testing Cronometer Data Parsing ===\n');
    
    const result = parseCronometerData(sampleCronometerData);
    
    console.log('\n=== Parsing Results ===');
    console.log('Parsed data:', result);
    
    // Verify expected values
    const expectedValues = {
        energy: 152.8,
        protein: 4.7,
        fats: 13.8,
        carbs: 4.7,
        fiber: 0.7,
        calcium: 24.0,
        iron: 0.1,
        vitamin_a: 49.0,
        vitamin_c: 0.1,
        vitamin_b12: 0.1,
        folate: 7.0,
        potassium: 37.0,
        sodium: 6.0,
        magnesium: 3.0,
        zinc: 0.1
    };
    
    console.log('\n=== Verification ===');
    let passCount = 0;
    let totalCount = 0;
    
    for (const [field, expectedValue] of Object.entries(expectedValues)) {
        totalCount++;
        const actualValue = result[field];
        const passed = actualValue === expectedValue;
        
        if (passed) {
            passCount++;
            console.log(`✅ ${field}: ${actualValue} (expected: ${expectedValue})`);
        } else {
            console.log(`❌ ${field}: ${actualValue} (expected: ${expectedValue})`);
        }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Passed: ${passCount}/${totalCount} tests`);
    
    if (passCount === totalCount) {
        console.log('🎉 All tests passed! Cronometer parsing is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Check the parsing logic.');
    }
    
    return passCount === totalCount;
}

// Run the test
if (require.main === module) {
    runTest();
}

module.exports = { parseCronometerData, runTest };
