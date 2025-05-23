/**
 * Meal Routes
 * Provides API endpoints for managing meals
 */

const express = require('express');
const router = express.Router();
const MealController = require('../controllers/mealController');

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
router.post('/', MealController.createMeal);

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

module.exports = router;
