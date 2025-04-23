// Import the Google Cloud Vision library
const vision = require('@google-cloud/vision');

// Create a client
// Option 1: Using environment variable (recommended)
const client = new vision.ImageAnnotatorClient();

// Option 2: Explicitly providing credentials
// const client = new vision.ImageAnnotatorClient({
//   keyFilename: './path/to/your-project-credentials.json'
// });

// Function to detect text in an image
async function detectText(filePath) {
  try {
    // Performs text detection on the local file
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;
    console.log('Text:');
    console.log(detections[0].description);

    // Print individual text elements
    console.log('\nDetailed text elements:');
    detections.slice(1).forEach(text => {
      console.log(`- "${text.description}"`);
    });

    return detections;
  } catch (error) {
    console.error('Error detecting text:', error);
    throw error;
  }
}

// Function to detect labels in an image
async function detectLabels(filePath) {
  try {
    // Performs label detection on the local file
    const [result] = await client.labelDetection(filePath);
    const labels = result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => {
      console.log(`- ${label.description} (${Math.round(label.score * 100)}% confidence)`);
    });

    return labels;
  } catch (error) {
    console.error('Error detecting labels:', error);
    throw error;
  }
}

// Main function to run the example
async function main() {
  // Use a test image from your uploads folder if it exists, or specify your own path
  const imagePath = './uploads/progress_photos/test.jpg';
  // If the above path doesn't exist, replace it with the path to an actual image on your system

  console.log(`Analyzing image: ${imagePath}`);
  console.log('----------------------------------------');

  try {
    // Detect text
    console.log('\n=== TEXT DETECTION ===');
    await detectText(imagePath);

    // Detect labels
    console.log('\n=== LABEL DETECTION ===');
    await detectLabels(imagePath);

    console.log('\nAnalysis complete!');
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

// Run the example
main();
