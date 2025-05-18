/**
 * Duplicate Task Prevention Middleware
 * Prevents duplicate tasks from being created on the server side
 */

// Store recent task creation requests
const recentRequests = new Map();

// Clean up old requests every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of recentRequests.entries()) {
        // Remove entries older than 1 minute
        if (now - timestamp > 60000) {
            recentRequests.delete(key);
        }
    }
}, 300000); // 5 minutes

/**
 * Middleware to prevent duplicate task creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function preventDuplicateTasks(req, res, next) {
    // Only apply to POST requests to /api/tasks
    if (req.method === 'POST' && req.path === '/') {
        console.log('Checking for duplicate task creation request');
        
        // Get request data
        const { title, description } = req.body;
        
        // Check for request ID in headers or query params
        const requestId = req.headers['x-request-id'] || req.query.requestId;
        
        // If we have a request ID, check if we've seen it before
        if (requestId) {
            if (recentRequests.has(requestId)) {
                console.log(`Duplicate request detected with ID: ${requestId}`);
                return res.status(409).json({
                    error: 'Duplicate request',
                    message: 'This appears to be a duplicate request that was already processed'
                });
            }
            
            // Store the request ID
            recentRequests.set(requestId, Date.now());
        }
        
        // Create a key based on the task data
        const taskKey = `${title}|${description || ''}`;
        
        // Check if we've seen this task recently
        if (recentRequests.has(taskKey)) {
            const timestamp = recentRequests.get(taskKey);
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
        
        // Store the task key
        recentRequests.set(taskKey, Date.now());
    }
    
    // Continue to the next middleware
    next();
}

module.exports = preventDuplicateTasks;
