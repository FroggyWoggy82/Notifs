# Test info

- Name: Cronometer Data Parsing >> should parse Cronometer data and populate nutrition fields
- Location: C:\Users\Kevin\423fawn\Notifs\tests\test-cronometer-parsing.spec.js:4:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveValue(expected)

Locator: locator('#edit-ingredient-energy')
Expected string: "152.8"
Received: <element(s) not found>
Call log:
  - expect.toHaveValue with timeout 5000ms
  - waiting for locator('#edit-ingredient-energy')

    at C:\Users\Kevin\423fawn\Notifs\tests\test-cronometer-parsing.spec.js:95:31
```

# Page snapshot

```yaml
- button ""
- heading "Dashboard" [level=2]
- navigation:
  - link " Tasks":
    - /url: index.html
  - link " Goals":
    - /url: pages/goals.html
  - link " Workouts":
    - /url: pages/workouts.html
  - link " Calendar":
    - /url: pages/calendar.html
  - link " Days Since":
    - /url: pages/days-since.html
  - link " Food":
    - /url: pages/food.html
  - link " Journal":
    - /url: pages/journal-redesign.html
  - link " Product Tracking":
    - /url: pages/product-tracking.html
  - link " Settings":
    - /url: pages/settings.html
- heading "Food & Recipes" [level=1]
- button " Goals & Targets"
- text: "X-Axis Scale:"
- slider "X-Axis Scale:": "1"
- text: "1.0x Y-Axis Scale:"
- slider "Y-Axis Scale:": "1"
- text: 1.0x
- button "Edit Goal Weights"
- button "Reset Scale"
- heading "Meal Calendar" [level=2]
- paragraph: View your daily calorie targets, meals, and consumption at a glance
- button ""
- heading "June 2025" [level=3]
- button ""
- text: Sun Mon Tue Wed Thu Fri Sat 1 0/2600 cal 158.8 lbs 2 225/2600 cal 160.6 lbs 15:55Bacon Egg & Cheese + Banana & Kiwi Sillz Style 3 0/2600 cal 159 lbs 4 0/2600 cal 160 lbs 5 0/2600 cal 163.2 lbs 6 0/2600 cal 161 lbs 7 0/2600 cal 163.6 lbs 8 0/2600 cal 161 lbs 9 1188/2600 cal 160.6 lbs 13:18Poke Bowl 10 0/2600 cal 162.4 lbs 11 0/2600 cal 161.4 lbs 12 0/2600 cal 163.2 lbs 13 0/2600 cal 161 lbs 14 0/2600 cal 15 0/2600 cal 161.2 lbs 16 1614/2600 cal 161.6 lbs 22:03Chicken Katsu Curry 17 0/2600 cal 18 0/2600 cal 164.6 lbs 19 0/2600 cal 20 0/2600 cal 21 0/2600 cal 22 0/2600 cal 23 0/2600 cal 24 0/2600 cal 25 0/2600 cal 26 0/2600 cal 27 0/2600 cal 28 0/2600 cal 29 0/2600 cal 30 0/2600 cal 1 2 3 4 5 6 7 8 9 10 11 12
- heading "Submit Meal" [level=2]
- paragraph: Record a meal you've eaten by selecting from your recipes and adjusting ingredient amounts
- heading "Bloating Rating (Optional)" [level=3]
- paragraph: Rate current bloating level (you'll be prompted again in 30 minutes)
- text: "Skip 1 - None 3 - Mild 6 - Moderate 10 - Severe Custom (1-10):"
- spinbutton "Custom (1-10):"
- heading "Meal Photo (Optional)" [level=3]
- text:  Click to add a photo of your meal
- button " Submit Meal" [disabled]
- button " Reset Form"
- textbox "Date:": 2025-06-19
- combobox "Choose a recipe:":
  - option "-- Select a recipe --" [selected]
  - option "Broccoli Ziti (452.1 cal)"
  - option "Chicken Katsu Curry (1614.2 cal)"
  - option "Chipotle Bowl (853.6999999999999 cal)"
  - option "Genuis Bowl (400.1 cal)"
  - option "Poke Bowl (1561.8000000000002 cal)"
  - option "Shreggs (583.0999999999999 cal)"
  - option "Sillz Meat Pasta (876.1 cal)"
  - option "Sillz Pasta From Kroger (2843.7 cal)"
  - option "Test Recipe for Micronutrients (152.8 cal)"
- heading "Create New Recipe" [level=2]
- textbox "Enter recipe name"
- radio [checked]
- text: Create New
- radio
- text: Use Existing
- button "Show Nutrition"
- button "🗑️ Remove"
- textbox "Search existing ingredients..."
- textbox "Enter ingredient name"
- spinbutton
- spinbutton
- spinbutton
- textbox "Grocery Store"
- textbox "Paste Cronometer nutrition data here for automatic parsing...": General Energy 152.8 kcal Protein Protein 4.7 g Fat 0.6 g Carbs 30.6 g Fiber 2.4 g Calcium 0.0 mg Iron 0.4 mg Sodium 117.6 mg
- button "Parse Nutrition Data"
- button "➕ Add Ingredient"
- button "Save Recipe"
- heading "Your Recipes" [level=2]
- textbox "Search recipes..."
- button "×"
- heading "Broccoli Ziti" [level=3]
- text: 
- paragraph: 452.1 calories
- button "View"
- button "Adjust"
- button "Delete"
- heading "Chicken Katsu Curry" [level=3]
- text: 
- paragraph: 1614.2 calories
- button "View"
- button "Adjust"
- button "Delete"
- heading "Chipotle Bowl" [level=3]
- text: 
- paragraph: 853.7 calories
- button "View"
- button "Adjust"
- button "Delete"
- heading "Genuis Bowl" [level=3]
- text: 
- paragraph: 400.1 calories
- button "View"
- button "Adjust"
- button "Delete"
- heading "Poke Bowl" [level=3]
- text: 
- paragraph: 1561.8 calories
- button "View"
- button "Adjust"
- button "Delete"
- heading "Shreggs" [level=3]
- text: 
- paragraph: 583.1 calories
- button "View"
- button "Adjust"
- button "Delete"
- heading "Sillz Meat Pasta" [level=3]
- text: 
- paragraph: 876.1 calories
- button "View"
- button "Adjust"
- button "Delete"
- heading "Sillz Pasta From Kroger" [level=3]
- text: 
- paragraph: 2843.7 calories
- button "View"
- button "Adjust"
- button "Delete"
- heading "Test Recipe for Micronutrients" [level=3]
- text: 
- paragraph: 152.8 calories
- button "Hide"
- button "Adjust"
- button "Delete"
- text: Chicken Breast 100g
- button "Edit"
- button "×"
- text: 153cal 4.7p 0.6f 30.6c $165.00
- button "+ Add Ingredient"
- heading "Grocery List Generator" [level=2]
- heading "Select Recipes" [level=3]
- checkbox
- text: Broccoli Ziti 452.1 calories
- checkbox
- text: Chicken Katsu Curry 1614.2 calories
- checkbox
- text: Chipotle Bowl 853.7 calories
- checkbox
- text: Genuis Bowl 400.1 calories
- checkbox
- text: Poke Bowl 1561.8 calories
- checkbox
- text: Shreggs 583.1 calories
- checkbox
- text: Sillz Meat Pasta 876.1 calories
- checkbox
- text: Sillz Pasta From Kroger 2843.7 calories
- checkbox
- text: Test Recipe for Micronutrients 152.8 calories
- heading "Adjust Calories" [level=3]
- button "Generate Grocery List" [disabled]
- button "Save as Task" [disabled]
- text: console.log('[CONFLICTING MODAL REMOVAL] Old conflicting modal code has been removed!');
- link " Tasks":
  - /url: index.html
- link " Goals":
  - /url: pages/goals.html
- link " Workouts":
  - /url: pages/workouts.html
- link " Calendar":
  - /url: pages/calendar.html
- link " Food":
  - /url: pages/food.html
```

# Test source

```ts
   1 | const { test, expect } = require('@playwright/test');
   2 |
   3 | test.describe('Cronometer Data Parsing', () => {
   4 |   test('should parse Cronometer data and populate nutrition fields', async ({ page }) => {
   5 |     console.log('🧪 Testing Cronometer data parsing...');
   6 |
   7 |     // Navigate to the food page
   8 |     await page.goto('http://localhost:3000/food');
   9 |
   10 |     // Wait for page to load
   11 |     await page.waitForTimeout(2000);
   12 |
   13 |     // Find and click the last View button (Test Recipe for Micronutrients)
   14 |     const viewButtons = await page.locator('button:has-text("View")').all();
   15 |     if (viewButtons.length > 0) {
   16 |       await viewButtons[viewButtons.length - 1].click();
   17 |       console.log('✅ Clicked View button for Test Recipe');
   18 |     }
   19 |
   20 |     // Wait for modal to open
   21 |     await page.waitForTimeout(1000);
   22 |
   23 |     // Look for an ingredient in the recipe to edit
   24 |     // Find the first ingredient edit button (usually has "Edit" text or edit icon)
   25 |     const ingredientEditButtons = await page.locator('button:has-text("Edit"), button[onclick*="editIngredient"], .edit-ingredient-btn, [class*="edit"]').all();
   26 |
   27 |     if (ingredientEditButtons.length > 0) {
   28 |       await ingredientEditButtons[0].click();
   29 |       console.log('✅ Clicked ingredient Edit button');
   30 |     } else {
   31 |       // If no ingredient edit button found, try creating a new ingredient
   32 |       const addIngredientButton = page.locator('button:has-text("Add Ingredient"), button:has-text("➕"), .add-ingredient-btn');
   33 |       await addIngredientButton.click();
   34 |       console.log('✅ Clicked Add Ingredient button');
   35 |     }
   36 |
   37 |     // Wait for ingredient edit modal to open
   38 |     await page.waitForTimeout(1500);
   39 |     
   40 |     // Find the Cronometer data textarea
   41 |     const cronometerTextarea = page.locator('#edit-popup-cronometer-data, textarea[placeholder*="Cronometer"], textarea[placeholder*="cronometer"]').first();
   42 |     
   43 |     // Verify the textarea exists and is larger now
   44 |     await expect(cronometerTextarea).toBeVisible();
   45 |     console.log('✅ Found Cronometer textarea');
   46 |     
   47 |     // Clear any existing data
   48 |     await cronometerTextarea.fill('');
   49 |     
   50 |     // Test data in the multi-line format
   51 |     const testData = `General
   52 | Energy
   53 | 152.8
   54 | kcal
   55 | Protein
   56 | Protein
   57 | 4.7
   58 | g
   59 | Fat
   60 | 0.6
   61 | g
   62 | Carbs
   63 | 30.6
   64 | g
   65 | Fiber
   66 | 2.4
   67 | g
   68 | Calcium
   69 | 0.0
   70 | mg
   71 | Iron
   72 | 0.4
   73 | mg
   74 | Sodium
   75 | 117.6
   76 | mg`;
   77 |
   78 |     // Paste the test data
   79 |     await cronometerTextarea.fill(testData);
   80 |     console.log('✅ Pasted Cronometer test data');
   81 |     
   82 |     // Wait for parsing to complete
   83 |     await page.waitForTimeout(1000);
   84 |     
   85 |     // Check if nutrition fields were populated
   86 |     const energyField = page.locator('#edit-ingredient-energy');
   87 |     const proteinField = page.locator('#edit-ingredient-protein');
   88 |     const fatField = page.locator('#edit-ingredient-fats');
   89 |     const carbsField = page.locator('#edit-ingredient-carbs');
   90 |     const fiberField = page.locator('#edit-ingredient-fiber');
   91 |     const ironField = page.locator('#edit-ingredient-iron');
   92 |     const sodiumField = page.locator('#edit-ingredient-sodium');
   93 |     
   94 |     // Verify the fields were populated with correct values
>  95 |     await expect(energyField).toHaveValue('152.8');
      |                               ^ Error: Timed out 5000ms waiting for expect(locator).toHaveValue(expected)
   96 |     await expect(proteinField).toHaveValue('4.7');
   97 |     await expect(fatField).toHaveValue('0.6');
   98 |     await expect(carbsField).toHaveValue('30.6');
   99 |     await expect(fiberField).toHaveValue('2.4');
  100 |     await expect(ironField).toHaveValue('0.4');
  101 |     await expect(sodiumField).toHaveValue('117.6');
  102 |     
  103 |     console.log('✅ All nutrition fields populated correctly!');
  104 |     
  105 |     // Take a screenshot for verification
  106 |     await page.screenshot({ 
  107 |       path: 'cronometer-parsing-success.png',
  108 |       fullPage: true 
  109 |     });
  110 |     
  111 |     console.log('🎉 Cronometer parsing test completed successfully!');
  112 |   });
  113 |   
  114 |   test('should handle textarea resizing for large Cronometer data', async ({ page }) => {
  115 |     console.log('🧪 Testing textarea resizing...');
  116 |
  117 |     // Navigate to the food page
  118 |     await page.goto('http://localhost:3000/food');
  119 |     await page.waitForTimeout(2000);
  120 |
  121 |     // Find and click the last View button
  122 |     const viewButtons = await page.locator('button:has-text("View")').all();
  123 |     if (viewButtons.length > 0) {
  124 |       await viewButtons[viewButtons.length - 1].click();
  125 |     }
  126 |
  127 |     await page.waitForTimeout(1000);
  128 |
  129 |     // Look for an ingredient edit button
  130 |     const ingredientEditButtons = await page.locator('button:has-text("Edit"), button[onclick*="editIngredient"], .edit-ingredient-btn, [class*="edit"]').all();
  131 |
  132 |     if (ingredientEditButtons.length > 0) {
  133 |       await ingredientEditButtons[0].click();
  134 |     } else {
  135 |       // If no ingredient edit button found, try creating a new ingredient
  136 |       const addIngredientButton = page.locator('button:has-text("Add Ingredient"), button:has-text("➕"), .add-ingredient-btn');
  137 |       await addIngredientButton.click();
  138 |     }
  139 |
  140 |     await page.waitForTimeout(1500);
  141 |     
  142 |     // Find the Cronometer textarea
  143 |     const cronometerTextarea = page.locator('#edit-popup-cronometer-data, textarea[placeholder*="Cronometer"], textarea[placeholder*="cronometer"]').first();
  144 |     
  145 |     // Check that the textarea has the proper height
  146 |     const textareaHeight = await cronometerTextarea.evaluate(el => el.style.height);
  147 |     expect(textareaHeight).toBe('200px');
  148 |     console.log('✅ Textarea height is correctly set to 200px');
  149 |     
  150 |     // Verify it can handle large amounts of data
  151 |     const largeData = `General
  152 | Energy
  153 | 152.8
  154 | kcal
  155 | Alcohol
  156 | -
  157 | g
  158 | Caffeine
  159 | -
  160 | mg
  161 | Water
  162 | -
  163 | g
  164 | Carbohydrates
  165 | Carbs
  166 | 30.6
  167 | g
  168 | Fiber
  169 | 2.4
  170 | g
  171 | Starch
  172 | -
  173 | g
  174 | Sugars
  175 | 1.2
  176 | g
  177 | Added Sugars
  178 | -
  179 | g
  180 | Net Carbs
  181 | 28.2
  182 | g
  183 | Lipids
  184 | Fat
  185 | 0.6
  186 | g
  187 | Monounsaturated
  188 | -
  189 | g
  190 | Polyunsaturated
  191 | -
  192 | g
  193 | Omega-3
  194 | -
  195 | g
```