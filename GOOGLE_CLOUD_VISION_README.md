# Google Cloud Vision OCR Integration

This project now uses Google Cloud Vision AI for improved OCR accuracy in the nutrition scanning feature.

## Setup

To use Google Cloud Vision, you need to:

1. Create a Google Cloud Platform (GCP) account if you don't have one
2. Create a new project in GCP
3. Enable the Cloud Vision API for your project
4. Create a service account and download the JSON key file
5. Set up authentication

## Authentication

There are two ways to authenticate with Google Cloud Vision:

### Option 1: Environment Variable (Recommended)

1. Download the service account key JSON file from GCP
2. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your JSON key file:

```bash
# For Windows
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your-project-credentials.json

# For Linux/Mac
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-project-credentials.json
```

### Option 2: Explicit Authentication in Code

If you prefer not to use environment variables, you can modify the `vision-ocr.js` file to explicitly authenticate:

```javascript
// In vision-ocr.js
const client = new ImageAnnotatorClient({
  keyFilename: '/path/to/your-project-credentials.json'
});
```

## Usage

The nutrition scanning feature now automatically uses Google Cloud Vision for all OCR processing. No additional configuration is needed in the frontend.

When adding ingredients, simply:

1. Click the "Scan Nutrition Label" button
2. Upload or paste a nutrition label image
3. The system will use Google Cloud Vision to extract the nutrition information

## Troubleshooting

If you encounter issues with the OCR functionality:

1. **Check Authentication**: Make sure your credentials are correctly set up
2. **API Quota**: Check if you've exceeded your Google Cloud Vision API quota
3. **Image Quality**: Ensure the nutrition label image is clear and well-lit
4. **Manual Entry**: If OCR fails, you can always enter the nutrition information manually

## Pricing

Google Cloud Vision API has a free tier that includes 1,000 units per month. After that, pricing is based on usage. Check the [Google Cloud Vision pricing page](https://cloud.google.com/vision/pricing) for current rates.

## Additional Resources

- [Google Cloud Vision Documentation](https://cloud.google.com/vision/docs)
- [Setting up Authentication](https://cloud.google.com/docs/authentication/getting-started)
- [Vision API Reference](https://cloud.google.com/vision/docs/reference/rest)
