/**
 * Clean Food HTML
 * 
 * This script specifically cleans up the food.html file by removing
 * commented-out CSS and JavaScript files and consolidating duplicate
 * functionality.
 */

const fs = require('fs');
const path = require('path');

// Path to the food.html file
const foodHtmlPath = path.join(__dirname, 'public', 'pages', 'food.html');

// Configuration
const config = {
    // Create a backup before modifying the file
    createBackup: true,
    
    // Dry run mode (set to true to see what would be changed without making changes)
    dryRun: false,
    
    // Patterns to identify commented-out code
    commentedScriptPattern: /<!--\s*<script[^>]*src="([^"]*)"[^>]*>\s*<\/script>\s*-->/g,
    commentedLinkPattern: /<!--\s*<link[^>]*href="([^"]*)"[^>]*>\s*-->/g,
    
    // Patterns to identify commented-out sections
    commentedSectionPattern: /<!--\s*Commenting out.*?-->\s*(\n\s*<!--.*?-->)+/g,
    
    // Patterns to identify commented-out code blocks
    commentedCodeBlockPattern: /<!--\s*.*?\s*-->/g,
    
    // Scripts to remove (these are duplicates or have been consolidated)
    scriptsToRemove: [
        '../js/food/fix-ingredient-refresh.js',
        '../js/food/fix-add-ingredient.js',
        '../js/food/fix-direct-api-call.js',
        '../js/food/fix-recipe-ingredient-api.js',
        '../js/food/horizontal-ingredient-edit.js',
        '../js/food/horizontal-edit-fields.js',
        '../js/food/top-fields-dark-fix.js'
    ],
    
    // CSS files to remove (these are duplicates or have been consolidated)
    cssToRemove: [
        '../css/smaller-nutrition-inputs.css',
        '../css/horizontal-ingredient-edit.css',
        '../css/horizontal-edit-fields.css',
        '../css/top-fields-dark-fix.css',
        '../css/nutrition-display-redesign.css',
        '../css/ultra-compact-nutrition.css',
        '../css/super-compact-nutrition.css',
        '../css/nutrition-grid-fix.css'
    ]
};

/**
 * Create a backup of the food.html file
 */
function createBackup() {
    if (!config.createBackup) return;
    
    const backupPath = `${foodHtmlPath}.bak`;
    try {
        fs.copyFileSync(foodHtmlPath, backupPath);
        console.log(`Created backup: ${backupPath}`);
    } catch (error) {
        console.error(`Error creating backup: ${error.message}`);
    }
}

/**
 * Clean up the food.html file
 */
function cleanFoodHtml() {
    console.log('\n=== Clean Food HTML ===\n');
    
    try {
        // Read the file content
        const content = fs.readFileSync(foodHtmlPath, 'utf8');
        
        // Create a backup
        if (!config.dryRun) {
            createBackup();
        }
        
        // Remove commented-out script tags
        let newContent = content;
        let commentedScriptCount = 0;
        
        newContent = newContent.replace(config.commentedScriptPattern, (match, scriptSrc) => {
            commentedScriptCount++;
            console.log(`Found commented-out script: ${scriptSrc}`);
            return '';
        });
        
        // Remove commented-out link tags
        let commentedLinkCount = 0;
        
        newContent = newContent.replace(config.commentedLinkPattern, (match, linkHref) => {
            commentedLinkCount++;
            console.log(`Found commented-out link: ${linkHref}`);
            return '';
        });
        
        // Remove commented-out sections
        let commentedSectionCount = 0;
        
        newContent = newContent.replace(config.commentedSectionPattern, (match) => {
            commentedSectionCount++;
            console.log(`Found commented-out section`);
            return '';
        });
        
        // Remove scripts that have been consolidated
        let removedScriptCount = 0;
        
        for (const script of config.scriptsToRemove) {
            const scriptPattern = new RegExp(`<script[^>]*src="${script.replace(/\./g, '\\.')}"[^>]*>\\s*<\\/script>`, 'g');
            
            if (scriptPattern.test(newContent)) {
                removedScriptCount++;
                console.log(`Removing script: ${script}`);
                newContent = newContent.replace(scriptPattern, '');
            }
        }
        
        // Remove CSS files that have been consolidated
        let removedCssCount = 0;
        
        for (const css of config.cssToRemove) {
            const cssPattern = new RegExp(`<link[^>]*href="${css.replace(/\./g, '\\.')}"[^>]*>`, 'g');
            
            if (cssPattern.test(newContent)) {
                removedCssCount++;
                console.log(`Removing CSS: ${css}`);
                newContent = newContent.replace(cssPattern, '');
            }
        }
        
        // Remove empty lines
        newContent = newContent.replace(/^\s*\n/gm, '');
        
        // Write the modified content back to the file
        if (!config.dryRun) {
            fs.writeFileSync(foodHtmlPath, newContent, 'utf8');
            console.log(`Modified file: ${foodHtmlPath}`);
        }
        
        // Log statistics
        console.log('\n=== Statistics ===');
        console.log(`Commented-Out Scripts Removed: ${commentedScriptCount}`);
        console.log(`Commented-Out Links Removed: ${commentedLinkCount}`);
        console.log(`Commented-Out Sections Removed: ${commentedSectionCount}`);
        console.log(`Consolidated Scripts Removed: ${removedScriptCount}`);
        console.log(`Consolidated CSS Files Removed: ${removedCssCount}`);
        
        console.log('\n=== Done ===\n');
    } catch (error) {
        console.error(`Error cleaning food.html: ${error.message}`);
    }
}

// Run the script
cleanFoodHtml();
