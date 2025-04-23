// Test script for Google Cloud Vision API
const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');

// Check if credentials file exists
const credentialsPath = path.join(__dirname, 'google-vision-credentials.json');
if (!fs.existsSync(credentialsPath)) {
    console.error('Error: Google Vision credentials file not found at:', credentialsPath);
    console.error('Please create a google-vision-credentials.json file with your Google Cloud Vision API credentials.');
    process.exit(1);
}

// Create a client with explicit credentials
const client = new vision.ImageAnnotatorClient({
    keyFilename: credentialsPath
});

// Test function to detect text in an image
async function testTextDetection() {
    try {
        console.log('Testing Google Cloud Vision API text detection...');
        
        // Check if test image exists
        const testImagePath = path.join(__dirname, 'test-image.jpg');
        if (!fs.existsSync(testImagePath)) {
            console.error('Error: Test image not found at:', testImagePath);
            console.error('Please provide a test-image.jpg file in the root directory.');
            process.exit(1);
        }

        // Performs text detection on the local file
        const [result] = await client.textDetection(testImagePath);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            console.log('No text detected in the image.');
            return;
        }

        // The first annotation contains the entire text
        const fullText = detections[0].description;
        console.log('Detected text:');
        console.log(fullText);
        console.log('\nText detection successful!');
    } catch (error) {
        console.error('Error testing text detection:', error);
        process.exit(1);
    }
}

// Run the test
testTextDetection();
