/**
 * Workout Routes
 * Defines API endpoints for workouts
 */

const express = require('express');
const router = express.Router();
const WorkoutController = require('../controllers/workoutController');

/**
 * @swagger
 * /api/workouts/exercises:
 *   get:
 *     summary: Get all available exercises
 *     tags: [Workouts]
 *     responses:
 *       200:
 *         description: List of exercises
 *       500:
 *         description: Server error
 */
router.get('/exercises', WorkoutController.getAllExercises);

/**
 * @swagger
 * /api/workouts/exercises/search:
 *   get:
 *     summary: Search exercises by name or category
 *     tags: [Workouts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching exercises
 *       500:
 *         description: Server error
 */
router.get('/exercises/search', WorkoutController.searchExercises);

/**
 * @swagger
 * /api/workouts/exercises:
 *   post:
 *     summary: Create a new exercise
 *     tags: [Workouts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: The exercise name
 *               category:
 *                 type: string
 *                 description: The exercise category
 *     responses:
 *       201:
 *         description: Exercise created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/exercises', WorkoutController.createExercise);

/**
 * @swagger
 * /api/workouts/templates:
 *   get:
 *     summary: Get all workout templates
 *     tags: [Workouts]
 *     responses:
 *       200:
 *         description: List of workout templates
 *       500:
 *         description: Server error
 */
router.get('/templates', WorkoutController.getWorkoutTemplates);

/**
 * @swagger
 * /api/workouts/templates/{id}:
 *   get:
 *     summary: Get a workout template by ID
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The template ID
 *     responses:
 *       200:
 *         description: Workout template details
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
router.get('/templates/:id', WorkoutController.getWorkoutTemplateById);

/**
 * @swagger
 * /api/workouts/templates:
 *   post:
 *     summary: Create a new workout template
 *     tags: [Workouts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - exercises
 *             properties:
 *               name:
 *                 type: string
 *                 description: The template name
 *               description:
 *                 type: string
 *                 description: The template description
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - exercise_id
 *                   properties:
 *                     exercise_id:
 *                       type: integer
 *                     sets:
 *                       type: integer
 *                     reps:
 *                       type: string
 *                     weight:
 *                       type: number
 *                     weight_unit:
 *                       type: string
 *                       enum: [kg, lb]
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/templates', WorkoutController.createWorkoutTemplate);

/**
 * @swagger
 * /api/workouts/templates/{id}:
 *   put:
 *     summary: Update a workout template
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - exercises
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated template name
 *               description:
 *                 type: string
 *                 description: The updated template description
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - exercise_id
 *                   properties:
 *                     exercise_id:
 *                       type: integer
 *                     sets:
 *                       type: integer
 *                     reps:
 *                       type: string
 *                     weight:
 *                       type: number
 *                     weight_unit:
 *                       type: string
 *                       enum: [kg, lb]
 *                     notes:
 *                       type: string
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
router.put('/templates/:id', WorkoutController.updateWorkoutTemplate);

/**
 * @swagger
 * /api/workouts/templates/{id}:
 *   delete:
 *     summary: Delete a workout template
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
router.delete('/templates/:id', WorkoutController.deleteWorkoutTemplate);

/**
 * @swagger
 * /api/workouts/log:
 *   post:
 *     summary: Log a completed workout
 *     tags: [Workouts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workoutName
 *               - exercises
 *             properties:
 *               workoutName:
 *                 type: string
 *                 description: The workout name
 *               duration:
 *                 type: string
 *                 description: The workout duration (ISO 8601 interval string)
 *               notes:
 *                 type: string
 *                 description: The workout notes
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - exercise_id
 *                     - exercise_name
 *                     - sets_completed
 *                     - reps_completed
 *                   properties:
 *                     exercise_id:
 *                       type: integer
 *                     exercise_name:
 *                       type: string
 *                     sets_completed:
 *                       type: integer
 *                     reps_completed:
 *                       type: string
 *                     weight_used:
 *                       type: number
 *                     weight_unit:
 *                       type: string
 *                       enum: [kg, lb]
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Workout logged successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/log', WorkoutController.logWorkout);

/**
 * @swagger
 * /api/workouts/logs:
 *   get:
 *     summary: Get workout logs with pagination
 *     tags: [Workouts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of logs to return (default 10)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination (default 0)
 *     responses:
 *       200:
 *         description: Workout logs with pagination info
 *       500:
 *         description: Server error
 */
router.get('/logs', WorkoutController.getWorkoutLogs);

/**
 * @swagger
 * /api/workouts/logs/{id}:
 *   get:
 *     summary: Get a workout log by ID
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The log ID
 *     responses:
 *       200:
 *         description: Workout log details
 *       404:
 *         description: Log not found
 *       500:
 *         description: Server error
 */
router.get('/logs/:id', WorkoutController.getWorkoutLogById);

/**
 * @swagger
 * /api/workouts/logs/{id}:
 *   delete:
 *     summary: Delete a workout log
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The log ID
 *     responses:
 *       200:
 *         description: Log deleted successfully
 *       404:
 *         description: Log not found
 *       500:
 *         description: Server error
 */
router.delete('/logs/:id', WorkoutController.deleteWorkoutLog);

/**
 * @swagger
 * /api/workouts/progress-photos:
 *   post:
 *     summary: Upload progress photos
 *     tags: [Workouts]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: photos
 *         type: file
 *         description: Progress photos to upload (up to 10)
 *     responses:
 *       201:
 *         description: Photos uploaded successfully
 *       400:
 *         description: Invalid input or no files uploaded
 *       500:
 *         description: Server error
 */
router.post('/progress-photos', WorkoutController.uploadProgressPhotos);

/**
 * @swagger
 * /api/workouts/progress-photos:
 *   get:
 *     summary: Get all progress photos
 *     tags: [Workouts]
 *     responses:
 *       200:
 *         description: List of progress photos
 *       500:
 *         description: Server error
 */
router.get('/progress-photos', WorkoutController.getProgressPhotos);

/**
 * @swagger
 * /api/workouts/progress-photos/{photo_id}:
 *   delete:
 *     summary: Delete a progress photo
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: photo_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The photo ID
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Server error
 */
router.delete('/progress-photos/:photo_id', WorkoutController.deleteProgressPhoto);

module.exports = router;
