const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'memory.json');

try {
    let memory = { entries: [] };
    
    if (fs.existsSync(MEMORY_FILE)) {
        const data = fs.readFileSync(MEMORY_FILE, 'utf8');
        memory = JSON.parse(data);
    }
    
    // Find and update the entry about the number 2 being green
    let foundGreenEntry = false;
    for (let i = 0; i < memory.entries.length; i++) {
        if (memory.entries[i].text.includes("number 2") && memory.entries[i].text.includes("green")) {
            memory.entries[i].text = "The number 2 is green.";
            memory.entries[i].summary = "The user has explicitly stated that the number 2 is green.";
            foundGreenEntry = true;
            console.log("Updated existing entry about number 2 being green");
            break;
        }
    }
    
    // If no entry found, add a new one
    if (!foundGreenEntry) {
        memory.entries.push({
            date: new Date().toISOString(),
            text: "The number 2 is green.",
            summary: "The user has explicitly stated that the number 2 is green."
        });
        console.log("Added new entry about number 2 being green");
    }
    
    // Save the updated memory
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
    console.log('Memory file updated successfully!');
    
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
