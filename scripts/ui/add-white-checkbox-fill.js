/**
 * Script to add the white-checkbox-fill.css to all pages with checkboxes
 */
const fs = require('fs');
const path = require('path');

// Pages to update
const pagesToUpdate = [
    'public/index.html',
    'public/pages/calendar.html',
    'public/pages/goals.html',
    'public/pages/workouts.html',
    'public/pages/food.html',
    'public/pages/days-since.html',
    'public/pages/journal.html',
    'public/pages/product-tracking.html',
    'public/pages/settings.html',
    'public/pages/exercise-history.html',
    'public/pages/cronometer-nutrition.html',
    'public/css-test.html'
];

// Base directory
const baseDir = __dirname;

// CSS file to add
const cssToAdd = '<link rel="stylesheet" href="../css/white-checkbox-fill.css"> <!-- White checkbox fill with animation -->';
const cssToAddRoot = '<link rel="stylesheet" href="css/white-checkbox-fill.css"> <!-- White checkbox fill with animation -->';

// Process each file
pagesToUpdate.forEach(filePath => {
    const fullPath = path.join(baseDir, filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }
    
    // Read file content
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if the CSS is already included
    if (content.includes('white-checkbox-fill.css')) {
        console.log(`CSS already included in ${filePath}`);
        return;
    }
    
    // Determine if this is a root-level file or in a subdirectory
    const isRootLevel = !filePath.includes('/pages/');
    const cssLine = isRootLevel ? cssToAddRoot : cssToAdd;
    
    // Find the position to insert the new CSS
    // Look for the last CSS import before Font Awesome or the closing head tag
    let insertPosition;
    
    if (content.includes('Font Awesome for icons')) {
        // Insert before Font Awesome
        insertPosition = content.indexOf('<!-- Font Awesome for icons -->');
        content = content.slice(0, insertPosition) + 
                 cssLine + '\n    ' + 
                 content.slice(insertPosition);
    } else if (content.includes('</head>')) {
        // Insert before closing head tag
        insertPosition = content.indexOf('</head>');
        content = content.slice(0, insertPosition) + 
                 '    ' + cssLine + '\n' + 
                 content.slice(insertPosition);
    } else {
        console.log(`Could not find insertion point in ${filePath}`);
        return;
    }
    
    // Write updated content back to file
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
});

console.log('Done updating files.');
