const { test, expect } = require('@playwright/test');

test.describe('Cronometer Data Parsing', () => {
  test('should parse Cronometer data and populate nutrition fields', async ({ page }) => {
    console.log('🧪 Testing Cronometer data parsing...');

    // Navigate to the food page
    await page.goto('http://localhost:3000/food');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Find and click the last View button (Test Recipe for Micronutrients)
    const viewButtons = await page.locator('button:has-text("View")').all();
    if (viewButtons.length > 0) {
      await viewButtons[viewButtons.length - 1].click();
      console.log('✅ Clicked View button for Test Recipe');
    }

    // Wait for modal to open
    await page.waitForTimeout(1000);

    // Look for an ingredient in the recipe to edit
    // Find the first ingredient edit button (usually has "Edit" text or edit icon)
    const ingredientEditButtons = await page.locator('button:has-text("Edit"), button[onclick*="editIngredient"], .edit-ingredient-btn, [class*="edit"]').all();

    if (ingredientEditButtons.length > 0) {
      await ingredientEditButtons[0].click();
      console.log('✅ Clicked ingredient Edit button');
    } else {
      // If no ingredient edit button found, try creating a new ingredient
      const addIngredientButton = page.locator('button:has-text("Add Ingredient"), button:has-text("➕"), .add-ingredient-btn');
      await addIngredientButton.click();
      console.log('✅ Clicked Add Ingredient button');
    }

    // Wait for ingredient edit modal to open
    await page.waitForTimeout(1500);
    
    // Find the Cronometer data textarea
    const cronometerTextarea = page.locator('#edit-popup-cronometer-data, textarea[placeholder*="Cronometer"], textarea[placeholder*="cronometer"]').first();
    
    // Verify the textarea exists and is larger now
    await expect(cronometerTextarea).toBeVisible();
    console.log('✅ Found Cronometer textarea');
    
    // Clear any existing data
    await cronometerTextarea.fill('');
    
    // Test data in the multi-line format
    const testData = `General
Energy
152.8
kcal
Protein
Protein
4.7
g
Fat
0.6
g
Carbs
30.6
g
Fiber
2.4
g
Calcium
0.0
mg
Iron
0.4
mg
Sodium
117.6
mg`;

    // Paste the test data
    await cronometerTextarea.fill(testData);
    console.log('✅ Pasted Cronometer test data');
    
    // Wait for parsing to complete
    await page.waitForTimeout(1000);
    
    // Check if nutrition fields were populated
    const energyField = page.locator('#edit-ingredient-energy');
    const proteinField = page.locator('#edit-ingredient-protein');
    const fatField = page.locator('#edit-ingredient-fats');
    const carbsField = page.locator('#edit-ingredient-carbs');
    const fiberField = page.locator('#edit-ingredient-fiber');
    const ironField = page.locator('#edit-ingredient-iron');
    const sodiumField = page.locator('#edit-ingredient-sodium');
    
    // Verify the fields were populated with correct values
    await expect(energyField).toHaveValue('152.8');
    await expect(proteinField).toHaveValue('4.7');
    await expect(fatField).toHaveValue('0.6');
    await expect(carbsField).toHaveValue('30.6');
    await expect(fiberField).toHaveValue('2.4');
    await expect(ironField).toHaveValue('0.4');
    await expect(sodiumField).toHaveValue('117.6');
    
    console.log('✅ All nutrition fields populated correctly!');
    
    // Take a screenshot for verification
    await page.screenshot({ 
      path: 'cronometer-parsing-success.png',
      fullPage: true 
    });
    
    console.log('🎉 Cronometer parsing test completed successfully!');
  });
  
  test('should handle textarea resizing for large Cronometer data', async ({ page }) => {
    console.log('🧪 Testing textarea resizing...');

    // Navigate to the food page
    await page.goto('http://localhost:3000/food');
    await page.waitForTimeout(2000);

    // Find and click the last View button
    const viewButtons = await page.locator('button:has-text("View")').all();
    if (viewButtons.length > 0) {
      await viewButtons[viewButtons.length - 1].click();
    }

    await page.waitForTimeout(1000);

    // Look for an ingredient edit button
    const ingredientEditButtons = await page.locator('button:has-text("Edit"), button[onclick*="editIngredient"], .edit-ingredient-btn, [class*="edit"]').all();

    if (ingredientEditButtons.length > 0) {
      await ingredientEditButtons[0].click();
    } else {
      // If no ingredient edit button found, try creating a new ingredient
      const addIngredientButton = page.locator('button:has-text("Add Ingredient"), button:has-text("➕"), .add-ingredient-btn');
      await addIngredientButton.click();
    }

    await page.waitForTimeout(1500);
    
    // Find the Cronometer textarea
    const cronometerTextarea = page.locator('#edit-popup-cronometer-data, textarea[placeholder*="Cronometer"], textarea[placeholder*="cronometer"]').first();
    
    // Check that the textarea has the proper height
    const textareaHeight = await cronometerTextarea.evaluate(el => el.style.height);
    expect(textareaHeight).toBe('200px');
    console.log('✅ Textarea height is correctly set to 200px');
    
    // Verify it can handle large amounts of data
    const largeData = `General
Energy
152.8
kcal
Alcohol
-
g
Caffeine
-
mg
Water
-
g
Carbohydrates
Carbs
30.6
g
Fiber
2.4
g
Starch
-
g
Sugars
1.2
g
Added Sugars
-
g
Net Carbs
28.2
g
Lipids
Fat
0.6
g
Monounsaturated
-
g
Polyunsaturated
-
g
Omega-3
-
g
Omega-6
-
g
Saturated
0.0
g
Trans-Fats
0.0
g
Cholesterol
0.0
mg
Protein
Protein
4.7
g
Vitamins
Vitamin A
0.0
µg
Vitamin C
0.0
mg
Vitamin D
-
IU
Vitamin E
-
mg
Vitamin K
-
µg
Minerals
Calcium
0.0
mg
Copper
-
mg
Iron
0.4
mg
Magnesium
-
mg
Manganese
-
mg
Phosphorus
-
mg
Potassium
-
mg
Selenium
-
µg
Sodium
117.6
mg
Zinc
-
mg`;

    await cronometerTextarea.fill(largeData);
    console.log('✅ Successfully filled textarea with large Cronometer data');
    
    // Verify the data is visible and scrollable
    const textareaValue = await cronometerTextarea.inputValue();
    expect(textareaValue.length).toBeGreaterThan(500);
    console.log('✅ Large data properly stored in textarea');
    
    console.log('🎉 Textarea resizing test completed successfully!');
  });
});
