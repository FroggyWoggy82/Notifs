// Test script to diagnose habit creation issues
const axios = require('axios');
const db = require('./db');

// Test creating a habit directly through the API
async function testHabitCreationAPI() {
    try {
        console.log('Testing habit creation through API...');
        const testHabit = {
            title: 'API Test Habit ' + new Date().toISOString(),
            frequency: 'daily',
            completions_per_day: 1
        };
        
        console.log('Sending test habit data:', testHabit);
        
        const response = await axios.post('http://localhost:3000/api/habits', testHabit, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        return true;
    } catch (error) {
        console.error('Error creating habit through API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        return false;
    }
}

// Test creating a habit directly through the model
async function testHabitCreationModel() {
    try {
        console.log('Testing habit creation through model...');
        const HabitModel = require('./models/habitModel');
        
        const testHabit = {
            title: 'Model Test Habit ' + new Date().toISOString(),
            frequency: 'daily',
            completions_per_day: 1
        };
        
        console.log('Creating test habit:', testHabit);
        
        const habit = await HabitModel.createHabit(testHabit);
        console.log('Habit created successfully:', habit);
        
        return true;
    } catch (error) {
        console.error('Error creating habit through model:', error.message);
        console.error('Error stack:', error.stack);
        return false;
    }
}

// Test creating a habit directly through SQL
async function testHabitCreationSQL() {
    try {
        console.log('Testing habit creation through SQL...');
        
        const testHabit = {
            title: 'SQL Test Habit ' + new Date().toISOString(),
            frequency: 'daily',
            completions_per_day: 1
        };
        
        console.log('Creating test habit:', testHabit);
        
        // Check if the habits table exists
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
        
        // Insert the habit
        const result = await db.query(
            'INSERT INTO habits (title, frequency, completions_per_day) VALUES ($1, $2, $3) RETURNING *',
            [testHabit.title, testHabit.frequency, testHabit.completions_per_day]
        );
        
        console.log('Habit created successfully:', result.rows[0]);
        
        return true;
    } catch (error) {
        console.error('Error creating habit through SQL:', error.message);
        console.error('Error stack:', error.stack);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('=== STARTING HABIT CREATION TESTS ===');
    
    console.log('\n=== TEST 1: SQL DIRECT INSERTION ===');
    const sqlResult = await testHabitCreationSQL();
    console.log('SQL test result:', sqlResult ? 'SUCCESS' : 'FAILURE');
    
    console.log('\n=== TEST 2: MODEL CREATION ===');
    const modelResult = await testHabitCreationModel();
    console.log('Model test result:', modelResult ? 'SUCCESS' : 'FAILURE');
    
    console.log('\n=== TEST 3: API CREATION ===');
    const apiResult = await testHabitCreationAPI();
    console.log('API test result:', apiResult ? 'SUCCESS' : 'FAILURE');
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('SQL Direct Insertion:', sqlResult ? 'SUCCESS' : 'FAILURE');
    console.log('Model Creation:', modelResult ? 'SUCCESS' : 'FAILURE');
    console.log('API Creation:', apiResult ? 'SUCCESS' : 'FAILURE');
    
    if (sqlResult && !modelResult) {
        console.log('\nDiagnosis: Issue is in the model layer');
    } else if (modelResult && !apiResult) {
        console.log('\nDiagnosis: Issue is in the API/route layer');
    } else if (!sqlResult) {
        console.log('\nDiagnosis: Issue is in the database connection or schema');
    }
    
    process.exit(0);
}

runTests();
