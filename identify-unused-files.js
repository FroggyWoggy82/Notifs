/**
 * Identify Unused Files
 * 
 * This script identifies JavaScript and CSS files that are not referenced
 * in any HTML files and are likely unused.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    // Directories to scan for HTML files
    htmlDirectories: [
        path.join(__dirname, 'public'),
        path.join(__dirname, 'public', 'pages')
    ],
    
    // Directories to scan for JavaScript and CSS files
    assetDirectories: [
        path.join(__dirname, 'public', 'js'),
        path.join(__dirname, 'public', 'js', 'food'),
        path.join(__dirname, 'public', 'css')
    ],
    
    // File extensions to consider
    htmlExtensions: ['.html'],
    assetExtensions: ['.js', '.css'],
    
    // Files to exclude from the analysis
    excludeFiles: [
        'console-log-suppressor.js',
        'console-log-helper.js',
        'remove-deprecated-code.js',
        'clean-food-html.js',
        'identify-unused-files.js'
    ],
    
    // Output file for the list of unused files
    outputFile: path.join(__dirname, 'unused-files.txt'),
    
    // Whether to include the file content in the output
    includeContent: true,
    
    // Maximum number of lines to include from each file
    maxLines: 10
};

// Set of files referenced in HTML files
const referencedFiles = new Set();

// Set of files that exist in the project
const existingFiles = new Map(); // Map of file path to file size

/**
 * Scan HTML files to find referenced JavaScript and CSS files
 */
function scanHtmlFiles() {
    console.log('Scanning HTML files for references...');
    
    let htmlFilesScanned = 0;
    
    // Process each HTML directory
    for (const dir of config.htmlDirectories) {
        const files = findFiles(dir, config.htmlExtensions);
        
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                htmlFilesScanned++;
                
                // Find all script tags
                const scriptRegex = /<script[^>]*src="([^"]*)"[^>]*>\s*<\/script>/g;
                let match;
                
                while ((match = scriptRegex.exec(content)) !== null) {
                    const scriptSrc = match[1];
                    addReferencedFile(scriptSrc);
                }
                
                // Find all link tags
                const linkRegex = /<link[^>]*href="([^"]*)"[^>]*>/g;
                
                while ((match = linkRegex.exec(content)) !== null) {
                    const linkHref = match[1];
                    if (linkHref.endsWith('.css')) {
                        addReferencedFile(linkHref);
                    }
                }
            } catch (error) {
                console.error(`Error reading file ${file}: ${error.message}`);
            }
        }
    }
    
    console.log(`Scanned ${htmlFilesScanned} HTML files and found ${referencedFiles.size} referenced files.`);
}

/**
 * Add a referenced file to the set of referenced files
 */
function addReferencedFile(filePath) {
    // Normalize the file path
    let normalizedPath = filePath.replace(/\\/g, '/');
    
    // Remove leading path segments if present
    if (normalizedPath.startsWith('../')) {
        normalizedPath = normalizedPath.replace(/^\.\.\//, '');
    }
    
    // Add the file to the set of referenced files
    referencedFiles.add(normalizedPath);
}

/**
 * Scan asset directories to find all JavaScript and CSS files
 */
function scanAssetDirectories() {
    console.log('Scanning asset directories for files...');
    
    let assetFilesFound = 0;
    
    // Process each asset directory
    for (const dir of config.assetDirectories) {
        const files = findFiles(dir, config.assetExtensions);
        
        for (const file of files) {
            try {
                // Skip excluded files
                const fileName = path.basename(file);
                if (config.excludeFiles.includes(fileName)) {
                    continue;
                }
                
                // Get the file size
                const stats = fs.statSync(file);
                const fileSize = stats.size;
                
                // Normalize the file path
                const normalizedPath = path.relative(__dirname, file).replace(/\\/g, '/');
                
                // Add the file to the map of existing files
                existingFiles.set(normalizedPath, fileSize);
                assetFilesFound++;
            } catch (error) {
                console.error(`Error processing file ${file}: ${error.message}`);
            }
        }
    }
    
    console.log(`Found ${assetFilesFound} asset files.`);
}

/**
 * Find files with specific extensions in a directory (recursively)
 */
function findFiles(dir, extensions) {
    const results = [];
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively scan subdirectories
                results.push(...findFiles(fullPath, extensions));
            } else if (entry.isFile()) {
                // Check if the file has a supported extension
                const ext = path.extname(entry.name).toLowerCase();
                if (extensions.includes(ext)) {
                    results.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dir}: ${error.message}`);
    }
    
    return results;
}

/**
 * Identify unused files by comparing referenced files with existing files
 */
function identifyUnusedFiles() {
    console.log('Identifying unused files...');
    
    const unusedFiles = [];
    
    // Find files that exist but are not referenced
    for (const [file, size] of existingFiles.entries()) {
        let isReferenced = false;
        
        // Check if the file is referenced directly
        if (referencedFiles.has(file)) {
            isReferenced = true;
        } else {
            // Check if the file is referenced with a different path
            for (const refFile of referencedFiles) {
                if (file.endsWith(refFile) || refFile.endsWith(file)) {
                    isReferenced = true;
                    break;
                }
            }
        }
        
        // If the file is not referenced, add it to the list of unused files
        if (!isReferenced) {
            unusedFiles.push({ path: file, size });
        }
    }
    
    // Sort unused files by size (largest first)
    unusedFiles.sort((a, b) => b.size - a.size);
    
    console.log(`Found ${unusedFiles.length} unused files.`);
    
    return unusedFiles;
}

/**
 * Get the first few lines of a file
 */
function getFilePreview(filePath, maxLines) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Get the first few lines
        const preview = lines.slice(0, maxLines).join('\n');
        
        return preview;
    } catch (error) {
        return `Error reading file: ${error.message}`;
    }
}

/**
 * Write the list of unused files to a file
 */
function writeUnusedFilesToFile(unusedFiles) {
    console.log(`Writing list of unused files to ${config.outputFile}...`);
    
    try {
        let content = `# Unused Files\n\n`;
        content += `Found ${unusedFiles.length} unused files.\n\n`;
        
        for (const file of unusedFiles) {
            content += `## ${file.path}\n\n`;
            content += `Size: ${formatFileSize(file.size)}\n\n`;
            
            if (config.includeContent) {
                const fullPath = path.join(__dirname, file.path);
                content += '```\n';
                content += getFilePreview(fullPath, config.maxLines);
                content += '\n```\n\n';
            }
        }
        
        fs.writeFileSync(config.outputFile, content, 'utf8');
        console.log(`Wrote list of unused files to ${config.outputFile}.`);
    } catch (error) {
        console.error(`Error writing to ${config.outputFile}: ${error.message}`);
    }
}

/**
 * Format a file size in bytes to a human-readable format
 */
function formatFileSize(size) {
    if (size < 1024) {
        return `${size} bytes`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
}

/**
 * Main function to run the script
 */
function main() {
    console.log('\n=== Identify Unused Files ===\n');
    
    // Scan HTML files to find referenced files
    scanHtmlFiles();
    
    // Scan asset directories to find all JavaScript and CSS files
    scanAssetDirectories();
    
    // Identify unused files
    const unusedFiles = identifyUnusedFiles();
    
    // Write the list of unused files to a file
    writeUnusedFilesToFile(unusedFiles);
    
    console.log('\n=== Done ===\n');
}

// Run the script
main();
