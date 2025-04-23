# Cronometer Nutrition Data Scraper

This module provides a way to scrape nutrition data from Cronometer.com for personal use. It allows you to search for foods, get detailed nutrition information, and export your diary data.

## Important Notice

This scraper is intended for **personal use only** and should be used in accordance with Cronometer's terms of service. Please be respectful of their service and avoid making excessive requests.

## Setup

1. Install the required dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on the `.env.example` template and add your Cronometer credentials:
   ```
   CRONOMETER_USERNAME=your_username
   CRONOMETER_PASSWORD=your_password
   ```

3. Create the necessary directories:
   ```bash
   mkdir -p data uploads
   ```

## Features

### 1. Search for Foods

Search the Cronometer database for foods by name or description.

**Endpoint:** `GET /api/cronometer/search?query=your_search_query`

**Example Response:**
```json
{
  "success": true,
  "source": "cronometer",
  "results": [
    {
      "id": "123456",
      "name": "Apple",
      "brand": "NCCDB"
    },
    {
      "id": "789012",
      "name": "Apple, raw",
      "brand": "USDA"
    }
  ]
}
```

### 2. Get Nutrition Data

Get detailed nutrition information for a specific food.

**Endpoint:** `GET /api/cronometer/food/:id`

**Example Response:**
```json
{
  "success": true,
  "source": "cronometer",
  "food": {
    "id": "123456",
    "name": "Apple",
    "brand": "NCCDB",
    "servingSize": "100g",
    "calories": 52,
    "macronutrients": {
      "protein": 0.3,
      "carbs": 14,
      "fat": 0.2,
      "fiber": 2.4,
      "sugar": 10.4
    },
    "micronutrients": {
      "vitamin c": {
        "value": 4.6,
        "unit": "mg"
      },
      "potassium": {
        "value": 107,
        "unit": "mg"
      }
    }
  }
}
```

### 3. Export Diary Data

Export your diary data for a specific date range.

**Endpoint:** `GET /api/cronometer/export?startDate=2023-01-01&endDate=2023-01-31`

### 4. Process Screenshots (Coming Soon)

Upload or paste screenshots from Cronometer to extract nutrition data.

**Endpoint:** `POST /api/cronometer/process-screenshot`

## Web Interface

A web interface is available at `/cronometer-nutrition` that allows you to:
- Search for foods
- View detailed nutrition information
- Upload or paste screenshots (feature coming soon)

## How It Works

The scraper uses Puppeteer, a headless browser automation library, to:
1. Log in to your Cronometer account
2. Navigate to the appropriate pages
3. Extract the nutrition data
4. Store it in a local database for faster access in the future

## Limitations

- The scraper may break if Cronometer changes their website structure
- Screenshot processing is not yet fully implemented
- The scraper is not optimized for high-volume requests

## Future Improvements

- Implement OCR for processing screenshots
- Add support for custom foods and recipes
- Improve error handling and retry logic
- Add caching to reduce the number of requests to Cronometer

## License

This project is for personal use only. Please respect Cronometer's terms of service.
