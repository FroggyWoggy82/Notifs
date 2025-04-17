const db = require('../utils/db');

async function updateJournalEntries() {
    try {
        console.log('Connecting to database...');

        // Update the first entry to explicitly state the number 2 is green
        const result1 = await db.query(
            'UPDATE journal_entries SET content = $1, analysis = NULL WHERE id = $2 RETURNING *',
            ['the number 2 is green', 1]
        );

        console.log('Updated entry 1:', JSON.stringify(result1.rows[0], null, 2));

        // Update the third entry to explicitly state the number 2 is green
        const result3 = await db.query(
            'UPDATE journal_entries SET content = $1, analysis = NULL WHERE id = $2 RETURNING *',
            ['the number 2 is green', 3]
        );

        console.log('Updated entry 3:', JSON.stringify(result3.rows[0], null, 2));

        // Now analyze these entries to generate proper analysis
        console.log('Analyzing entries...');

        // Get all entries
        const entries = await db.query('SELECT * FROM journal_entries ORDER BY date DESC');
        console.log('All entries:', JSON.stringify(entries.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

updateJournalEntries();
