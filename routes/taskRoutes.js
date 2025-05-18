const express = require('express');
const TaskController = require('../controllers/taskController');

const router = express.Router();

// Store recent task creation requests to prevent duplicates
const recentTaskRequests = new Map();

// Clean up old requests every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of recentTaskRequests.entries()) {
        // Remove entries older than 1 minute
        if (now - timestamp > 60000) {
            recentTaskRequests.delete(key);
        }
    }
}, 300000); // 5 minutes

// Apply duplicate task prevention middleware directly
router.use((req, res, next) => {
    // Only apply to POST requests
    if (req.method === 'POST' && req.path === '/') {
        console.log('Checking for duplicate task creation request');

        // Get request data
        const { title, description, dueDate } = req.body;

        // Check for request ID in headers or query params
        const requestId = req.headers['x-request-id'] || req.query.requestId;

        // If we have a request ID, check if we've seen it before
        if (requestId && recentTaskRequests.has(requestId)) {
            console.log(`Duplicate request detected with ID: ${requestId}`);
            return res.status(409).json({
                error: 'Duplicate request',
                message: 'This appears to be a duplicate request that was already processed'
            });
        }

        // Create a key based on the task data
        const taskKey = `${title}|${description || ''}|${dueDate || ''}`;

        // Check if we've seen this task recently
        if (recentTaskRequests.has(taskKey)) {
            const timestamp = recentTaskRequests.get(taskKey);
            const now = Date.now();

            // If the same task was created in the last 5 seconds, reject it as a duplicate
            if (now - timestamp < 5000) {
                console.log(`Duplicate task detected: ${taskKey}`);
                return res.status(409).json({
                    error: 'Duplicate task',
                    message: 'A task with the same title and description was created within the last 5 seconds'
                });
            }
        }

        // Store the task key and request ID
        recentTaskRequests.set(taskKey, Date.now());
        if (requestId) {
            recentTaskRequests.set(requestId, Date.now());
        }
    }

    next();
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *       500:
 *         description: Server error
 */
router.get('/', TaskController.getAllTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               reminderTime:
 *                 type: string
 *               assignedDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               recurrenceType:
 *                 type: string
 *               recurrenceInterval:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', TaskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               reminderTime:
 *                 type: string
 *               is_complete:
 *                 type: boolean
 *               assignedDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               recurrenceType:
 *                 type: string
 *               recurrenceInterval:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.put('/:id', TaskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted
 *       400:
 *         description: Invalid task ID
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', TaskController.deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/toggle-completion:
 *   patch:
 *     summary: Toggle task completion status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_complete:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task completion toggled
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/toggle-completion', TaskController.toggleCompletion);

/**
 * @swagger
 * /api/tasks/{id}/next-occurrence:
 *   post:
 *     summary: Create the next occurrence of a recurring task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       201:
 *         description: Next occurrence created
 *       400:
 *         description: Invalid input or task is not recurring
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.post('/:id/next-occurrence', TaskController.createNextOccurrence);

/**
 * @swagger
 * /api/tasks/debug-routes:
 *   get:
 *     summary: Debug endpoint to list all registered routes
 *     responses:
 *       200:
 *         description: List of registered routes
 */
router.get('/debug-routes', (req, res) => {
    const routes = [];
    router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods).filter(m => middleware.route.methods[m])
            });
        }
    });
    res.json(routes);
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get('/:id', TaskController.getTaskById);

/**
 * @swagger
 * /api/tasks/{id}/subtasks:
 *   get:
 *     summary: Get all subtasks for a parent task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent Task ID
 *     responses:
 *       200:
 *         description: List of subtasks
 *       404:
 *         description: Parent task not found
 *       500:
 *         description: Server error
 */
router.get('/:id/subtasks', TaskController.getSubtasks);

module.exports = router;
