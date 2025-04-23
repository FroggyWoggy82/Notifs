const https = require('https');
const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
const dir = path.join(__dirname, 'uploads', 'progress_photos');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// URL of a sample nutrition label image
const imageUrl = 'https://www.fda.gov/files/food/published/Nutrition-Facts-Label-Graphic-1.jpg';
const filePath = path.join(dir, 'test-nutrition-label.jpg');

console.log(`Downloading sample nutrition label image to: ${filePath}`);

// Download the image
https.get(imageUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download image: ${response.statusCode} ${response.statusMessage}`);
    return;
  }
  
  const fileStream = fs.createWriteStream(filePath);
  response.pipe(fileStream);
  
  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Download completed!');
    console.log('You can now run the vision-test.js script with this image.');
  });
}).on('error', (err) => {
  console.error(`Error downloading image: ${err.message}`);
});
