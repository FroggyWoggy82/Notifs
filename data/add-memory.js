const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'memory.json');

try {
    let memory = { entries: [] };
    
    if (fs.existsSync(MEMORY_FILE)) {
        const data = fs.readFileSync(MEMORY_FILE, 'utf8');
        memory = JSON.parse(data);
    }
    
    // Add the entry about the number 2 being green
    memory.entries.push({
        date: new Date().toISOString(),
        text: "just remember the number 2 its green.",
        summary: "The user noted that the number 2 is green, providing a specific color association."
    });
    
    // Save the updated memory
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
    console.log('Memory entry added successfully!');
    
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
