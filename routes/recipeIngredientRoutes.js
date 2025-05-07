/**
 * Recipe Ingredient Routes
 * Provides API endpoints for managing recipe ingredients
 */

const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipeController');

/**
 * @swagger
 * /api/recipe-ingredients/{recipeId}/ingredients:
 *   post:
 *     summary: Add a new ingredient to an existing recipe
 *     tags: [Recipe Ingredients]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - calories
 *               - amount
 *               - protein
 *               - fats
 *               - carbohydrates
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: The ingredient name
 *               calories:
 *                 type: number
 *                 description: The calories in the ingredient
 *               amount:
 *                 type: number
 *                 description: The amount in grams
 *               protein:
 *                 type: number
 *                 description: The protein content in grams
 *               fats:
 *                 type: number
 *                 description: The fat content in grams
 *               carbohydrates:
 *                 type: number
 *                 description: The carbohydrate content in grams
 *               price:
 *                 type: number
 *                 description: The price of the ingredient
 *               package_amount:
 *                 type: number
 *                 description: The package amount in grams (optional)
 *     responses:
 *       201:
 *         description: Ingredient added successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.post('/:recipeId/ingredients', RecipeController.addIngredientToRecipe);

/**
 * @swagger
 * /api/recipe-ingredients/{recipeId}/ingredients/{ingredientId}:
 *   get:
 *     summary: Get a single ingredient from a recipe
 *     tags: [Recipe Ingredients]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The recipe ID
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ingredient ID
 *     responses:
 *       200:
 *         description: Ingredient retrieved successfully
 *       404:
 *         description: Recipe or ingredient not found
 *       500:
 *         description: Server error
 */
router.get('/:recipeId/ingredients/:ingredientId', RecipeController.getIngredientById);

/**
 * @swagger
 * /api/recipe-ingredients/{recipeId}/ingredients/{ingredientId}:
 *   patch:
 *     summary: Update a single ingredient in a recipe
 *     tags: [Recipe Ingredients]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The recipe ID
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ingredient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The ingredient name
 *               calories:
 *                 type: number
 *                 description: The calories in the ingredient
 *               amount:
 *                 type: number
 *                 description: The amount in grams
 *               protein:
 *                 type: number
 *                 description: The protein content in grams
 *               fats:
 *                 type: number
 *                 description: The fat content in grams
 *               carbohydrates:
 *                 type: number
 *                 description: The carbohydrate content in grams
 *               price:
 *                 type: number
 *                 description: The price of the ingredient
 *               package_amount:
 *                 type: number
 *                 description: The package amount in grams
 *     responses:
 *       200:
 *         description: Ingredient updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Recipe or ingredient not found
 *       500:
 *         description: Server error
 */
router.patch('/:recipeId/ingredients/:ingredientId', RecipeController.updateIngredient);

module.exports = router;
