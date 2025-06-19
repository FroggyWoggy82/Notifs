// test-simple-upload.js
const fs = require('fs');
const path = require('path');

async function testSimpleUploadEndpoint() {
    try {
        console.log('Testing simple photo upload endpoint...\n');

        // Test if the endpoint is accessible
        const testUrl = 'http://localhost:3000/api/basic/upload';

        console.log(`Testing endpoint: ${testUrl}`);

        // Make a simple GET request to see if the route exists
        const response = await fetch(testUrl, {
            method: 'GET'
        });

        console.log(`Response status: ${response.status}`);

        if (response.status === 404) {
            console.log('❌ Endpoint not found - route may not be registered correctly');
        } else if (response.status === 405) {
            console.log('✅ Endpoint exists (Method Not Allowed is expected for GET request)');
        } else {
            console.log(`ℹ️  Unexpected status: ${response.status}`);
        }

        console.log('\n📝 To test photo upload:');
        console.log('1. Go to http://localhost:3000/pages/workouts.html');
        console.log('2. Click "Add Photo"');
        console.log('3. Select a photo and upload');
        console.log('4. Check that only ONE photo is created (not duplicated)');
        console.log('5. Check that the photo is NOT rotated incorrectly');

    } catch (error) {
        console.error('❌ Error testing endpoint:', error.message);
    }
}

testSimpleUploadEndpoint();
