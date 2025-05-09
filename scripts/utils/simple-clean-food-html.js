/**
 * Simple Clean Food HTML
 * 
 * This script cleans up the food.html file by removing commented-out CSS and JavaScript files.
 */

const fs = require('fs');
const path = require('path');

// Path to the food.html file
const foodHtmlPath = path.join(__dirname, 'public', 'pages', 'food.html');

// Create a backup of the food.html file
const backupPath = `${foodHtmlPath}.bak`;
fs.copyFileSync(foodHtmlPath, backupPath);
console.log(`Created backup: ${backupPath}`);

// Read the file content
const content = fs.readFileSync(foodHtmlPath, 'utf8');

// Remove commented-out script tags
let newContent = content.replace(/<!--\s*<script[^>]*src="([^"]*)"[^>]*>\s*<\/script>\s*-->/g, '');

// Remove commented-out link tags
newContent = newContent.replace(/<!--\s*<link[^>]*href="([^"]*)"[^>]*>\s*-->/g, '');

// Remove commented-out sections
newContent = newContent.replace(/<!--\s*Commenting out.*?-->\s*(\n\s*<!--.*?-->)+/g, '');

// Remove empty lines
newContent = newContent.replace(/^\s*\n/gm, '');

// Write the modified content back to the file
fs.writeFileSync(foodHtmlPath, newContent, 'utf8');
console.log(`Modified file: ${foodHtmlPath}`);

console.log('Done!');
