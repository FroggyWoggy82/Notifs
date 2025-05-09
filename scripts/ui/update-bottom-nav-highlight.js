/**
 * Script to add the bottom-nav-white-highlight.css to all pages with a bottom navigation bar
 */
const fs = require('fs');
const path = require('path');

// Pages to update
const pagesToUpdate = [
    'index.html',
    'pages/goals.html',
    'pages/workouts.html',
    'pages/calendar.html',
    'pages/food.html',
    'pages/days-since.html',
    'pages/journal.html',
    'pages/product-tracking.html',
    'pages/settings.html',
    'pages/exercise-history.html',
    'pages/cronometer-nutrition.html',
    'css-test.html'
];

// Base directory
const baseDir = path.join(__dirname, 'public');

// Process each page
pagesToUpdate.forEach(pagePath => {
    const fullPath = path.join(baseDir, pagePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }
    
    // Read the file
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if the file already has the bottom-nav-white-highlight.css
    if (content.includes('bottom-nav-white-highlight.css')) {
        console.log(`${pagePath} already has bottom-nav-white-highlight.css`);
        return;
    }
    
    // Find the </head> tag
    const headEndIndex = content.indexOf('</head>');
    if (headEndIndex === -1) {
        console.log(`Could not find </head> in ${pagePath}`);
        return;
    }
    
    // Determine the relative path to the CSS file
    const cssPath = pagePath.includes('pages/') ? '../css/bottom-nav-white-highlight.css' : 'css/bottom-nav-white-highlight.css';
    
    // Create the link tag
    const linkTag = `    <link rel="stylesheet" href="${cssPath}">\n`;
    
    // Insert the link tag before the </head> tag
    const newContent = content.slice(0, headEndIndex) + linkTag + content.slice(headEndIndex);
    
    // Write the updated content back to the file
    fs.writeFileSync(fullPath, newContent, 'utf8');
    
    console.log(`Updated ${pagePath}`);
});

console.log('Done updating pages');
