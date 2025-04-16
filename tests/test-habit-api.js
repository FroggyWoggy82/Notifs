// Simple script to test the habit API
const axios = require('axios');

async function testCreateHabit() {
    try {
        console.log('Testing habit creation API...');
        
        const testHabit = {
            title: 'API Test Habit ' + new Date().toISOString(),
            frequency: 'daily',
            completions_per_day: 1
        };
        
        console.log('Sending test habit data:', testHabit);
        
        const response = await axios.post('http://localhost:3000/api/habits', testHabit);
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        console.log('Habit creation successful!');
        return true;
    } catch (error) {
        console.error('Error creating habit:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        return false;
    }
}

// Run the test
testCreateHabit()
    .then(success => {
        console.log('Test result:', success ? 'SUCCESS' : 'FAILURE');
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('Unexpected error:', err);
        process.exit(1);
    });
