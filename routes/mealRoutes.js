/**
 * Meal Routes
 * Provides API endpoints for managing meals
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const MealController = require('../controllers/mealController');

// Configure multer for meal photo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'meal_photos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'meal-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

/**
 * @swagger
 * /api/meals:
 *   get:
 *     summary: Get all meals
 *     tags: [Meals]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: The user ID (optional, defaults to 1)
 *     responses:
 *       200:
 *         description: List of meals
 *       500:
 *         description: Server error
 */
router.get('/', MealController.getAllMeals);

/**
 * @swagger
 * /api/meals:
 *   post:
 *     summary: Create a new meal
 *     tags: [Meals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *               - time
 *               - ingredients
 *             properties:
 *               name:
 *                 type: string
 *                 description: The meal name
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The meal date (YYYY-MM-DD)
 *               time:
 *                 type: string
 *                 format: time
 *                 description: The meal time (HH:MM)
 *               ingredients:
 *                 type: array
 *                 description: Array of ingredients
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ingredient ID (or temporary ID for new ingredients)
 *                     name:
 *                       type: string
 *                       description: The ingredient name
 *                     amount:
 *                       type: number
 *                       description: The amount in grams
 *                     calories:
 *                       type: number
 *                       description: The calories
 *                     protein:
 *                       type: number
 *                       description: The protein content in grams
 *                     fat:
 *                       type: number
 *                       description: The fat content in grams
 *                     carbs:
 *                       type: number
 *                       description: The carbohydrate content in grams
 *                     isNew:
 *                       type: boolean
 *                       description: Whether this is a new ingredient
 *               user_id:
 *                 type: integer
 *                 description: The user ID (optional, defaults to 1)
 *     responses:
 *       201:
 *         description: Meal created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('meal-photo'), MealController.createMeal);

/**
 * @swagger
 * /api/meals/upload-photo:
 *   post:
 *     summary: Upload a meal photo
 *     tags: [Meals]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               meal-photo:
 *                 type: string
 *                 format: binary
 *                 description: The meal photo file
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Invalid file or no file provided
 *       500:
 *         description: Server error
 */
router.post('/upload-photo', upload.single('meal-photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const photoUrl = `/uploads/meal_photos/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            photo_url: photoUrl
        });
    } catch (error) {
        console.error('Error uploading meal photo:', error);
        res.status(500).json({
            success: false,
            message: 'Server error uploading photo',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/meals/calendar-data:
 *   get:
 *     summary: Get calendar data for meals and calorie targets
 *     tags: [Meals]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: The user ID (optional, defaults to 1)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: The year to fetch data for
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: The month to fetch data for (1-12)
 *     responses:
 *       200:
 *         description: Calendar data with meals and calorie targets
 *       500:
 *         description: Server error
 */
router.get('/calendar-data', MealController.getCalendarData);

/**
 * @swagger
 * /api/meals/{id}:
 *   get:
 *     summary: Get a meal by ID
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The meal ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: The user ID (optional, defaults to 1)
 *     responses:
 *       200:
 *         description: Meal details
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Server error
 */
router.get('/:id', MealController.getMealById);

/**
 * @swagger
 * /api/meals/{id}:
 *   put:
 *     summary: Update a meal
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The meal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *               - time
 *               - ingredients
 *             properties:
 *               name:
 *                 type: string
 *                 description: The meal name
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The meal date (YYYY-MM-DD)
 *               time:
 *                 type: string
 *                 format: time
 *                 description: The meal time (HH:MM)
 *               ingredients:
 *                 type: array
 *                 description: Array of ingredients
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ingredient ID (or temporary ID for new ingredients)
 *                     name:
 *                       type: string
 *                       description: The ingredient name
 *                     amount:
 *                       type: number
 *                       description: The amount in grams
 *                     calories:
 *                       type: number
 *                       description: The calories
 *                     protein:
 *                       type: number
 *                       description: The protein content in grams
 *                     fat:
 *                       type: number
 *                       description: The fat content in grams
 *                     carbs:
 *                       type: number
 *                       description: The carbohydrate content in grams
 *                     isNew:
 *                       type: boolean
 *                       description: Whether this is a new ingredient
 *               user_id:
 *                 type: integer
 *                 description: The user ID (optional, defaults to 1)
 *     responses:
 *       200:
 *         description: Meal updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Server error
 */
router.put('/:id', MealController.updateMeal);

/**
 * @swagger
 * /api/meals/{id}:
 *   delete:
 *     summary: Delete a meal
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The meal ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: The user ID (optional, defaults to 1)
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', MealController.deleteMeal);

/**
 * @swagger
 * /api/meals/{id}/bloating-rating:
 *   patch:
 *     summary: Update bloating rating for a meal
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The meal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bloating_rating
 *             properties:
 *               bloating_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: The bloating rating (1 = no bloating, 10 = severe bloating)
 *               user_id:
 *                 type: integer
 *                 description: The user ID (optional, defaults to 1)
 *     responses:
 *       200:
 *         description: Bloating rating updated successfully
 *       400:
 *         description: Invalid bloating rating
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/bloating-rating', MealController.updateBloatingRating);

module.exports = router;
