const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'memory.json');

async function addGreenMemory() {
    try {
        console.log('Reading memory file...');
        
        let memory = { entries: [] };
        if (fs.existsSync(MEMORY_FILE)) {
            const data = fs.readFileSync(MEMORY_FILE, 'utf8');
            memory = JSON.parse(data);
        }
        
        // Add explicit entry about number 2 being green
        memory.entries.push({
            date: new Date().toISOString(),
            text: 'the number 2 is green',
            summary: 'The user has explicitly stated that the number 2 is green.'
        });
        
        fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
        console.log('Updated memory file with explicit entry about number 2 being green');
        
        // Print the last 5 entries
        console.log('Last 5 entries:');
        const lastEntries = memory.entries.slice(-5);
        lastEntries.forEach((entry, index) => {
            console.log(`\nEntry ${index + 1}:`);
            console.log(`Date: ${entry.date}`);
            console.log(`Text: ${entry.text}`);
            console.log(`Summary: ${entry.summary}`);
        });
        
    } catch (err) {
        console.error('Error:', err);
    }
}

addGreenMemory();
