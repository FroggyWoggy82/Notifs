/**
 * Cronometer Scraper
 *
 * A utility for scraping nutrition data from Cronometer.com for personal use.
 * This is intended for personal projects only and should be used in accordance
 * with Cronometer's terms of service.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Optional Puppeteer import - gracefully handle if not installed
let puppeteer;
try {
    puppeteer = require('puppeteer');
} catch (error) {
    console.warn('Puppeteer not installed. Cronometer scraping functionality will be disabled.');
    puppeteer = null;
}

// Local database to store nutrition data
const NUTRITION_DB_PATH = path.join(__dirname, '../data/nutrition-db.json');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize the nutrition database if it doesn't exist
if (!fs.existsSync(NUTRITION_DB_PATH)) {
    fs.writeFileSync(NUTRITION_DB_PATH, JSON.stringify({
        foods: [],
        lastUpdated: new Date().toISOString()
    }));
}

/**
 * CronometerScraper class for interacting with Cronometer.com
 */
class CronometerScraper {
    constructor(options = {}) {
        this.options = {
            headless: true,
            slowMo: 100,
            timeout: 30000,
            ...options
        };
        this.browser = null;
        this.page = null;
        this.isLoggedIn = false;
        this.db = this.loadDatabase();
    }

    /**
     * Load the local nutrition database
     * @returns {Object} The nutrition database
     */
    loadDatabase() {
        try {
            const data = fs.readFileSync(NUTRITION_DB_PATH, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading nutrition database:', error);
            return { foods: [], lastUpdated: new Date().toISOString() };
        }
    }

    /**
     * Save the nutrition database
     */
    saveDatabase() {
        try {
            this.db.lastUpdated = new Date().toISOString();
            fs.writeFileSync(NUTRITION_DB_PATH, JSON.stringify(this.db, null, 2));
        } catch (error) {
            console.error('Error saving nutrition database:', error);
        }
    }

    /**
     * Initialize the browser and page
     */
    async initialize() {
        if (!puppeteer) {
            throw new Error('Puppeteer is not installed. Please install puppeteer to use Cronometer scraping functionality.');
        }

        try {
            this.browser = await puppeteer.launch({
                headless: this.options.headless ? 'new' : false,
                slowMo: this.options.slowMo,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1280, height: 800 });
            await this.page.setDefaultNavigationTimeout(this.options.timeout);

            // Set up request interception for better performance
            await this.page.setRequestInterception(true);
            this.page.on('request', (request) => {
                // Block images, fonts, and other non-essential resources
                const resourceType = request.resourceType();
                if (['image', 'font', 'media'].includes(resourceType)) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            console.log('Browser initialized');
            return true;
        } catch (error) {
            console.error('Error initializing browser:', error);
            return false;
        }
    }

    /**
     * Log in to Cronometer.com
     * @param {string} username - Cronometer username
     * @param {string} password - Cronometer password
     * @returns {boolean} Whether login was successful
     */
    async login(username, password) {
        try {
            if (!this.browser || !this.page) {
                await this.initialize();
            }

            console.log('Navigating to Cronometer login page...');
            await this.page.goto('https://cronometer.com/login/', {
                waitUntil: 'networkidle2'
            });

            // Fill in login form
            await this.page.type('input[name="username"]', username);
            await this.page.type('input[name="password"]', password);

            // Click login button
            await Promise.all([
                this.page.click('button[type="submit"]'),
                this.page.waitForNavigation({ waitUntil: 'networkidle2' })
            ]);

            // Check if login was successful
            const url = this.page.url();
            this.isLoggedIn = url.includes('app.cronometer.com');

            if (this.isLoggedIn) {
                console.log('Successfully logged in to Cronometer');
            } else {
                console.error('Failed to log in to Cronometer');
            }

            return this.isLoggedIn;
        } catch (error) {
            console.error('Error logging in to Cronometer:', error);
            return false;
        }
    }

    /**
     * Search for a food in Cronometer
     * @param {string} query - Food search query
     * @returns {Array} Array of food search results
     */
    async searchFood(query) {
        try {
            if (!this.isLoggedIn) {
                throw new Error('Not logged in to Cronometer');
            }

            // Navigate to the diary page
            await this.page.goto('https://app.cronometer.com/diary', {
                waitUntil: 'networkidle2'
            });

            // Click the "Add Food" button
            await this.page.click('button[data-testid="add-food-button"]');

            // Wait for the search modal to appear
            await this.page.waitForSelector('input[placeholder="Search for a food"]');

            // Type the search query
            await this.page.type('input[placeholder="Search for a food"]', query);

            // Wait for search results
            await this.page.waitForSelector('.search-result-item');

            // Extract search results
            const searchResults = await this.page.evaluate(() => {
                const results = [];
                const resultElements = document.querySelectorAll('.search-result-item');

                resultElements.forEach((element) => {
                    const nameElement = element.querySelector('.food-name');
                    const brandElement = element.querySelector('.food-brand');

                    results.push({
                        id: element.getAttribute('data-food-id'),
                        name: nameElement ? nameElement.textContent.trim() : '',
                        brand: brandElement ? brandElement.textContent.trim() : '',
                        element: element
                    });
                });

                return results;
            });

            return searchResults;
        } catch (error) {
            console.error('Error searching for food:', error);
            return [];
        }
    }

    /**
     * Get nutrition data for a specific food
     * @param {string|Object} food - Food ID or food object from search results
     * @returns {Object} Nutrition data for the food
     */
    async getFoodNutrition(food) {
        try {
            if (!this.isLoggedIn) {
                throw new Error('Not logged in to Cronometer');
            }

            const foodId = typeof food === 'string' ? food : food.id;

            // Check if we already have this food in our database
            const existingFood = this.db.foods.find(f => f.id === foodId);
            if (existingFood) {
                console.log(`Found food ${foodId} in local database`);
                return existingFood;
            }

            // Click on the food item to view details
            if (typeof food === 'object' && food.element) {
                await this.page.evaluate((element) => {
                    element.click();
                }, food.element);
            } else {
                // If we only have the ID, we need to search for it first
                const searchResults = await this.searchFood(food.name || foodId);
                const foodItem = searchResults.find(item => item.id === foodId);
                if (!foodItem) {
                    throw new Error(`Food with ID ${foodId} not found`);
                }

                await this.page.evaluate((element) => {
                    element.click();
                }, foodItem.element);
            }

            // Wait for the nutrition panel to load
            await this.page.waitForSelector('.nutrition-panel');

            // Extract nutrition data
            const nutritionData = await this.page.evaluate(() => {
                const data = {
                    name: '',
                    brand: '',
                    servingSize: '',
                    calories: 0,
                    macronutrients: {
                        protein: 0,
                        carbs: 0,
                        fat: 0,
                        fiber: 0,
                        sugar: 0
                    },
                    micronutrients: {}
                };

                // Get basic food info
                const nameElement = document.querySelector('.food-detail-name');
                const brandElement = document.querySelector('.food-detail-brand');
                const servingSizeElement = document.querySelector('.serving-size');

                if (nameElement) data.name = nameElement.textContent.trim();
                if (brandElement) data.brand = brandElement.textContent.trim();
                if (servingSizeElement) data.servingSize = servingSizeElement.textContent.trim();

                // Get calories
                const caloriesElement = document.querySelector('.calories-value');
                if (caloriesElement) {
                    data.calories = parseFloat(caloriesElement.textContent.trim());
                }

                // Get macronutrients
                const macroElements = document.querySelectorAll('.macro-panel .nutrient-row');
                macroElements.forEach(element => {
                    const nameElement = element.querySelector('.nutrient-name');
                    const valueElement = element.querySelector('.nutrient-value');

                    if (nameElement && valueElement) {
                        const name = nameElement.textContent.trim().toLowerCase();
                        const value = parseFloat(valueElement.textContent.trim());

                        if (name.includes('protein')) data.macronutrients.protein = value;
                        if (name.includes('carbs') || name.includes('carbohydrates')) data.macronutrients.carbs = value;
                        if (name.includes('fat')) data.macronutrients.fat = value;
                        if (name.includes('fiber')) data.macronutrients.fiber = value;
                        if (name.includes('sugar')) data.macronutrients.sugar = value;
                    }
                });

                // Get micronutrients
                const microElements = document.querySelectorAll('.micro-panel .nutrient-row');
                microElements.forEach(element => {
                    const nameElement = element.querySelector('.nutrient-name');
                    const valueElement = element.querySelector('.nutrient-value');
                    const unitElement = element.querySelector('.nutrient-unit');

                    if (nameElement && valueElement) {
                        const name = nameElement.textContent.trim().toLowerCase();
                        const value = parseFloat(valueElement.textContent.trim());
                        const unit = unitElement ? unitElement.textContent.trim() : '';

                        data.micronutrients[name] = {
                            value,
                            unit
                        };
                    }
                });

                return data;
            });

            // Add the food ID to the nutrition data
            nutritionData.id = foodId;

            // Add to our database
            this.db.foods.push(nutritionData);
            this.saveDatabase();

            return nutritionData;
        } catch (error) {
            console.error('Error getting food nutrition:', error);
            return null;
        }
    }

    /**
     * Export diary data from Cronometer
     * @param {string} startDate - Start date in YYYY-MM-DD format
     * @param {string} endDate - End date in YYYY-MM-DD format
     * @returns {Object} Exported diary data
     */
    async exportDiaryData(startDate, endDate) {
        try {
            if (!this.isLoggedIn) {
                throw new Error('Not logged in to Cronometer');
            }

            // Navigate to the export page
            await this.page.goto('https://app.cronometer.com/export', {
                waitUntil: 'networkidle2'
            });

            // Set date range
            await this.page.type('input[name="startDate"]', startDate);
            await this.page.type('input[name="endDate"]', endDate);

            // Select export format (CSV)
            await this.page.select('select[name="format"]', 'csv');

            // Click export button
            const [download] = await Promise.all([
                this.page.waitForEvent('download'),
                this.page.click('button[type="submit"]')
            ]);

            // Save the downloaded file
            const filePath = path.join(dataDir, `cronometer-export-${startDate}-to-${endDate}.csv`);
            await download.saveAs(filePath);

            console.log(`Exported diary data saved to ${filePath}`);

            // Read and parse the CSV file
            const csvData = fs.readFileSync(filePath, 'utf8');

            // Simple CSV parsing (for a more robust solution, use a CSV parsing library)
            const lines = csvData.split('\n');
            const headers = lines[0].split(',');

            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length === headers.length) {
                    const entry = {};
                    headers.forEach((header, index) => {
                        entry[header.trim()] = values[index].trim();
                    });
                    data.push(entry);
                }
            }

            return {
                filePath,
                data
            };
        } catch (error) {
            console.error('Error exporting diary data:', error);
            return null;
        }
    }

    /**
     * Search for foods in the local database
     * @param {string} query - Search query
     * @returns {Array} Matching foods
     */
    searchLocalDatabase(query) {
        if (!query) return [];

        const lowerQuery = query.toLowerCase();
        return this.db.foods.filter(food =>
            food.name.toLowerCase().includes(lowerQuery) ||
            (food.brand && food.brand.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Close the browser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            this.isLoggedIn = false;
            console.log('Browser closed');
        }
    }
}

module.exports = CronometerScraper;
