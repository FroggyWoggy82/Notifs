const express = require('express');
const TaskController = require('../controllers/taskController');

const router = express.Router();

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
 * /api/tasks/completed/week:
 *   get:
 *     summary: Get completed tasks for the current week
 *     responses:
 *       200:
 *         description: List of completed tasks from this week
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get('/completed/week', TaskController.getCompletedTasksThisWeek);

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

/**
 * @swagger
 * /api/tasks/{id}/subtasks:
 *   post:
 *     summary: Create a subtask for a parent task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Subtask title
 *               description:
 *                 type: string
 *                 description: Subtask description
 *               is_complete:
 *                 type: boolean
 *                 description: Whether the subtask is complete
 *               grocery_data:
 *                 type: object
 *                 description: Optional grocery data for the subtask
 *     responses:
 *       201:
 *         description: Subtask created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Parent task not found
 *       500:
 *         description: Server error
 */
router.post('/:id/subtasks', TaskController.createSubtask);

/**
 * @swagger
 * /api/tasks/weekly-complete-list:
 *   get:
 *     summary: Get a complete weekly list of all tasks organized by day and notification
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the week (YYYY-MM-DD). Defaults to current week's Sunday.
 *     responses:
 *       200:
 *         description: Complete weekly task list organized by day and notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 weekStart:
 *                   type: string
 *                   format: date
 *                 weekEnd:
 *                   type: string
 *                   format: date
 *                 dailyBreakdown:
 *                   type: object
 *                   properties:
 *                     sunday:
 *                       type: array
 *                     monday:
 *                       type: array
 *                     tuesday:
 *                       type: array
 *                     wednesday:
 *                       type: array
 *                     thursday:
 *                       type: array
 *                     friday:
 *                       type: array
 *                     saturday:
 *                       type: array
 *                 notificationBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       time:
 *                         type: string
 *                       tasks:
 *                         type: array
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                     completedTasks:
 *                       type: integer
 *                     pendingTasks:
 *                       type: integer
 *                     tasksWithNotifications:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/weekly-complete-list', TaskController.getWeeklyCompleteList);

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

module.exports = router;
