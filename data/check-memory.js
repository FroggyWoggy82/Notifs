const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'memory.json');

try {
    if (fs.existsSync(MEMORY_FILE)) {
        const data = fs.readFileSync(MEMORY_FILE, 'utf8');
        const memory = JSON.parse(data);
        console.log('Memory entries found:', memory.entries.length);
        console.log('Last 5 entries:');
        memory.entries.slice(-5).forEach((entry, index) => {
            console.log(`\nEntry ${index + 1}:`);
            console.log(`Date: ${entry.date}`);
            console.log(`Text: ${entry.text}`);
            console.log(`Summary: ${entry.summary}`);
        });
    } else {
        console.log('Memory file does not exist at:', MEMORY_FILE);
    }
} catch (error) {
    console.error('Error reading memory file:', error);
}
