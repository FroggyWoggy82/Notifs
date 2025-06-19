#!/usr/bin/env node

/**
 * CSS Bundle Builder
 * 
 * This script consolidates all CSS files referenced in index.html into a single bundle.css file
 * while preserving the exact order and maintaining all existing styles.
 */

const fs = require('fs');
const path = require('path');

// Read index.html to extract CSS file references
function extractCSSFiles() {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Extract all CSS link tags
    const cssLinkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+\.css)["'][^>]*>/gi;
    const cssFiles = [];
    let match;
    
    while ((match = cssLinkRegex.exec(indexContent)) !== null) {
        const href = match[1];
        // Skip external CDN links
        if (!href.startsWith('http') && !href.startsWith('//')) {
            cssFiles.push(href);
        }
    }
    
    console.log(`Found ${cssFiles.length} CSS files to bundle:`);
    cssFiles.forEach(file => console.log(`  - ${file}`));
    
    return cssFiles;
}

// Resolve CSS imports recursively
function resolveCSSImports(cssContent, basePath) {
    const importRegex = /@import\s+['"]([^'"]+)['"];?/g;
    let resolvedContent = cssContent;
    let match;
    
    while ((match = importRegex.exec(cssContent)) !== null) {
        const importPath = match[1];
        const fullImportPath = path.resolve(basePath, importPath);
        
        if (fs.existsSync(fullImportPath)) {
            const importedContent = fs.readFileSync(fullImportPath, 'utf8');
            const importedBasePath = path.dirname(fullImportPath);
            
            // Recursively resolve imports in the imported file
            const resolvedImportedContent = resolveCSSImports(importedContent, importedBasePath);
            
            // Replace the @import statement with the actual content
            resolvedContent = resolvedContent.replace(match[0], `\n/* === Imported from ${importPath} === */\n${resolvedImportedContent}\n/* === End import ${importPath} === */\n`);
        } else {
            console.warn(`Warning: Import file not found: ${fullImportPath}`);
        }
    }
    
    return resolvedContent;
}

// Bundle all CSS files
function bundleCSS() {
    const cssFiles = extractCSSFiles();
    let bundledContent = `/**
 * Bundled CSS for PWA Performance Optimization
 * Generated on: ${new Date().toISOString()}
 * 
 * This file contains all CSS styles consolidated into a single file
 * to reduce HTTP requests and improve loading performance.
 */

`;

    const processedFiles = new Set();
    
    for (const cssFile of cssFiles) {
        const cssPath = path.join(__dirname, 'public', cssFile);
        
        if (fs.existsSync(cssPath) && !processedFiles.has(cssPath)) {
            console.log(`Processing: ${cssFile}`);
            
            try {
                let cssContent = fs.readFileSync(cssPath, 'utf8');
                const basePath = path.dirname(cssPath);
                
                // Resolve any @import statements
                cssContent = resolveCSSImports(cssContent, basePath);
                
                // Add file header comment
                bundledContent += `\n/* ========================================== */\n`;
                bundledContent += `/* File: ${cssFile} */\n`;
                bundledContent += `/* ========================================== */\n\n`;
                
                // Add the CSS content
                bundledContent += cssContent;
                bundledContent += '\n\n';
                
                processedFiles.add(cssPath);
            } catch (error) {
                console.error(`Error processing ${cssFile}:`, error.message);
            }
        } else if (!fs.existsSync(cssPath)) {
            console.warn(`Warning: CSS file not found: ${cssPath}`);
        }
    }
    
    // Write the bundled CSS
    const outputPath = path.join(__dirname, 'public', 'css', 'bundle.css');
    fs.writeFileSync(outputPath, bundledContent, 'utf8');
    
    console.log(`\nCSS bundle created successfully!`);
    console.log(`Output: ${outputPath}`);
    console.log(`Total files processed: ${processedFiles.size}`);
    console.log(`Bundle size: ${(bundledContent.length / 1024).toFixed(2)} KB`);
    
    return outputPath;
}

// Main execution
if (require.main === module) {
    try {
        bundleCSS();
        console.log('\n✅ CSS bundling completed successfully!');
    } catch (error) {
        console.error('\n❌ CSS bundling failed:', error.message);
        process.exit(1);
    }
}

module.exports = { bundleCSS, extractCSSFiles };
