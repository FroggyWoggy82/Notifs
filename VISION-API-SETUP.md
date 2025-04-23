# Google Cloud Vision API Setup for Nutrition Label OCR

This guide will help you set up and use the Google Cloud Vision API for OCR (Optical Character Recognition) of nutrition labels in your Node.js application.

## Prerequisites

- Node.js installed on your machine
- A Google Cloud account
- npm or yarn package manager

## Step 1: Set Up Your Google Cloud Project

1. **Create a Google Cloud Project** (if you don't already have one):
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Click on "New Project" and follow the prompts

2. **Enable the Cloud Vision API**:
   - In the Cloud Console, navigate to "APIs & Services" > "Library"
   - Search for "Cloud Vision API" and click on it
   - Click "Enable"

3. **Create Service Account Credentials**:
   - Go to "IAM & Admin" > "Service accounts"
   - Click "+ CREATE SERVICE ACCOUNT"
   - Give your service account a name and description
   - Grant it the "Cloud Vision API User" role
   - Click "CREATE KEY" and choose JSON as the key type
   - Download the JSON key file – you'll need it to authenticate your application

## Step 2: Install Required Packages

```bash
npm install @google-cloud/vision express multer
```

## Step 3: Set Up Authentication

You have two options to authenticate your application:

### Option A: Using Environment Variables (Recommended)

Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your JSON key file:

```bash
# On Windows (Command Prompt)
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your-project-credentials.json

# On Windows (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your-project-credentials.json"

# On macOS/Linux
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-project-credentials.json"
```

### Option B: Explicitly Providing Credentials in Code

```javascript
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
  keyFilename: './path/to/your-project-credentials.json'
});
```

## Step 4: Integrate with Your Application

1. **Copy the provided files to your project**:
   - `nutrition-ocr.js`: Core OCR functionality
   - `nutrition-ocr-route.js`: Express routes for handling OCR requests
   - `integrate-vision-api.js`: Example of how to integrate with your Express app
   - `public/nutrition-ocr-test.html`: Test page for the OCR functionality

2. **Update your main Express application** to include the nutrition OCR routes:

```javascript
const nutritionOcrRoutes = require('./nutrition-ocr-route');

// Mount the nutrition OCR routes
app.use('/api/nutrition-ocr', nutritionOcrRoutes);
```

## Step 5: Test the OCR Functionality

1. **Start your Express server**:

```bash
node integrate-vision-api.js
```

2. **Open the test page** in your browser:

```
http://localhost:3000/nutrition-ocr-test.html
```

3. **Upload a nutrition label image** and test the OCR functionality

## API Endpoints

The integration provides two main endpoints:

### 1. File Upload Endpoint

**URL**: `/api/nutrition-ocr/upload`
**Method**: POST
**Content-Type**: multipart/form-data
**Parameter**: `image` (file)

**Response**:
```json
{
  "success": true,
  "file": {
    "filename": "nutrition-1234567890.jpg",
    "path": "uploads/nutrition-labels/nutrition-1234567890.jpg",
    "size": 123456
  },
  "results": {
    "rawText": "...",
    "parsedData": {
      "calories": 120,
      "totalFat": 5,
      ...
    }
  }
}
```

### 2. Base64 Image Data Endpoint

**URL**: `/api/nutrition-ocr/process-base64`
**Method**: POST
**Content-Type**: application/json
**Body**:
```json
{
  "imageData": "base64EncodedImageData..."
}
```

**Response**: Same as the file upload endpoint

## Customizing the OCR Parser

The nutrition label parser in `nutrition-ocr.js` can be customized to better match your specific nutrition label formats:

1. Modify the `parseNutritionText` function to add more nutrient types
2. Adjust the regular expressions to better match your label format
3. Add additional post-processing logic to improve accuracy

## Troubleshooting

1. **Authentication Issues**:
   - Ensure your service account has the correct permissions
   - Verify the path to your credentials file is correct
   - Check that the environment variable is set correctly

2. **OCR Quality Issues**:
   - Ensure the nutrition label image is clear and well-lit
   - Try preprocessing the image (cropping, enhancing contrast)
   - Adjust the parsing logic to better match your label format

3. **API Quota Issues**:
   - Check your Google Cloud Console for quota usage
   - Consider implementing rate limiting for production use

## Production Considerations

1. **Security**:
   - Store your credentials securely (use environment variables or a secret manager)
   - Implement proper authentication for your API endpoints
   - Validate and sanitize all user inputs

2. **Performance**:
   - Consider caching OCR results for frequently scanned products
   - Implement image preprocessing to improve OCR accuracy
   - Use a CDN for serving static files

3. **Cost Management**:
   - Monitor your API usage in the Google Cloud Console
   - Implement rate limiting to prevent abuse
   - Consider batch processing for bulk operations
