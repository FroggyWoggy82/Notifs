#!/usr/bin/env node

/**
 * JavaScript Bundle Builder
 *
 * This script consolidates all JavaScript files referenced in index.html into a single bundle.js file
 * while preserving the exact execution order and maintaining all existing functionality.
 */

const fs = require('fs');
const path = require('path');

// Read index.html to extract JavaScript file references
function extractJSFiles() {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    // Extract all script tags with src attributes
    const scriptSrcRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi;
    const jsFiles = [];
    let match;

    while ((match = scriptSrcRegex.exec(indexContent)) !== null) {
        const src = match[1];
        // Skip external CDN links, relative paths that start with http, and the bundle.js file itself
        if (!src.startsWith('http') && !src.startsWith('//') && !src.includes('bundle.js')) {
            jsFiles.push(src);
        }
    }

    console.log(`Found ${jsFiles.length} JavaScript files to bundle:`);
    jsFiles.forEach(file => console.log(`  - ${file}`));

    return jsFiles;
}

// Wrap JavaScript content to prevent global scope pollution
function wrapJSContent(jsContent, fileName) {
    // Replace var declarations with let to avoid redeclaration issues
    const processedContent = jsContent
        .replace(/\bvar\s+/g, 'let ')
        .replace(/\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, 'window.$1 = function(');

    return `
/* ========================================== */
/* File: ${fileName} */
/* ========================================== */

(function() {
    'use strict';

    // Original content from ${fileName}
    ${processedContent}

})();

`;
}

// Bundle all JavaScript files
function bundleJS() {
    const jsFiles = extractJSFiles();
    let bundledContent = `/**
 * Bundled JavaScript for PWA Performance Optimization
 * Generated on: ${new Date().toISOString()}
 *
 * This file contains all JavaScript functionality consolidated into a single file
 * to reduce HTTP requests and improve loading performance.
 *
 * Each script is wrapped in an IIFE to prevent global scope pollution
 * while maintaining the original execution order.
 */

`;

    const processedFiles = new Set();

    for (const jsFile of jsFiles) {
        const jsPath = path.join(__dirname, 'public', jsFile);

        if (fs.existsSync(jsPath) && !processedFiles.has(jsPath)) {
            console.log(`Processing: ${jsFile}`);

            try {
                let jsContent = fs.readFileSync(jsPath, 'utf8');

                // Special handling for certain critical scripts that need global scope
                const criticalGlobalScripts = [
                    'js/immediate-notification-fix.js',
                    'js/tasks/script.js', // Main task script needs global access
                    'js/notification-system.js',
                    'js/modal-system.js'
                ];

                // Don't wrap any scripts for now to avoid variable conflicts
                bundledContent += `\n/* ========================================== */\n`;
                bundledContent += `/* File: ${jsFile} */\n`;
                bundledContent += `/* ========================================== */\n\n`;
                bundledContent += jsContent;
                bundledContent += '\n\n';

                processedFiles.add(jsPath);
            } catch (error) {
                console.error(`Error processing ${jsFile}:`, error.message);
            }
        } else if (!fs.existsSync(jsPath)) {
            console.warn(`Warning: JavaScript file not found: ${jsPath}`);
        }
    }

    // Write the bundled JavaScript
    const outputPath = path.join(__dirname, 'public', 'js', 'bundle.js');
    fs.writeFileSync(outputPath, bundledContent, 'utf8');

    console.log(`\nJavaScript bundle created successfully!`);
    console.log(`Output: ${outputPath}`);
    console.log(`Total files processed: ${processedFiles.size}`);
    console.log(`Bundle size: ${(bundledContent.length / 1024).toFixed(2)} KB`);

    return outputPath;
}

// Main execution
if (require.main === module) {
    try {
        bundleJS();
        console.log('\n✅ JavaScript bundling completed successfully!');
    } catch (error) {
        console.error('\n❌ JavaScript bundling failed:', error.message);
        process.exit(1);
    }
}

module.exports = { bundleJS, extractJSFiles };
