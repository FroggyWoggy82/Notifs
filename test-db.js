// Test script to check database connection and insert a habit
console.log('Starting database test script...');
const db = require('./db');
console.log('Database module loaded');

async function testDatabaseConnection() {
    try {
        console.log('Testing database connection...');
        const result = await db.query('SELECT NOW()');
        console.log('Database connection successful:', result.rows[0]);
        return true;
    } catch (err) {
        console.error('Database connection test failed:', err);
        return false;
    }
}

async function testHabitInsertion() {
    try {
        console.log('Testing habit insertion...');
        const testHabit = {
            title: 'Test Habit ' + new Date().toISOString(),
            frequency: 'daily',
            completions_per_day: 1
        };

        console.log('Inserting test habit:', testHabit);

        // First try using the model function
        try {
            console.log('Testing habit insertion using model function...');
            const HabitModel = require('./models/habitModel');
            const habit = await HabitModel.createHabit(testHabit);
            console.log('Habit insertion using model successful:', habit);
        } catch (modelErr) {
            console.error('Habit insertion using model failed:', modelErr);
            console.error('Error stack:', modelErr.stack);
        }

        // Then try direct database insertion
        const result = await db.query(
            'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
            [testHabit.title, testHabit.frequency, testHabit.completions_per_day]
        );

        console.log('Direct habit insertion successful:', result.rows[0]);
        return true;
    } catch (err) {
        console.error('Habit insertion test failed:', err);
        console.error('Error stack:', err.stack);
        return false;
    }
}

async function testHabitTable() {
    try {
        console.log('Checking if habits table exists...');
        const result = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'habits'
            )
        `);

        const tableExists = result.rows[0].exists;
        console.log('Habits table exists:', tableExists);

        if (tableExists) {
            // Check table structure
            const tableInfo = await db.query(`
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'habits'
            `);

            console.log('Habits table structure:');
            tableInfo.rows.forEach(col => {
                console.log(`- ${col.column_name}: ${col.data_type}`);
            });
        } else {
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

        return true;
    } catch (err) {
        console.error('Error checking/creating habits table:', err);
        return false;
    }
}

async function runTests() {
    const connectionOk = await testDatabaseConnection();
    if (!connectionOk) {
        console.error('Database connection failed, aborting tests');
        process.exit(1);
    }

    const tableOk = await testHabitTable();
    if (!tableOk) {
        console.error('Habits table check/creation failed, aborting tests');
        process.exit(1);
    }

    const insertionOk = await testHabitInsertion();
    if (!insertionOk) {
        console.error('Habit insertion failed');
        process.exit(1);
    }

    console.log('All tests passed successfully!');
    process.exit(0);
}

runTests();
