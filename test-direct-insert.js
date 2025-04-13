// Test script to directly insert a habit into the database
const db = require('./db');

async function directInsertHabit() {
    try {
        console.log('Testing direct habit insertion...');
        const testHabit = {
            title: 'Direct Insert Test ' + new Date().toISOString(),
            frequency: 'daily',
            completions_per_day: 1
        };
        
        console.log('Inserting test habit:', testHabit);
        
        // First check if the habits table exists
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'habits'
            )
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        console.log('Habits table exists:', tableExists);
        
        if (!tableExists) {
            console.log('Creating habits table...');
            await db.query(`
                CREATE TABLE habits (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
                    completions_per_day INTEGER NOT NULL DEFAULT 1,
                    total_completions INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                )
            `);
            console.log('Habits table created successfully');
        }
        
        // Now insert the habit
        const result = await db.query(
            'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
            [testHabit.title, testHabit.frequency, testHabit.completions_per_day]
        );
        
        console.log('Habit insertion successful:', result.rows[0]);
        return true;
    } catch (err) {
        console.error('Direct habit insertion failed:', err);
        console.error('Error stack:', err.stack);
        return false;
    }
}

async function runTest() {
    const insertOk = await directInsertHabit();
    if (!insertOk) {
        console.error('Direct habit insertion failed');
        process.exit(1);
    }
    
    console.log('Test passed successfully!');
    process.exit(0);
}

runTest();
