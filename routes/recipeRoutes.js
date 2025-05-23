/**
 * Recipe Routes
 * Defines API endpoints for recipes
 */

const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipeController');

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes (basic info)
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of recipes
 *       500:
 *         description: Server error
 */
router.get('/', RecipeController.getAllRecipes);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get a recipe by ID with ingredients
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: Recipe details with ingredients
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.get('/:id', RecipeController.getRecipeById);

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe with ingredients
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ingredients
 *             properties:
 *               name:
 *                 type: string
 *                 description: The recipe name
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - calories
 *                     - amount
 *                     - protein
 *                     - fats
 *                     - carbohydrates
 *                     - price
 *                   properties:
 *                     name:
 *                       type: string
 *                     calories:
 *                       type: number
 *                     amount:
 *                       type: number
 *                     protein:
 *                       type: number
 *                     fats:
 *                       type: number
 *                     carbohydrates:
 *                       type: number
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', RecipeController.createRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update a recipe's calories and scale ingredients
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - targetCalories
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated recipe name (optional)
 *               targetCalories:
 *                 type: number
 *                 description: The target total calories
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.put('/:id', RecipeController.updateRecipeCalories);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete a recipe and its ingredients
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', RecipeController.deleteRecipe);

/**
 * @swagger
 * /api/recipes/{recipeId}/ingredients/{ingredientId}:
 *   get:
 *     summary: Get a single ingredient from a recipe
 *     tags: [Recipes]
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
 * /api/recipes/{recipeId}/ingredients/{ingredientId}:
 *   patch:
 *     summary: Update a single ingredient in a recipe
 *     tags: [Recipes]
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
 *               amount:
 *                 type: number
 *                 description: The ingredient amount in grams
 *               calories:
 *                 type: number
 *                 description: The ingredient calories
 *               protein:
 *                 type: number
 *                 description: The ingredient protein in grams
 *               fats:
 *                 type: number
 *                 description: The ingredient fats in grams
 *               carbohydrates:
 *                 type: number
 *                 description: The ingredient carbohydrates in grams
 *               price:
 *                 type: number
 *                 description: The ingredient price
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
