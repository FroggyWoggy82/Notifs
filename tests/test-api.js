// test-api.js
// Using dynamic import for node-fetch
import('node-fetch').then(({ default: fetch }) => {

async function testAPI() {
    try {
        console.log('Testing GET /api/exercise-preferences/1');
        const getResponse = await fetch('http://localhost:3000/api/exercise-preferences/1', {
            headers: { 'Accept': 'application/json' }
        });
        console.log('GET Status:', getResponse.status);
        if (getResponse.ok) {
            const getData = await getResponse.json();
            console.log('GET Response:', getData);
        } else {
            console.log('GET Error:', await getResponse.text());
        }

        console.log('\nTesting POST /api/exercise-preferences');
        const postResponse = await fetch('http://localhost:3000/api/exercise-preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                exerciseId: 1,
                weightUnit: 'lbs'
            })
        });
        console.log('POST Status:', postResponse.status);
        if (postResponse.ok) {
            const postData = await postResponse.json();
            console.log('POST Response:', postData);
        } else {
            console.log('POST Error:', await postResponse.text());
        }
    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testAPI();
});
