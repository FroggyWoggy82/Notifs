/**
 * Cross-platform postinstall script
 * This script handles the installation of Sharp and other dependencies
 * in a way that works on both Windows and Unix-based systems
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running postinstall script...');

// Create necessary directories
const dirs = [
  path.join(__dirname, '../public/uploads'),
  path.join(__dirname, '../public/uploads/progress_photos')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Try to rebuild Sharp
try {
  console.log('Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  
  // Remove Sharp in a cross-platform way
  const sharpDir = path.join(__dirname, '../node_modules/sharp');
  if (fs.existsSync(sharpDir)) {
    console.log('Removing existing Sharp installation...');
    fs.rmSync(sharpDir, { recursive: true, force: true });
  }
  
  // Reinstall Sharp
  console.log('Reinstalling Sharp...');
  execSync('npm install sharp --ignore-scripts=false --build-from-source=sharp', { stdio: 'inherit' });
  
  console.log('Sharp reinstalled successfully');
} catch (error) {
  console.error('Error reinstalling Sharp:', error.message);
  console.log('Continuing with installation despite Sharp rebuild failure...');
}

console.log('Postinstall script completed');
