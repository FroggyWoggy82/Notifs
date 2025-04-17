const db = require('../utils/db');

async function updateJournal() {
    try {
        console.log('Connecting to database...');
        
        // Update the first entry to explicitly state the number 2 is green
        const result = await db.query(
            'UPDATE journal_entries SET content = $1 WHERE id = $2 RETURNING *',
            ['the number 2 is green', 1]
        );
        
        console.log('Updated entry:', JSON.stringify(result.rows[0], null, 2));
        
        // Also add a new entry that explicitly states the number 2 is green
        const newEntry = await db.query(
            'INSERT INTO journal_entries (date, content, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
            ['2025-04-16', 'just remember the number 2 is green']
        );
        
        console.log('Added new entry:', JSON.stringify(newEntry.rows[0], null, 2));
        
        // Also update the memory file
        const fs = require('fs');
        const path = require('path');
        const MEMORY_FILE = path.join(__dirname, 'memory.json');
        
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
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

updateJournal();
