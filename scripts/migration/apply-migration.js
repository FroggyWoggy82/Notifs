/**
 * Wrapper script for apply-migration.js
 * 
 * This script has been moved to migrations/apply-migration.js
 * This wrapper is provided for backward compatibility.
 */

console.log('This script has been moved to migrations/apply-migration.js');
console.log('Running from new location...\n');

// Run the script from its new location
require('./migrations/apply-migration.js');
