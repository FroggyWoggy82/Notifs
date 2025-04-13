// Test script to check the API endpoint for creating habits
const axios = require('axios');

async function testCreateHabit() {
    try {
        console.log('Testing habit creation API...');
        const testHabit = {
            title: 'Test Habit ' + new Date().toISOString(),
            frequency: 'daily',
            completions_per_day: 1
        };

        console.log('Sending test habit data:', testHabit);

        try {
            const response = await axios.post('http://localhost:3000/api/habits', testHabit, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            const result = response.data;
            console.log('Habit creation successful:', result);
            return true;
        } catch (axiosError) {
            console.error('Error response status:', axiosError.response?.status);
            console.error('Error response data:', axiosError.response?.data);
            console.error('Error message:', axiosError.message);

            if (axiosError.response) {
                console.error('Error details:', axiosError.response.data);
            }

            return false;
        }
    } catch (err) {
        console.error('Habit creation test failed:', err);
        return false;
    }
}

async function runTests() {
    const createOk = await testCreateHabit();
    if (!createOk) {
        console.error('Habit creation failed');
        process.exit(1);
    }

    console.log('All tests passed successfully!');
    process.exit(0);
}

runTests();
