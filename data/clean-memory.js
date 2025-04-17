const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'memory.json');

try {
    let memory = { entries: [] };
    
    if (fs.existsSync(MEMORY_FILE)) {
        const data = fs.readFileSync(MEMORY_FILE, 'utf8');
        memory = JSON.parse(data);
    }
    
    // Remove the explicit entries we added
    memory.entries = memory.entries.filter(entry => {
        return !(entry.text === "The number 2 is green." || 
                entry.text === "I have 2 water bottles besides my desk.");
    });
    
    // Save the updated memory
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
    console.log('Memory file cleaned successfully!');
    
    // Display the updated memory
    console.log('Memory entries found:', memory.entries.length);
    console.log('Last 5 entries:');
    memory.entries.slice(-5).forEach((entry, index) => {
        console.log(`\nEntry ${index + 1}:`);
        console.log(`Date: ${entry.date}`);
        console.log(`Text: ${entry.text}`);
        console.log(`Summary: ${entry.summary}`);
    });
} catch (error) {
    console.error('Error updating memory file:', error);
}
