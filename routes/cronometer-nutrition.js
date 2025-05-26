/**
 * Cronometer Nutrition API Routes
 *
 * This file contains routes for accessing nutrition data from Cronometer.
 * For personal use only, in accordance with Cronometer's terms of service.
 */

const express = require('express');
const router = express.Router();
const CronometerScraper = require('../utils/cronometer-scraper');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cronometer-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Create a scraper instance
let scraper = null;

/**
 * Initialize the scraper
 */
async function initializeScraper() {
    if (!scraper) {
        try {
            scraper = new CronometerScraper({
                headless: process.env.NODE_ENV === 'production',
                slowMo: 50
            });
            await scraper.initialize();
        } catch (error) {
            console.warn('Cronometer scraper initialization failed:', error.message);
            scraper = null;
            throw error;
        }
    }
    return scraper;
}

/**
 * Ensure the scraper is logged in
 */
async function ensureLoggedIn() {
    const scraper = await initializeScraper();

    if (!scraper.isLoggedIn) {
        const username = process.env.CRONOMETER_USERNAME;
        const password = process.env.CRONOMETER_PASSWORD;

        if (!username || !password) {
            throw new Error('Cronometer credentials not found in environment variables');
        }

        const success = await scraper.login(username, password);
        if (!success) {
            throw new Error('Failed to log in to Cronometer');
        }
    }

    return scraper;
}

/**
 * Test endpoint to verify the route is working
 */
router.get('/test', (req, res) => {
    console.log('[Cronometer Nutrition] Test endpoint hit');
    res.json({
        message: 'Cronometer Nutrition API is working!',
        version: '1.0.0'
    });
});

/**
 * Search for foods in Cronometer
 */
router.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            success: false,
            error: 'Search query is required'
        });
    }

    try {
        // First, check the local database
        const scraper = await initializeScraper();
        const localResults = scraper.searchLocalDatabase(query);

        if (localResults.length > 0) {
            return res.json({
                success: true,
                source: 'local',
                results: localResults
            });
        }

        // If no local results, search Cronometer
        await ensureLoggedIn();
        const results = await scraper.searchFood(query);

        res.json({
            success: true,
            source: 'cronometer',
            results: results.map(result => ({
                id: result.id,
                name: result.name,
                brand: result.brand
            }))
        });
    } catch (error) {
        console.error('[Cronometer Nutrition] Search error:', error);

        // Check if this is a Puppeteer-related error
        if (error.message.includes('Puppeteer is not installed')) {
            return res.status(503).json({
                success: false,
                error: 'Cronometer scraping functionality is not available. Puppeteer is not installed.',
                code: 'PUPPETEER_NOT_AVAILABLE'
            });
        }

        res.status(500).json({
            success: false,
            error: `Error searching for foods: ${error.message}`
        });
    }
});

/**
 * Get nutrition data for a specific food
 */
router.get('/food/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Food ID is required'
        });
    }

    try {
        // First, check the local database
        const scraper = await initializeScraper();
        const localFood = scraper.db.foods.find(food => food.id === id);

        if (localFood) {
            return res.json({
                success: true,
                source: 'local',
                food: localFood
            });
        }

        // If not in local database, get from Cronometer
        await ensureLoggedIn();
        const food = await scraper.getFoodNutrition(id);

        if (!food) {
            return res.status(404).json({
                success: false,
                error: `Food with ID ${id} not found`
            });
        }

        res.json({
            success: true,
            source: 'cronometer',
            food
        });
    } catch (error) {
        console.error('[Cronometer Nutrition] Get food error:', error);

        // Check if this is a Puppeteer-related error
        if (error.message.includes('Puppeteer is not installed')) {
            return res.status(503).json({
                success: false,
                error: 'Cronometer scraping functionality is not available. Puppeteer is not installed.',
                code: 'PUPPETEER_NOT_AVAILABLE'
            });
        }

        res.status(500).json({
            success: false,
            error: `Error getting food nutrition: ${error.message}`
        });
    }
});

/**
 * Export diary data from Cronometer
 */
router.get('/export', async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            error: 'Start date and end date are required'
        });
    }

    try {
        await ensureLoggedIn();
        const exportData = await scraper.exportDiaryData(startDate, endDate);

        if (!exportData) {
            return res.status(500).json({
                success: false,
                error: 'Failed to export diary data'
            });
        }

        res.json({
            success: true,
            filePath: path.basename(exportData.filePath),
            data: exportData.data
        });
    } catch (error) {
        console.error('[Cronometer Nutrition] Export error:', error);

        // Check if this is a Puppeteer-related error
        if (error.message.includes('Puppeteer is not installed')) {
            return res.status(503).json({
                success: false,
                error: 'Cronometer scraping functionality is not available. Puppeteer is not installed.',
                code: 'PUPPETEER_NOT_AVAILABLE'
            });
        }

        res.status(500).json({
            success: false,
            error: `Error exporting diary data: ${error.message}`
        });
    }
});

/**
 * Download exported diary data
 */
router.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(dataDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            error: 'File not found'
        });
    }

    res.download(filePath);
});

/**
 * Process a screenshot of Cronometer
 */
router.post('/process-screenshot', upload.single('image'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        console.log(`[Cronometer Nutrition] Processing screenshot: ${req.file.path}`);

        // TODO: Implement OCR or image processing to extract nutrition data from screenshot
        // For now, return a placeholder response

        res.json({
            success: true,
            message: 'Screenshot processing not yet implemented',
            imagePath: req.file.path
        });
    } catch (error) {
        console.error('[Cronometer Nutrition] Screenshot processing error:', error);
        res.status(500).json({
            success: false,
            error: `Error processing screenshot: ${error.message}`
        });
    }
});

module.exports = router;
