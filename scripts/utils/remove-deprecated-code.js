/**
 * Remove Deprecated Code
 * 
 * This script identifies and removes commented-out code and unused files
 * from the project to improve code readability and reduce file sizes.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    // Directories to scan
    directories: [
        path.join(__dirname, 'public', 'pages'),
        path.join(__dirname, 'public', 'js'),
        path.join(__dirname, 'public', 'js', 'food'),
        path.join(__dirname, 'public', 'css')
    ],
    
    // File extensions to process
    extensions: ['.html', '.js', '.css'],
    
    // Files to skip (these files are important and should not be modified)
    skipFiles: [
        'console-log-suppressor.js',
        'console-log-helper.js',
        'remove-deprecated-code.js'
    ],
    
    // Patterns to identify commented-out code
    commentPatterns: [
        // HTML comments
        {
            start: '<!-- ',
            end: ' -->',
            regex: /<!--\s*(.*?)\s*-->/g,
            fileTypes: ['.html']
        },
        // JavaScript/CSS single-line comments
        {
            regex: /^\s*\/\/.*$/gm,
            fileTypes: ['.js', '.css']
        },
        // JavaScript/CSS multi-line comments
        {
            start: '/*',
            end: '*/',
            regex: /\/\*[\s\S]*?\*\//g,
            fileTypes: ['.js', '.css']
        }
    ],
    
    // Patterns for commented-out script and link tags
    commentedScriptPattern: /<!--\s*<script[^>]*src="([^"]*)"[^>]*>\s*<\/script>\s*-->/g,
    commentedLinkPattern: /<!--\s*<link[^>]*href="([^"]*)"[^>]*>\s*-->/g,
    
    // Patterns for commented-out code blocks
    commentedCodeBlockPattern: /\/\*[\s\S]*?\*\//g,
    commentedLinePattern: /^\s*\/\/.*$/gm,
    
    // Dry run mode (set to true to see what would be changed without making changes)
    dryRun: false,
    
    // Backup files before modifying them
    createBackups: true,
    
    // Log level (1 = minimal, 2 = normal, 3 = verbose)
    logLevel: 2
};

// Statistics
const stats = {
    filesScanned: 0,
    filesModified: 0,
    commentedOutScriptsRemoved: 0,
    commentedOutLinksRemoved: 0,
    commentedOutCodeBlocksRemoved: 0,
    commentedOutLinesRemoved: 0,
    unusedFilesIdentified: 0,
    unusedFilesRemoved: 0,
    backupsCreated: 0
};

// Set of files referenced in HTML files
const referencedFiles = new Set();

// Set of files that exist in the project
const existingFiles = new Set();

/**
 * Log a message based on the current log level
 */
function log(message, level = 2) {
    if (level <= config.logLevel) {
        console.log(message);
    }
}

/**
 * Create a backup of a file before modifying it
 */
function createBackup(filePath) {
    if (!config.createBackups) return;
    
    const backupPath = `${filePath}.bak`;
    try {
        fs.copyFileSync(filePath, backupPath);
        stats.backupsCreated++;
        log(`Created backup: ${backupPath}`, 3);
    } catch (error) {
        log(`Error creating backup for ${filePath}: ${error.message}`, 1);
    }
}

/**
 * Process an HTML file to remove commented-out script and link tags
 */
function processHtmlFile(filePath, content) {
    let modified = false;
    let newContent = content;
    
    // Find all script tags (both commented and uncommented)
    const scriptRegex = /<script[^>]*src="([^"]*)"[^>]*>\s*<\/script>/g;
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
        const scriptSrc = match[1];
        referencedFiles.add(scriptSrc);
    }
    
    // Find all link tags (both commented and uncommented)
    const linkRegex = /<link[^>]*href="([^"]*)"[^>]*>/g;
    while ((match = linkRegex.exec(content)) !== null) {
        const linkHref = match[1];
        referencedFiles.add(linkHref);
    }
    
    // Remove commented-out script tags
    let commentedScriptCount = 0;
    newContent = newContent.replace(config.commentedScriptPattern, (match, scriptSrc) => {
        commentedScriptCount++;
        log(`Found commented-out script: ${scriptSrc}`, 3);
        return '';
    });
    
    // Remove commented-out link tags
    let commentedLinkCount = 0;
    newContent = newContent.replace(config.commentedLinkPattern, (match, linkHref) => {
        commentedLinkCount++;
        log(`Found commented-out link: ${linkHref}`, 3);
        return '';
    });
    
    // Update statistics
    stats.commentedOutScriptsRemoved += commentedScriptCount;
    stats.commentedOutLinksRemoved += commentedLinkCount;
    
    // Check if the content was modified
    if (newContent !== content) {
        modified = true;
        log(`Removed ${commentedScriptCount} commented-out scripts and ${commentedLinkCount} commented-out links from ${filePath}`, 2);
    }
    
    return { content: newContent, modified };
}

/**
 * Process a JavaScript or CSS file to remove commented-out code
 */
function processJsOrCssFile(filePath, content) {
    let modified = false;
    let newContent = content;
    
    // Remove commented-out code blocks
    let commentedCodeBlockCount = 0;
    newContent = newContent.replace(config.commentedCodeBlockPattern, (match) => {
        // Don't remove JSDoc comments or license headers
        if (match.includes('* @') || match.includes('* Copyright') || match.includes('* License')) {
            return match;
        }
        
        // Don't remove the first comment block if it's a file header
        if (commentedCodeBlockCount === 0 && match.includes('/**') && (match.includes(' * ') || match.includes(' *\n'))) {
            return match;
        }
        
        commentedCodeBlockCount++;
        log(`Found commented-out code block in ${filePath}`, 3);
        return '';
    });
    
    // Remove commented-out lines
    let commentedLineCount = 0;
    newContent = newContent.replace(config.commentedLinePattern, (match) => {
        // Don't remove certain types of comments
        if (match.includes('TODO') || match.includes('FIXME') || match.includes('NOTE') || match.includes('HACK')) {
            return match;
        }
        
        commentedLineCount++;
        log(`Found commented-out line in ${filePath}`, 3);
        return '';
    });
    
    // Update statistics
    stats.commentedOutCodeBlocksRemoved += commentedCodeBlockCount;
    stats.commentedOutLinesRemoved += commentedLineCount;
    
    // Check if the content was modified
    if (newContent !== content) {
        modified = true;
        log(`Removed ${commentedCodeBlockCount} commented-out code blocks and ${commentedLineCount} commented-out lines from ${filePath}`, 2);
    }
    
    return { content: newContent, modified };
}

/**
 * Process a file to remove commented-out code
 */
function processFile(filePath) {
    // Skip files in the skip list
    const fileName = path.basename(filePath);
    if (config.skipFiles.includes(fileName)) {
        log(`Skipping file: ${filePath}`, 3);
        return;
    }
    
    try {
        // Read the file content
        const content = fs.readFileSync(filePath, 'utf8');
        stats.filesScanned++;
        
        // Process the file based on its extension
        const ext = path.extname(filePath).toLowerCase();
        let result;
        
        if (ext === '.html') {
            result = processHtmlFile(filePath, content);
        } else if (ext === '.js' || ext === '.css') {
            result = processJsOrCssFile(filePath, content);
        } else {
            log(`Skipping unsupported file type: ${filePath}`, 3);
            return;
        }
        
        // Write the modified content back to the file
        if (result.modified && !config.dryRun) {
            createBackup(filePath);
            fs.writeFileSync(filePath, result.content, 'utf8');
            stats.filesModified++;
            log(`Modified file: ${filePath}`, 2);
        }
    } catch (error) {
        log(`Error processing file ${filePath}: ${error.message}`, 1);
    }
}

/**
 * Scan a directory for files to process
 */
function scanDirectory(dirPath) {
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively scan subdirectories
                scanDirectory(fullPath);
            } else if (entry.isFile()) {
                // Check if the file has a supported extension
                const ext = path.extname(entry.name).toLowerCase();
                if (config.extensions.includes(ext)) {
                    // Add the file to the set of existing files
                    const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
                    existingFiles.add(relativePath);
                    
                    // Process the file
                    processFile(fullPath);
                }
            }
        }
    } catch (error) {
        log(`Error scanning directory ${dirPath}: ${error.message}`, 1);
    }
}

/**
 * Identify unused files by comparing referenced files with existing files
 */
function identifyUnusedFiles() {
    const unusedFiles = [];
    
    // Convert sets to arrays for easier manipulation
    const referencedFilesArray = Array.from(referencedFiles);
    const existingFilesArray = Array.from(existingFiles);
    
    // Find files that exist but are not referenced
    for (const file of existingFilesArray) {
        // Skip files that are not CSS or JS
        const ext = path.extname(file).toLowerCase();
        if (ext !== '.css' && ext !== '.js') continue;
        
        // Check if the file is referenced
        let isReferenced = false;
        for (const refFile of referencedFilesArray) {
            if (refFile.includes(file) || file.includes(refFile)) {
                isReferenced = true;
                break;
            }
        }
        
        // If the file is not referenced, add it to the list of unused files
        if (!isReferenced) {
            unusedFiles.push(file);
        }
    }
    
    // Update statistics
    stats.unusedFilesIdentified = unusedFiles.length;
    
    // Log the unused files
    if (unusedFiles.length > 0) {
        log(`\nFound ${unusedFiles.length} potentially unused files:`, 1);
        unusedFiles.forEach(file => log(`  ${file}`, 1));
    } else {
        log('\nNo unused files found.', 1);
    }
    
    return unusedFiles;
}

/**
 * Main function to run the script
 */
function main() {
    log('\n=== Remove Deprecated Code ===\n', 1);
    
    // Log the configuration
    log(`Mode: ${config.dryRun ? 'Dry Run' : 'Live Run'}`, 1);
    log(`Create Backups: ${config.createBackups ? 'Yes' : 'No'}`, 1);
    log(`Log Level: ${config.logLevel}`, 1);
    log('', 1);
    
    // Scan directories
    log('Scanning directories...', 1);
    for (const dir of config.directories) {
        log(`Scanning ${dir}...`, 2);
        scanDirectory(dir);
    }
    
    // Identify unused files
    log('\nIdentifying unused files...', 1);
    const unusedFiles = identifyUnusedFiles();
    
    // Log statistics
    log('\n=== Statistics ===', 1);
    log(`Files Scanned: ${stats.filesScanned}`, 1);
    log(`Files Modified: ${stats.filesModified}`, 1);
    log(`Commented-Out Scripts Removed: ${stats.commentedOutScriptsRemoved}`, 1);
    log(`Commented-Out Links Removed: ${stats.commentedOutLinksRemoved}`, 1);
    log(`Commented-Out Code Blocks Removed: ${stats.commentedOutCodeBlocksRemoved}`, 1);
    log(`Commented-Out Lines Removed: ${stats.commentedOutLinesRemoved}`, 1);
    log(`Unused Files Identified: ${stats.unusedFilesIdentified}`, 1);
    log(`Backups Created: ${stats.backupsCreated}`, 1);
    
    log('\n=== Done ===\n', 1);
}

// Run the script
main();
